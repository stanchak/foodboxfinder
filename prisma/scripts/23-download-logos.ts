/**
 * Phase 23 Plan 01: Download Logos for 22 New Providers
 *
 * Downloads logos for all 22 new Tier 1 and Tier 2 providers and updates
 * the logo manifest.json. Uses logo.clearbit.com as primary source with
 * img.logo.dev as fallback. Creates SVG placeholders for any failures.
 *
 * Run with: npx tsx prisma/scripts/23-download-logos.ts
 */

import * as fs from "fs";
import * as path from "path";

// All 22 new providers with exact slugs, names, websites, and domains
const NEW_PROVIDERS = [
  { slug: "clean-eatz-kitchen", name: "Clean Eatz Kitchen", website: "https://cleaneatzkitchen.com", domain: "cleaneatzkitchen.com" },
  { slug: "tempo", name: "Tempo", website: "https://tempomeals.com", domain: "tempomeals.com" },
  { slug: "rastellis", name: "Rastelli's", website: "https://rastellis.com", domain: "rastellis.com" },
  { slug: "sea-to-table", name: "Sea to Table", website: "https://sea2table.com", domain: "sea2table.com" },
  { slug: "cometeer", name: "Cometeer", website: "https://cometeer.com", domain: "cometeer.com" },
  { slug: "tokyotreat", name: "TokyoTreat", website: "https://tokyotreat.com", domain: "tokyotreat.com" },
  { slug: "japan-crate", name: "Japan Crate", website: "https://japancrate.com", domain: "japancrate.com" },
  { slug: "munch-addict", name: "Munch Addict", website: "https://munchaddict.com", domain: "munchaddict.com" },
  { slug: "heatonist", name: "Heatonist", website: "https://heatonist.com", domain: "heatonist.com" },
  { slug: "melissas-produce", name: "Melissa's Produce", website: "https://melissas.com", domain: "melissas.com" },
  { slug: "sprinly", name: "Sprinly", website: "https://sprinly.com", domain: "sprinly.com" },
  { slug: "modifyhealth", name: "ModifyHealth", website: "https://modifyhealth.com", domain: "modifyhealth.com" },
  { slug: "mealpro", name: "MealPro", website: "https://mealpro.net", domain: "mealpro.net" },
  { slug: "megafit-meals", name: "MegaFit Meals", website: "https://megafitmeals.com", domain: "megafitmeals.com" },
  { slug: "methodology", name: "Methodology", website: "https://gomethodology.com", domain: "gomethodology.com" },
  { slug: "primal-pastures", name: "Primal Pastures", website: "https://primalpastures.com", domain: "primalpastures.com" },
  { slug: "alaskan-salmon-company", name: "Alaskan Salmon Company", website: "https://aksalmonco.com", domain: "aksalmonco.com" },
  { slug: "wild-tide-seafoods", name: "Wild Tide Seafoods", website: "https://wildtideseafoods.com", domain: "wildtideseafoods.com" },
  { slug: "frog-hollow-farm", name: "Frog Hollow Farm", website: "https://froghollow.com", domain: "froghollow.com" },
  { slug: "seoulbox", name: "Seoulbox", website: "https://myseoulbox.com", domain: "myseoulbox.com" },
  { slug: "snackfever", name: "SnackFever", website: "https://snackfever.com", domain: "snackfever.com" },
  { slug: "fuego-box", name: "Fuego Box", website: "https://fuegobox.com", domain: "fuegobox.com" },
];

// Color palette for SVG placeholders (deterministic per first letter)
const PLACEHOLDER_COLORS: Record<string, string> = {
  A: "#e74c3c", B: "#3498db", C: "#2ecc71", D: "#e67e22", E: "#9b59b6",
  F: "#1abc9c", G: "#f39c12", H: "#e74c3c", I: "#3498db", J: "#2ecc71",
  K: "#e67e22", L: "#9b59b6", M: "#1abc9c", N: "#f39c12", O: "#e74c3c",
  P: "#3498db", Q: "#2ecc71", R: "#e67e22", S: "#9b59b6", T: "#1abc9c",
  U: "#f39c12", V: "#e74c3c", W: "#3498db", X: "#2ecc71", Y: "#e67e22",
  Z: "#9b59b6",
};

function generatePlaceholderSvg(name: string): string {
  const letter = name.charAt(0).toUpperCase();
  const color = PLACEHOLDER_COLORS[letter] ?? "#6c757d";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="32" fill="${color}"/>
  <text x="128" y="148" font-family="Arial, Helvetica, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle">${letter}</text>
</svg>`;
}

interface ManifestEntry {
  slug: string;
  name: string;
  website: string;
  asset: string;
  sourceUrl: string | null;
  error: string | null;
}

const ASSETS_DIR = path.join(process.cwd(), "public", "assets", "providers");
const MANIFEST_PATH = path.join(ASSETS_DIR, "manifest.json");

async function downloadLogo(
  provider: typeof NEW_PROVIDERS[number],
): Promise<ManifestEntry> {
  const { slug, name, website, domain } = provider;

  // Primary: Google Favicon Service (most reliable, always returns an image)
  const googleUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=256`;
  try {
    console.log(`  [${slug}] Trying Google Favicon: ${domain}`);
    const response = await fetch(googleUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.startsWith("image/")) {
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > 500) {
          const filePath = path.join(ASSETS_DIR, `${slug}.png`);
          fs.writeFileSync(filePath, buffer);
          console.log(`  [${slug}] SUCCESS via Google Favicon (${buffer.length} bytes)`);
          return { slug, name, website, asset: `/assets/providers/${slug}.png`, sourceUrl: googleUrl, error: null };
        }
      }
    }
    console.log(`  [${slug}] Google Favicon returned non-image or too small, trying clearbit...`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  [${slug}] Google Favicon failed: ${msg}`);
  }

  // Fallback 1: logo.clearbit.com
  const clearbitUrl = `https://logo.clearbit.com/${domain}`;
  try {
    console.log(`  [${slug}] Trying clearbit: ${clearbitUrl}`);
    const response = await fetch(clearbitUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.startsWith("image/")) {
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > 100) {
          const filePath = path.join(ASSETS_DIR, `${slug}.png`);
          fs.writeFileSync(filePath, buffer);
          console.log(`  [${slug}] SUCCESS via clearbit (${buffer.length} bytes)`);
          return { slug, name, website, asset: `/assets/providers/${slug}.png`, sourceUrl: clearbitUrl, error: null };
        }
      }
    }
    console.log(`  [${slug}] Clearbit returned non-image or too small, trying logo.dev...`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  [${slug}] Clearbit failed: ${msg}`);
  }

  // Fallback 2: img.logo.dev
  const logoDevUrl = `https://img.logo.dev/${domain}?token=pk_anonymous&size=256`;
  try {
    console.log(`  [${slug}] Trying logo.dev: ${logoDevUrl}`);
    const response = await fetch(logoDevUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.startsWith("image/")) {
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > 100) {
          const filePath = path.join(ASSETS_DIR, `${slug}.png`);
          fs.writeFileSync(filePath, buffer);
          console.log(`  [${slug}] SUCCESS via logo.dev (${buffer.length} bytes)`);
          return { slug, name, website, asset: `/assets/providers/${slug}.png`, sourceUrl: logoDevUrl, error: null };
        }
      }
    }
    console.log(`  [${slug}] logo.dev returned non-image or too small, using placeholder...`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  [${slug}] logo.dev failed: ${msg}`);
  }

  // Final fallback: SVG placeholder
  console.log(`  [${slug}] Using SVG placeholder`);
  const svg = generatePlaceholderSvg(name);
  const filePath = path.join(ASSETS_DIR, `${slug}.svg`);
  fs.writeFileSync(filePath, svg);
  return { slug, name, website, asset: `/assets/providers/${slug}.svg`, sourceUrl: null, error: "Both clearbit and logo.dev failed; using SVG placeholder" };
}

async function main() {
  console.log("=== Phase 23 Plan 01: Download Logos for 22 New Providers ===\n");

  // Ensure output directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  // Download all logos sequentially (to avoid rate limiting)
  const newEntries: ManifestEntry[] = [];
  let successCount = 0;
  let placeholderCount = 0;

  for (const provider of NEW_PROVIDERS) {
    const entry = await downloadLogo(provider);
    newEntries.push(entry);
    if (entry.error) {
      placeholderCount++;
    } else {
      successCount++;
    }
    // Small delay between requests to be polite
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Read existing manifest
  console.log("\nUpdating manifest.json...");
  const existingManifest: ManifestEntry[] = JSON.parse(
    fs.readFileSync(MANIFEST_PATH, "utf8"),
  );
  console.log(`  Existing entries: ${existingManifest.length}`);

  // Remove any existing entries for our slugs (in case of re-run)
  const newSlugs = new Set(NEW_PROVIDERS.map((p) => p.slug));
  const filteredManifest = existingManifest.filter(
    (entry) => !newSlugs.has(entry.slug),
  );

  // Merge and sort alphabetically by slug
  const fullManifest = [...filteredManifest, ...newEntries].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );

  // Write updated manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(fullManifest, null, 2) + "\n");
  console.log(`  Total entries after merge: ${fullManifest.length}`);

  // Summary
  console.log("\n=== Summary ===");
  console.log(`  Logos downloaded successfully: ${successCount}`);
  console.log(`  SVG placeholders created: ${placeholderCount}`);
  console.log(`  Total new entries: ${newEntries.length}`);
  console.log(`  Manifest entries: ${fullManifest.length}`);

  if (placeholderCount > 0) {
    console.log("\n  Providers using SVG placeholders:");
    for (const entry of newEntries) {
      if (entry.error) {
        console.log(`    - ${entry.slug}: ${entry.error}`);
      }
    }
  }

  console.log("\nDone!");
}

main().catch((e) => {
  console.error("Logo download failed:", e);
  process.exit(1);
});
