/**
 * Phase 24 Plan 01: Bulk Content Enrichment via xAI Responses API
 *
 * This script uses xAI's grok-4-1-fast-reasoning model with web_search to
 * research each provider and populate empty content fields in the database.
 *
 * Features:
 * - Batch processing with rate limiting (2s between calls, 5s between batches)
 * - Idempotent: only fills empty/stub fields, never overwrites hand-crafted data
 * - Validates all API responses before writing to DB
 * - Supports --dry-run, --slug, --limit, --include-existing flags
 *
 * Run with: npx tsx prisma/scripts/24-enrich-providers.ts
 * Test:     npx tsx prisma/scripts/24-enrich-providers.ts --dry-run --limit=1
 * Single:   npx tsx prisma/scripts/24-enrich-providers.ts --slug=dinnerly
 */

import "dotenv/config";
import { config } from "dotenv";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Load .env.local for XAI_API_KEY (dotenv/config only loads .env)
config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Types ──────────────────────────────────────────────────────────────────

interface EnrichmentData {
  description: string | null;
  shortDescription: string | null;
  pros: string[] | null;
  cons: string[] | null;
  valueTier: "BUDGET" | "MID" | "PREMIUM" | "LUXURY" | null;
  dietaryTags: string[] | null;
  flexibility: string | null;
  foundedYear: number | null;
  headquarters: string | null;
  deliveryAreaDescription: string | null;
  householdFit: string | null;
  geography: string | null;
}

interface ProviderRecord {
  id: string;
  slug: string;
  name: string;
  website: string;
  category: string;
  description: string;
  shortDescription: string | null;
  prosJson: unknown;
  consJson: unknown;
  valueTier: string | null;
  flexibility: string | null;
  foundedYear: number | null;
  headquarters: string | null;
  deliveryAreaDescription: string | null;
  householdFit: string | null;
  geography: string | null;
  dietaryTags: Array<{ id: string; providerId: string; tag: string }>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const VALID_TAGS = new Set([
  "VEGAN", "VEGETARIAN", "PESCATARIAN", "KETO", "PALEO",
  "GLUTEN_FREE", "DAIRY_FREE", "NUT_FREE", "LOW_CARB",
  "LOW_SODIUM", "ORGANIC", "HALAL", "KOSHER",
  "DIABETIC_FRIENDLY", "WHOLE30", "MEDITERRANEAN",
]);

const VALID_VALUE_TIERS = new Set(["BUDGET", "MID", "PREMIUM", "LUXURY"]);

const BATCH_SIZE = 10;
const INTER_CALL_DELAY_MS = 2000;
const INTER_BATCH_DELAY_MS = 5000;

const XAI_API_URL = "https://api.x.ai/v1/responses";
const XAI_MODEL = "grok-4-1-fast-reasoning";

// ─── xAI API Research Function ──────────────────────────────────────────────

async function researchProvider(
  name: string,
  website: string,
  category: string,
): Promise<EnrichmentData | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error("  ERROR: XAI_API_KEY not set in environment");
    return null;
  }

  const prompt = `Research the food subscription service "${name}" (website: ${website}, category: ${category}).

Return a JSON object with EXACTLY these fields. Be factual — only include information you can verify from the website or reliable sources. If you cannot determine a field, set it to null.

{
  "description": "2-3 factual sentences about what this service offers, who it's for, and what makes it unique. Do NOT use marketing language.",
  "shortDescription": "Under 280 characters. One sentence summarizing the service for a comparison card.",
  "pros": ["3-4 genuine advantages as strings"],
  "cons": ["2-3 honest disadvantages as strings"],
  "valueTier": "One of: BUDGET (under $7/serving or under $50/box), MID ($7-12/serving or $50-100/box), PREMIUM ($12-18/serving or $100-150/box), LUXURY (over $18/serving or over $150/box). Base this on actual pricing from the website.",
  "dietaryTags": ["Array of applicable tags from: VEGAN, VEGETARIAN, PESCATARIAN, KETO, PALEO, GLUTEN_FREE, DAIRY_FREE, NUT_FREE, LOW_CARB, LOW_SODIUM, ORGANIC, HALAL, KOSHER, DIABETIC_FRIENDLY, WHOLE30, MEDITERRANEAN. Only include tags the provider explicitly supports with dedicated menu options or filters."],
  "flexibility": "1-2 sentences about skip/pause/cancel policy. e.g. 'Skip or cancel anytime with no penalty. Changes must be made by Wednesday for the following week's delivery.'",
  "foundedYear": 2015,
  "headquarters": "City, State format e.g. 'New York, NY' or 'Austin, TX'",
  "deliveryAreaDescription": "e.g. 'Contiguous US (48 states)' or 'Select metro areas in California and New York'",
  "householdFit": "Who this is best for, e.g. 'Singles and couples who want convenient healthy meals' or 'Families of 4+ looking for budget-friendly meal kits'",
  "geography": "Only if the provider has geographic limitations, e.g. 'West Coast only' or 'Northeast US'. null if nationwide."
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, no explanation.`;

  try {
    const response = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
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
      return JSON.parse(jsonStr) as EnrichmentData;
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

function validateEnrichmentData(data: EnrichmentData, providerName: string): EnrichmentData {
  const validated: EnrichmentData = { ...data };

  // description: non-empty, not "see research notes", under 2000 chars
  if (validated.description) {
    if (
      validated.description.includes("see research notes") ||
      validated.description.length > 2000 ||
      validated.description.trim().length === 0
    ) {
      console.warn(`  WARN: Invalid description for ${providerName}, setting to null`);
      validated.description = null;
    }
  }

  // shortDescription: under 300 chars, not identical to description
  if (validated.shortDescription) {
    if (validated.shortDescription.length > 300) {
      validated.shortDescription = validated.shortDescription.substring(0, 297) + "...";
      console.warn(`  WARN: Truncated shortDescription for ${providerName}`);
    }
    if (validated.shortDescription.trim().length === 0) {
      validated.shortDescription = null;
    }
    if (validated.shortDescription && validated.description &&
        validated.shortDescription === validated.description) {
      console.warn(`  WARN: shortDescription identical to description for ${providerName}, setting to null`);
      validated.shortDescription = null;
    }
  }

  // pros: array of 2-5 strings, each under 200 chars
  if (validated.pros) {
    if (!Array.isArray(validated.pros)) {
      console.warn(`  WARN: pros is not an array for ${providerName}`);
      validated.pros = null;
    } else {
      validated.pros = validated.pros
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .map(p => p.length > 200 ? p.substring(0, 197) + "..." : p)
        .slice(0, 5);
      if (validated.pros.length < 2) {
        console.warn(`  WARN: Too few pros for ${providerName} (${validated.pros.length}), keeping anyway`);
      }
    }
  }

  // cons: array of 1-4 strings, each under 200 chars
  if (validated.cons) {
    if (!Array.isArray(validated.cons)) {
      console.warn(`  WARN: cons is not an array for ${providerName}`);
      validated.cons = null;
    } else {
      validated.cons = validated.cons
        .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
        .map(c => c.length > 200 ? c.substring(0, 197) + "..." : c)
        .slice(0, 4);
      if (validated.cons.length < 1) {
        console.warn(`  WARN: No valid cons for ${providerName}`);
        validated.cons = null;
      }
    }
  }

  // valueTier: must be one of BUDGET, MID, PREMIUM, LUXURY
  if (validated.valueTier && !VALID_VALUE_TIERS.has(validated.valueTier)) {
    console.warn(`  WARN: Invalid valueTier "${validated.valueTier}" for ${providerName}`);
    validated.valueTier = null;
  }

  // dietaryTags: each must be a valid DietaryTag enum value
  if (validated.dietaryTags) {
    if (!Array.isArray(validated.dietaryTags)) {
      validated.dietaryTags = null;
    } else {
      validated.dietaryTags = validated.dietaryTags.filter(t =>
        typeof t === "string" && VALID_TAGS.has(t),
      );
      if (validated.dietaryTags.length === 0) {
        validated.dietaryTags = null;
      }
    }
  }

  // foundedYear: integer between 1900 and 2026
  if (validated.foundedYear !== null && validated.foundedYear !== undefined) {
    if (
      !Number.isInteger(validated.foundedYear) ||
      validated.foundedYear < 1900 ||
      validated.foundedYear > 2026
    ) {
      console.warn(`  WARN: Invalid foundedYear ${validated.foundedYear} for ${providerName}`);
      validated.foundedYear = null;
    }
  }

  // headquarters: string or null (no validation beyond type)
  if (validated.headquarters && typeof validated.headquarters !== "string") {
    validated.headquarters = null;
  }

  // deliveryAreaDescription: string or null
  if (validated.deliveryAreaDescription && typeof validated.deliveryAreaDescription !== "string") {
    validated.deliveryAreaDescription = null;
  }

  // householdFit: string or null
  if (validated.householdFit && typeof validated.householdFit !== "string") {
    validated.householdFit = null;
  }

  // geography: string or null
  if (validated.geography && typeof validated.geography !== "string") {
    validated.geography = null;
  }

  // flexibility: string or null
  if (validated.flexibility && typeof validated.flexibility !== "string") {
    validated.flexibility = null;
  }

  return validated;
}

// ─── Database Update ────────────────────────────────────────────────────────

async function updateProvider(
  provider: ProviderRecord,
  data: EnrichmentData,
  dryRun: boolean,
): Promise<{ fieldsUpdated: string[]; tagsAdded: string[] }> {
  const isStub = provider.description.includes("see research notes");
  const updateData: Record<string, unknown> = {};
  const fieldsUpdated: string[] = [];

  // Only update fields that are currently empty/stub
  if (isStub && data.description) {
    updateData.description = data.description;
    fieldsUpdated.push("description");
  }

  if (!provider.shortDescription && data.shortDescription) {
    updateData.shortDescription = data.shortDescription.substring(0, 300);
    fieldsUpdated.push("shortDescription");
  }

  if (!provider.prosJson && data.pros && data.pros.length > 0) {
    updateData.prosJson = data.pros;
    fieldsUpdated.push("prosJson");
  }

  if (!provider.consJson && data.cons && data.cons.length > 0) {
    updateData.consJson = data.cons;
    fieldsUpdated.push("consJson");
  }

  if (!provider.valueTier && data.valueTier) {
    updateData.valueTier = data.valueTier;
    fieldsUpdated.push("valueTier");
  }

  if (!provider.flexibility && data.flexibility) {
    updateData.flexibility = data.flexibility;
    fieldsUpdated.push("flexibility");
  }

  if (!provider.foundedYear && data.foundedYear) {
    updateData.foundedYear = data.foundedYear;
    fieldsUpdated.push("foundedYear");
  }

  if (!provider.headquarters && data.headquarters) {
    updateData.headquarters = data.headquarters;
    fieldsUpdated.push("headquarters");
  }

  if (!provider.deliveryAreaDescription && data.deliveryAreaDescription) {
    updateData.deliveryAreaDescription = data.deliveryAreaDescription;
    fieldsUpdated.push("deliveryAreaDescription");
  }

  if (!provider.householdFit && data.householdFit) {
    updateData.householdFit = data.householdFit;
    fieldsUpdated.push("householdFit");
  }

  if (!provider.geography && data.geography) {
    updateData.geography = data.geography;
    fieldsUpdated.push("geography");
  }

  // Write provider fields to DB
  if (Object.keys(updateData).length > 0) {
    if (dryRun) {
      console.log(`  [DRY RUN] Would update: ${fieldsUpdated.join(", ")}`);
      for (const [key, value] of Object.entries(updateData)) {
        const display = typeof value === "string"
          ? value.substring(0, 100) + (value.length > 100 ? "..." : "")
          : JSON.stringify(value);
        console.log(`    ${key}: ${display}`);
      }
    } else {
      await prisma.provider.update({
        where: { id: provider.id },
        data: updateData,
      });
    }
  }

  // Handle dietary tags separately (relation table)
  const tagsAdded: string[] = [];
  if (data.dietaryTags && data.dietaryTags.length > 0) {
    const existingTags = new Set(provider.dietaryTags.map(t => t.tag));
    const newTags = data.dietaryTags.filter(t => !existingTags.has(t));

    for (const tag of newTags) {
      if (dryRun) {
        console.log(`  [DRY RUN] Would add dietary tag: ${tag}`);
        tagsAdded.push(tag);
      } else {
        try {
          await prisma.providerDietaryTag.upsert({
            where: {
              providerId_tag: {
                providerId: provider.id,
                tag: tag as "VEGAN" | "VEGETARIAN" | "PESCATARIAN" | "KETO" | "PALEO" |
                  "GLUTEN_FREE" | "DAIRY_FREE" | "NUT_FREE" | "LOW_CARB" | "LOW_SODIUM" |
                  "ORGANIC" | "HALAL" | "KOSHER" | "DIABETIC_FRIENDLY" | "WHOLE30" | "MEDITERRANEAN",
              },
            },
            update: {},
            create: {
              providerId: provider.id,
              tag: tag as "VEGAN" | "VEGETARIAN" | "PESCATARIAN" | "KETO" | "PALEO" |
                "GLUTEN_FREE" | "DAIRY_FREE" | "NUT_FREE" | "LOW_CARB" | "LOW_SODIUM" |
                "ORGANIC" | "HALAL" | "KOSHER" | "DIABETIC_FRIENDLY" | "WHOLE30" | "MEDITERRANEAN",
            },
          });
          tagsAdded.push(tag);
        } catch (tagError) {
          console.error(`  ERROR adding tag ${tag} for ${provider.slug}: ${tagError}`);
        }
      }
    }
  }

  return { fieldsUpdated, tagsAdded };
}

// ─── CLI Argument Parsing ───────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
    includeExisting: args.includes("--include-existing"),
    slug: args.find(a => a.startsWith("--slug="))?.split("=")[1] ?? null,
    limit: (() => {
      const val = args.find(a => a.startsWith("--limit="))?.split("=")[1];
      return val ? parseInt(val, 10) : null;
    })(),
  };
}

// ─── Delay Helper ───────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const { dryRun, includeExisting, slug, limit } = parseArgs();

  // Verify API key is set
  if (!process.env.XAI_API_KEY) {
    console.error("ERROR: XAI_API_KEY not set. Check .env.local file.");
    process.exit(1);
  }

  // Query providers
  let providers: ProviderRecord[];
  if (slug) {
    providers = await prisma.provider.findMany({
      where: { slug, status: { not: "DISCONTINUED" } },
      include: { dietaryTags: true },
    }) as unknown as ProviderRecord[];
    if (providers.length === 0) {
      console.error(`ERROR: Provider with slug "${slug}" not found (or is DISCONTINUED).`);
      process.exit(1);
    }
  } else {
    providers = await prisma.provider.findMany({
      where: { status: { not: "DISCONTINUED" } },
      include: { dietaryTags: true },
      orderBy: { slug: "asc" },
    }) as unknown as ProviderRecord[];
  }

  // Filter to providers needing enrichment (unless --include-existing)
  if (!includeExisting) {
    providers = providers.filter(p =>
      p.description.includes("see research notes") ||
      !p.shortDescription ||
      !p.prosJson ||
      !p.consJson ||
      !p.valueTier,
    );
  }

  // Apply limit
  if (limit !== null && limit > 0) {
    providers = providers.slice(0, limit);
  }

  console.log(`\n=== Phase 24: Bulk Content Enrichment ===`);
  console.log(`Providers to process: ${providers.length}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  if (slug) console.log(`Filter: --slug=${slug}`);
  if (limit) console.log(`Limit: ${limit}`);
  if (includeExisting) console.log(`Including already-enriched providers`);
  console.log("");

  if (providers.length === 0) {
    console.log("No providers need enrichment. Done!");
    return;
  }

  let enriched = 0;
  let skipped = 0;
  let failed = 0;
  const failedSlugs: string[] = [];

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const progress = `[${i + 1}/${providers.length}]`;
    console.log(`${progress} Processing: ${provider.name} (${provider.slug})`);

    try {
      // Research via xAI API
      console.log(`  Researching via xAI (${XAI_MODEL})...`);
      const rawData = await researchProvider(
        provider.name,
        provider.website,
        provider.category,
      );

      if (!rawData) {
        console.log(`  FAILED: No data returned from API`);
        failed++;
        failedSlugs.push(provider.slug);
        // Still wait before next call to respect rate limits
        if (i < providers.length - 1) {
          await delay(INTER_CALL_DELAY_MS);
        }
        continue;
      }

      // Validate
      const validatedData = validateEnrichmentData(rawData, provider.name);

      // Update DB
      const { fieldsUpdated, tagsAdded } = await updateProvider(provider, validatedData, dryRun);

      if (fieldsUpdated.length === 0 && tagsAdded.length === 0) {
        console.log(`  SKIPPED: All fields already populated`);
        skipped++;
      } else {
        const prefix = dryRun ? "WOULD ENRICH" : "ENRICHED";
        console.log(`  ${prefix}: ${fieldsUpdated.length} fields, ${tagsAdded.length} dietary tags`);
        if (fieldsUpdated.length > 0) {
          console.log(`    Fields: ${fieldsUpdated.join(", ")}`);
        }
        if (tagsAdded.length > 0) {
          console.log(`    Tags: ${tagsAdded.join(", ")}`);
        }
        enriched++;
      }
    } catch (error) {
      console.error(`  ERROR: ${error}`);
      failed++;
      failedSlugs.push(provider.slug);
    }

    // Rate limiting: wait between API calls
    if (i < providers.length - 1) {
      await delay(INTER_CALL_DELAY_MS);
    }

    // Extra pause every BATCH_SIZE providers
    if ((i + 1) % BATCH_SIZE === 0 && i < providers.length - 1) {
      console.log(`\n--- Batch pause (${i + 1}/${providers.length} done, waiting ${INTER_BATCH_DELAY_MS / 1000}s) ---\n`);
      await delay(INTER_BATCH_DELAY_MS);
    }
  }

  // Print summary
  console.log(`\n=== Enrichment Complete ===`);
  console.log(`Enriched: ${enriched}`);
  console.log(`Skipped (already complete): ${skipped}`);
  console.log(`Failed: ${failed}`);

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
