/**
 * Phase 23 Plan 02: Add 22 New Providers (Tier 1 + Tier 2)
 *
 * This script inserts 22 new providers into the database using upsert (idempotent).
 * It reads manifest.json to set the correct logoUrl for each provider.
 *
 * Run with: npx tsx prisma/scripts/23-add-providers.ts
 */

import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "node:fs";
import * as path from "node:path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Read manifest.json to build slug -> asset map
const manifestPath = path.resolve(__dirname, "../../public/assets/providers/manifest.json");
const manifest: Array<{ slug: string; asset: string }> = JSON.parse(
  fs.readFileSync(manifestPath, "utf-8"),
);
const logoMap = new Map<string, string>();
for (const entry of manifest) {
  logoMap.set(entry.slug, entry.asset);
}

interface NewProvider {
  name: string;
  slug: string;
  website: string;
  category: "MEAL_KIT" | "PREPARED_MEAL" | "PROTEIN_BOX" | "PRODUCE_BOX" | "SPECIALTY";
  status: "ACTIVE";
  modelType: string;
  prepStyle: string;
  description: string;
  notes: string;
  parentCompany?: string;
}

const NEW_PROVIDERS: NewProvider[] = [
  // ─── Tier 1 (10 must-adds) ────────────────────────────────────────────────
  {
    name: "Clean Eatz Kitchen",
    slug: "clean-eatz-kitchen",
    website: "https://cleaneatzkitchen.com",
    category: "PREPARED_MEAL",
    status: "ACTIVE",
    modelType: "subscription-free",
    prepStyle: "heat-and-eat",
    description: "Clean Eatz Kitchen -- see research notes for positioning, pricing, and flexibility details.",
    notes: "No-subscription model (unique positioning), $7.50/meal, flash-frozen, GLP-1 meal plan, dietitian-designed. Appears in multiple 2026 comparison articles as Factor alternative.",
  },
  {
    name: "Tempo",
    slug: "tempo",
    website: "https://tempomeals.com",
    category: "PREPARED_MEAL",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "heat-and-eat",
    parentCompany: "Kroger",
    description: "Tempo -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Home Chef's prepared meal brand by Kroger. 4-minute microwave meals, $11-13/serving. Launched Oct 2023. Appears in NBC, Fortune, Taste of Home 2026 lists.",
  },
  {
    name: "Rastelli's",
    slug: "rastellis",
    website: "https://rastellis.com",
    category: "PROTEIN_BOX",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "raw-ingredients",
    description: "Rastelli's -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Widely reviewed meat/seafood subscription. Grass-fed, blast-frozen at -40F. Flexible 2/4/6/8 week delivery. $12+/portion. Free shipping over $200.",
  },
  {
    name: "Sea to Table",
    slug: "sea-to-table",
    website: "https://sea2table.com",
    category: "PROTEIN_BOX",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "raw-ingredients",
    description: "Sea to Table -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Wild-caught US seafood subscriptions. DNA-tested fish (only company doing this). 4/6/8 week delivery. Traceable to specific fisheries.",
  },
  {
    name: "Cometeer",
    slug: "cometeer",
    website: "https://cometeer.com",
    category: "SPECIALTY",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "ready-to-drink",
    description: "Cometeer -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Flash-frozen coffee capsules. Innovative format. $2/cup. Strong media buzz. Multiple 2026 \"best coffee subscription\" lists.",
  },
  {
    name: "TokyoTreat",
    slug: "tokyotreat",
    website: "https://tokyotreat.com",
    category: "SPECIALTY",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "ready-to-eat",
    description: "TokyoTreat -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Japanese snack box, 15-20 items, $32.50/mo. 24-page culture guide. Ships worldwide. Very popular.",
  },
  {
    name: "Japan Crate",
    slug: "japan-crate",
    website: "https://japancrate.com",
    category: "SPECIALTY",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "ready-to-eat",
    description: "Japan Crate -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Japanese candy/snacks, 3 tiers ($12-35/mo). DIY kits, drinks included.",
  },
  {
    name: "Munch Addict",
    slug: "munch-addict",
    website: "https://munchaddict.com",
    category: "SPECIALTY",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "ready-to-eat",
    description: "Munch Addict -- see research notes for positioning, pricing, and flexibility details.",
    notes: "International snacks, 5-72 snacks per order. Also Korean-specific box. LA-based.",
  },
  {
    name: "Heatonist",
    slug: "heatonist",
    website: "https://heatonist.com",
    category: "SPECIALTY",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "condiment",
    description: "Heatonist -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Official Hot Ones hot sauce subscription. 3 sauces/month. Strong brand recognition from the show.",
  },
  {
    name: "Melissa's Produce",
    slug: "melissas-produce",
    website: "https://melissas.com",
    category: "PRODUCE_BOX",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "raw-ingredients",
    description: "Melissa's Produce -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Named \"best overall produce delivery\" by Taste of Home. Subscription clubs (HarvestClub Americana, Medley, Exotica, Organic). National.",
  },

  // ─── Tier 2 (12 should-adds) ──────────────────────────────────────────────
  {
    name: "Sprinly",
    slug: "sprinly",
    website: "https://sprinly.com",
    category: "PREPARED_MEAL",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "heat-and-eat",
    description: "Sprinly -- see research notes for positioning, pricing, and flexibility details.",
    notes: "100% plant-based, organic, gluten-free prepared meals. Ships nationwide incl AK/HI. $18/meal. Cleveland-based.",
  },
  {
    name: "ModifyHealth",
    slug: "modifyhealth",
    website: "https://modifyhealth.com",
    category: "PREPARED_MEAL",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "heat-and-eat",
    description: "ModifyHealth -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Gut health / Low FODMAP specialist. Monash University certified. Also GLP-1, Mediterranean, diabetes-friendly. Free shipping. Dietitian access included.",
  },
  {
    name: "MealPro",
    slug: "mealpro",
    website: "https://mealpro.net",
    category: "PREPARED_MEAL",
    status: "ACTIVE",
    modelType: "subscription-free",
    prepStyle: "heat-and-eat",
    description: "MealPro -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Fitness-focused, no subscription required, macro-customizable, registered dietitian designed. Nationwide delivery.",
  },
  {
    name: "MegaFit Meals",
    slug: "megafit-meals",
    website: "https://megafitmeals.com",
    category: "PREPARED_MEAL",
    status: "ACTIVE",
    modelType: "hybrid",
    prepStyle: "heat-and-eat",
    description: "MegaFit Meals -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Fitness/bodybuilding focused, $12.95-18/meal, 40+ rotating meals, macro-customizable, one-time or subscription.",
  },
  {
    name: "Methodology",
    slug: "methodology",
    website: "https://gomethodology.com",
    category: "PREPARED_MEAL",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "heat-and-eat",
    description: "Methodology -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Premium prepared meals ($14-18/meal), zero food waste, gluten/dairy/refined sugar free. Expanded from SF Bay Area to nationwide.",
  },
  {
    name: "Primal Pastures",
    slug: "primal-pastures",
    website: "https://primalpastures.com",
    category: "PROTEIN_BOX",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "raw-ingredients",
    description: "Primal Pastures -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Regenerative, pasture-raised, soy-free, sugar-free. Nationwide. 10-20lb boxes.",
  },
  {
    name: "Alaskan Salmon Company",
    slug: "alaskan-salmon-company",
    website: "https://aksalmonco.com",
    category: "PROTEIN_BOX",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "raw-ingredients",
    description: "Alaskan Salmon Company -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Direct-from-Alaska wild salmon. Flash-frozen, customizable boxes.",
  },
  {
    name: "Wild Tide Seafoods",
    slug: "wild-tide-seafoods",
    website: "https://wildtideseafoods.com",
    category: "PROTEIN_BOX",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "raw-ingredients",
    description: "Wild Tide Seafoods -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Wild-caught seafood subscription boxes. Captain's Choice, Omega, Grill boxes. 14% subscriber discount.",
  },
  {
    name: "Frog Hollow Farm",
    slug: "frog-hollow-farm",
    website: "https://froghollow.com",
    category: "PRODUCE_BOX",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "raw-ingredients",
    description: "Frog Hollow Farm -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Premium organic fruit subscriptions. \"Tree to table\" from their own California farm. Bay Area CSA + nationwide shipping.",
  },
  {
    name: "Seoulbox",
    slug: "seoulbox",
    website: "https://myseoulbox.com",
    category: "SPECIALTY",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "ready-to-eat",
    description: "Seoulbox -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Korean snacks + K-beauty + K-pop merch. Ships from Seoul. Vegetarian option available.",
  },
  {
    name: "SnackFever",
    slug: "snackfever",
    website: "https://snackfever.com",
    category: "SPECIALTY",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "ready-to-eat",
    description: "SnackFever -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Korean snacks, $19.99-29.99/box. Ships from Korea.",
  },
  {
    name: "Fuego Box",
    slug: "fuego-box",
    website: "https://fuegobox.com",
    category: "SPECIALTY",
    status: "ACTIVE",
    modelType: "subscription",
    prepStyle: "condiment",
    description: "Fuego Box -- see research notes for positioning, pricing, and flexibility details.",
    notes: "Curated hot sauce subscription. Flavor-forward, not gimmicky heat.",
  },
];

async function main() {
  console.log("=== Phase 23 Plan 02: Add 22 New Providers ===\n");

  let created = 0;
  let skipped = 0;

  for (const provider of NEW_PROVIDERS) {
    const logoUrl = logoMap.get(provider.slug) ?? null;

    if (!logoUrl) {
      console.log(`  WARNING: No logo found in manifest for ${provider.slug}`);
    }

    const result = await prisma.provider.upsert({
      where: { slug: provider.slug },
      update: {}, // Don't overwrite if provider was already enriched
      create: {
        name: provider.name,
        slug: provider.slug,
        website: provider.website,
        category: provider.category,
        status: provider.status,
        modelType: provider.modelType,
        prepStyle: provider.prepStyle,
        description: provider.description,
        notes: provider.notes,
        logoUrl,
        ...(provider.parentCompany ? { parentCompany: provider.parentCompany } : {}),
      },
    });

    // Check if this was a create (new) or update (existing) by comparing createdAt/updatedAt
    const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
    if (isNew) {
      console.log(`  CREATED: ${provider.name} (${provider.category})`);
      created++;
    } else {
      console.log(`  EXISTS:  ${provider.name} (${provider.category}) - skipped`);
      skipped++;
    }
  }

  // Summary
  console.log("\n=== Migration Summary ===");
  console.log(`  New providers created: ${created}`);
  console.log(`  Already existed (skipped): ${skipped}`);
  console.log(`  Total processed: ${NEW_PROVIDERS.length}`);

  // Verify totals
  const totalProviders = await prisma.provider.count();
  const activeProviders = await prisma.provider.count({ where: { status: "ACTIVE" } });
  console.log(`\n  Total providers in database: ${totalProviders}`);
  console.log(`  Active providers: ${activeProviders}`);

  // Category breakdown of new providers
  const categoryBreakdown = NEW_PROVIDERS.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log("\n  New provider category breakdown:");
  for (const [cat, count] of Object.entries(categoryBreakdown)) {
    console.log(`    ${cat}: ${count}`);
  }

  console.log("\nDone!");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Migration failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
