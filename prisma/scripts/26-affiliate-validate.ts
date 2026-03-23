/**
 * Phase 26 Plan 02: Affiliate URL Population & Data Validation
 *
 * This script populates affiliateUrl for providers with known affiliate programs,
 * cross-validates key provider data, and sets lastVerifiedAt for all processed providers.
 *
 * Features:
 * - Populates affiliateUrl from KNOWN_AFFILIATE_URLS map (UTM-tagged website URLs)
 * - Cross-validates provider data: description, shortDescription, category, plans, website
 * - Sets lastVerifiedAt for all processed providers (v3.0 data verification timestamp)
 * - Optional xAI validation for website activity and rebranding checks
 * - Supports --dry-run, --slug, --limit, --template-only, --validate-only, --affiliate-only
 *
 * Run with: npx tsx prisma/scripts/26-affiliate-validate.ts --template-only
 * Test:     npx tsx prisma/scripts/26-affiliate-validate.ts --dry-run --limit=5 --template-only
 * Single:   npx tsx prisma/scripts/26-affiliate-validate.ts --slug=dinnerly --template-only
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

interface ProviderRecord {
  id: string;
  slug: string;
  name: string;
  website: string;
  category: string;
  description: string;
  shortDescription: string | null;
  affiliateUrl: string | null;
  lastVerifiedAt: Date | null;
  status: string;
  plans: Array<{ id: string }>;
}

interface ValidationWarning {
  slug: string;
  name: string;
  field: string;
  issue: string;
}

interface XaiValidationResult {
  active: boolean;
  rebranded: string | null;
  notes: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Known affiliate URLs for major providers.
 * These are UTM-tagged website URLs as placeholders -- real affiliate links
 * would require signing up for each affiliate program (Impact, ShareASale, CJ, etc.).
 * Providers that already have affiliateUrl set will NOT be overwritten.
 */
const KNOWN_AFFILIATE_URLS: Record<string, string> = {
  // Major meal kits with well-known affiliate programs
  "hellofresh": "https://www.hellofresh.com/?utm_source=foodboxfinder",
  "blue-apron": "https://www.blueapron.com/?utm_source=foodboxfinder",
  "home-chef": "https://www.homechef.com/?utm_source=foodboxfinder",
  "green-chef": "https://www.greenchef.com/?utm_source=foodboxfinder",
  "everyplate": "https://www.everyplate.com/?utm_source=foodboxfinder",
  "factor": "https://www.factor75.com/?utm_source=foodboxfinder",
  "dinnerly": "https://dinnerly.com/?utm_source=foodboxfinder",
  "marley-spoon": "https://marleyspoon.com/?utm_source=foodboxfinder",
  "sunbasket": "https://sunbasket.com/?utm_source=foodboxfinder",
  "gobble": "https://www.gobble.com/?utm_source=foodboxfinder",
  "hungryroot": "https://www.hungryroot.com/?utm_source=foodboxfinder",
  "freshly": "https://www.freshly.com/?utm_source=foodboxfinder",
  "trifecta": "https://www.trifectanutrition.com/?utm_source=foodboxfinder",
  "snap-kitchen": "https://www.snapkitchen.com/?utm_source=foodboxfinder",
  "territory-foods": "https://www.territoryfoods.com/?utm_source=foodboxfinder",
  // Produce / grocery
  "imperfect-foods": "https://www.imperfectfoods.com/?utm_source=foodboxfinder",
  "misfits-market": "https://www.misfitsmarket.com/?utm_source=foodboxfinder",
  "butcher-box": "https://www.butcherbox.com/?utm_source=foodboxfinder",
  // Specialty
  "cometeer": "https://cometeer.com/?utm_source=foodboxfinder",
  "tokyotreat": "https://tokyotreat.com/?utm_source=foodboxfinder",
  "japan-crate": "https://japancrate.com/?utm_source=foodboxfinder",
  "universal-yums": "https://www.universalyums.com/?utm_source=foodboxfinder",
};

const VALID_CATEGORIES = new Set([
  "MEAL_KIT",
  "PREPARED_MEAL",
  "PROTEIN_BOX",
  "PRODUCE_BOX",
  "SPECIALTY",
]);

const XAI_API_URL = "https://api.x.ai/v1/responses";
const XAI_MODEL = "grok-4-1-fast-reasoning";
const INTER_CALL_DELAY_MS = 2000;

// ─── CLI Argument Parsing ───────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
    templateOnly: args.includes("--template-only"),
    validateOnly: args.includes("--validate-only"),
    affiliateOnly: args.includes("--affiliate-only"),
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

// ─── xAI Validation (Optional) ─────────────────────────────────────────────

async function validateViaXai(
  name: string,
  website: string,
  categoryLabel: string,
): Promise<XaiValidationResult | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error("  ERROR: XAI_API_KEY not set in environment");
    return null;
  }

  const prompt = `Visit ${website} and confirm:
1. Is this website still active and selling ${categoryLabel}?
2. Is the provider name still "${name}" or has it rebranded?
Return JSON: { "active": true/false, "rebranded": null or "new name", "notes": "any issues" }
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
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  xAI API error ${response.status}: ${errorText.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();

    const messageItem = data.output?.find(
      (item: { type: string }) => item.type === "message",
    );
    const textContent = messageItem?.content?.find(
      (c: { type: string }) => c.type === "output_text",
    );
    const rawText: string | undefined = textContent?.text;

    if (!rawText) {
      console.error(`  No text in xAI response for ${name}`);
      return null;
    }

    const jsonStr = rawText
      .replace(/^```json?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    try {
      return JSON.parse(jsonStr) as XaiValidationResult;
    } catch {
      console.error(`  Failed to parse xAI JSON for ${name}: ${jsonStr.substring(0, 200)}`);
      return null;
    }
  } catch (fetchError) {
    console.error(`  Fetch error for ${name}: ${fetchError}`);
    return null;
  }
}

// ─── Category Label Helper ──────────────────────────────────────────────────

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    "MEAL_KIT": "meal kits",
    "PREPARED_MEAL": "prepared meals",
    "PROTEIN_BOX": "protein/meat boxes",
    "PRODUCE_BOX": "produce boxes",
    "SPECIALTY": "specialty food boxes",
  };
  return labels[category] ?? "food subscription boxes";
}

// ─── Validation Logic (Template-Based) ──────────────────────────────────────

function validateProvider(provider: ProviderRecord): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // 1. Status check -- DISCONTINUED providers should be skipped
  if (provider.status === "DISCONTINUED") {
    warnings.push({
      slug: provider.slug,
      name: provider.name,
      field: "status",
      issue: "Provider is DISCONTINUED -- should typically be excluded from processing",
    });
  }

  // 2. Description: not empty or stub
  if (!provider.description || provider.description.trim().length === 0) {
    warnings.push({
      slug: provider.slug,
      name: provider.name,
      field: "description",
      issue: "Description is empty",
    });
  } else if (provider.description.includes("see research notes")) {
    warnings.push({
      slug: provider.slug,
      name: provider.name,
      field: "description",
      issue: "Description is still a stub (\"see research notes\")",
    });
  }

  // 3. shortDescription: exists and under 300 chars
  if (!provider.shortDescription) {
    warnings.push({
      slug: provider.slug,
      name: provider.name,
      field: "shortDescription",
      issue: "Missing shortDescription",
    });
  } else if (provider.shortDescription.length > 300) {
    warnings.push({
      slug: provider.slug,
      name: provider.name,
      field: "shortDescription",
      issue: `shortDescription too long (${provider.shortDescription.length} chars, max 300)`,
    });
  }

  // 4. Category: valid enum value
  if (!VALID_CATEGORIES.has(provider.category)) {
    warnings.push({
      slug: provider.slug,
      name: provider.name,
      field: "category",
      issue: `Invalid category: "${provider.category}"`,
    });
  }

  // 5. Plans: at least one Plan record
  if (!provider.plans || provider.plans.length === 0) {
    warnings.push({
      slug: provider.slug,
      name: provider.name,
      field: "plans",
      issue: "No Plan records found for this provider",
    });
  }

  // 6. Website: valid URL format
  if (!provider.website) {
    warnings.push({
      slug: provider.slug,
      name: provider.name,
      field: "website",
      issue: "Missing website URL",
    });
  } else if (!provider.website.startsWith("http")) {
    warnings.push({
      slug: provider.slug,
      name: provider.name,
      field: "website",
      issue: `Website URL does not start with http: "${provider.website}"`,
    });
  }

  return warnings;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const { dryRun, templateOnly, validateOnly, affiliateOnly, slug, limit } = parseArgs();

  // Query providers
  let providers: ProviderRecord[];
  if (slug) {
    providers = await prisma.provider.findMany({
      where: { slug },
      include: { plans: { select: { id: true } } },
    }) as unknown as ProviderRecord[];
    if (providers.length === 0) {
      console.error(`ERROR: Provider with slug "${slug}" not found.`);
      process.exit(1);
    }
  } else {
    providers = await prisma.provider.findMany({
      where: { status: { not: "DISCONTINUED" } },
      include: { plans: { select: { id: true } } },
      orderBy: { slug: "asc" },
    }) as unknown as ProviderRecord[];
  }

  // Apply limit
  if (limit !== null && limit > 0) {
    providers = providers.slice(0, limit);
  }

  const modeFlags: string[] = [];
  if (dryRun) modeFlags.push("DRY RUN");
  if (templateOnly) modeFlags.push("TEMPLATE-ONLY");
  if (validateOnly) modeFlags.push("VALIDATE-ONLY");
  if (affiliateOnly) modeFlags.push("AFFILIATE-ONLY");

  console.log(`\n=== Phase 26-02: Affiliate URL Population & Data Validation ===`);
  console.log(`Providers to process: ${providers.length}`);
  console.log(`Mode: ${modeFlags.length > 0 ? modeFlags.join(" + ") : "LIVE (full)"}`);
  if (slug) console.log(`Filter: --slug=${slug}`);
  if (limit) console.log(`Limit: ${limit}`);
  console.log(`Known affiliate URLs: ${Object.keys(KNOWN_AFFILIATE_URLS).length} providers`);
  console.log("");

  if (providers.length === 0) {
    console.log("No providers to process. Done!");
    return;
  }

  // Tracking counters
  let affiliateUrlsSet = 0;
  let affiliateUrlsSkipped = 0;
  let lastVerifiedAtSet = 0;
  let xaiValidated = 0;
  let xaiFailed = 0;
  const allWarnings: ValidationWarning[] = [];
  const failedSlugs: string[] = [];

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const progress = `[${i + 1}/${providers.length}]`;
    console.log(`${progress} Processing: ${provider.name} (${provider.slug})`);

    // Skip DISCONTINUED in processing (but still log)
    if (provider.status === "DISCONTINUED") {
      console.log(`  SKIP: Provider is DISCONTINUED`);
      continue;
    }

    try {
      const updateData: Record<string, unknown> = {};
      const fieldsUpdated: string[] = [];

      // ── Affiliate URL Population ──
      if (!validateOnly) {
        if (!provider.affiliateUrl && KNOWN_AFFILIATE_URLS[provider.slug]) {
          updateData.affiliateUrl = KNOWN_AFFILIATE_URLS[provider.slug];
          fieldsUpdated.push("affiliateUrl");
          affiliateUrlsSet++;
          console.log(`  affiliateUrl: SET -> ${KNOWN_AFFILIATE_URLS[provider.slug]}`);
        } else if (provider.affiliateUrl) {
          console.log(`  affiliateUrl: PRESERVED (already set)`);
          affiliateUrlsSkipped++;
        } else {
          console.log(`  affiliateUrl: NONE (not in known affiliate map)`);
        }
      }

      // ── Validation (template-based) ──
      if (!affiliateOnly) {
        const warnings = validateProvider(provider);
        if (warnings.length > 0) {
          for (const w of warnings) {
            console.log(`  WARN [${w.field}]: ${w.issue}`);
          }
          allWarnings.push(...warnings);
        } else {
          console.log(`  Validation: CLEAN (no issues)`);
        }
      }

      // ── xAI Validation (optional) ──
      if (!templateOnly && !affiliateOnly) {
        console.log(`  xAI validation: checking website activity...`);
        const xaiResult = await validateViaXai(
          provider.name,
          provider.website,
          getCategoryLabel(provider.category),
        );

        if (xaiResult) {
          xaiValidated++;
          if (!xaiResult.active) {
            console.log(`  xAI WARN: Website may be inactive!`);
            allWarnings.push({
              slug: provider.slug,
              name: provider.name,
              field: "website (xAI)",
              issue: `Website may be inactive. Notes: ${xaiResult.notes}`,
            });
          }
          if (xaiResult.rebranded) {
            console.log(`  xAI WARN: Provider may have rebranded to "${xaiResult.rebranded}"`);
            allWarnings.push({
              slug: provider.slug,
              name: provider.name,
              field: "name (xAI)",
              issue: `May have rebranded to "${xaiResult.rebranded}". Notes: ${xaiResult.notes}`,
            });
          }
          if (xaiResult.active && !xaiResult.rebranded) {
            console.log(`  xAI: CONFIRMED active`);
          }
        } else {
          xaiFailed++;
          console.log(`  xAI: SKIPPED (API error or rate limit)`);
        }

        // Rate limit between xAI calls
        if (i < providers.length - 1) {
          await delay(INTER_CALL_DELAY_MS);
        }
      }

      // ── lastVerifiedAt ──
      if (!validateOnly) {
        updateData.lastVerifiedAt = new Date();
        fieldsUpdated.push("lastVerifiedAt");
        lastVerifiedAtSet++;
      }

      // ── Database Write ──
      if (Object.keys(updateData).length > 0) {
        if (dryRun) {
          console.log(`  [DRY RUN] Would update: ${fieldsUpdated.join(", ")}`);
        } else {
          await prisma.provider.update({
            where: { id: provider.id },
            data: updateData,
          });
          console.log(`  UPDATED: ${fieldsUpdated.join(", ")}`);
        }
      }
    } catch (error) {
      console.error(`  ERROR: ${error}`);
      failedSlugs.push(provider.slug);
    }

    console.log("");
  }

  // ─── Summary Report ─────────────────────────────────────────────────────────

  console.log(`\n${"=".repeat(60)}`);
  console.log(`=== Phase 26-02: Summary Report ===`);
  console.log(`${"=".repeat(60)}\n`);

  console.log(`Providers processed: ${providers.length}`);

  if (!validateOnly) {
    console.log(`\n--- Affiliate URLs ---`);
    console.log(`  Set (new):     ${affiliateUrlsSet}`);
    console.log(`  Preserved:     ${affiliateUrlsSkipped}`);
    console.log(`  Not in map:    ${providers.length - affiliateUrlsSet - affiliateUrlsSkipped}`);
  }

  if (!affiliateOnly) {
    console.log(`\n--- Validation ---`);
    console.log(`  Total warnings:  ${allWarnings.length}`);
    if (!templateOnly) {
      console.log(`  xAI validated:   ${xaiValidated}`);
      console.log(`  xAI failed:      ${xaiFailed}`);
    }
  }

  if (!validateOnly) {
    console.log(`\n--- lastVerifiedAt ---`);
    console.log(`  Set: ${lastVerifiedAtSet}`);
  }

  if (failedSlugs.length > 0) {
    console.log(`\n--- Errors ---`);
    console.log(`  Failed: ${failedSlugs.length}`);
    for (const s of failedSlugs) {
      console.log(`    - ${s}`);
    }
  }

  // Print validation warnings detail
  if (allWarnings.length > 0) {
    console.log(`\n--- Validation Warnings Detail ---`);
    const byField = new Map<string, ValidationWarning[]>();
    for (const w of allWarnings) {
      const group = byField.get(w.field) ?? [];
      group.push(w);
      byField.set(w.field, group);
    }
    for (const [field, warnings] of byField) {
      console.log(`\n  [${field}] (${warnings.length} issues):`);
      for (const w of warnings) {
        console.log(`    - ${w.slug}: ${w.issue}`);
      }
    }
  } else if (!affiliateOnly) {
    console.log(`\n--- Validation ---`);
    console.log(`  All providers passed validation! No warnings.`);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(dryRun ? "DRY RUN complete. No database changes made." : "Done!");
  console.log(`${"=".repeat(60)}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
