/**
 * Phase 25 Plan 01: xAI-powered Pricing Research & Plan Creation
 *
 * This script uses xAI's grok-4-1-fast-reasoning model with web_search to
 * research current pricing for each provider and create Plan records in the database.
 *
 * Features:
 * - Category-aware prompts (meal kits vs protein boxes vs specialty)
 * - Validation with category-specific null enforcement
 * - Idempotent: deletes existing plans before re-creating (safe to re-run)
 * - Denormalized field recomputation after plan creation
 * - Supports --dry-run, --slug, --limit, --category, --include-existing flags
 *
 * Run with: npx tsx prisma/scripts/25-create-plans.ts
 * Test:     npx tsx prisma/scripts/25-create-plans.ts --dry-run --limit=1
 * Single:   npx tsx prisma/scripts/25-create-plans.ts --slug=hellofresh
 * Category: npx tsx prisma/scripts/25-create-plans.ts --category=MEAL_KIT --limit=5
 */

import "dotenv/config";
import { config } from "dotenv";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PlanFrequency } from "../../src/generated/prisma/client";

// Load .env.local for XAI_API_KEY (dotenv/config only loads .env)
config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Types ──────────────────────────────────────────────────────────────────

interface PlanData {
  name: string;
  description: string;
  pricePerServingCents: number | null;
  pricePerBoxCents: number | null;
  pricePerWeekCents: number | null;
  shippingCostCents: number;
  shippingNote: string | null;
  introOfferNote: string | null;
  servingsPerMeal: number | null;
  mealsPerWeek: number | null;
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "FLEXIBLE";
  isPopular: boolean;
}

interface PricingResponse {
  plans: PlanData[];
}

interface ProviderRecord {
  id: string;
  slug: string;
  name: string;
  website: string;
  category: string;
  plans: Array<{ id: string }>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const BATCH_SIZE = 10;
const INTER_CALL_DELAY_MS = 2000;
const INTER_BATCH_DELAY_MS = 5000;

const XAI_API_URL = "https://api.x.ai/v1/responses";
const XAI_MODEL = "grok-4-1-fast-reasoning";

const VALID_FREQUENCIES = new Set(["WEEKLY", "BIWEEKLY", "MONTHLY", "FLEXIBLE"]);

const CATEGORY_LABELS: Record<string, string> = {
  MEAL_KIT: "meal kit",
  PREPARED_MEAL: "prepared meal delivery",
  PROTEIN_BOX: "protein/meat box",
  PRODUCE_BOX: "produce box",
  SPECIALTY: "specialty subscription box",
};

const CATEGORY_INSTRUCTIONS: Record<string, string> = {
  MEAL_KIT:
    "This is a meal kit provider. Create 2-3 plans showing different household sizes (e.g., 2 people vs 4 people) or meal quantities. Always include pricePerServingCents AND pricePerBoxCents.",
  PREPARED_MEAL:
    "This is a prepared meal provider. Create 2-3 plans showing different meal quantities (e.g., 6 meals/week vs 12 meals/week). Always include pricePerServingCents (= per meal price) AND pricePerBoxCents.",
  PROTEIN_BOX:
    "This is a protein/meat box provider. Create 1-3 plans for different box sizes. pricePerServingCents must be null. Use pricePerBoxCents as the primary metric. Frequency is typically MONTHLY or FLEXIBLE.",
  PRODUCE_BOX:
    "This is a produce box provider. Create 1-3 plans for different box sizes (small/medium/large). pricePerServingCents must be null. Use pricePerBoxCents as the primary metric.",
  SPECIALTY:
    "This is a specialty subscription box. Create 1-3 plans for different tiers. pricePerServingCents must be null. Use pricePerBoxCents as the monthly price. Frequency is typically MONTHLY.",
};

/**
 * Default frequency by category when xAI returns an invalid value.
 */
const DEFAULT_FREQUENCY: Record<string, "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "FLEXIBLE"> = {
  MEAL_KIT: "WEEKLY",
  PREPARED_MEAL: "WEEKLY",
  PROTEIN_BOX: "MONTHLY",
  PRODUCE_BOX: "WEEKLY",
  SPECIALTY: "MONTHLY",
};

// ─── xAI API Research Function ──────────────────────────────────────────────

async function researchPricing(
  name: string,
  website: string,
  category: string,
): Promise<PricingResponse | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error("  ERROR: XAI_API_KEY not set in environment");
    return null;
  }

  const categoryLabel = CATEGORY_LABELS[category] ?? category;
  const categoryInstructions = CATEGORY_INSTRUCTIONS[category] ?? "";

  const prompt = `Research the current pricing for "${name}" (website: ${website}, category: ${categoryLabel}).

Return a JSON object with a "plans" array containing 1-4 plan objects. Each plan represents a distinct pricing tier or configuration the provider offers.

${categoryInstructions}

Each plan object must have EXACTLY these fields:
{
  "name": "Human-readable plan name, e.g. '2 People, 3 Meals/Week' or 'Curated Box' or 'Monthly Snack Box'",
  "description": "1-2 sentences explaining what's included in this plan",
  "pricePerServingCents": <integer cents or null -- ONLY for MEAL_KIT and PREPARED_MEAL categories, null for others>,
  "pricePerBoxCents": <integer cents -- the total box/order price in cents for ALL categories>,
  "pricePerWeekCents": <integer cents or null -- ONLY for structured weekly programs like Nutrisystem/BistroMD>,
  "shippingCostCents": <integer cents, 0 if free>,
  "shippingNote": "<e.g. 'Free on subscriptions' or '$10.99 flat rate' or null>",
  "introOfferNote": "<e.g. '50% off first box' or '60% off + free shipping on first order' or null>",
  "servingsPerMeal": <integer -- number of people/servings per meal, e.g. 2 for a 2-person plan, or null>,
  "mealsPerWeek": <integer -- number of meals/items per week/delivery, or null>,
  "frequency": "<WEEKLY | BIWEEKLY | MONTHLY | FLEXIBLE>",
  "isPopular": <true for the most commonly chosen plan, false otherwise>
}

PRICING RULES:
- All prices in US CENTS (e.g. $7.99 = 799, $146.00 = 14600)
- pricePerServingCents: Set ONLY for meal kits and prepared meals. This is the per-serving or per-meal price.
- pricePerBoxCents: Set for ALL categories. This is the total delivery/box price.
- For protein/produce/specialty: pricePerServingCents must be null (per-serving is meaningless for these).
- For complex pricing (credit-based, marketplace, grocery): Create ONE representative plan showing the most common configuration. Use description to explain the pricing model.

Return ONLY the JSON object with no markdown formatting.`;

  try {
    const response = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: XAI_MODEL,
        input: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search" }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  API error ${response.status}: ${errorText.substring(0, 300)}`);
      return null;
    }

    const data = await response.json();

    // Parse xAI Responses API format:
    // output[] -> find type: "message" -> content[] -> find type: "output_text" -> .text
    const messageItem = data.output?.find(
      (item: { type: string }) => item.type === "message",
    );
    const textContent = messageItem?.content?.find(
      (c: { type: string }) => c.type === "output_text",
    );
    const rawText: string | undefined = textContent?.text;

    if (!rawText) {
      console.error(`  No text in API response for ${name}`);
      console.error(`  Response structure: ${JSON.stringify(data).substring(0, 300)}`);
      return null;
    }

    // Strip markdown code fences if the model wraps its response
    const jsonStr = rawText
      .replace(/^```json?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(jsonStr) as PricingResponse;
      if (!parsed.plans || !Array.isArray(parsed.plans)) {
        console.error(`  Response missing "plans" array for ${name}`);
        console.error(`  Parsed: ${JSON.stringify(parsed).substring(0, 300)}`);
        return null;
      }
      return parsed;
    } catch (parseError) {
      console.error(`  Failed to parse JSON for ${name}: ${parseError}`);
      console.error(`  Raw text (first 500 chars): ${rawText.substring(0, 500)}`);
      return null;
    }
  } catch (fetchError) {
    console.error(`  Fetch error for ${name}: ${fetchError}`);
    return null;
  }
}

// ─── Validation ─────────────────────────────────────────────────────────────

function validatePlanData(
  plan: PlanData,
  providerName: string,
  category: string,
): PlanData | null {
  const validated = { ...plan };

  // name: non-empty, under 200 chars
  if (!validated.name || typeof validated.name !== "string" || validated.name.trim().length === 0) {
    console.warn(`  WARN: Empty plan name for ${providerName}, rejecting plan`);
    return null;
  }
  if (validated.name.length > 200) {
    validated.name = validated.name.substring(0, 197) + "...";
    console.warn(`  WARN: Truncated plan name for ${providerName}`);
  }

  // description: string or null, under 500 chars
  if (validated.description) {
    if (typeof validated.description !== "string") {
      validated.description = "";
    }
    if (validated.description.length > 500) {
      validated.description = validated.description.substring(0, 497) + "...";
      console.warn(`  WARN: Truncated plan description for ${providerName}`);
    }
  } else {
    validated.description = "";
  }

  // Category-specific null enforcement for pricePerServingCents
  const noServingCategories = new Set(["PROTEIN_BOX", "PRODUCE_BOX", "SPECIALTY"]);
  if (noServingCategories.has(category)) {
    if (validated.pricePerServingCents !== null && validated.pricePerServingCents !== undefined) {
      console.warn(`  WARN: Forcing pricePerServingCents to null for ${providerName} (${category})`);
      validated.pricePerServingCents = null;
    }
  }

  // pricePerServingCents: if set, must be integer 100-10000 ($1.00-$100.00)
  if (validated.pricePerServingCents !== null && validated.pricePerServingCents !== undefined) {
    validated.pricePerServingCents = Math.round(validated.pricePerServingCents);
    if (validated.pricePerServingCents < 100 || validated.pricePerServingCents > 10000) {
      console.warn(
        `  WARN: pricePerServingCents ${validated.pricePerServingCents} out of range for ${providerName}, rejecting`,
      );
      validated.pricePerServingCents = null;
    }
  } else {
    validated.pricePerServingCents = null;
  }

  // pricePerBoxCents: if set, must be integer 500-100000 ($5.00-$1000.00)
  if (validated.pricePerBoxCents !== null && validated.pricePerBoxCents !== undefined) {
    validated.pricePerBoxCents = Math.round(validated.pricePerBoxCents);
    if (validated.pricePerBoxCents < 500 || validated.pricePerBoxCents > 100000) {
      console.warn(
        `  WARN: pricePerBoxCents ${validated.pricePerBoxCents} out of range for ${providerName}, rejecting`,
      );
      validated.pricePerBoxCents = null;
    }
  } else {
    validated.pricePerBoxCents = null;
  }

  // pricePerWeekCents: if set, must be integer 500-100000
  if (validated.pricePerWeekCents !== null && validated.pricePerWeekCents !== undefined) {
    validated.pricePerWeekCents = Math.round(validated.pricePerWeekCents);
    if (validated.pricePerWeekCents < 500 || validated.pricePerWeekCents > 100000) {
      console.warn(
        `  WARN: pricePerWeekCents ${validated.pricePerWeekCents} out of range for ${providerName}, setting null`,
      );
      validated.pricePerWeekCents = null;
    }
  } else {
    validated.pricePerWeekCents = null;
  }

  // At least one pricing field must be set
  if (
    validated.pricePerServingCents === null &&
    validated.pricePerBoxCents === null &&
    validated.pricePerWeekCents === null
  ) {
    console.warn(`  WARN: All pricing fields null for plan "${validated.name}" (${providerName}), rejecting`);
    return null;
  }

  // shippingCostCents: integer >= 0 and <= 5000, default 0
  if (
    validated.shippingCostCents === null ||
    validated.shippingCostCents === undefined ||
    typeof validated.shippingCostCents !== "number" ||
    !Number.isInteger(validated.shippingCostCents) ||
    validated.shippingCostCents < 0 ||
    validated.shippingCostCents > 5000
  ) {
    if (validated.shippingCostCents !== 0) {
      console.warn(
        `  WARN: Invalid shippingCostCents ${validated.shippingCostCents} for ${providerName}, defaulting to 0`,
      );
    }
    validated.shippingCostCents = 0;
  }

  // frequency: must be valid PlanFrequency, default by category
  if (!validated.frequency || !VALID_FREQUENCIES.has(validated.frequency)) {
    const defaultFreq = DEFAULT_FREQUENCY[category] ?? "WEEKLY";
    console.warn(
      `  WARN: Invalid frequency "${validated.frequency}" for ${providerName}, defaulting to ${defaultFreq}`,
    );
    validated.frequency = defaultFreq;
  }

  // servingsPerMeal: if set, integer 1-12
  if (validated.servingsPerMeal !== null && validated.servingsPerMeal !== undefined) {
    validated.servingsPerMeal = Math.round(validated.servingsPerMeal);
    if (validated.servingsPerMeal < 1 || validated.servingsPerMeal > 12) {
      console.warn(`  WARN: Invalid servingsPerMeal ${validated.servingsPerMeal} for ${providerName}`);
      validated.servingsPerMeal = null;
    }
  } else {
    validated.servingsPerMeal = null;
  }

  // mealsPerWeek: if set, integer 1-30
  if (validated.mealsPerWeek !== null && validated.mealsPerWeek !== undefined) {
    validated.mealsPerWeek = Math.round(validated.mealsPerWeek);
    if (validated.mealsPerWeek < 1 || validated.mealsPerWeek > 30) {
      console.warn(`  WARN: Invalid mealsPerWeek ${validated.mealsPerWeek} for ${providerName}`);
      validated.mealsPerWeek = null;
    }
  } else {
    validated.mealsPerWeek = null;
  }

  // shippingNote: string or null
  if (validated.shippingNote && typeof validated.shippingNote !== "string") {
    validated.shippingNote = null;
  }

  // introOfferNote: string or null
  if (validated.introOfferNote && typeof validated.introOfferNote !== "string") {
    validated.introOfferNote = null;
  }

  // isPopular: boolean, default false
  if (typeof validated.isPopular !== "boolean") {
    validated.isPopular = false;
  }

  return validated;
}

// ─── Plan Creation & Denormalization ────────────────────────────────────────

async function createPlansForProvider(
  provider: ProviderRecord,
  plans: PlanData[],
  dryRun: boolean,
): Promise<number> {
  if (dryRun) {
    console.log(`  [DRY RUN] Would delete existing plans and create ${plans.length} new plans`);
    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      console.log(`    Plan ${i + 1}: "${plan.name}"`);
      console.log(`      pricePerServingCents: ${plan.pricePerServingCents}`);
      console.log(`      pricePerBoxCents: ${plan.pricePerBoxCents}`);
      console.log(`      pricePerWeekCents: ${plan.pricePerWeekCents}`);
      console.log(`      shippingCostCents: ${plan.shippingCostCents}`);
      console.log(`      frequency: ${plan.frequency}`);
      console.log(`      servingsPerMeal: ${plan.servingsPerMeal}`);
      console.log(`      mealsPerWeek: ${plan.mealsPerWeek}`);
      console.log(`      featured: ${plan.isPopular}`);
      if (plan.shippingNote) console.log(`      shippingNote: ${plan.shippingNote}`);
      if (plan.introOfferNote) console.log(`      introOfferNote: ${plan.introOfferNote}`);
    }
    return plans.length;
  }

  // Delete all existing plans for this provider (idempotent -- safe to re-run)
  const deleteResult = await prisma.plan.deleteMany({
    where: { providerId: provider.id },
  });
  if (deleteResult.count > 0) {
    console.log(`  Deleted ${deleteResult.count} existing plans`);
  }

  // Create each plan
  let created = 0;
  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    try {
      await prisma.plan.create({
        data: {
          providerId: provider.id,
          name: plan.name,
          description: plan.description,
          pricePerServingCents: plan.pricePerServingCents,
          pricePerBoxCents: plan.pricePerBoxCents,
          pricePerWeekCents: plan.pricePerWeekCents,
          shippingCostCents: plan.shippingCostCents,
          shippingNote: plan.shippingNote,
          introOfferNote: plan.introOfferNote,
          servingsPerMeal: plan.servingsPerMeal,
          mealsPerWeek: plan.mealsPerWeek,
          frequency: plan.frequency as PlanFrequency,
          featured: plan.isPopular,
          active: true,
          sortOrder: i,
        },
      });
      created++;
    } catch (err) {
      console.error(`  ERROR creating plan "${plan.name}": ${err}`);
    }
  }

  // Recompute denormalized fields on Provider
  // (exact pattern from src/app/actions/admin.ts lines 552-571)
  const allPlans = await prisma.plan.findMany({
    where: { providerId: provider.id, active: true },
    select: { pricePerServingCents: true, shippingCostCents: true },
  });

  const servingPrices = allPlans
    .map((p) => p.pricePerServingCents)
    .filter((v): v is number => v !== null);

  const hasFreeShipping = allPlans.some((p) => p.shippingCostCents === 0);

  await prisma.provider.update({
    where: { id: provider.id },
    data: {
      minPricePerServingCents: servingPrices.length > 0 ? Math.min(...servingPrices) : null,
      maxPricePerServingCents: servingPrices.length > 0 ? Math.max(...servingPrices) : null,
      freeShipping: hasFreeShipping,
    },
  });

  return created;
}

// ─── CLI Argument Parsing ───────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
    includeExisting: args.includes("--include-existing"),
    slug: args.find((a) => a.startsWith("--slug="))?.split("=")[1] ?? null,
    limit: (() => {
      const val = args.find((a) => a.startsWith("--limit="))?.split("=")[1];
      return val ? parseInt(val, 10) : null;
    })(),
    category: (() => {
      const val = args.find((a) => a.startsWith("--category="))?.split("=")[1];
      if (val && CATEGORY_LABELS[val]) return val;
      if (val) {
        console.warn(`WARN: Unknown category "${val}". Valid: ${Object.keys(CATEGORY_LABELS).join(", ")}`);
      }
      return null;
    })(),
  };
}

// ─── Delay Helper ───────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const { dryRun, includeExisting, slug, limit, category } = parseArgs();

  // Verify API key is set
  if (!process.env.XAI_API_KEY) {
    console.error("ERROR: XAI_API_KEY not set. Check .env.local file.");
    process.exit(1);
  }

  // Build query filter
  const where: Record<string, unknown> = {
    status: { not: "DISCONTINUED" },
  };

  // Skip providers that already have Plan records (default behavior)
  if (!includeExisting) {
    where.plans = { none: {} };
  }

  if (category) {
    where.category = category;
  }

  if (slug) {
    where.slug = slug;
    // When targeting a specific slug, always include existing (user wants to re-run)
    delete where.plans;
  }

  // Query providers
  const providers = await prisma.provider.findMany({
    where,
    include: { plans: { select: { id: true } } },
    orderBy: { slug: "asc" },
  }) as unknown as ProviderRecord[];

  // Apply limit
  let targetProviders = providers;
  if (limit !== null && limit > 0) {
    targetProviders = providers.slice(0, limit);
  }

  console.log(`\n=== Phase 25: Pricing Research & Plan Creation ===`);
  console.log(`Providers to process: ${targetProviders.length}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  if (slug) console.log(`Filter: --slug=${slug}`);
  if (category) console.log(`Filter: --category=${category}`);
  if (limit) console.log(`Limit: ${limit}`);
  if (includeExisting) console.log(`Including providers with existing plans`);
  console.log("");

  if (targetProviders.length === 0) {
    console.log("No providers to process. Done!");
    console.log("(Use --include-existing to re-process providers that already have plans)");
    return;
  }

  let totalPlansCreated = 0;
  let providersProcessed = 0;
  let providersSkipped = 0;
  let providersFailed = 0;
  const failedSlugs: string[] = [];

  for (let i = 0; i < targetProviders.length; i++) {
    const provider = targetProviders[i];
    const progress = `[${i + 1}/${targetProviders.length}]`;
    console.log(`${progress} Processing: ${provider.name} (${provider.slug}) [${provider.category}]`);

    try {
      // Research via xAI API
      console.log(`  Researching pricing via xAI (${XAI_MODEL})...`);
      const pricingResponse = await researchPricing(
        provider.name,
        provider.website,
        provider.category,
      );

      if (!pricingResponse || pricingResponse.plans.length === 0) {
        console.log(`  FAILED: No pricing data returned from API`);
        providersFailed++;
        failedSlugs.push(provider.slug);
        if (i < targetProviders.length - 1) {
          await delay(INTER_CALL_DELAY_MS);
        }
        continue;
      }

      console.log(`  API returned ${pricingResponse.plans.length} plans`);

      // Validate each plan
      const validPlans: PlanData[] = [];
      for (const rawPlan of pricingResponse.plans) {
        const validated = validatePlanData(rawPlan, provider.name, provider.category);
        if (validated) {
          validPlans.push(validated);
        }
      }

      if (validPlans.length === 0) {
        console.log(`  FAILED: All plans rejected during validation`);
        providersFailed++;
        failedSlugs.push(provider.slug);
        if (i < targetProviders.length - 1) {
          await delay(INTER_CALL_DELAY_MS);
        }
        continue;
      }

      // Limit to max 4 plans
      const plansToCreate = validPlans.slice(0, 4);

      // Create plans in DB (or dry-run log)
      const created = await createPlansForProvider(provider, plansToCreate, dryRun);

      const prefix = dryRun ? "WOULD CREATE" : "Created";
      console.log(`  ${prefix} ${created} plans for ${provider.name}`);
      totalPlansCreated += created;
      providersProcessed++;
    } catch (error) {
      console.error(`  ERROR: ${error}`);
      providersFailed++;
      failedSlugs.push(provider.slug);
    }

    // Rate limiting: wait between API calls
    if (i < targetProviders.length - 1) {
      await delay(INTER_CALL_DELAY_MS);
    }

    // Extra pause every BATCH_SIZE providers
    if ((i + 1) % BATCH_SIZE === 0 && i < targetProviders.length - 1) {
      console.log(
        `\n--- Batch pause (${i + 1}/${targetProviders.length} done, waiting ${INTER_BATCH_DELAY_MS / 1000}s) ---\n`,
      );
      await delay(INTER_BATCH_DELAY_MS);
    }
  }

  // Print summary
  console.log(`\n=== Plan Creation Complete ===`);
  console.log(`Providers processed: ${providersProcessed}`);
  console.log(`Plans created: ${totalPlansCreated}`);
  console.log(`Providers skipped: ${providersSkipped}`);
  console.log(`Providers failed: ${providersFailed}`);

  if (failedSlugs.length > 0) {
    console.log(`\nFailed slugs (re-run with --slug=X):`);
    for (const s of failedSlugs) {
      console.log(`  ${s}`);
    }
  }

  console.log("");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
