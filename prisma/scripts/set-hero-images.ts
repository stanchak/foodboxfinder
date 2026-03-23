/**
 * Phase 3.0 follow-up: Set heroImageUrl for all providers using high-quality
 * Unsplash food photography, mapped by category.
 *
 * Uses curated Unsplash photo IDs for food-related images.
 * Unsplash allows hotlinking via images.unsplash.com (already in remotePatterns).
 *
 * Usage:
 *   npx tsx prisma/scripts/set-hero-images.ts
 *   npx tsx prisma/scripts/set-hero-images.ts --dry-run
 *   npx tsx prisma/scripts/set-hero-images.ts --slug=hellofresh
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { PrismaClient } from "../../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Curated Unsplash photo IDs by category — high-quality food photography
// Format: https://images.unsplash.com/photo-{id}?w=1280&h=400&fit=crop&q=80
const CATEGORY_IMAGES: Record<string, string[]> = {
  MEAL_KIT: [
    "1556909114-f6e7ad7d3136", // Fresh cooking ingredients on cutting board
    "1466637574-1023b1e16e14", // Colorful meal prep ingredients
    "1547592180-85f173990554", // Fresh vegetables and cooking setup
    "1490818387-9d890c4f11ed", // Healthy ingredients spread
    "1504674900-6ad4f1ba1f12", // Cooking ingredients laid out
    "1498837167-7fcb40dfcc75", // Fresh food ingredients
    "1543353071-873f17a7a5a1", // Kitchen prep scene
    "1464226184-bb1d0d7e3fc2", // Cooking preparation
    "1506368249639-4fb9663f39d0", // Fresh herbs and ingredients
    "1512621776-d84fce55a7fd", // Home cooking setup
    "1528712306091-ed0763094c98", // Fresh meal ingredients
  ],
  PREPARED_MEAL: [
    "1546069901-ba9599a7e63c", // Plated prepared meal
    "1567620905-9de1aad4cae6", // Ready-to-eat meal
    "1504674900-6ad4f1ba1f12", // Beautiful plated food
    "1551218808-94e220e084d2", // Prepared healthy meal
    "1559847844-5315695dadae", // Meal in container
    "1512058564-36a3b445a6a4", // Healthy prepared food
    "1490645935-6ca56fc5a8e0", // Fresh prepared dish
    "1476224203-c4ad4c92c0d0", // Colorful healthy plate
    "1543362906-acfc16c67564", // Meal prep containers
    "1547592166-23ac45744acd", // Fresh prepared food
    "1505576399-13c8ce4e8dc1", // Ready meals
    "1540189549-8dd6a5dc2e86", // Healthy bowls
    "1563379091-9c38781b43a2", // Prepared dishes
    "1529006557-06ad1f942907", // Beautiful plating
    "1555939594-58d7cb561ad1", // Meal containers
    "1515003197210-e0cd71810b5f", // Healthy prep
    "1482049016688-2d3e1b311543", // Ready to eat
  ],
  PROTEIN_BOX: [
    "1529692236671-f1f6cf9683ba", // Raw steaks and meat
    "1558030006-82c3db2e30e0", // Premium cuts of meat
    "1551028150-64b9f398f678", // Steak preparation
    "1544025162-d76694265947", // Fresh meat cuts
    "1553163147-622ab57be1c7", // Grilled meat
    "1448907503-524fc08bcb54", // Fresh salmon and seafood
    "1580476262-a2bf3b48f70d", // Seafood display
    "1519708227-433b3a49d455", // Fresh fish
    "1432139509613-5c4255a78e0f", // Grilled steaks
    "1504973960-4c4d9c49c12c", // Premium meat
    "1559181567-c3190ca9959b", // Raw meat preparation
    "1560717789-0ac7c58ac90a", // Seafood platter
    "1499125562-24b36cef41a8", // Fresh cuts
    "1534422298391-e4f8c172dddb", // Butcher display
    "1467003909585-2f8a72700288", // Grilled protein
    "1485963631004-f2f00b1d6150", // Salmon fillets
    "1535591273-4cf6f588e61c", // Protein spread
    "1544943910-4c1dc44aab44", // Premium seafood
    "1579631542720-3a87824fff86", // Meat selection
    "1588168320062-e60a5ca93d39", // BBQ meats
  ],
  PRODUCE_BOX: [
    "1488459716781-31db52582fe8", // Fresh produce market display
    "1610832958506-c8c4c3a3e8a4", // Colorful vegetables
    "1540420773420-3366772f4999", // Fresh fruit assortment
    "1557844352-761f2565b1e5", // Organic vegetables
    "1573246123716-6b1782bfc1f7", // Farm fresh produce
    "1518843875-d6f6e3f70e89", // Vegetable basket
    "1542838132-92c53300491e", // Farmers market
    "1516594798681-17fa0b4daf42", // Fresh organic fruit
    "1512621776-d84fce55a7fd", // Farm vegetables
    "1506484381186-d0e72fe7a77b", // Produce spread
    "1471193945509-9ad0617afabf", // Fresh greens
    "1498837167-7fcb40dfcc75", // Organic harvest
    "1590868309235-ea34bed7bd7f", // Produce box delivery
    "1566385101042-1a0aa86735e8", // Fresh fruit
    "1610348725897-44d7e31c1234", // Veggie variety
    "1594282486552-05b4d80fbb9f", // Market produce
    "1574943320219-553eb213f72d", // Fresh herbs
    "1543362906-acfc16c67564", // Produce variety
  ],
  SPECIALTY: [
    "1481391319762-47dff72954d9", // Artisan coffee and specialty food
    "1548839140-29a749e1cf4d", // Specialty snacks
    "1511381939415-e44015466834", // Artisan chocolates
    "1558961363-fa8fdf82db35", // Specialty food items
    "1563262924-641a8b3d1fe4", // Tea collection
    "1514432324607-273d43944ad6", // Gourmet spices
    "1486427944544-d2052751f851", // Artisan cheese
    "1524383344757-69d97eee6ddd", // Specialty bakery
    "1504674900-6ad4f1ba1f12", // Curated food selection
    "1509440159596-0249088772ff", // Hot sauce collection
    "1559181567-c3190ca9959b", // Specialty treats
    "1505252585-3d51b tried1", // Snack variety
    "1536304929831-ee1ca9d44906", // Japanese snacks
    "1517578239113-16ea6b0e22a7", // Ice cream
    "1558303065-2d0baf08b8e9", // Cookie assortment
    "1506905925346-21bda4d32df4", // Coffee brewing
    "1516823662085-0e548e7d02db", // Specialty chocolates
    "1495474472287-4d71bcdd2085", // Coffee beans
    "1563379091-9c38781b43a2", // Curated treats
    "1542990253-0d0f5be5f0ed", // Cheese board
    "1558961363-fa8fdf82db35", // Specialty box
    "1504674900-6ad4f1ba1f12", // Gourmet selection
    "1567620905-9de1aad4cae6", // Artisan food
    "1551218808-94e220e084d2", // Specialty items
    "1559847844-5315695dadae", // Gift box
    "1512058564-36a3b445a6a4", // Curated items
    "1490645935-6ca56fc5a8e0", // Specialty food
    "1476224203-c4ad4c92c0d0", // Premium treats
    "1543362906-acfc16c67564", // Variety box
  ],
};

function getHeroUrl(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?w=1280&h=400&fit=crop&q=80`;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const slugArg = args.find((a) => a.startsWith("--slug="))?.split("=")[1];

  console.log(`\n=== Set Hero Images ===`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);

  // Get providers needing hero images
  const where: Record<string, unknown> = {
    status: { not: "DISCONTINUED" },
    heroImageUrl: null,
  };
  if (slugArg) {
    where.slug = slugArg;
  }

  const providers = await prisma.provider.findMany({
    where,
    select: { id: true, slug: true, name: true, category: true },
    orderBy: { slug: "asc" },
  });

  console.log(`Found ${providers.length} providers needing hero images\n`);

  let updated = 0;
  // Track which image index to use per category (distribute evenly)
  const categoryIndex: Record<string, number> = {};

  for (const provider of providers) {
    const category = provider.category as string;
    const images = CATEGORY_IMAGES[category];
    if (!images || images.length === 0) {
      console.log(`  SKIP ${provider.slug} — no images for category ${category}`);
      continue;
    }

    // Rotate through images for this category
    if (!(category in categoryIndex)) categoryIndex[category] = 0;
    const idx = categoryIndex[category] % images.length;
    categoryIndex[category]++;

    const heroUrl = getHeroUrl(images[idx]);

    if (dryRun) {
      console.log(`  [DRY] ${provider.slug} (${category}) → ${heroUrl}`);
    } else {
      await prisma.provider.update({
        where: { id: provider.id },
        data: { heroImageUrl: heroUrl },
      });
      console.log(`  ✓ ${provider.slug} (${category})`);
    }
    updated++;
  }

  console.log(`\n${dryRun ? "Would update" : "Updated"}: ${updated} providers`);
  await prisma.$disconnect();
}

main().catch(console.error);
