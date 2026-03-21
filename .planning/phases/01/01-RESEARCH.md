# Phase 1: Data Foundation - Research

**Researched:** 2026-03-21
**Domain:** Prisma schema extension, data seeding, image conversion
**Confidence:** HIGH

## Summary

Phase 1 extends the existing Prisma schema to accommodate 95 providers from a research dataset (`food-box-companies.json`), replaces the boolean `active` field with a `ProviderStatus` enum, converts 5 `.ico` logo files to `.png`, and creates a seed script that imports all 95 providers with logo paths derived from the manifest.

The existing codebase already has 18 hand-crafted provider seed records with rich editorial content (descriptions, pros/cons, plans, reviews, FAQs). The dataset has 95 providers with metadata fields (model_type, prep_style, value_tier, etc.) but minimal editorial content (just template summaries). The seed script must import all 95 from the JSON while preserving the richer editorial data for the 18 overlapping providers. Two slug mismatches exist: `farmbox-direct` (seed) vs `farmbox-delivery` (JSON), and `trifecta` (seed) vs `trifecta-nutrition` (JSON).

**Primary recommendation:** Store `modelType`, `prepStyle`, `secondaryTags`, and `flexibility` as plain strings (not enums) because the dataset has 37 unique prep_style values and 92 unique secondary tags -- too many and too irregular for Prisma enums. Use enums only for `status` (4 fixed values), `valueTier` (4 fixed values), `householdFit` (4 fixed values), and `geography` (3 normalizable values). Use `sips` (macOS built-in) for ICO-to-PNG conversion.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
None -- all implementation choices delegated to Claude's discretion.

### Claude's Discretion
All implementation choices are at Claude's discretion -- pure infrastructure phase. Key technical decisions:
- Enum vs string fields for sparse dataset values (model_type, prep_style, value_tier, etc.)
- Field mapping between JSON dataset keys and Prisma schema field names
- .ico to .png conversion approach
- Seed script error handling and idempotency strategy
- How to handle pipe-delimited fields (secondary_tags, diet_tags, household_fit) during import

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Extend Provider schema with dataset fields: modelType, prepStyle, householdFit, valueTier, geography, shippingNotes, flexibility, pricingSignal, secondaryTags, affiliateSignal, sourceUrls, sourceFiles, notes | Field analysis complete -- enum vs string recommendation for each field based on value cardinality |
| DATA-02 | Add status enum (ACTIVE, HYBRID, UNCLEAR, DISCONTINUED) to replace boolean active field on Provider | Exact 4 values confirmed in dataset; all 95 records have status populated |
| DATA-03 | Seed script imports all 95 providers from food-box-companies.json with field mapping | Full field mapping documented; slug mismatches identified; merge strategy for 18 overlapping providers defined |
| DATA-04 | Seed script maps provider logo paths from manifest.json to Provider logoUrl field | Manifest has 95 entries with zero errors; path derivation pattern: strip public dir prefix to get `/assets/providers/{slug}.{ext}` |
| DATA-05 | Convert 5 .ico logo files to .png format (Blue Apron, Farm Fresh to You, Farmbox Delivery, Full Circle, Crowd Cow) | File analysis complete; `sips` confirmed working on macOS for ICO-to-PNG; one "ICO" is actually a renamed PNG (crowd-cow) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| prisma | 7.5.0 | Schema definition and database push | Already installed; `db push` for schema sync |
| @prisma/client | 7.5.0 | Type-safe database client | Already installed; generates types to `src/generated/prisma/` |
| tsx | (dev dep) | Run TypeScript seed script | Already used for seed via `npx tsx prisma/seed.ts` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sips | macOS built-in | ICO to PNG image conversion | Pre-seed step; convert 5 .ico files |
| Node.js fs | built-in | Read JSON files, write converted images | Seed script data loading |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sips (macOS) | sharp (0.34.5, bundled with Next.js) | sharp cannot read ICO format -- tested and confirmed failure. sips handles all 5 files correctly |
| sips (macOS) | ffmpeg (available at /opt/homebrew/bin/ffmpeg) | ffmpeg works but sips is simpler and already available without extra dependencies |
| String fields for prep_style | Prisma enum | 37 unique values, many with parenthetical qualifiers -- enum would be unmaintainable |

**No new packages need to be installed.** All tools are already available.

## Architecture Patterns

### Schema Extension Pattern
```
prisma/schema.prisma
  - Add ProviderStatus enum (ACTIVE, HYBRID, UNCLEAR, DISCONTINUED)
  - Add ValueTier enum (BUDGET, MID, PREMIUM, LUXURY)
  - Add new fields to Provider model
  - Replace `active Boolean` with `status ProviderStatus`
```

### Seed Script Architecture
```
prisma/
  seed.ts                    # Main entry point (EXISTING - needs modification)
  seed-data/
    providers.ts             # EXISTING 18 hand-crafted providers (KEEP for editorial content)
    helpers.ts               # EXISTING pricing helpers (KEEP)
    collections.ts           # EXISTING (KEEP)
    blog-posts.ts            # EXISTING (KEEP)
temp/plandocs/
  food-box-companies.json    # 95-provider research dataset (READ-ONLY source)
public/assets/providers/
  manifest.json              # Logo asset manifest (READ-ONLY source)
  *.png, *.jpg, *.svg, etc.  # Logo files (5 .ico files need conversion)
```

### Pattern 1: Merge-Based Seeding
**What:** For the 16 providers that exist in both the hand-crafted seed data AND the JSON dataset, merge the JSON metadata fields onto the existing rich provider records. The 79 providers only in the JSON dataset get seeded from JSON directly.
**When to use:** When you have two data sources with complementary fields.
**Example:**
```typescript
// 1. Load both data sources
import handCraftedProviders from "./seed-data/providers";
const jsonDataset = JSON.parse(fs.readFileSync("temp/plandocs/food-box-companies.json", "utf-8"));
const manifest = JSON.parse(fs.readFileSync("public/assets/providers/manifest.json", "utf-8"));

// 2. For each JSON record, check if hand-crafted version exists
// 3. If yes: use hand-crafted as base, overlay new fields from JSON
// 4. If no: create minimal provider from JSON data
```

### Pattern 2: Status Enum Migration
**What:** Replace `active: Boolean @default(true)` with `status: ProviderStatus @default(ACTIVE)`.
**When to use:** When a boolean becomes insufficient to represent a multi-state field.
**Important:** The existing 18 seed providers all set `active: true`. After migration, these should use `status: "ACTIVE"`. The JSON dataset has explicit status values for all 95 providers.

### Pattern 3: Nullable Fields for Sparse Data
**What:** All new dataset fields must be nullable (`String?`) because population rates are very low.
**When to use:** When data sparsity is > 50%.

**Population rates from dataset analysis:**
| Field | Populated | Rate |
|-------|-----------|------|
| model_type | 95/95 | 100% |
| prep_style | 95/95 | 100% |
| status | 95/95 | 100% |
| secondary_tags | 95/95 | 100% |
| source_files | 92/95 | 97% |
| source_urls | 92/95 | 97% |
| summary | 95/95 | 100% |
| flexibility | 25/95 | 26% |
| shipping_notes | 19/95 | 20% |
| notes | 21/95 | 22% |
| pricing_signal | 16/95 | 17% |
| affiliate_signal | 16/95 | 17% |
| value_tier | 8/95 | 8% |
| household_fit | 4/95 | 4% |
| diet_tags | 15/95 | 16% |
| geography | 9/95 | 9% |

### Anti-Patterns to Avoid
- **Creating Prisma enums for high-cardinality text fields:** prep_style has 37 unique values with parenthetical qualifiers like `"prepared (fresh heat-and-eat)"`. Making these enums would require constant schema migrations as new providers are added. Store as `String?`.
- **Dropping existing seed data:** The 18 hand-crafted providers have rich editorial content (descriptions, pros/cons, plans, reviews, FAQs, pricing) that does not exist in the JSON dataset. Do not replace them wholesale.
- **Storing diet_tags as a pipe-delimited string:** The existing schema already has a `ProviderDietaryTag` many-to-many model. Map JSON `diet_tags` to this model where possible.
- **Using absolute filesystem paths for logoUrl:** The manifest has absolute paths like `/Users/.../public/assets/providers/hellofresh.png`. The database should store web-relative paths like `/assets/providers/hellofresh.png`.

## Field Mapping

### JSON Key to Prisma Field Name

| JSON Key | Prisma Field | Type | Why |
|----------|-------------|------|-----|
| `slug` | `slug` | String (existing) | Already exists, primary key for matching |
| `name` | `name` | String (existing) | Already exists |
| `website` | `website` | String (existing) | Already exists |
| `primary_category` | `category` | CategoryType (existing) | Map: `meal_kits` -> `MEAL_KIT`, etc. |
| `model_type` | `modelType` | String? | NEW - 11 unique values, normalizable to ~5-6 but keep raw string for fidelity |
| `prep_style` | `prepStyle` | String? | NEW - 37 unique values, too many for enum |
| `diet_tags` | (ProviderDietaryTag relation) | many-to-many | Map to existing DietaryTag enum where possible |
| `household_fit` | `householdFit` | String? | NEW - only 4 values but 96% empty; store as pipe-delimited string |
| `value_tier` | `valueTier` | ValueTier? | NEW enum - exactly 4 clean values: BUDGET, MID, PREMIUM, LUXURY |
| `geography` | `geography` | String? | NEW - 8 values but they have parenthetical notes, store as string |
| `shipping_notes` | `shippingNotes` | String? @db.Text | NEW - free text |
| `flexibility` | `flexibility` | String? @db.Text | NEW - free text with structured but inconsistent format |
| `pricing_signal` | `pricingSignal` | String? @db.Text | NEW - free text |
| `secondary_tags` | `secondaryTags` | String? @db.Text | NEW - pipe-delimited, 92 unique tags |
| `affiliate_signal` | `affiliateSignal` | String? @db.Text | NEW - free text |
| `source_urls` | `sourceUrls` | String? @db.Text | NEW - pipe-delimited URLs |
| `source_files` | `sourceFiles` | String? @db.Text | NEW - pipe-delimited filenames |
| `notes` | `notes` | String? @db.Text | NEW - internal editorial notes |
| `status` | `status` | ProviderStatus | NEW enum replacing boolean `active` |
| `summary` | (use as `description` for JSON-only providers) | -- | Fallback description |

### Category Mapping (JSON -> Prisma Enum)
| JSON Value | Prisma Enum Value |
|------------|-------------------|
| `meal_kits` | `MEAL_KIT` |
| `prepared_meals` | `PREPARED_MEAL` |
| `protein_boxes` | `PROTEIN_BOX` |
| `produce_boxes` | `PRODUCE_BOX` |
| `specialty` | `SPECIALTY` |

### Status Mapping (JSON -> Prisma Enum)
| JSON Value | Prisma Enum Value |
|------------|-------------------|
| `active` | `ACTIVE` |
| `hybrid` | `HYBRID` |
| `unclear` | `UNCLEAR` |
| `discontinued` | `DISCONTINUED` |

### Value Tier Mapping (JSON -> Prisma Enum)
| JSON Value | Prisma Enum Value |
|------------|-------------------|
| `budget` | `BUDGET` |
| `mid` | `MID` |
| `premium` | `PREMIUM` |
| `luxury` | `LUXURY` |

### Diet Tag Mapping (JSON -> Existing DietaryTag Enum)
| JSON Value | Maps to DietaryTag? | Action |
|------------|---------------------|--------|
| `vegan` | VEGAN | Create ProviderDietaryTag |
| `vegetarian` | VEGETARIAN | Create ProviderDietaryTag |
| `keto` | KETO | Create ProviderDietaryTag |
| `dairy-free` | DAIRY_FREE | Create ProviderDietaryTag |
| `gluten-free` | GLUTEN_FREE | Create ProviderDietaryTag |
| `low-carb` | LOW_CARB | Create ProviderDietaryTag |
| `mediterranean` | MEDITERRANEAN | Create ProviderDietaryTag |
| `high-protein` | No match | Skip (no HIGH_PROTEIN in enum) |
| `plant-based` | No match | Skip (closest: VEGAN, but not same) |
| `plant-based options` | No match | Skip |
| `plant-forward` | No match | Skip |
| `protein` | No match | Skip |
| `vegan options` | No match | Skip (not same as VEGAN) |
| `gluten-free options` | No match | Skip (not same as GLUTEN_FREE) |

**7 of 14 diet tag values map cleanly to existing enum. The remaining 7 have no match and should be skipped (they are captured in `secondaryTags` anyway).**

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ICO to PNG conversion | Custom Node.js ICO parser | macOS `sips -s format png input.ico --out output.png` | ICO is a complex container format with multiple sizes; sips handles it natively |
| JSON field mapping | Manual switch/case per field | A mapping object + loop | 17 fields to map; a data-driven approach is less error-prone |
| Slug generation | Custom slugify function | Use slugs directly from dataset | All 95 slugs are already URL-safe and match between dataset and manifest |
| Category string to enum | Custom parser | Simple lookup map with 5 entries | `meal_kits` -> `MEAL_KIT` via `toUpperCase().replace('s$', '')` won't work reliably; use explicit map |

**Key insight:** The dataset is already well-structured with consistent slugs and clean categorical values. The complexity is in merging two data sources (hand-crafted editorial + research dataset) and handling nullable/sparse fields.

## ICO Conversion Details

### Files to Convert
| Slug | Source File | Source Dimensions | Target |
|------|-----------|-------------------|--------|
| blue-apron | blue-apron.ico | 48x48 (multi-icon, largest) | blue-apron.png |
| farm-fresh-to-you | farm-fresh-to-you.ico | 16x16 (single icon) | farm-fresh-to-you.png |
| farmbox-delivery | farmbox-delivery.ico | 256x256 (multi-icon, largest) | farmbox-delivery.png |
| full-circle | full-circle.ico | 32x32 (single icon) | full-circle.png |
| crowd-cow | crowd-cow.ico | 1010x1035 (actually a PNG with .ico extension) | crowd-cow.png |

### Conversion Command
```bash
sips -s format png input.ico --out output.png
```

**Notes:**
- `sips` extracts the largest icon from multi-icon ICO containers
- `crowd-cow.ico` is actually a PNG file with the wrong extension; `sips` handles it correctly (outputs 1010x1035 PNG)
- `farm-fresh-to-you.ico` is only 16x16 -- very small but usable as a favicon-sized logo
- After conversion, delete the original `.ico` files
- Update `manifest.json` to reference `.png` instead of `.ico`
- Sharp (0.34.5, bundled with Next.js) was tested and CANNOT read ICO format -- confirmed error: "Input file contains unsupported image format"

## Slug Mismatches

Two providers exist in the seed data with different slugs than in the JSON dataset:

| Seed Data Slug | JSON Dataset Slug | Resolution |
|----------------|-------------------|------------|
| `farmbox-direct` | `farmbox-delivery` | Use JSON slug `farmbox-delivery` (matches manifest); update or remove `farmbox-direct` from seed |
| `trifecta` | `trifecta-nutrition` | Use JSON slug `trifecta-nutrition` (matches manifest); update or remove `trifecta` from seed |

**Impact:** The seed data has 18 providers, but only 16 match the JSON dataset by slug. The 2 mismatched providers need their slugs reconciled. The editorial content from the seed data should be preserved under the corrected slug.

## Common Pitfalls

### Pitfall 1: Prisma db push with enum changes
**What goes wrong:** Adding a new enum and changing a column type from Boolean to enum can cause data loss if existing data is in the database.
**Why it happens:** `prisma db push` in development mode may drop and recreate columns when types change.
**How to avoid:** Run `prisma db push` BEFORE seeding (empty database state or accept data reset). The project uses `db push` (not migrations), so this is expected.
**Warning signs:** Prisma CLI warning about "you will lose data" -- acceptable in development.

### Pitfall 2: Removing `active` field breaks existing code
**What goes wrong:** The existing schema has `active Boolean @default(true)` and indexes reference it. The seed data sets `active: true`. Code may reference `active` field.
**Why it happens:** Replacing a field with a new enum-typed field is a breaking change.
**How to avoid:** Search for all references to `active` on Provider in the codebase. Update seed data, indexes, and any query code.
**Warning signs:** TypeScript compilation errors after schema change.

### Pitfall 3: Existing seed data structure assumes current schema
**What goes wrong:** The `prisma/seed-data/providers.ts` file uses `Prisma.ProviderCreateInput` type. After schema changes, this type will require `status` instead of `active` and new nullable fields.
**Why it happens:** Generated types change after `prisma generate`.
**How to avoid:** After schema changes, run `prisma generate` first, then update the seed data type references.
**Warning signs:** TypeScript errors in `providers.ts`.

### Pitfall 4: Manifest paths are absolute filesystem paths
**What goes wrong:** Storing `/Users/chrisstanchak/Code/foodboxfinder/public/assets/providers/hellofresh.png` as logoUrl makes the app non-portable.
**Why it happens:** The manifest was generated with absolute paths.
**How to avoid:** Strip the project's `public` directory prefix: `/assets/providers/hellofresh.png`. After ICO conversion, reference the `.png` extension.
**Warning signs:** Logos not loading in the browser.

### Pitfall 5: Pipe-delimited fields with empty strings
**What goes wrong:** Splitting an empty string on `|` produces `[""]` (array with one empty string), not `[]`.
**Why it happens:** JavaScript `"".split("|")` returns `[""]`.
**How to avoid:** Check for empty/falsy string before splitting: `value ? value.split("|").map(s => s.trim()).filter(Boolean) : []`.
**Warning signs:** Empty string tags or empty ProviderDietaryTag records.

### Pitfall 6: Diet tag values that don't match enum
**What goes wrong:** Trying to create a ProviderDietaryTag with `"high-protein"` when no `HIGH_PROTEIN` enum value exists causes a Prisma error.
**Why it happens:** 7 of 14 diet tag values in the JSON have no corresponding DietaryTag enum value.
**How to avoid:** Use a mapping function that returns `null` for unmapped values and filter nulls before creating records.
**Warning signs:** Prisma constraint violation errors during seeding.

## Code Examples

### Schema Extension
```prisma
// New enums to add
enum ProviderStatus {
  ACTIVE
  HYBRID
  UNCLEAR
  DISCONTINUED
}

enum ValueTier {
  BUDGET
  MID
  PREMIUM
  LUXURY
}

// New fields on Provider model
model Provider {
  // ... existing fields ...

  // Replace: active Boolean @default(true)
  // With:
  status ProviderStatus @default(ACTIVE)

  // New dataset fields
  modelType       String?  // e.g. "subscription-first", "hybrid", "store-first"
  prepStyle       String?  // e.g. "cook-it-yourself", "prepared (fresh heat-and-eat)"
  valueTier       ValueTier?
  householdFit    String?  // pipe-delimited: "single-serve|family"
  geography       String?  // e.g. "regional (CA + Western US)"
  shippingNotes   String?  @db.Text
  flexibility     String?  @db.Text
  pricingSignal   String?  @db.Text
  secondaryTags   String?  @db.Text  // pipe-delimited tags
  affiliateSignal String?  @db.Text
  sourceUrls      String?  @db.Text  // pipe-delimited URLs
  sourceFiles     String?  @db.Text  // pipe-delimited filenames
  notes           String?  @db.Text  // internal editorial notes

  // Update indexes: replace [active] and composite indexes
  @@index([status])
  @@index([category, status, averageRating])  // replaces [category, active, averageRating]
  // Remove @@index([active])
}
```

### Category Mapping Function
```typescript
import type { CategoryType } from "@/generated/prisma/client";

const CATEGORY_MAP: Record<string, CategoryType> = {
  "meal_kits": "MEAL_KIT",
  "prepared_meals": "PREPARED_MEAL",
  "protein_boxes": "PROTEIN_BOX",
  "produce_boxes": "PRODUCE_BOX",
  "specialty": "SPECIALTY",
};

function mapCategory(jsonCategory: string): CategoryType {
  const mapped = CATEGORY_MAP[jsonCategory];
  if (!mapped) throw new Error(`Unknown category: ${jsonCategory}`);
  return mapped;
}
```

### Logo URL Derivation
```typescript
function getLogoUrl(
  slug: string,
  manifest: Array<{ slug: string; asset: string }>,
  publicDir: string,
): string | null {
  const entry = manifest.find(m => m.slug === slug);
  if (!entry) return null;
  // Convert absolute path to web-relative path
  // After ICO conversion, .ico files will be .png
  let relPath = entry.asset.replace(publicDir, "");
  relPath = relPath.replace(/\.ico$/, ".png");
  return relPath;
}
```

### Safe Pipe-Delimited Parsing
```typescript
function parsePipeDelimited(value: string | undefined | null): string[] {
  if (!value || !value.trim()) return [];
  return value.split("|").map(s => s.trim()).filter(Boolean);
}
```

### Diet Tag Mapping
```typescript
import type { DietaryTag } from "@/generated/prisma/client";

const DIET_TAG_MAP: Record<string, DietaryTag | null> = {
  "vegan": "VEGAN",
  "vegetarian": "VEGETARIAN",
  "keto": "KETO",
  "dairy-free": "DAIRY_FREE",
  "gluten-free": "GLUTEN_FREE",
  "low-carb": "LOW_CARB",
  "mediterranean": "MEDITERRANEAN",
  // Unmapped values
  "high-protein": null,
  "plant-based": null,
  "plant-based options": null,
  "plant-forward": null,
  "protein": null,
  "vegan options": null,
  "gluten-free options": null,
};

function mapDietTags(pipeDelimited: string): DietaryTag[] {
  return parsePipeDelimited(pipeDelimited)
    .map(tag => DIET_TAG_MAP[tag] ?? null)
    .filter((t): t is DietaryTag => t !== null);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Boolean `active` field | Multi-value enum status | This phase | Supports HYBRID, UNCLEAR, DISCONTINUED in addition to ACTIVE |
| 18 hand-crafted providers | 95 providers from research dataset | This phase | Full catalog seeded from day one |
| Manual provider creation | JSON-driven seed with field mapping | This phase | Reproducible, idempotent seeding |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed (no test framework in project) |
| Config file | None |
| Quick run command | `npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts` |
| Full suite command | `npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts && npx prisma db execute --stdin <<< "SELECT count(*) FROM \"Provider\""` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | Schema has all new fields | smoke | `npx prisma db push` (succeeds without error) | N/A - schema validation |
| DATA-02 | Status enum replaces active boolean | smoke | `npx prisma db push` + seed runs with status values | N/A - schema validation |
| DATA-03 | 95 providers seeded | smoke | `npx tsx prisma/seed.ts` (prints count = 95) | Exists: prisma/seed.ts |
| DATA-04 | logoUrl populated from manifest | smoke | Seed output shows logo paths; `SELECT count(*) FROM "Provider" WHERE "logoUrl" IS NOT NULL` | N/A - seed verification |
| DATA-05 | 5 .ico files converted to .png | manual | `file public/assets/providers/blue-apron.png` (shows PNG) | N/A - file conversion |

### Sampling Rate
- **Per task commit:** `npx prisma generate && npx tsc --noEmit` (type check)
- **Per wave merge:** `npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts`
- **Phase gate:** Full seed run + verify 95 providers in database + all .ico files converted

### Wave 0 Gaps
- No test framework installed -- validation is via schema push, seed execution, and manual verification
- No automated assertion for provider count or field population -- rely on seed script console output
- This is acceptable for a data-only phase with no runtime code changes

## Open Questions

1. **Should the 2 mismatched slugs be reconciled by renaming in seed data or by adding aliases?**
   - What we know: `farmbox-direct` (seed) maps to `farmbox-delivery` (JSON/manifest); `trifecta` (seed) maps to `trifecta-nutrition` (JSON/manifest)
   - What's unclear: Whether any existing database data references the old slugs
   - Recommendation: Rename in seed data to match JSON/manifest slugs. Since no production data exists yet and `db push` clears data, this is safe.

2. **Should the `active` field be kept alongside `status` for backward compatibility?**
   - What we know: The `active` field is referenced in composite indexes and possibly in the existing query layer (not yet built)
   - What's unclear: Whether any existing code beyond seeds references `active`
   - Recommendation: Remove `active` and replace with `status`. This is phase 1 with no deployed code -- clean break is better.

3. **How to handle low-resolution logos (farm-fresh-to-you at 16x16)?**
   - What we know: After conversion, farm-fresh-to-you.png will be only 16x16 pixels -- too small for most UI uses
   - What's unclear: Whether higher-resolution logos can be sourced
   - Recommendation: Convert as-is and set logoUrl. Future logo improvements are outside this phase's scope. The ProviderLogo component (Phase 3) will have a fallback placeholder.

## Sources

### Primary (HIGH confidence)
- `prisma/schema.prisma` -- existing schema with 10 models, 5 enums
- `temp/plandocs/food-box-companies.json` -- 95 providers, analyzed all unique field values
- `public/assets/providers/manifest.json` -- 95 logo entries, 0 errors
- `prisma/seed-data/providers.ts` -- 18 existing hand-crafted providers
- macOS `sips` command -- tested ICO-to-PNG conversion on all 5 files
- sharp 0.34.5 (bundled with Next.js) -- tested and confirmed cannot read ICO format

### Secondary (MEDIUM confidence)
- Prisma 7.5.0 `db push` behavior for enum additions -- based on known Prisma behavior, not freshly verified against v7.5 changelog

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all tools already installed and verified
- Architecture: HIGH - full data analysis of both sources complete; all field mappings verified
- Pitfalls: HIGH - tested conversion tools; analyzed field value distributions; identified slug mismatches

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable -- data files are static, schema is under project control)
