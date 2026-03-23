/**
 * Download hero images from provider websites, falling back to Unsplash.
 *
 * Strategy:
 * 1. Fetch provider's homepage, extract og:image or twitter:image meta tag
 * 2. If og:image found and large enough, download it
 * 3. If not, fall back to curated Unsplash image for the category
 *
 * Stores locally at public/assets/providers/heroes/{slug}.jpg
 * Updates heroImageUrl in DB to /assets/providers/heroes/{slug}.jpg
 *
 * Usage:
 *   npx tsx prisma/scripts/download-hero-images.ts
 *   npx tsx prisma/scripts/download-hero-images.ts --slug=hellofresh
 *   npx tsx prisma/scripts/download-hero-images.ts --fallback-only
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { PrismaClient } from "../../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const HERO_DIR = path.join(process.cwd(), "public/assets/providers/heroes");
const MIN_IMAGE_SIZE = 5000; // 5KB minimum to avoid tiny placeholders

function fetchUrl(url: string, maxRedirects = 5): Promise<{ status: number; body: string; headers: Record<string, string> }> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      timeout: 10000,
    }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith("/")) {
          const parsed = new URL(url);
          redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
        }
        fetchUrl(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
        return;
      }
      let body = "";
      res.on("data", (chunk: Buffer) => { body += chunk.toString(); });
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 0,
          body,
          headers: res.headers as Record<string, string>,
        });
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

function downloadFile(url: string, dest: string, maxRedirects = 5): Promise<boolean> {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      },
      timeout: 15000,
    }, (response) => {
      if ((response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) && response.headers.location && maxRedirects > 0) {
        let redirectUrl = response.headers.location;
        if (redirectUrl.startsWith("/")) {
          const parsed = new URL(url);
          redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
        }
        downloadFile(redirectUrl, dest, maxRedirects - 1).then(resolve);
        return;
      }
      if (response.statusCode !== 200) {
        resolve(false);
        return;
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        const stats = fs.statSync(dest);
        if (stats.size < MIN_IMAGE_SIZE) {
          fs.unlinkSync(dest);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
  });
}

function extractOgImage(html: string, baseUrl: string): string | null {
  // Try og:image first, then twitter:image
  const patterns = [
    /property="og:image"\s+content="([^"]+)"/i,
    /content="([^"]+)"\s+property="og:image"/i,
    /name="twitter:image"\s+content="([^"]+)"/i,
    /content="([^"]+)"\s+name="twitter:image"/i,
    /property="og:image:secure_url"\s+content="([^"]+)"/i,
    /content="([^"]+)"\s+property="og:image:secure_url"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      let imgUrl = match[1];
      // Handle relative URLs
      if (imgUrl.startsWith("//")) {
        imgUrl = "https:" + imgUrl;
      } else if (imgUrl.startsWith("/")) {
        try {
          const parsed = new URL(baseUrl);
          imgUrl = `${parsed.protocol}//${parsed.host}${imgUrl}`;
        } catch {
          continue;
        }
      }
      // Skip tiny/placeholder images
      if (imgUrl.includes("favicon") || imgUrl.includes("1x1") || imgUrl.includes("pixel")) {
        continue;
      }
      return imgUrl;
    }
  }
  return null;
}

// Curated Unsplash fallback images by category
const FALLBACK_IMAGES: Record<string, string[]> = {
  MEAL_KIT: [
    "1556909114-f6e7ad7d3136",
    "1466637574-1023b1e16e14",
    "1547592180-85f173990554",
    "1490818387-9d890c4f11ed",
    "1498837167-7fcb40dfcc75",
    "1543353071-873f17a7a5a1",
    "1464226184-bb1d0d7e3fc2",
    "1506368249639-4fb9663f39d0",
    "1512621776-d84fce55a7fd",
    "1528712306091-ed0763094c98",
  ],
  PREPARED_MEAL: [
    "1546069901-ba9599a7e63c",
    "1567620905-9de1aad4cae6",
    "1551218808-94e220e084d2",
    "1559847844-5315695dadae",
    "1512058564-36a3b445a6a4",
    "1490645935-6ca56fc5a8e0",
    "1476224203-c4ad4c92c0d0",
    "1543362906-acfc16c67564",
    "1547592166-23ac45744acd",
    "1505576399-13c8ce4e8dc1",
    "1540189549-8dd6a5dc2e86",
    "1563379091-9c38781b43a2",
    "1529006557-06ad1f942907",
    "1555939594-58d7cb561ad1",
    "1515003197210-e0cd71810b5f",
    "1482049016688-2d3e1b311543",
  ],
  PROTEIN_BOX: [
    "1529692236671-f1f6cf9683ba",
    "1558030006-82c3db2e30e0",
    "1551028150-64b9f398f678",
    "1544025162-d76694265947",
    "1553163147-622ab57be1c7",
    "1448907503-524fc08bcb54",
    "1580476262-a2bf3b48f70d",
    "1519708227-433b3a49d455",
    "1432139509613-5c4255a78e0f",
    "1504973960-4c4d9c49c12c",
    "1559181567-c3190ca9959b",
    "1560717789-0ac7c58ac90a",
    "1499125562-24b36cef41a8",
    "1534422298391-e4f8c172dddb",
    "1467003909585-2f8a72700288",
    "1485963631004-f2f00b1d6150",
    "1535591273-4cf6f588e61c",
    "1544943910-4c1dc44aab44",
    "1579631542720-3a87824fff86",
  ],
  PRODUCE_BOX: [
    "1488459716781-31db52582fe8",
    "1540420773420-3366772f4999",
    "1557844352-761f2565b1e5",
    "1573246123716-6b1782bfc1f7",
    "1518843875-d6f6e3f70e89",
    "1542838132-92c53300491e",
    "1516594798681-17fa0b4daf42",
    "1512621776-d84fce55a7fd",
    "1506484381186-d0e72fe7a77b",
    "1471193945509-9ad0617afabf",
    "1498837167-7fcb40dfcc75",
    "1590868309235-ea34bed7bd7f",
    "1566385101042-1a0aa86735e8",
    "1594282486552-05b4d80fbb9f",
    "1574943320219-553eb213f72d",
    "1543362906-acfc16c67564",
  ],
  SPECIALTY: [
    "1481391319762-47dff72954d9",
    "1548839140-29a749e1cf4d",
    "1511381939415-e44015466834",
    "1558961363-fa8fdf82db35",
    "1563262924-641a8b3d1fe4",
    "1514432324607-273d43944ad6",
    "1486427944544-d2052751f851",
    "1524383344757-69d97eee6ddd",
    "1509440159596-0249088772ff",
    "1536304929831-ee1ca9d44906",
    "1517578239113-16ea6b0e22a7",
    "1558303065-2d0baf08b8e9",
    "1506905925346-21bda4d32df4",
    "1516823662085-0e548e7d02db",
    "1495474472287-4d71bcdd2085",
    "1542990253-0d0f5be5f0ed",
  ],
};

function getFallbackUrl(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?w=1280&h=400&fit=crop&q=80`;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const slugArg = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
  const fallbackOnly = args.includes("--fallback-only");

  console.log(`\n=== Download Hero Images ===`);
  console.log(`Strategy: ${fallbackOnly ? "Unsplash fallback only" : "Provider og:image → Unsplash fallback"}`);
  console.log(`Output: ${HERO_DIR}\n`);

  fs.mkdirSync(HERO_DIR, { recursive: true });

  const where: Record<string, unknown> = {
    status: { not: "DISCONTINUED" },
  };
  if (slugArg) where.slug = slugArg;

  const providers = await prisma.provider.findMany({
    where,
    select: { id: true, slug: true, name: true, category: true, website: true, heroImageUrl: true },
    orderBy: { slug: "asc" },
  });

  console.log(`Found ${providers.length} providers\n`);

  let fromProvider = 0;
  let fromFallback = 0;
  let skippedExisting = 0;
  let failed = 0;
  const categoryIndex: Record<string, number> = {};

  for (const provider of providers) {
    const localPath = `/assets/providers/heroes/${provider.slug}.jpg`;
    const fullPath = path.join(process.cwd(), "public", localPath);

    // Skip if already downloaded
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > MIN_IMAGE_SIZE) {
      if (provider.heroImageUrl !== localPath) {
        await prisma.provider.update({
          where: { id: provider.id },
          data: { heroImageUrl: localPath },
        });
        console.log(`  ↻ ${provider.slug} — exists, updated DB`);
      } else {
        console.log(`  ⏭ ${provider.slug}`);
      }
      skippedExisting++;
      continue;
    }

    let downloaded = false;

    // Step 1: Try provider's og:image
    if (!fallbackOnly && provider.website) {
      try {
        process.stdout.write(`  🌐 ${provider.slug} — fetching og:image...`);
        const { body } = await fetchUrl(provider.website);
        const ogImage = extractOgImage(body, provider.website);

        if (ogImage) {
          process.stdout.write(` found → downloading...`);
          downloaded = await downloadFile(ogImage, fullPath);
          if (downloaded) {
            const size = fs.statSync(fullPath).size;
            console.log(` ✓ (${Math.round(size / 1024)}KB from provider)`);
            fromProvider++;
          } else {
            console.log(` too small, trying fallback...`);
          }
        } else {
          console.log(` none found`);
        }
      } catch (err) {
        console.log(` error: ${(err as Error).message}`);
      }
      await sleep(500); // Be polite to provider sites
    }

    // Step 2: Fallback to Unsplash
    if (!downloaded) {
      const category = provider.category as string;
      const images = FALLBACK_IMAGES[category];
      if (!images?.length) {
        console.log(`  ✗ ${provider.slug} — no fallback images for ${category}`);
        failed++;
        continue;
      }

      if (!(category in categoryIndex)) categoryIndex[category] = 0;
      const idx = categoryIndex[category] % images.length;
      categoryIndex[category]++;

      const fallbackUrl = getFallbackUrl(images[idx]);
      process.stdout.write(`  📷 ${provider.slug} — Unsplash fallback...`);
      downloaded = await downloadFile(fallbackUrl, fullPath);

      if (downloaded) {
        const size = fs.statSync(fullPath).size;
        console.log(` ✓ (${Math.round(size / 1024)}KB)`);
        fromFallback++;
      } else {
        console.log(` ✗ FAILED`);
        failed++;
        continue;
      }
      await sleep(200);
    }

    // Update DB
    if (downloaded) {
      await prisma.provider.update({
        where: { id: provider.id },
        data: { heroImageUrl: localPath },
      });
    }
  }

  console.log(`\n=== Results ===`);
  console.log(`From provider sites: ${fromProvider}`);
  console.log(`From Unsplash fallback: ${fromFallback}`);
  console.log(`Skipped (already existed): ${skippedExisting}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total files: ${fs.readdirSync(HERO_DIR).length}`);

  await prisma.$disconnect();
}

main().catch(console.error);
