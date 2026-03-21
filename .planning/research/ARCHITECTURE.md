# Architecture Patterns

**Domain:** Food subscription discovery/comparison platform
**Researched:** 2026-03-21
**Confidence:** HIGH (based on direct codebase analysis + established Next.js App Router patterns)

## Current Architecture State

The codebase already has a well-established layered architecture built across v1.0. This research documents the existing patterns, identifies what needs to change for the next milestone (schema extension, expanded filtering, provider logo rendering, SEO pages for 95 providers), and recommends architectural decisions for the new work.

### What Exists Today

| Layer | Location | Status |
|-------|----------|--------|
| Presentation (Pages) | `src/app/` | 15+ route segments built (home, category, provider detail, compare, search, blog, collections, admin, methodology) |
| Components | `src/components/` | 28 components (18 consumer, 6 admin, 4 UI primitives) |
| Query Layer | `src/lib/queries.ts` | 20 cached query functions, 336 lines, `React.cache()` throughout |
| Database | `src/lib/db.ts` + `prisma/schema.prisma` | 10 models, 6 enums, Neon PostgreSQL adapter |
| Server Actions | `src/app/actions/` | 2 files (reviews.ts, admin.ts) with 13 mutations |
| Auth | `src/proxy.ts` | Cookie-based admin protection via Next.js 16 proxy |
| Utilities | `src/lib/` | 4 files (db, queries, categories, format) |

## Recommended Architecture (Evolving What Exists)

The architecture does not need a rewrite. It needs targeted extensions in three areas: (1) schema fields for the new dataset, (2) expanded filter infrastructure, and (3) provider image rendering from local assets.

### Component Boundaries

| Component / Module | Responsibility | Communicates With | Server/Client |
|--------------------|---------------|-------------------|---------------|
| `prisma/schema.prisma` | Data model with new enum fields for model_type, prep_style, value_tier, household_fit, geography, flexibility | Generated types consumed by Query Layer | N/A (schema) |
| `prisma/seed.ts` | One-time import of 95 providers from `food-box-companies.json` | Prisma Client directly | Server (CLI) |
| `src/lib/queries.ts` | Extended `getProvidersByCategory` with new filter dimensions; new query for all-provider listing | Database Layer | Server only |
| `src/lib/filters.ts` (NEW) | Parse and validate URL search params into typed filter objects with safe defaults | Used by category page and any filtered listing | Server only |
| `src/lib/enums.ts` (NEW) | Bidirectional slug-to-enum maps for new enums (ModelType, PrepStyle, ValueTier, HouseholdFit, Geography, Flexibility) analogous to `categories.ts` | Used by filters, components, URLs | Shared |
| `src/components/CategoryFilters.tsx` | Extended with new filter sections (prep style, value tier, household fit, model type, flexibility, geography) | URL params via `useRouter` | Client |
| `src/components/ProviderCard.tsx` | Already complete; needs `logoUrl` path resolution from manifest | Props from Server Components | Server |
| `src/components/ComparisonTable.tsx` | Already complete; may gain new rows for extended fields | Props from Server Components | Server |
| `src/components/CompareProvider.tsx` | Comparison tray state (sessionStorage); already complete | `useCompare` context consumed by `AddToCompareButton`, `CompareBar` | Client |
| `src/components/ProviderLogo.tsx` (NEW) | Encapsulate logo rendering with fallback behavior, consistent sizing, Next.js Image optimization | Props; used by ProviderCard, ComparisonTable, provider detail | Server |
| `src/app/[category]/page.tsx` | Category listing with extended filtering | Query Layer, filter parser, CategoryFilters | Server |
| `src/app/providers/[slug]/page.tsx` | Provider detail (already complete) | Query Layer | Server |
| `src/app/compare/page.tsx` | Flexible comparison (already complete) | Query Layer | Server |
| `src/app/compare/[versus]/page.tsx` | SEO comparison (already complete) | Query Layer | Server |
| `next.config.ts` | `images.remotePatterns` or local image path configuration | Next.js Image component | Config |

### Data Flow

#### Extended Filtering Flow (Primary New Architecture)

```
1. User visits /{category-slug}?prep=cook-it-yourself&tier=budget&fit=family&diet=VEGAN
2. [category]/page.tsx (Server Component):
   a. await params -> resolve category slug to CategoryType enum
   b. await searchParams -> pass raw params to parseFilters()
3. parseFilters() (src/lib/filters.ts):
   a. Validates each param against known enum values
   b. Converts URL slugs to Prisma enum values using enum maps
   c. Returns typed ProviderFilters object with safe defaults
   d. Invalid values silently fall back to "all" (no error)
4. getProvidersByCategory(filters) (src/lib/queries.ts):
   a. Builds Prisma where clause dynamically from filter object
   b. New enum fields filter directly (no joins needed)
   c. Dietary tags filter via relation (existing pattern)
   d. Returns paginated results with total count
5. Page renders:
   a. Server: ProviderCard grid, Pagination, JSON-LD
   b. Client: CategoryFilters reads URL via useSearchParams(),
      updates URL via useRouter().push() on interaction
6. URL change -> Next.js re-renders Server Component with new params
```

#### Provider Logo Resolution Flow (New)

```
1. Provider record has logoUrl field (currently nullable)
2. Seed script sets logoUrl from manifest.json paths:
   e.g., "/assets/providers/hellofresh.webp"
3. ProviderLogo component:
   a. If logoUrl exists: render Next.js Image with local src
   b. If logoUrl is null: render fallback (first letter of name
      or generic food icon SVG)
   c. Consistent sizing via props (sm/md/lg variants)
4. No remotePatterns needed — all logos are in public/assets/providers/
```

#### Schema Extension Flow

```
1. Add new enum types to schema.prisma:
   - ModelType (SUBSCRIPTION_FIRST, A_LA_CARTE, HYBRID, MARKETPLACE)
   - PrepStyle (COOK_IT_YOURSELF, HEAT_AND_EAT, READY_TO_EAT, RAW_INGREDIENTS)
   - ValueTier (BUDGET, MID, PREMIUM, LUXURY)
   - HouseholdFit (SOLO, COUPLE, FAMILY, FLEXIBLE)
   - Geography (NATIONWIDE, REGIONAL, LOCAL)
   - FlexibilityLevel (HIGH, MEDIUM, LOW)

2. Add fields to Provider model:
   - modelType ModelType?
   - prepStyle PrepStyle?
   - valueTier ValueTier?
   - householdFit HouseholdFit?
   - geography Geography?
   - flexibilityLevel FlexibilityLevel?
   - shippingNotes String? @db.Text
   - pricingSignal String?
   - secondaryTags String? @db.Text  // pipe-delimited, searchable
   - providerStatus String? @default("active")

3. npx prisma db push -> sync to Neon (no migrations for now)
4. npx prisma generate -> regenerate client types
5. Seed script maps JSON field values to enum values
```

## Patterns to Follow

### Pattern 1: URL-Driven Filter State (Established)

**What:** All filter/sort state lives in URL search params. Server Components read params, Client Components update params. No client-side data fetching.

**When:** Any listing or filterable page.

**Why this works here:** The codebase already implements this pattern in `[category]/page.tsx` + `CategoryFilters.tsx`. The pattern scales cleanly to new filter dimensions because each new filter is just another URL param parsed server-side.

**Example of the extension:**
```typescript
// src/lib/filters.ts
import type { CategoryType, DietaryTag, ModelType, PrepStyle, ValueTier, HouseholdFit } from "@/generated/prisma/client";

interface ProviderFilters {
  category: CategoryType;
  dietaryTags: DietaryTag[];
  modelType?: ModelType;
  prepStyle?: PrepStyle;
  valueTier?: ValueTier;
  householdFit?: HouseholdFit;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy: "rating" | "price-asc" | "price-desc" | "reviews" | "newest";
  page: number;
}

export function parseFilters(
  category: CategoryType,
  raw: Record<string, string | string[] | undefined>,
): ProviderFilters {
  // Each param parsed independently, invalid -> undefined (show all)
}
```

### Pattern 2: Enum Fields Over Relation Tables for Fixed Taxonomies

**What:** Use Prisma enum fields directly on the Provider model for fixed, small-cardinality taxonomies (prep style, value tier, household fit, model type, geography, flexibility). Use relation tables only for many-to-many relationships (dietary tags).

**When:** The taxonomy is fixed (defined by the product, not user-generated), has fewer than ~20 values, and each provider has exactly one value per dimension.

**Why:** Enum fields filter with simple WHERE clauses (no JOINs), index efficiently, and are type-safe at the Prisma level. The dietary tag relation is correct because a provider can have multiple dietary tags (many-to-many).

**Example:**
```prisma
model Provider {
  // Direct enum fields (one value per provider)
  modelType    ModelType?
  prepStyle    PrepStyle?
  valueTier    ValueTier?

  // Relation table (many values per provider)
  dietaryTags  ProviderDietaryTag[]
}
```

### Pattern 3: Centralized Filter Parsing with Validation

**What:** Extract filter parsing from the page component into a dedicated `src/lib/filters.ts` module. Currently the category page has inline `parseSearchParams()` and `countActiveFilters()` functions. As filter dimensions grow from 4 to 9+, this parsing logic should be shared and tested.

**When:** More than one page needs to parse the same filter params, or the parsing logic exceeds ~30 lines.

**Why:** The current inline approach in `[category]/page.tsx` (lines 44-93) works for 4 filters but will become unwieldy with 9+. Centralization enables reuse if an "all providers" listing page is added, and makes the parsing logic independently testable.

### Pattern 4: Enum-to-Slug Bidirectional Mapping

**What:** Each filterable enum needs a mapping between Prisma enum values (COOK_IT_YOURSELF) and URL-friendly slugs (cook-it-yourself), plus human-readable labels.

**When:** Any enum value appears in URLs or in UI labels.

**Why:** The `categories.ts` pattern (CATEGORY_MAP with getCategoryBySlug/getSlugByCategory) is proven and should be replicated for new enums. This keeps URL slugs stable (SEO-safe) even if enum values change.

**Example:**
```typescript
// src/lib/enums.ts
export const PREP_STYLE_MAP: Record<PrepStyle, { slug: string; label: string }> = {
  COOK_IT_YOURSELF: { slug: "cook-it-yourself", label: "Cook It Yourself" },
  HEAT_AND_EAT: { slug: "heat-and-eat", label: "Heat & Eat" },
  READY_TO_EAT: { slug: "ready-to-eat", label: "Ready to Eat" },
  RAW_INGREDIENTS: { slug: "raw-ingredients", label: "Raw Ingredients" },
};
```

### Pattern 5: Local Image Serving with Next.js Image

**What:** Provider logos live in `public/assets/providers/` as static files. The `logoUrl` field on Provider stores relative paths like `/assets/providers/hellofresh.webp`. Next.js Image component renders them with automatic optimization.

**When:** All provider logo/graphic rendering across the app.

**Why:** Local assets eliminate external image hosting costs, CORS issues, and `remotePatterns` configuration. The manifest.json in the assets directory confirms all 95 providers have valid paths (93 real images + 2 SVG placeholders). Next.js Image optimizes these at build/request time.

**Key detail:** Since images are in `public/`, they are served statically. The Next.js Image component can optimize local images without `remotePatterns` configuration. The `logoUrl` stored in the database should be the path relative to the public directory (e.g., `/assets/providers/hellofresh.webp`).

### Pattern 6: Reusable ProviderLogo Component

**What:** Encapsulate logo rendering logic (image vs fallback, sizing variants, alt text) in a single component used everywhere a provider logo appears.

**When:** Provider logos appear in: ProviderCard, ComparisonTable headers, provider detail hero, compare page headers, collection items.

**Example:**
```typescript
// src/components/ProviderLogo.tsx (Server Component)
import Image from "next/image";

const SIZES = {
  sm: { width: 48, height: 48, className: "w-12 h-12" },
  md: { width: 80, height: 80, className: "w-20 h-20" },
  lg: { width: 192, height: 192, className: "w-48 h-48" },
} as const;

export default function ProviderLogo({
  name,
  logoUrl,
  size = "md",
  priority = false,
}: Readonly<{
  name: string;
  logoUrl: string | null;
  size?: keyof typeof SIZES;
  priority?: boolean;
}>) {
  const dim = SIZES[size];

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={dim.width}
        height={dim.height}
        className="object-contain"
        priority={priority}
      />
    );
  }

  return (
    <span className="text-2xl font-bold text-gray-300" aria-hidden="true">
      {name.charAt(0)}
    </span>
  );
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side Data Fetching for Filterable Listings

**What:** Using `useEffect` + `fetch()` to load filtered results on the client.

**Why bad:** Breaks SSR/SEO (search engines see empty content), doubles data fetching code (API route + client fetch), loses React.cache() deduplication, creates loading state complexity. The current URL-param-driven Server Component pattern is correct and should not be abandoned.

**Instead:** Keep the Server Component pattern where URL param changes trigger full server re-renders. Use `useTransition` in the filter component (already done) to show a pending indicator during navigation.

### Anti-Pattern 2: Creating New Prisma Relations for Fixed Taxonomies

**What:** Creating `ProviderPrepStyle`, `ProviderValueTier`, etc. join tables (like `ProviderDietaryTag`) for single-value fields.

**Why bad:** Over-engineering. Join tables are correct for many-to-many (dietary tags) but wasteful for one-to-one relationships. Each query requires an additional JOIN, indexes are more complex, and the seed script has to create join records instead of setting a field.

**Instead:** Use enum fields directly on the Provider model. A provider has exactly one prep style, one value tier, one model type, etc.

### Anti-Pattern 3: Storing Filter State in React Context or Global Store

**What:** Using Zustand, Redux, or React Context to manage filter selections.

**Why bad:** Filter state is already in the URL. Duplicating it in a store creates synchronization bugs, breaks the back button, and makes URLs non-shareable. The comparison tray correctly uses sessionStorage (via CompareProvider) because comparison selection is transient and per-session, not part of the URL contract.

**Instead:** URL params are the single source of truth for filters. sessionStorage is the single source of truth for comparison selection. These are the only two client-side state stores needed.

### Anti-Pattern 4: Hardcoding Filter Options in Components

**What:** Duplicating enum values and labels in both the schema and the filter component (currently done with `DIETARY_TAG_OPTIONS` in `CategoryFilters.tsx`).

**Why bad:** Adding a new enum value requires updating both the schema and the component. With 6+ filter dimensions, this becomes a maintenance burden and source of drift.

**Instead:** Centralize all enum-to-label mappings in `src/lib/enums.ts`. Components import from there. Single source of truth.

### Anti-Pattern 5: Overly Granular Prisma Indexes on Nullable Enum Fields

**What:** Creating composite indexes on every combination of the new filter fields.

**Why bad:** With 6 new filter dimensions, the number of possible composite indexes explodes. PostgreSQL's query planner handles individual column indexes well with bitmap index scans, combining multiple single-column indexes efficiently.

**Instead:** Add single-column indexes on each new filterable enum field. Let PostgreSQL combine them. Only add composite indexes if query analysis (EXPLAIN ANALYZE) reveals specific slow patterns after launch.

## Scalability Considerations

| Concern | Current (95 providers) | At 500 providers | At 2000+ providers |
|---------|----------------------|-------------------|---------------------|
| Query performance | Fast; under 100ms with indexes | Still fast; single-table queries with enum filters | Consider full-text search index for text search; enum filters remain fast |
| Category page rendering | Instant; 12 per page | Same; pagination handles it | Same |
| Comparison state | sessionStorage; max 4 items | No change | No change |
| Filter combinatorics | 9 dimensions manageable | Same | Consider pre-computed "suggested filters" based on available inventory |
| Image optimization | 95 local images; Next.js Image handles it | Image CDN or external hosting | Move to cloud storage (S3/R2) with remotePatterns |
| Seed/import | One-time script, ~95 records | Still fine as batch insert | Streaming import, chunked |
| Admin management | CRUD per provider works | Needs bulk edit, CSV import | Needs search within admin, pagination |

## Component Dependency Graph

```
Root Layout (layout.tsx)
  |-- CompareProvider (Client, sessionStorage context)
  |-- Header (Server, nav links)
  |     |-- HeaderSearchForm (Client, search input)
  |-- main (children)
  |     |
  |     |-- Homepage (page.tsx, Server)
  |     |     |-- ProviderCard (Server)
  |     |     |     |-- ProviderLogo (Server, NEW)
  |     |     |-- Badge, RatingStars (Server)
  |     |
  |     |-- Category Listing ([category]/page.tsx, Server)
  |     |     |-- CategoryFilters (Client, URL-driven)
  |     |     |-- ProviderCard (Server)
  |     |     |     |-- ProviderLogo (Server, NEW)
  |     |     |     |-- AddToCompareButton (Client)
  |     |     |-- Pagination (Server)
  |     |
  |     |-- Provider Detail (providers/[slug]/page.tsx, Server)
  |     |     |-- ProviderLogo (Server, NEW, size="lg")
  |     |     |-- PricingTable, RatingBreakdown, ReviewCard (Server)
  |     |     |-- FaqAccordion (Client, toggle)
  |     |     |-- ReviewForm (Client, form)
  |     |     |-- AffiliateLink (Server)
  |     |     |-- ProviderCard (related providers)
  |     |
  |     |-- Compare Flexible (compare/page.tsx, Server)
  |     |     |-- ComparisonTable (Server)
  |     |     |     |-- ProviderLogo (Server, NEW)
  |     |
  |     |-- Compare SEO (compare/[versus]/page.tsx, Server)
  |     |     |-- ComparisonTable (Server)
  |     |     |-- QuickSummaryCard (Server)
  |     |
  |     |-- Search (search/page.tsx, Server)
  |     |     |-- SearchInput (Client)
  |     |     |-- ProviderCard, Card, Badge (Server)
  |     |
  |     |-- Admin (admin/*, Server)
  |           |-- ProviderForm (Client, form)
  |           |-- PlanForm, PlanManager (Client, forms)
  |
  |-- Footer (Server)
  |-- CompareBar (Client, floating)
```

## Suggested Build Order (Dependencies Between Components)

The following order minimizes rework and ensures each piece has what it needs before being built:

### Phase 1: Schema & Data Foundation (No UI Dependencies)

**Must happen first** because everything else depends on the data model and seeded data.

1. **Extend Prisma schema** with new enum types and Provider fields
2. **`npx prisma db push`** to sync schema to Neon
3. **`npx prisma generate`** to get new TypeScript types
4. **Write seed script** (`prisma/seed.ts`) to import 95 providers from `food-box-companies.json`
5. **Run seed** to populate the database

Dependencies: None (schema-only work).
Produces: Populated database with all 95 providers and their new fields.

### Phase 2: Utility Layer (No UI Dependencies)

**Must happen before UI** because filter parsing and enum mapping are consumed by both pages and components.

1. **`src/lib/enums.ts`** -- Bidirectional maps for all new enums (ModelType, PrepStyle, ValueTier, HouseholdFit, Geography, FlexibilityLevel)
2. **`src/lib/filters.ts`** -- Centralized search param parsing with validation
3. **Extend `src/lib/queries.ts`** -- Add new filter params to `getProvidersByCategory()`, add `getProviderCountsByField()` for filter facet counts (optional)

Dependencies: Schema must be pushed and generated (Phase 1).
Produces: Type-safe filter infrastructure ready for pages and components.

### Phase 3: Image Infrastructure

1. **`src/components/ProviderLogo.tsx`** -- Reusable logo component with fallback
2. **Update seed script** to set `logoUrl` from manifest.json paths
3. **Configure `next.config.ts`** -- Verify local image optimization works (no remotePatterns needed for public/ images)

Dependencies: Seed script (Phase 1) must set logoUrl values.
Produces: Consistent logo rendering across the app.

### Phase 4: Extended Filtering UI

1. **Update `CategoryFilters.tsx`** -- Add new filter sections for each extended dimension
2. **Update `[category]/page.tsx`** -- Use new `parseFilters()` from filters.ts, pass filter count to CategoryFilters

Dependencies: Utility layer (Phase 2), populated data (Phase 1).
Produces: Full multi-criteria filtering on category pages.

### Phase 5: Component Updates

1. **Update `ProviderCard.tsx`** -- Use `ProviderLogo` component, optionally show new badges (value tier, prep style)
2. **Update provider detail page** -- Use `ProviderLogo`, display new fields (model type, prep style, geography, flexibility)
3. **Update `ComparisonTable.tsx`** -- Add rows for new comparison dimensions
4. **Update SEO comparison page** -- Include new fields in verdict generation and JSON-LD

Dependencies: ProviderLogo (Phase 3), data (Phase 1).
Produces: Complete consumer-facing experience.

### Phase 6: Admin & SEO Polish

1. **Update `ProviderForm.tsx`** -- Add form fields for new enum values
2. **Update admin Server Actions** -- Handle new fields in create/update
3. **Verify `generateStaticParams`** -- Ensure all 95 providers generate static pages
4. **Update sitemap.ts** -- Include any new routes
5. **JSON-LD updates** -- Include new structured data fields where appropriate

Dependencies: All prior phases.
Produces: Complete admin management of extended provider data.

## Key Architectural Decisions for Next Milestone

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Enum fields vs string fields for new taxonomies | Enum fields | Type safety, Prisma validation, IDE autocomplete, consistent with existing CategoryType pattern |
| Nullable vs required for new fields | Nullable (`?`) | Many providers in the dataset have sparse data; nullable allows gradual enrichment without blocking seed |
| Separate filter parser module vs inline | Separate (`src/lib/filters.ts`) | Reusable across pages, testable, prevents page component from growing past 150 lines |
| New ProviderLogo component vs inline rendering | New component | Logo rendering appears in 5+ places with identical fallback logic; DRY |
| Single-column indexes vs composite for new fields | Single-column | PostgreSQL bitmap scans combine them efficiently; composite only after EXPLAIN ANALYZE evidence |
| Schema migration files vs db push | db push | Project decision (established in CLAUDE.md); no migration files for now |
| All providers in seed vs active-only | All 95, flag inactive | Dataset includes status field; seed all, let `active` filter handle display |

## Sources

- Direct codebase analysis of all 28 components, 15+ route segments, schema, queries, and utilities
- Next.js 16 official documentation in `node_modules/next/dist/docs/` (ISR, streaming, image optimization)
- Provider dataset at `temp/plandocs/food-box-companies.json` (95 entries, field structure)
- Provider asset manifest at `public/assets/providers/manifest.json` (95 validated image paths)
- Existing ARCHITECTURE.md at `.planning/codebase/ARCHITECTURE.md` (v1.0 architecture baseline)
- Prisma documentation (enum types, filtering, indexes) -- training data, MEDIUM confidence

---

*Architecture research: 2026-03-21*
