import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import handCraftedProviders from "./seed-data/providers";
import { recalculateProviderPricing } from "./seed-data/helpers";
import { seedCollections } from "./seed-data/collections";
import { seedBlogPosts } from "./seed-data/blog-posts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// --- Load external data sources ---

const jsonDataset: JsonProvider[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../temp/plandocs/food-box-companies.json"), "utf-8"),
);
const manifest: ManifestEntry[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../public/assets/providers/manifest.json"), "utf-8"),
);

// --- Types ---

interface JsonProvider {
  slug: string;
  name: string;
  website: string;
  primary_category: string;
  secondary_tags: string;
  model_type: string;
  prep_style: string;
  diet_tags: string;
  household_fit: string;
  value_tier: string;
  geography: string;
  shipping_notes: string;
  flexibility: string;
  pricing_signal: string;
  affiliate_signal: string;
  status: string;
  summary: string;
  source_files: string;
  source_urls: string;
  notes: string;
}

interface ManifestEntry {
  slug: string;
  asset: string;
}

// --- Mapping utilities ---

const CATEGORY_MAP: Record<string, string> = {
  meal_kits: "MEAL_KIT",
  prepared_meals: "PREPARED_MEAL",
  protein_boxes: "PROTEIN_BOX",
  produce_boxes: "PRODUCE_BOX",
  specialty: "SPECIALTY",
};

const STATUS_MAP: Record<string, string> = {
  active: "ACTIVE",
  hybrid: "HYBRID",
  unclear: "UNCLEAR",
  discontinued: "DISCONTINUED",
};

const VALUE_TIER_MAP: Record<string, string> = {
  budget: "BUDGET",
  mid: "MID",
  premium: "PREMIUM",
  luxury: "LUXURY",
};

const DIET_TAG_MAP: Record<string, string | null> = {
  vegan: "VEGAN",
  vegetarian: "VEGETARIAN",
  keto: "KETO",
  "dairy-free": "DAIRY_FREE",
  "gluten-free": "GLUTEN_FREE",
  "low-carb": "LOW_CARB",
  mediterranean: "MEDITERRANEAN",
  "high-protein": null,
  "plant-based": null,
  "plant-based options": null,
  "plant-forward": null,
  protein: null,
  "vegan options": null,
  "gluten-free options": null,
};

function parsePipeDelimited(value: string | undefined | null): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function nullIfEmpty(value: string | undefined | null): string | null {
  if (!value || !value.trim()) return null;
  return value.trim();
}

function getLogoUrl(slug: string): string | null {
  const entry = manifest.find((m) => m.slug === slug);
  if (!entry) return null;
  return entry.asset;
}

function mapDietTags(pipeDelimited: string | undefined | null): string[] {
  return parsePipeDelimited(pipeDelimited)
    .map((tag) => DIET_TAG_MAP[tag] ?? null)
    .filter((t): t is string => t !== null);
}

// --- Main seed logic ---

async function main() {
  console.log("Seeding database...\n");

  // Clean slate: delete all data in dependency order (children first)
  console.log("Clearing existing data...");
  await prisma.affiliateClick.deleteMany();
  await prisma.collectionItem.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.review.deleteMany();
  await prisma.providerFaq.deleteMany();
  await prisma.providerDietaryTag.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.provider.deleteMany();
  console.log("All existing data cleared.\n");

  // Build a Map of hand-crafted providers keyed by slug for O(1) lookup
  const handCraftedMap = new Map<string, (typeof handCraftedProviders)[number]>();
  for (const hcp of handCraftedProviders) {
    handCraftedMap.set(hcp.slug, hcp);
  }

  // Create each provider by iterating over the JSON dataset
  console.log("Creating providers...");
  let createdCount = 0;

  for (const jsonRecord of jsonDataset) {
    const handCrafted = handCraftedMap.get(jsonRecord.slug);

    // Dataset metadata fields (used for both merged and JSON-only providers)
    const datasetFields = {
      status: STATUS_MAP[jsonRecord.status] ?? "UNCLEAR",
      modelType: nullIfEmpty(jsonRecord.model_type),
      prepStyle: nullIfEmpty(jsonRecord.prep_style),
      valueTier: nullIfEmpty(VALUE_TIER_MAP[jsonRecord.value_tier]) ?? undefined,
      householdFit: nullIfEmpty(jsonRecord.household_fit),
      geography: nullIfEmpty(jsonRecord.geography),
      shippingNotes: nullIfEmpty(jsonRecord.shipping_notes),
      flexibility: nullIfEmpty(jsonRecord.flexibility),
      pricingSignal: nullIfEmpty(jsonRecord.pricing_signal),
      secondaryTags: nullIfEmpty(jsonRecord.secondary_tags),
      affiliateSignal: nullIfEmpty(jsonRecord.affiliate_signal),
      sourceUrls: nullIfEmpty(jsonRecord.source_urls),
      sourceFiles: nullIfEmpty(jsonRecord.source_files),
      notes: nullIfEmpty(jsonRecord.notes),
      logoUrl: getLogoUrl(jsonRecord.slug),
    };

    // Get diet tags from JSON
    const jsonDietTags = mapDietTags(jsonRecord.diet_tags);

    if (handCrafted) {
      // ---- MERGED: hand-crafted base + JSON overlay ----

      // Collect hand-crafted diet tags
      const hcDietTags: string[] = [];
      const dtCreate = (handCrafted as Record<string, unknown>).dietaryTags as
        | { create: Array<{ tag: string }> }
        | undefined;
      if (dtCreate?.create) {
        for (const dt of dtCreate.create) {
          hcDietTags.push(dt.tag);
        }
      }

      // Merge diet tags: union of hand-crafted + JSON-derived tags
      const allDietTags = [...new Set([...hcDietTags, ...jsonDietTags])];

      // Build the provider data from hand-crafted base
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dietaryTags: _dt, status: _status, ...restHandCrafted } = handCrafted as Record<string, unknown>;

      const providerData = {
        ...restHandCrafted,
        // Overlay dataset fields
        ...datasetFields,
        // Rebuild dietary tags
        dietaryTags: {
          create: allDietTags.map((tag) => ({ tag })),
        },
      };

      const provider = await prisma.provider.create({
        data: providerData as Parameters<typeof prisma.provider.create>[0]["data"],
      });
      console.log(`  Created (merged): ${provider.name} (${provider.category})`);
    } else {
      // ---- JSON-ONLY: minimal provider from dataset ----
      const category = CATEGORY_MAP[jsonRecord.primary_category];
      if (!category) {
        console.warn(`  Warning: Unknown category "${jsonRecord.primary_category}" for ${jsonRecord.slug}. Skipping.`);
        continue;
      }

      const providerData = {
        name: jsonRecord.name,
        slug: jsonRecord.slug,
        description: jsonRecord.summary,
        website: jsonRecord.website,
        category,
        ...datasetFields,
        dietaryTags:
          jsonDietTags.length > 0
            ? { create: jsonDietTags.map((tag) => ({ tag })) }
            : undefined,
      };

      const provider = await prisma.provider.create({
        data: providerData as Parameters<typeof prisma.provider.create>[0]["data"],
      });
      console.log(`  Created (JSON): ${provider.name} (${provider.category})`);
    }

    createdCount++;
  }

  // Check if any hand-crafted providers were NOT in the JSON dataset (should be 0 after slug fixes)
  for (const hcp of handCraftedProviders) {
    const inJson = jsonDataset.some((j) => j.slug === hcp.slug);
    if (!inJson) {
      console.warn(`  Warning: Hand-crafted provider "${hcp.slug}" not found in JSON dataset. Seeding standalone.`);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { active: _active, ...rest } = hcp as Record<string, unknown>;
      const providerData = {
        ...rest,
        status: "ACTIVE",
        logoUrl: getLogoUrl(hcp.slug),
      };

      await prisma.provider.create({
        data: providerData as Parameters<typeof prisma.provider.create>[0]["data"],
      });
      createdCount++;
    }
  }

  console.log(`\n  Total providers created: ${createdCount}\n`);

  // Recalculate denormalized pricing fields
  console.log("Recalculating denormalized pricing...");
  const allProviders = await prisma.provider.findMany({ select: { id: true, name: true } });
  for (const { id, name } of allProviders) {
    await recalculateProviderPricing(prisma, id);
  }
  console.log(`  Recalculated for ${allProviders.length} providers.\n`);

  // Seed collections (must run after providers exist)
  await seedCollections(prisma);
  console.log("");

  // Seed blog posts
  await seedBlogPosts(prisma);
  console.log("");

  // Print summary stats
  const providerCount = await prisma.provider.count();
  const planCount = await prisma.plan.count();
  const reviewCount = await prisma.review.count();
  const tagCount = await prisma.providerDietaryTag.count();
  const faqCount = await prisma.providerFaq.count();
  const collectionCount = await prisma.collection.count();
  const collectionItemCount = await prisma.collectionItem.count();
  const blogPostCount = await prisma.blogPost.count();

  const categoryCounts = await prisma.provider.groupBy({
    by: ["category"],
    _count: true,
  });

  const providersWithLogo = await prisma.provider.count({
    where: { logoUrl: { not: null } },
  });

  const withPrices = await prisma.provider.count({
    where: { minPricePerServingCents: { not: null } },
  });

  console.log("=== Seed Summary ===");
  console.log(`Providers: ${providerCount}`);
  console.log(`Plans: ${planCount}`);
  console.log(`Reviews: ${reviewCount}`);
  console.log(`Dietary Tags: ${tagCount}`);
  console.log(`FAQs: ${faqCount}`);
  console.log(`Collections: ${collectionCount} (${collectionItemCount} items)`);
  console.log(`Blog Posts: ${blogPostCount}`);
  console.log(`\nProviders per category:`);
  for (const group of categoryCounts) {
    console.log(`  ${group.category}: ${group._count}`);
  }
  console.log(`\nProviders with logoUrl populated: ${providersWithLogo}`);
  console.log(`Providers with denormalized pricing: ${withPrices}`);
  console.log("\nSeed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
