/**
 * Phase 26 Plan 01: SEO Meta & FAQ Generation Script
 *
 * Generates metaTitle, metaDescription, and 2-3 ProviderFaq records for
 * all providers. Has a template-based fallback that works without xAI API
 * credits (which may be exhausted).
 *
 * Features:
 * - Template-based meta and FAQ generation from existing provider data
 * - Optional xAI API enhancement (falls back to templates on failure)
 * - Idempotent: never overwrites existing meta, never duplicates FAQs
 * - Supports --dry-run, --slug, --limit, --template-only, --meta-only, --faq-only
 *
 * Run with: npx tsx prisma/scripts/26-generate-meta-faqs.ts --template-only
 * Dry run:  npx tsx prisma/scripts/26-generate-meta-faqs.ts --dry-run --limit=3 --template-only
 * Single:   npx tsx prisma/scripts/26-generate-meta-faqs.ts --slug=dinnerly --template-only
 */

import "dotenv/config";
import { config } from "dotenv";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Load .env.local for XAI_API_KEY
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
  flexibility: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  freeShipping: boolean;
  dietaryTags: Array<{ id: string; providerId: string; tag: string }>;
  plans: Array<{
    id: string;
    name: string;
    pricePerServingCents: number | null;
    pricePerBoxCents: number | null;
    shippingCostCents: number;
    active: boolean;
    sortOrder: number;
  }>;
  faqs: Array<{ id: string; question: string; answer: string; sortOrder: number }>;
}

interface MetaData {
  metaTitle: string;
  metaDescription: string;
}

interface FaqData {
  question: string;
  answer: string;
  sortOrder: number;
}

interface XaiResult {
  metaTitle: string;
  metaDescription: string;
  faqs: Array<{ question: string; answer: string }>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  MEAL_KIT: "Meal Kit",
  PREPARED_MEAL: "Prepared Meal Delivery",
  PROTEIN_BOX: "Protein & Meat Box",
  PRODUCE_BOX: "Produce Box",
  SPECIALTY: "Specialty Food Box",
};

const XAI_API_URL = "https://api.x.ai/v1/responses";
const XAI_MODEL = "grok-4-1-fast-reasoning";
const INTER_CALL_DELAY_MS = 2000;

// ─── Template-Based Meta Generation ─────────────────────────────────────────

function generateTemplateMeta(provider: ProviderRecord): MetaData {
  const year = new Date().getFullYear();
  const catLabel = CATEGORY_LABELS[provider.category] ?? "Food Box";

  // metaTitle: max 70 chars (VarChar(70) in schema)
  let metaTitle = `${provider.name} Review ${year} - ${catLabel} | FoodBoxFinder`;
  if (metaTitle.length > 70) {
    metaTitle = `${provider.name} Review ${year} | FoodBoxFinder`;
  }
  if (metaTitle.length > 70) {
    metaTitle = `${provider.name} - ${catLabel} Review`;
  }
  if (metaTitle.length > 70) {
    metaTitle = `${provider.name} Review ${year}`;
  }
  if (metaTitle.length > 70) {
    metaTitle = metaTitle.substring(0, 67) + "...";
  }

  // metaDescription: max 160 chars (VarChar(160) in schema)
  // Use shortDescription or first ~120 chars of description + standard suffix
  const descBase = (provider.shortDescription ?? provider.description)
    .substring(0, 120)
    .trim();
  const suffix = " Compare plans, pricing & dietary options on FoodBoxFinder.";

  let metaDescription: string;
  if (descBase.length + suffix.length <= 160) {
    metaDescription = descBase + suffix;
  } else {
    // Truncate descBase to fit with suffix
    const maxDescLen = 160 - suffix.length - 3; // 3 for "..."
    if (maxDescLen > 20) {
      metaDescription = descBase.substring(0, maxDescLen) + "..." + suffix;
    } else {
      // Suffix is too long, just use descBase truncated
      metaDescription = descBase.substring(0, 157) + "...";
    }
  }

  // Final safety: hard truncate to 160
  if (metaDescription.length > 160) {
    metaDescription = metaDescription.substring(0, 157) + "...";
  }

  return { metaTitle, metaDescription };
}

// ─── Template-Based FAQ Generation ──────────────────────────────────────────

function generateTemplateFaqs(provider: ProviderRecord): FaqData[] {
  const faqs: FaqData[] = [];
  const catLabel = CATEGORY_LABELS[provider.category] ?? "food box";
  let order = 1;

  // FAQ 1: Always -- "How much does {name} cost?"
  const plan = provider.plans[0]; // cheapest active plan (sorted by sortOrder asc)
  if (plan) {
    const priceStr = plan.pricePerServingCents
      ? `$${(plan.pricePerServingCents / 100).toFixed(2)} per serving`
      : plan.pricePerBoxCents
        ? `$${(plan.pricePerBoxCents / 100).toFixed(2)} per box`
        : "varies by plan";
    const shipping = plan.shippingCostCents === 0
      ? "Free shipping is available."
      : `Shipping starts at $${(plan.shippingCostCents / 100).toFixed(2)}.`;
    faqs.push({
      question: `How much does ${provider.name} cost?`,
      answer: `${provider.name} plans start at ${priceStr}. ${shipping} Visit their website for the most current pricing and available promotions.`,
      sortOrder: order++,
    });
  } else {
    faqs.push({
      question: `How much does ${provider.name} cost?`,
      answer: `${provider.name} offers several ${catLabel.toLowerCase()} plans at different price points. Visit their website for current pricing and available promotions.`,
      sortOrder: order++,
    });
  }

  // FAQ 2: Dietary tags -- "What dietary options does {name} offer?"
  const tags = provider.dietaryTags.map(t => t.tag.replace(/_/g, " ").toLowerCase());
  if (tags.length > 0) {
    const tagList = tags.length === 1
      ? tags[0]
      : tags.slice(0, -1).join(", ") + " and " + tags[tags.length - 1];
    faqs.push({
      question: `What dietary options does ${provider.name} offer?`,
      answer: `${provider.name} supports ${tagList} dietary preferences. They offer dedicated menu options and filters to help you find meals that match your dietary needs.`,
      sortOrder: order++,
    });
  } else {
    faqs.push({
      question: `What dietary options does ${provider.name} offer?`,
      answer: `${provider.name} offers a variety of ${catLabel.toLowerCase()} options. Check their website for specific dietary accommodations and menu filters.`,
      sortOrder: order++,
    });
  }

  // FAQ 3: Flexibility -- "Can I skip or cancel {name}?"
  if (provider.flexibility) {
    faqs.push({
      question: `Can I skip or cancel my ${provider.name} subscription?`,
      answer: provider.flexibility,
      sortOrder: order++,
    });
  } else {
    faqs.push({
      question: `Can I skip or cancel my ${provider.name} subscription?`,
      answer: `Most ${catLabel.toLowerCase()} services including ${provider.name} allow you to skip weeks or cancel your subscription. Check their website for their specific cancellation and skip policies.`,
      sortOrder: order++,
    });
  }

  return faqs;
}

// ─── xAI API Integration ────────────────────────────────────────────────────

async function researchMetaFaqs(
  provider: ProviderRecord,
): Promise<XaiResult | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.log("  xAI: No API key, falling back to templates");
    return null;
  }

  const catLabel = CATEGORY_LABELS[provider.category] ?? "Food Box";

  const prompt = `Research the food subscription service "${provider.name}" (website: ${provider.website}, category: ${catLabel}).

Generate SEO metadata and FAQ content for their listing page on FoodBoxFinder.com.

Return a JSON object with EXACTLY these fields:

{
  "metaTitle": "SEO-optimized title under 70 characters for the provider page. Include the provider name and year. Example: 'HelloFresh Review 2026 - Meal Kit Delivery | FoodBoxFinder'",
  "metaDescription": "SEO-optimized description under 160 characters for search result snippets. Summarize what makes this provider unique and include a call to action.",
  "faqs": [
    { "question": "How much does [provider] cost?", "answer": "2-3 sentence answer with actual pricing if available" },
    { "question": "What dietary options does [provider] offer?", "answer": "2-3 sentence answer about dietary accommodations" },
    { "question": "Can I skip or cancel [provider]?", "answer": "2-3 sentence answer about flexibility and cancellation" }
  ]
}

IMPORTANT:
- metaTitle MUST be under 70 characters
- metaDescription MUST be under 160 characters
- Include 3 FAQs with factual, helpful answers
- Return ONLY the JSON object, no markdown formatting, no code blocks`;

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
      console.log(`  xAI: API error ${response.status} -- falling back to templates`);
      if (response.status === 429) {
        console.log("  xAI: Rate limited (credits exhausted?)");
      } else {
        console.log(`  xAI: ${errorText.substring(0, 200)}`);
      }
      return null;
    }

    const data = await response.json();

    // Parse xAI Responses API format
    const messageItem = data.output?.find(
      (item: { type: string }) => item.type === "message",
    );
    const textContent = messageItem?.content?.find(
      (c: { type: string }) => c.type === "output_text",
    );
    const rawText: string | undefined = textContent?.text;

    if (!rawText) {
      console.log("  xAI: No text in response, falling back to templates");
      return null;
    }

    // Strip markdown code fences if present
    const jsonStr = rawText
      .replace(/^```json?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(jsonStr) as XaiResult;

      // Validate the response
      if (!parsed.metaTitle || typeof parsed.metaTitle !== "string") {
        console.log("  xAI: Invalid metaTitle in response, falling back to templates");
        return null;
      }
      if (!parsed.metaDescription || typeof parsed.metaDescription !== "string") {
        console.log("  xAI: Invalid metaDescription in response, falling back to templates");
        return null;
      }
      if (!Array.isArray(parsed.faqs) || parsed.faqs.length === 0) {
        console.log("  xAI: Invalid FAQs in response, falling back to templates");
        return null;
      }

      // Enforce length limits
      if (parsed.metaTitle.length > 70) {
        parsed.metaTitle = parsed.metaTitle.substring(0, 67) + "...";
      }
      if (parsed.metaDescription.length > 160) {
        parsed.metaDescription = parsed.metaDescription.substring(0, 157) + "...";
      }

      return parsed;
    } catch {
      console.log("  xAI: Failed to parse JSON response, falling back to templates");
      return null;
    }
  } catch (fetchError) {
    console.log(`  xAI: Fetch error -- ${fetchError}`);
    return null;
  }
}

// ─── Database Operations ────────────────────────────────────────────────────

async function updateMeta(
  providerId: string,
  meta: MetaData,
  dryRun: boolean,
): Promise<boolean> {
  if (dryRun) {
    console.log(`  [DRY RUN] Would set metaTitle: "${meta.metaTitle}" (${meta.metaTitle.length} chars)`);
    console.log(`  [DRY RUN] Would set metaDescription: "${meta.metaDescription}" (${meta.metaDescription.length} chars)`);
    return true;
  }

  await prisma.provider.update({
    where: { id: providerId },
    data: {
      metaTitle: meta.metaTitle,
      metaDescription: meta.metaDescription,
    },
  });
  return true;
}

async function createFaqs(
  providerId: string,
  faqs: FaqData[],
  dryRun: boolean,
): Promise<number> {
  if (dryRun) {
    for (const faq of faqs) {
      console.log(`  [DRY RUN] Would create FAQ: "${faq.question}"`);
      console.log(`    Answer: "${faq.answer.substring(0, 100)}${faq.answer.length > 100 ? "..." : ""}"`);
    }
    return faqs.length;
  }

  // Use a transaction for atomicity
  const created = await prisma.$transaction(
    faqs.map(faq =>
      prisma.providerFaq.create({
        data: {
          providerId,
          question: faq.question,
          answer: faq.answer,
          sortOrder: faq.sortOrder,
        },
      }),
    ),
  );

  return created.length;
}

// ─── CLI Argument Parsing ───────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
    templateOnly: args.includes("--template-only"),
    metaOnly: args.includes("--meta-only"),
    faqOnly: args.includes("--faq-only"),
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
  const { dryRun, templateOnly, metaOnly, faqOnly, slug, limit } = parseArgs();

  // Query providers
  const whereClause = slug
    ? { slug, status: { not: "DISCONTINUED" as const } }
    : { status: { not: "DISCONTINUED" as const } };

  const allProviders = await prisma.provider.findMany({
    where: whereClause,
    include: {
      dietaryTags: true,
      plans: { where: { active: true }, orderBy: { sortOrder: "asc" as const }, take: 3 },
      faqs: true,
    },
    orderBy: { slug: "asc" },
  }) as unknown as ProviderRecord[];

  if (slug && allProviders.length === 0) {
    console.error(`ERROR: Provider with slug "${slug}" not found (or is DISCONTINUED).`);
    process.exit(1);
  }

  // Apply limit
  let providers = limit !== null && limit > 0
    ? allProviders.slice(0, limit)
    : allProviders;

  console.log(`\n=== Phase 26: SEO Meta & FAQ Generation ===`);
  console.log(`Providers to process: ${providers.length}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Source: ${templateOnly ? "TEMPLATE ONLY" : "xAI API (fallback to templates)"}`);
  if (metaOnly) console.log(`Scope: Meta only (skip FAQs)`);
  if (faqOnly) console.log(`Scope: FAQs only (skip meta)`);
  if (slug) console.log(`Filter: --slug=${slug}`);
  if (limit) console.log(`Limit: ${limit}`);
  console.log("");

  if (providers.length === 0) {
    console.log("No providers to process. Done!");
    return;
  }

  let metaUpdated = 0;
  let metaSkipped = 0;
  let faqsCreated = 0;
  let faqsSkipped = 0;
  let failed = 0;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const progress = `[${i + 1}/${providers.length}]`;
    console.log(`${progress} Processing: ${provider.name} (${provider.slug})`);

    const needsMeta = !faqOnly && (!provider.metaTitle || !provider.metaDescription);
    const needsFaqs = !metaOnly && provider.faqs.length < 2;

    // Skip if nothing needed
    if (!needsMeta && !needsFaqs) {
      console.log(`  SKIP: Already has meta (${provider.metaTitle ? "yes" : "no"}) and ${provider.faqs.length} FAQs`);
      if (needsMeta === false && !faqOnly) metaSkipped++;
      if (needsFaqs === false && !metaOnly) faqsSkipped++;
      continue;
    }

    try {
      let meta: MetaData | null = null;
      let faqs: FaqData[] | null = null;

      // Try xAI first (unless --template-only)
      if (!templateOnly) {
        console.log("  Trying xAI API...");
        const xaiResult = await researchMetaFaqs(provider);

        if (xaiResult) {
          console.log("  xAI: Got response, using API-generated content");
          if (needsMeta) {
            meta = {
              metaTitle: xaiResult.metaTitle,
              metaDescription: xaiResult.metaDescription,
            };
          }
          if (needsFaqs && xaiResult.faqs.length > 0) {
            faqs = xaiResult.faqs.map((f, idx) => ({
              question: f.question,
              answer: f.answer,
              sortOrder: idx + 1,
            }));
          }
        } else {
          console.log("  xAI: Failed, using template fallback");
        }

        // Rate limit between API calls
        if (i < providers.length - 1 && !templateOnly) {
          await delay(INTER_CALL_DELAY_MS);
        }
      }

      // Fall back to templates for any missing data
      if (needsMeta && !meta) {
        meta = generateTemplateMeta(provider);
        console.log(`  Template metaTitle: "${meta.metaTitle}" (${meta.metaTitle.length} chars)`);
        console.log(`  Template metaDescription: "${meta.metaDescription}" (${meta.metaDescription.length} chars)`);
      }

      if (needsFaqs && !faqs) {
        faqs = generateTemplateFaqs(provider);
        console.log(`  Template FAQs: ${faqs.length} generated`);
        for (const faq of faqs) {
          console.log(`    Q: "${faq.question}"`);
        }
      }

      // Write meta to DB
      if (needsMeta && meta) {
        const wrote = await updateMeta(provider.id, meta, dryRun);
        if (wrote) {
          metaUpdated++;
          const prefix = dryRun ? "WOULD UPDATE" : "UPDATED";
          console.log(`  ${prefix} meta for ${provider.slug}`);
        }
      } else if (!needsMeta && !faqOnly) {
        console.log(`  SKIP meta: Already has metaTitle="${provider.metaTitle}"`);
        metaSkipped++;
      }

      // Write FAQs to DB
      if (needsFaqs && faqs && faqs.length > 0) {
        const count = await createFaqs(provider.id, faqs, dryRun);
        faqsCreated += count;
        const prefix = dryRun ? "WOULD CREATE" : "CREATED";
        console.log(`  ${prefix} ${count} FAQ records`);
      } else if (!needsFaqs && !metaOnly) {
        console.log(`  SKIP FAQs: Already has ${provider.faqs.length} FAQs`);
        faqsSkipped++;
      }
    } catch (error) {
      console.error(`  ERROR: ${error}`);
      failed++;
    }

    console.log("");
  }

  // Print summary
  console.log(`=== Generation Complete ===`);
  if (!faqOnly) {
    console.log(`Meta updated: ${metaUpdated}`);
    console.log(`Meta skipped (already populated): ${metaSkipped}`);
  }
  if (!metaOnly) {
    console.log(`FAQs created: ${faqsCreated}`);
    console.log(`FAQs skipped (already have 2+): ${faqsSkipped}`);
  }
  console.log(`Failed: ${failed}`);
  console.log(`Total processed: ${providers.length}`);
  console.log("");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
