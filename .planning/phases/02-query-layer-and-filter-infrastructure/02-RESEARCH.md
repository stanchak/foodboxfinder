# Phase 2: Query Layer and Filter Infrastructure - Research

**Researched:** 2026-03-21
**Domain:** React.cache() query layer, URL search param parsing, Prisma type-safe filtering
**Confidence:** HIGH

## Summary

Phase 2 is pure infrastructure: no UI, no routes, no visible changes. It delivers two modules -- an enhanced query layer (`src/lib/queries.ts`, potentially split) and a new filter parsing module (`src/lib/filters.ts`). The existing `queries.ts` already has 18 `React.cache()`-wrapped functions at 336 lines (above the 300-line split threshold from PROJECT.md). The main work is: (1) refactor and split queries.ts, (2) update `getProvidersByCategory` to accept the full 9-dimension filter object, (3) build `filters.ts` as the centralized filter parser, and (4) handle null-aware filtering for the very sparse dataset.

The critical design challenge is that 5 of the 9 filter dimensions (`modelType`, `prepStyle`, `householdFit`, `geography`, `flexibility`) are stored as nullable free-text strings -- NOT enums. Only `category` (CategoryType enum), `dietaryTags` (DietaryTag enum via join table), `valueTier` (ValueTier enum), and `status` (ProviderStatus enum) have constrained values. This means the filter parser must map URL slugs to known string values for the free-text fields, and the Prisma queries use `contains` or exact-match string comparisons rather than enum equality.

**Primary recommendation:** Build `filters.ts` with a `parseProviderFilters()` function that takes the raw `searchParams` object (after await), validates each dimension against known value sets, and returns a typed `ProviderFilters` object. Split queries.ts by domain (listing, detail, content, admin). Update the listing query to accept `ProviderFilters` and build a Prisma `where` clause with null-aware filtering (providers with null values for a filtered field pass through).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
None -- all implementation choices deferred to Claude's discretion.

### Claude's Discretion
All implementation choices are at Claude's discretion -- pure infrastructure phase. Key areas:
- How to split queries.ts if it exceeds 300 lines (by domain vs by page vs by operation type)
- Filter parser return type structure for the typed ProviderFilters object
- How to handle the new enum fields (ProviderStatus, ValueTier) in filter parsing alongside existing CategoryType and DietaryTag
- Safe defaults for each filter dimension when values are invalid or missing
- Whether to use Prisma's type-safe where clause building or manual query construction

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QUERY-01 | Centralized query layer in src/lib/queries.ts with React.cache() wrapped functions | Existing 336-line queries.ts already has 18 cache-wrapped functions. Research covers split strategy and cache() usage patterns. |
| QUERY-02 | Query functions for: listings with filters, provider detail by slug, comparison by slugs, search, admin stats, featured providers, category counts | All 7 query types already exist in queries.ts. Listing query needs enhancement for 9-dimension filtering. Others need minor updates. |
| QUERY-03 | Split queries.ts if exceeding 300 lines | Already at 336 lines. Research covers domain-based split strategy into 4 files. |
| FILTER-01 | Centralized filter parsing module (src/lib/filters.ts) with typed, validated filter objects and safe defaults | Research covers full filter architecture including ProviderFilters type, parseProviderFilters function, enum/string validation, null-aware filtering, and sort options. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react (cache) | 19.2.4 | Request-level memoization for query dedup | Already used in queries.ts; React.cache() deduplicates within a single render pass |
| @prisma/client | 7.5.0 | Type-safe database queries | Already configured with PrismaPg adapter for Neon |
| server-only | (bundled) | Prevent client-side import of query modules | Already used in queries.ts |
| next | 16.2.0 | searchParams as Promise, revalidatePath | searchParams must be awaited in page components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | This phase uses only existing dependencies |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React.cache() | unstable_cache from next/cache | unstable_cache adds cross-request caching with TTL and tags; React.cache() is per-request dedup only. For query layer, per-request dedup is correct -- page-level caching via ISR handles cross-request caching. |
| Manual where-clause building | Prisma query builder helpers | Manual building with spread operators is already the established pattern and works well for optional filter composition. |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/lib/
├── db.ts                  # Prisma singleton (unchanged)
├── categories.ts          # Category slug/enum mapping (unchanged)
├── format.ts              # Price formatting (unchanged)
├── filters.ts             # NEW: Filter parsing and types
├── queries/               # NEW: Split query modules
│   ├── index.ts           # Re-exports all query functions
│   ├── providers.ts       # Listing, detail, related, featured, slugs
│   ├── content.ts         # Blog posts, collections, search
│   └── admin.ts           # Admin stats, affiliate analytics, review stats
└── (queries.ts removed)   # Replaced by queries/ directory
```

**Split rationale:** Domain-based split is cleanest because query functions group naturally by the model they primarily operate on. The `providers.ts` file handles the most complex queries (filtered listings) while `content.ts` and `admin.ts` are straightforward. The `index.ts` barrel re-exports maintain backward compatibility so existing imports like `import { getProviderBySlug } from "@/lib/queries"` continue to work (just update the path from `queries.ts` to `queries/index.ts` -- or keep `queries.ts` as a barrel that re-exports from the subdirectory).

**Alternative approach (simpler):** Keep a single `queries.ts` file and just add the filter-enhanced listing query. The file is only 36 lines over the 300-line threshold. After adding filter infrastructure, it would grow to ~400-450 lines. The split is recommended but not urgent.

### Pattern 1: Filter Parser Module (`filters.ts`)
**What:** A module that exports types and a parser for converting raw URL searchParams into a validated, typed filter object.
**When to use:** Every page that needs to filter providers -- category pages, search pages, filtered listings.

**Type design:**
```typescript
// src/lib/filters.ts
import "server-only";
import type { CategoryType, DietaryTag, ValueTier, ProviderStatus } from "@/generated/prisma/client";

// --- Known Values for String Fields ---
// These are the canonical values stored in the database.
// The filter parser maps URL slugs to these values.

export const PREP_STYLE_VALUES = [
  "cook-it-yourself",
  "prepared (fresh)",
  "prepared (frozen)",
  "prepared (heat-and-eat)",
  "raw-protein",
  "snacks",
  "produce-box",
  "grocery/produce",
  "coffee",
  "tea",
  "dessert/bakery",
  "pantry/spices",
] as const;

export const HOUSEHOLD_FIT_VALUES = [
  "single-serve",
  "couples",
  "family",
  "freezer-stocking",
  "gifting",
] as const;

export const MODEL_TYPE_VALUES = [
  "subscription-first",
  "store-first",
  "hybrid",
  "marketplace",
  "gift-club",
] as const;

export const GEOGRAPHY_VALUES = [
  "national-us",
  "regional",
  "multi-market",
] as const;

export const SORT_OPTIONS = [
  "featured",
  "rating",
  "name-asc",
  "value-tier",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

// --- Filter Types ---

export interface ProviderFilters {
  category?: CategoryType;
  dietaryTags: DietaryTag[];
  prepStyle?: string;
  valueTier?: ValueTier;
  householdFit?: string;
  modelType?: string;
  geography?: string;
  status: ProviderStatus[];  // default: ["ACTIVE", "HYBRID"]
  sortBy: SortOption;
  page: number;
  pageSize: number;
}

// --- Parser ---

export function parseProviderFilters(
  searchParams: Record<string, string | string[] | undefined>
): ProviderFilters {
  // Implementation validates each field against known values,
  // falls back to safe defaults for invalid values
}
```

### Pattern 2: Null-Aware Filtering in Prisma Where Clause
**What:** When a filter is active, include providers that either match the filter OR have a null/empty value for that field.
**When to use:** All string-based filter dimensions (modelType, prepStyle, householdFit, geography).

**Rationale from project data:**
- `householdFit`: 91/95 providers have empty values
- `geography`: 86/95 providers have empty values
- `valueTier`: 87/95 providers have null values
- Without null-aware filtering, selecting "family" for household_fit would show only 1 provider

**Example:**
```typescript
// Null-aware filter: match value OR null
function nullAwareFilter(field: string, value: string | undefined) {
  if (!value) return {};
  return {
    OR: [
      { [field]: { contains: value, mode: "insensitive" } },
      { [field]: null },
      { [field]: "" },
    ],
  };
}

// For enum fields (valueTier), null-aware but exact match
function nullAwareEnumFilter(field: string, value: string | undefined) {
  if (!value) return {};
  return {
    OR: [
      { [field]: value },
      { [field]: null },
    ],
  };
}
```

### Pattern 3: Query Split with Barrel Re-export
**What:** Split queries into domain files, re-export from barrel index.
**When to use:** When queries.ts exceeds 300 lines.

```typescript
// src/lib/queries/index.ts
export {
  getProvidersByCategory,
  getProviderBySlug,
  getFeaturedProviders,
  getRelatedProviders,
  getAllProviderSlugs,
  getCategoryCounts,
  getProvidersForComparison,
} from "./providers";

export {
  searchProviders,
  searchBlogPosts,
  searchCollections,
  getPublishedBlogPosts,
  getBlogPostBySlug,
  getAllBlogPostSlugs,
  getPublishedCollections,
  getCollectionBySlug,
  getAllCollectionSlugs,
} from "./content";

export {
  getAdminStats,
  getTopAffiliateProviders,
  getProviderReviewStats,
} from "./admin";
```

### Pattern 4: Enhanced Listing Query with Filter Object
**What:** Upgrade `getProvidersByCategory` to accept the full `ProviderFilters` type.
**When to use:** Category listing pages, filtered views.

```typescript
export const getFilteredProviders = cache(async (filters: ProviderFilters) => {
  const where: Prisma.ProviderWhereInput = {
    // Status filter (always applied)
    status: { in: filters.status },

    // Category (if provided -- may be omitted on cross-category pages)
    ...(filters.category && {
      OR: [
        { category: filters.category },
        { secondaryCategory: filters.category },
      ],
    }),

    // Dietary tags (enum, via join table)
    ...(filters.dietaryTags.length > 0 && {
      dietaryTags: { some: { tag: { in: filters.dietaryTags } } },
    }),

    // Null-aware string filters
    ...nullAwareFilter("prepStyle", filters.prepStyle),
    ...nullAwareFilter("householdFit", filters.householdFit),
    ...nullAwareFilter("modelType", filters.modelType),
    ...nullAwareFilter("geography", filters.geography),

    // Null-aware enum filter
    ...nullAwareEnumFilter("valueTier", filters.valueTier),
  };

  const orderByMap: Record<SortOption, Prisma.ProviderOrderByWithRelationInput> = {
    featured: { featured: "desc" },
    rating: { averageRating: "desc" },
    "name-asc": { name: "asc" },
    "value-tier": { valueTier: "asc" },
  };

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      include: {
        dietaryTags: true,
        plans: { where: { active: true, featured: true }, take: 1 },
      },
      orderBy: orderByMap[filters.sortBy],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.provider.count({ where }),
  ]);

  return { providers, total, page: filters.page, pageSize: filters.pageSize };
});
```

### Anti-Patterns to Avoid
- **Parsing filters inside page components:** Filters MUST be parsed in `filters.ts`, not inline in each page. The existing pattern of inline parsing in `[category]/page.tsx` should be replaced.
- **Strict enum matching on sparse string fields:** Using exact equality on fields like `prepStyle` would exclude providers with slightly different text values (e.g., "prepared (fresh heat-and-eat)" vs "prepared (heat-and-eat)"). Use `contains` with `insensitive` mode for string fields.
- **Filtering OUT null values:** Excluding providers with null modelType/prepStyle/etc. when a filter is active would hide 85-95% of providers. Always use null-aware filtering.
- **Importing filters.ts in client components:** The filter parser is server-only. Client components should use URL search params directly and let the server parse them.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL param validation | Custom parsing logic per page | `parseProviderFilters()` centralized parser | 9 dimensions with validation is error-prone; DRY across all listing pages |
| Enum value checking | Manual if/switch statements | Object lookups against const arrays | Type-safe, exhaustive, easy to extend |
| Query deduplication | Manual caching or memoization | `React.cache()` wrapper | Built into React 19, handles per-request dedup automatically |
| Where clause composition | Raw SQL or string concatenation | Prisma's type-safe where input with spread | Prisma provides full type safety and prevents SQL injection |

**Key insight:** The filter parser is the single point of truth for translating URL strings into database query conditions. Every listing page passes raw searchParams through this one function. This prevents filter drift between pages and makes it trivial to add new filter dimensions later.

## Common Pitfalls

### Pitfall 1: searchParams is a Promise in Next.js 16
**What goes wrong:** Treating searchParams as a synchronous object causes runtime errors.
**Why it happens:** Next.js 16 changed params and searchParams to Promises.
**How to avoid:** Always `await searchParams` in page components before passing to `parseProviderFilters()`.
**Warning signs:** TypeScript error about missing `.then()` or runtime "cannot read property of Promise".

### Pitfall 2: String Field Value Variance
**What goes wrong:** Filters match nothing because stored values don't exactly match expected filter values.
**Why it happens:** String fields like `prepStyle` have high cardinality with variants like "prepared (fresh)", "prepared (fresh heat-and-eat)", "prepared (fresh vacuum-sealed)".
**How to avoid:** Use `contains` with `insensitive` mode for string filters, and group related variants under broader filter categories. The filter parser should map URL slugs like `prepared` to a `contains` search for "prepared", matching all prepared variants.
**Warning signs:** Filter returns 0 results for a category that clearly has providers.

### Pitfall 3: React.cache() Only Deduplicates Within a Single Render
**What goes wrong:** Expecting cache() to persist across requests or between different users.
**Why it happens:** Misunderstanding scope -- React.cache() memoizes per React render tree (i.e., per request).
**How to avoid:** Use React.cache() for dedup (e.g., generateMetadata and page component both calling getProviderBySlug). Use ISR/revalidate for cross-request caching.
**Warning signs:** Database queries running on every request despite cache() wrapping.

### Pitfall 4: Prisma OR/AND Nesting with Null-Aware Filters
**What goes wrong:** Combining multiple null-aware filters with spread creates invalid Prisma where clauses because each null-aware filter produces its own `OR` key.
**Why it happens:** Multiple spread `OR` keys overwrite each other -- only the last one survives.
**How to avoid:** Use Prisma's `AND` array to compose multiple null-aware filter conditions:
```typescript
const where: Prisma.ProviderWhereInput = {
  AND: [
    { status: { in: filters.status } },
    ...(filters.prepStyle ? [{
      OR: [
        { prepStyle: { contains: filters.prepStyle, mode: "insensitive" } },
        { prepStyle: null },
      ],
    }] : []),
    ...(filters.householdFit ? [{
      OR: [
        { householdFit: { contains: filters.householdFit, mode: "insensitive" } },
        { householdFit: null },
      ],
    }] : []),
    // ... more null-aware filters
  ],
};
```
**Warning signs:** Only the last filter dimension has any effect; other filters silently ignored.

### Pitfall 5: Barrel Re-export Breaking `import "server-only"`
**What goes wrong:** Moving `server-only` import to individual query files but not the barrel, or vice versa.
**Why it happens:** Each file in the split needs its own `import "server-only"` to prevent accidental client-side import.
**How to avoid:** Add `import "server-only"` to every file in `src/lib/queries/` AND to `src/lib/filters.ts`.
**Warning signs:** Build succeeds but client components can accidentally import query functions.

### Pitfall 6: searchParams Multi-Value Params
**What goes wrong:** URL like `?diet=VEGAN&diet=KETO` arrives as `string[]` but code expects `string`.
**Why it happens:** URLSearchParams allows repeated keys; Next.js returns `string | string[] | undefined`.
**How to avoid:** The filter parser must handle both `string` and `string[]` for array-capable fields (dietaryTags). Use a helper: `const asArray = (v: string | string[] | undefined) => v === undefined ? [] : Array.isArray(v) ? v : [v]`.
**Warning signs:** Only first dietary tag applied; selecting multiple tags has no additional effect.

## Code Examples

Verified patterns from the existing codebase and Next.js 16 docs:

### Consuming Filters in a Server Component Page
```typescript
// src/app/[category]/page.tsx (future Phase 5 consumer)
// Source: Next.js 16 page.md docs
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await params;
  const rawParams = await searchParams;

  // Parse URL params into typed filter object
  const filters = parseProviderFilters({
    ...rawParams,
    category: category, // inject route param as a filter dimension
  });

  // Fetch filtered providers
  const { providers, total } = await getFilteredProviders(filters);
  // ...
}
```

### URL Search Param Encoding for Filters
```
# Single category, multiple diet tags, sorted by rating
/meal-kits?diet=VEGAN&diet=KETO&sort=rating

# With value tier and prep style
/meal-kits?valueTier=budget&prep=prepared&sort=name-asc

# Status filter (admin-facing, not typical consumer URL)
/meal-kits?status=ACTIVE&status=HYBRID
```

### Bidirectional Slug Mapping (follow categories.ts pattern)
```typescript
// Replicating the pattern from src/lib/categories.ts for other dimensions
export const PREP_STYLE_MAP: Record<string, { slug: string; label: string }> = {
  "cook-it-yourself": { slug: "cook-it-yourself", label: "Cook-It-Yourself" },
  "prepared": { slug: "prepared", label: "Prepared Meals" },
  "raw-protein": { slug: "raw-protein", label: "Raw Protein" },
  "snacks": { slug: "snacks", label: "Snacks" },
  "produce-box": { slug: "produce-box", label: "Produce Box" },
  // ...
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useFormState` | `useActionState` | React 19 | Renamed; relevant if filter UI uses form actions |
| `middleware.ts` | `proxy.ts` | Next.js 16 | Not directly relevant to this phase but affects admin filter pages |
| Sync `searchParams` | `searchParams` as Promise | Next.js 15-16 | Must `await` before passing to filter parser |
| `@tailwind` directives | `@import "tailwindcss"` | Tailwind 4 | No impact on this phase (no UI) |

**Deprecated/outdated:**
- `unstable_cache` is the older cross-request caching approach; `use cache` directive with Cache Components is the new model in Next.js 16 (project hasn't enabled `cacheComponents: true` yet, so `unstable_cache` remains available but React.cache() is preferred for query dedup)

## Data Sparsity Analysis

Critical context for filter implementation. From the actual dataset (95 providers):

| Filter Dimension | DB Type | Populated | Empty/Null | Impact |
|-----------------|---------|-----------|------------|--------|
| category | CategoryType enum | 95/95 (100%) | 0 | Safe for strict filtering |
| status | ProviderStatus enum | 95/95 (100%) | 0 | Safe for strict filtering |
| dietaryTags | DietaryTag enum (join) | 15/95 (16%) | 80 | Null-aware: most providers have no tags |
| modelType | String (nullable) | 95/95 (100%) | 0 | High cardinality (11 distinct values); use grouped matching |
| prepStyle | String (nullable) | 95/95 (100%) | 0 | Very high cardinality (37 distinct values); use grouped matching |
| valueTier | ValueTier enum (nullable) | 8/95 (8%) | 87 | Null-aware critical: selecting "budget" shows 2+87=89 providers |
| householdFit | String (nullable) | 4/95 (4%) | 91 | Null-aware critical: almost always passes through |
| geography | String (nullable) | 9/95 (9%) | 86 | Null-aware critical: regional values are free-text with variants |
| flexibility | String (nullable) | 25/95 (26%) | 70 | Not in original 9 filter dimensions from CONTEXT.md |

**Key implication:** For valueTier, householdFit, and geography, null-aware filtering is essential -- strict filtering would hide 85-95% of providers. For modelType and prepStyle, data is fully populated but values are free-text with high cardinality, requiring grouped/contains matching rather than exact equality.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed (no test framework in project) |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QUERY-01 | All query functions wrapped in React.cache() | manual-only | Visual code review (cache() is a wrapper, not testable without React render context) | N/A |
| QUERY-02 | Query functions for all 7 use cases exist and return correct types | unit | Needs vitest + prisma mock | Wave 0 |
| QUERY-03 | queries.ts split into domain files with barrel re-export | manual-only | Check file structure + imports compile: `npx tsc --noEmit` | N/A |
| FILTER-01 | parseProviderFilters validates all 9 dimensions with safe defaults | unit | Needs vitest | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (type checking)
- **Per wave merge:** `npx tsc --noEmit && npx next build` (full build)
- **Phase gate:** `next build` succeeds with no type errors

### Wave 0 Gaps
- [ ] No test framework installed -- would need vitest + @prisma/client mock for unit tests
- [ ] No test config file exists
- [ ] `parseProviderFilters` is pure function, ideal for unit testing but no runner available

**Pragmatic note:** Since no test framework is installed and this is a pure infrastructure phase, verification relies on TypeScript type checking (`tsc --noEmit`) and successful `next build`. The filter parser is a pure function that is highly testable once a framework is added, but adding a test framework is out of scope for this phase (not in requirements).

## Open Questions

1. **How should prepStyle grouping work?**
   - What we know: 37 distinct prepStyle values in the database with variants like "prepared (fresh)", "prepared (frozen)", "prepared (heat-and-eat)"
   - What's unclear: Whether the filter UI will expose all 37 values or group them (e.g., all "prepared*" under one "Prepared Meals" option)
   - Recommendation: The filter parser should define broad categories that map to `contains` searches. E.g., slug `prepared` matches any prepStyle containing "prepared". This is a parser concern, not a UI concern -- the parser can be precise while the UI groups values.

2. **Should `getProvidersByCategory` be renamed to `getFilteredProviders`?**
   - What we know: The current function is category-focused but the new filter object makes category optional
   - What's unclear: Whether downstream consumers expect the old function signature
   - Recommendation: Add a new `getFilteredProviders` function and deprecate or update `getProvidersByCategory` to call it internally. No existing pages consume it yet (category pages don't exist yet).

3. **Should the filter parser export URL-building utilities?**
   - What we know: Phase 5 (Filter UI) will need to construct URLs from filter state
   - What's unclear: Whether URL building belongs in filters.ts or in a separate client-safe module
   - Recommendation: Export a `buildFilterUrl` helper from filters.ts that takes a `ProviderFilters` object and returns a query string. However, since filters.ts imports `server-only`, a separate `filter-utils.ts` (without server-only) may be needed for client components. Defer this to Phase 5 -- for now, focus on server-side parsing only.

## Sources

### Primary (HIGH confidence)
- `src/lib/queries.ts` -- existing 336-line query layer with 18 React.cache() functions (direct file read)
- `src/lib/categories.ts` -- bidirectional slug/enum mapping pattern (direct file read)
- `prisma/schema.prisma` -- full schema including ProviderStatus, ValueTier enums and string fields (direct file read)
- `src/generated/prisma/enums.ts` -- generated enum objects with exact values (direct file read)
- `prisma/seed.ts` -- seed logic showing how string fields are populated from JSON dataset (direct file read)
- `temp/plandocs/food-box-companies.json` -- raw dataset with actual values for all filter dimensions (direct file analysis)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` -- Next.js 16 searchParams as Promise (official docs)

### Secondary (MEDIUM confidence)
- React.cache() behavior -- documented in React 19 docs and verified by existing usage in queries.ts
- Prisma AND/OR composition -- verified by existing where clause patterns in queries.ts

### Tertiary (LOW confidence)
- None -- all findings verified from primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all existing dependencies
- Architecture: HIGH -- extends existing patterns with clear data model understanding
- Pitfalls: HIGH -- derived from actual codebase analysis and data sparsity measurements

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable -- no external dependencies or fast-moving APIs)
