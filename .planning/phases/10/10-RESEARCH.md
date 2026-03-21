# Phase 10: Database & Foundation - Research

**Researched:** 2026-03-20
**Domain:** Prisma 7.5 + Neon PostgreSQL schema deployment, seed data, query utilities
**Confidence:** HIGH

## Summary

Phase 10 establishes the data foundation that all 11 downstream phases depend on. The Prisma schema already exists with 10 models and 5 enums, the PrismaClient singleton is configured at `src/lib/db.ts` with the `@prisma/adapter-pg` driver adapter for Neon PostgreSQL, and the client is generated to `src/generated/prisma/`. This phase needs to: (1) enhance the schema with denormalized price fields, (2) push the schema to Neon, (3) create a comprehensive seed script with 18 real food box providers, and (4) build a query utility layer serving every downstream phase.

Three Prisma 7 breaking changes directly affect this phase's implementation. First, **seeding is configured in `prisma.config.ts`** (not `package.json`) under `migrations.seed`. The existing `prisma.config.ts` needs this field added. Second, **driver adapters are mandatory** -- the seed script must create its own PrismaClient with `PrismaPg` since it runs outside Next.js via `tsx`. Third, **enums are generated as `const` objects with type aliases** (not TypeScript `enum` declarations), which affects import patterns in the query layer and seed data.

The existing schema uses `Float` for all pricing fields. The prior domain research (PITFALLS.md Pitfall #4) strongly recommends changing to integer cents before any data is seeded, since IEEE 754 precision errors break price sorting and filtering -- the core value proposition. However, the existing PLAN.md uses `Float`. This research documents both approaches so the planner can make an informed decision.

**Primary recommendation:** Add denormalized price fields to Provider, configure seeding in `prisma.config.ts`, create the seed script with a standalone PrismaClient instance using relative imports, and wrap all query functions with `React.cache()` for render-pass deduplication.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DB-01 | Database schema deployed to Neon with all models (Provider, Plan, Review, BlogPost, Collection, etc.) | Schema exists. Add `minPricePerServing Float?` and `maxPricePerServing Float?` to Provider with indexes. Use `npx prisma db push` to deploy. Optional: CHECK constraints via `$executeRawUnsafe`. |
| DB-02 | Seed script populates 18 real food box providers across 5 categories with realistic plans, pricing, dietary tags, FAQs, and reviews | Seed command in `prisma.config.ts` (Prisma 7 change). Script needs standalone PrismaClient with PrismaPg adapter. One file per provider. deleteAll + sequential create strategy. |
| DB-03 | Query utility functions support all downstream page data needs (listings, detail, comparison, search, admin) | Single `src/lib/queries.ts` with ~15-20 `React.cache()`-wrapped async functions. Covers homepage, category listing, provider detail, comparison, collections, blog, search, reviews, admin, and SEO. |
| DB-04 | Denormalized price fields (minPricePerServing, maxPricePerServing) on Provider for filter performance | Add Float? fields with `@@index`. Pre-compute from Plan data during seeding. Used by category listing price range filters (Phase 40). |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| prisma | 7.5.0 | Schema management, db push, seeding CLI | Already installed. Drives schema-to-DB sync. |
| @prisma/client | 7.5.0 | Type-safe database client | Already installed. Generated to `src/generated/prisma/`. |
| @prisma/adapter-pg | 7.5.0 | PostgreSQL driver adapter for Neon | Already installed. Required by Prisma 7 for all PrismaClient instances. |
| react | 19.2.4 | `React.cache()` for query deduplication | Already installed. Deduplicates Prisma calls within a render pass. |
| dotenv | 17.3.1 | Environment variable loading | Already installed. Used by `prisma.config.ts` for DATABASE_URL. |

### Phase 10 Additions
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | 4.21.0 | TypeScript execution for seed script | `npx tsx prisma/seed.ts` -- add to devDependencies |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| tsx | ts-node | tsx is faster (esbuild-based), zero config, handles ESM natively. ts-node requires tsconfig adjustments for ESM. |
| deleteAll + create | Prisma upsert | deleteAll gives clean state, simpler logic. Upsert is better for production but adds complexity. Project decision: deleteAll + create (see PROJECT.md Key Decisions). |
| React.cache() | unstable_cache | React.cache() deduplicates within a render pass (request-scoped). unstable_cache adds cross-request caching with tags/revalidation. Phase 10 starts with React.cache() only; cross-request caching added in later phases. |
| Float for prices | Integer cents (Int) | Integer cents avoids IEEE 754 errors ($7.99 + $0.01 != $8.00). However, the existing schema uses Float and the PLAN.md uses Float. Integer cents is the industry standard (Stripe, Shopify) but requires renaming all price fields. |

**Installation:**
```bash
npm install --save-dev tsx
```

**Version verification:** Confirmed 2026-03-20:
- prisma: 7.5.0 (installed, verified via `npx prisma --version`)
- @prisma/client: 7.5.0 (installed)
- tsx: 4.21.0 (latest on npm, to be installed)

## Architecture Patterns

### Recommended Project Structure
```
prisma/
  schema.prisma              # Existing schema + denormalized price fields
  seed.ts                    # Main seed runner (standalone PrismaClient)
  seed-data/
    index.ts                 # Barrel export
    types.ts                 # Typed seed data interfaces
    providers/
      index.ts               # Barrel export all 18 providers
      hellofresh.ts          # One file per provider (MEAL_KIT)
      blue-apron.ts
      home-chef.ts
      everyplate.ts
      factor.ts              # PREPARED_MEAL
      cookunity.ts
      mosaic-foods.ts
      snap-kitchen.ts
      butcherbox.ts          # PROTEIN_BOX
      crowd-cow.ts
      good-chop.ts
      misfits-market.ts      # PRODUCE_BOX
      hungryroot.ts
      farmbox-direct.ts
      purple-carrot.ts       # SPECIALTY
      green-chef.ts
      sunbasket.ts
      trifecta.ts
    collections.ts           # 5-8 "Best Of" collections
    blog-posts.ts            # 3-5 blog posts
src/
  lib/
    db.ts                    # Existing Prisma singleton (no changes)
    queries.ts               # All query functions with React.cache()
    categories.ts            # Slug <-> CategoryType enum mapping
```

### Pattern 1: Seed Configuration in prisma.config.ts (Prisma 7 Breaking Change)
**What:** In Prisma 7, the seed command is configured in `prisma.config.ts` under `migrations.seed`, NOT in `package.json`'s `"prisma"` key. The old package.json approach is silently ignored.
**When to use:** Always for Prisma 7 projects.
**Example:**
```typescript
// prisma.config.ts (existing file, add migrations.seed)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",   // ADD THIS LINE
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```
**Source:** Prisma 7 seeding docs -- verified via WebFetch (prisma.io/docs/orm/prisma-migrate/workflows/seeding). Key quote: "In Prisma ORM v7, seeding is only triggered explicitly by running `npx prisma db seed`. Automatic seeding during `prisma migrate dev` or `prisma migrate reset` has been removed."

### Pattern 2: Seed Script with Standalone PrismaClient
**What:** The seed script MUST create its own PrismaClient instance with `PrismaPg` because it runs outside the Next.js bundler (via `tsx`). It cannot use `@/` path aliases or import from `src/lib/db.ts`.
**When to use:** Always for `prisma/seed.ts`.
**Example:**
```typescript
// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // Delete in reverse dependency order
  await prisma.affiliateClick.deleteMany();
  await prisma.collectionItem.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.providerFaq.deleteMany();
  await prisma.review.deleteMany();
  await prisma.providerDietaryTag.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.provider.deleteMany();

  // Create providers with nested relations
  for (const providerData of allProviders) {
    const provider = await prisma.provider.create({
      data: toCreateInput(providerData),
    });
    console.log(`  Created: ${provider.name} (${provider.category})`);
  }

  // Verify counts
  const counts = {
    providers: await prisma.provider.count(),
    plans: await prisma.plan.count(),
    reviews: await prisma.review.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```
**Source:** Prisma 7 seeding docs. Key requirement: "PrismaClient must be initialized with a driver adapter" (PrismaPg for PostgreSQL).

### Pattern 3: Prisma 7 Enum Usage (const Objects, Not TypeScript Enums)
**What:** Prisma 7 generates enums as `const` objects with matching type aliases, exported from `@/generated/prisma/client`. These are NOT TypeScript `enum` declarations.
**When to use:** Any code referencing CategoryType, DietaryTag, ReviewStatus, etc.
**Example:**
```typescript
// What Prisma 7 generates in src/generated/prisma/enums.ts:
export const CategoryType = {
  MEAL_KIT: 'MEAL_KIT',
  PREPARED_MEAL: 'PREPARED_MEAL',
  PROTEIN_BOX: 'PROTEIN_BOX',
  PRODUCE_BOX: 'PRODUCE_BOX',
  SPECIALTY: 'SPECIALTY'
} as const;

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

// How to import and use:
import { CategoryType, DietaryTag } from "@/generated/prisma/client";

// As value:
const category = CategoryType.MEAL_KIT; // "MEAL_KIT"

// As type:
function getProviders(category: CategoryType) { ... }

// In seed script (relative import, NOT @/ alias):
import { CategoryType } from "../../src/generated/prisma/client";
// Note: seed script uses relative path since tsx doesn't resolve @/ aliases
```
**Source:** Verified by reading generated `src/generated/prisma/enums.ts` after running `npx prisma generate` locally.

### Pattern 4: Query Layer with React.cache() Deduplication
**What:** Wrap all Prisma queries in `React.cache()` to deduplicate within a single render pass. Both `generateMetadata()` and the page component may call the same query -- the database is hit only once.
**When to use:** All query functions in `src/lib/queries.ts`.
**Example:**
```typescript
// src/lib/queries.ts
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { CategoryType, DietaryTag } from "@/generated/prisma/client";

export const getProviderBySlug = cache(async (slug: string) => {
  return prisma.provider.findUnique({
    where: { slug, active: true },
    include: {
      plans: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      dietaryTags: true,
      faqs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
});
```
**Source:** Next.js 16 docs `caching-without-cache-components.md` -- section "Deduplicating requests" -- verified locally in `node_modules/next/dist/docs/`. Key quote: "if you are using an ORM or database directly, you can wrap your data access with the React `cache` function to deduplicate requests within a single render pass."

### Pattern 5: Nested Creates for Seed Data
**What:** Use Prisma's nested create to seed Provider with all relations in a single operation. Pre-compute denormalized fields from the nested data before creating.
**When to use:** Seed script for each provider.
**Example:**
```typescript
// Transform seed data shape to Prisma create input
function toCreateInput(data: ProviderSeedData) {
  const { plans, dietaryTags, faqs, reviews, ...fields } = data;
  return {
    ...fields,
    // Pre-compute denormalized fields
    averageRating: reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0,
    reviewCount: reviews.length,
    minPricePerServing: plans
      .filter((p) => p.pricePerServing != null)
      .reduce((min, p) => Math.min(min, p.pricePerServing!), Infinity) || null,
    maxPricePerServing: plans
      .filter((p) => p.pricePerServing != null)
      .reduce((max, p) => Math.max(max, p.pricePerServing!), 0) || null,
    // Nested creates
    plans: { create: plans },
    dietaryTags: { create: dietaryTags.map((tag) => ({ tag })) },
    faqs: { create: faqs },
    reviews: { create: reviews },
  };
}
```

### Pattern 6: Category Slug Mapping Utility
**What:** Bidirectional mapping between URL slugs and Prisma CategoryType constants.
**When to use:** Every category page load, navigation link, query involving categories.
**Example:**
```typescript
// src/lib/categories.ts
import { CategoryType } from "@/generated/prisma/client";

export const CATEGORY_SLUG_MAP: Record<string, CategoryType> = {
  "meal-kits": CategoryType.MEAL_KIT,
  "prepared-meals": CategoryType.PREPARED_MEAL,
  "protein-boxes": CategoryType.PROTEIN_BOX,
  "produce-boxes": CategoryType.PRODUCE_BOX,
  "specialty": CategoryType.SPECIALTY,
};

export const CATEGORY_ENUM_MAP: Record<CategoryType, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_MAP).map(([slug, type]) => [type, slug])
) as Record<CategoryType, string>;

export const CATEGORY_DISPLAY_NAMES: Record<CategoryType, string> = {
  [CategoryType.MEAL_KIT]: "Meal Kits",
  [CategoryType.PREPARED_MEAL]: "Prepared Meals",
  [CategoryType.PROTEIN_BOX]: "Protein & Meat Boxes",
  [CategoryType.PRODUCE_BOX]: "Produce & Grocery Boxes",
  [CategoryType.SPECIALTY]: "Specialty Diet Boxes",
};

export const ALL_CATEGORY_SLUGS = Object.keys(CATEGORY_SLUG_MAP);
```

### Anti-Patterns to Avoid
- **Seed script importing from `@/lib/db`:** The `tsx` runner does not resolve Next.js path aliases. The seed script must use relative imports (`../src/generated/prisma/client`) and create its own PrismaClient.
- **Configuring seed in package.json:** This is the Prisma 5/6 pattern. Prisma 7 uses `prisma.config.ts`. The old approach is silently ignored.
- **Wrapping entire seed in one `$transaction`:** A single massive transaction with 18 providers + nested relations risks timeout on Neon serverless. Use sequential individual creates instead.
- **Direct `prisma.` calls in page components:** All queries go through `src/lib/queries.ts` to centralize data access, enable `React.cache()`, and keep a single optimization point.
- **Forgetting `$disconnect()` in seed script:** The seed process hangs indefinitely without it. Use `.finally(() => prisma.$disconnect())`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript seed execution | Custom build step or ts-node config | `tsx` (esbuild-based TS runner) | Zero config, handles ESM, fast. |
| Query deduplication | Custom memoization | `React.cache()` from `react` | Built into React 19, request-scoped, works with Next.js RSC. |
| Enum slug mapping | Scattered string constants | Centralized `src/lib/categories.ts` | Single source of truth, prevents typos. |
| CHECK constraints | Prisma schema validation | Raw SQL via `$executeRawUnsafe` | Prisma schema does not support CHECK constraints. Use `$executeRawUnsafe` for DDL (not `$executeRaw` which uses PREPARE and rejects ALTER/DDL). |
| Denormalized price computation | Runtime MIN/MAX subqueries | Pre-computed fields on Provider | Avoids Plan subquery on every listing page load. |
| Seed data for real providers | Made-up fake data | Real 2026 provider data | Exposes UI/data issues immediately. Fake data hides layout and formatting problems. |

## Common Pitfalls

### Pitfall 1: Seed Command in package.json (Prisma 7 Breaking Change)
**What goes wrong:** `npx prisma db seed` outputs "No seed command found" or silently does nothing.
**Why it happens:** Prisma 7 moved seed configuration from `package.json` to `prisma.config.ts`. The old `"prisma": { "seed": "..." }` in package.json is silently ignored.
**How to avoid:** Add `seed: "npx tsx prisma/seed.ts"` to the `migrations` block in `prisma.config.ts`.
**Warning signs:** Seed command exits with no output, or says configuration not found.

### Pitfall 2: Seed Script Path Alias Resolution Failure
**What goes wrong:** `tsx prisma/seed.ts` fails with "Cannot find module '@/lib/db'" or "@/generated/prisma/client".
**Why it happens:** `tsx` does not use Next.js's bundler or tsconfig path aliases. The `@/` alias only works inside the Next.js build pipeline.
**How to avoid:** Use relative imports in the seed script: `import { PrismaClient } from "../src/generated/prisma/client"`. Create a standalone PrismaClient -- do not import from `src/lib/db.ts`.
**Warning signs:** Module resolution errors when running `npx prisma db seed`.

### Pitfall 3: Neon Connection Timeout During Seeding
**What goes wrong:** Seed script hangs or times out partway through, leaving partial data.
**Why it happens:** Neon serverless has connection idle timeout. A large `$transaction` wrapping all 18 provider creates with nested relations can exceed this limit.
**How to avoid:** Do NOT wrap the entire seed in one `$transaction`. Use sequential individual `prisma.provider.create()` calls. The deleteAll at the start ensures idempotency even without a wrapping transaction.
**Warning signs:** Timeout errors, partially seeded data, connection pool exhaustion.

### Pitfall 4: CHECK Constraint Syntax with $executeRaw
**What goes wrong:** Using `$executeRaw` (tagged template) for ALTER TABLE / CHECK constraints fails.
**Why it happens:** PostgreSQL PREPARE statements do not support ALTER/DDL commands. Prisma's `$executeRaw` uses prepared statements.
**How to avoid:** Use `$executeRawUnsafe()` for DDL statements. This is safe when SQL is hardcoded with no user input.
**Warning signs:** Error "PREPARE does not support ALTER".

### Pitfall 5: Forgetting to Pre-Compute Denormalized Fields
**What goes wrong:** `minPricePerServing` and `maxPricePerServing` are null on all providers after seeding, breaking category listing filters (Phase 40).
**Why it happens:** Prisma nested creates don't auto-compute denormalized fields. The provider record must explicitly include these values.
**How to avoid:** In the seed data transform function, compute min/max from the plans array before passing to `prisma.provider.create()`. Same for `averageRating` and `reviewCount` from reviews.
**Warning signs:** Null price fields, zero ratings despite having reviews, filters returning zero results.

### Pitfall 6: Float Pricing Precision (Known Risk)
**What goes wrong:** `$7.99` stored as Float becomes `7.990000000000001`. Sorting "price low to high" can produce incorrect ordering. Filtering "under $8.00" may exclude items at exactly $8.00.
**Why it happens:** IEEE 754 binary floating point cannot exactly represent most decimal fractions.
**How to avoid:** Two options: (a) Keep Float but always round to 2 decimal places when displaying and use `>=` / `<=` with small epsilon for filtering. (b) Convert to integer cents before seeding (industry standard but requires schema field renames). The PLAN.md uses Float, which is workable with careful formatting.
**Warning signs:** Prices displaying more than 2 decimal places. Two identical prices sorting differently.

### Pitfall 7: Promotional vs. Regular Pricing Confusion
**What goes wrong:** Seed data uses introductory promotional prices ("First box 60% off!") as primary pricing, making every provider look cheaper than reality.
**Why it happens:** Promotional pricing is the most prominently displayed on provider websites.
**How to avoid:** Always seed REGULAR (non-promotional) pricing. Add comments documenting this convention. Optionally track intro offers in a separate field.
**Warning signs:** All providers show suspiciously low prices ($3-5/serving when regular is $8-13).

### Pitfall 8: Stale Prisma Client After Schema Changes
**What goes wrong:** Schema changes pushed with `prisma db push` but TypeScript client not regenerated. Code compiles with old types, runtime errors on new fields.
**Why it happens:** Two-step process: `prisma db push` + `prisma generate`. Forgetting the second step.
**How to avoid:** Always run both: `npx prisma db push && npx prisma generate`.
**Warning signs:** TypeScript errors about missing properties, or runtime errors about unexpected columns.

### Pitfall 9: Generic Seed Data Fails E-E-A-T Standards
**What goes wrong:** Seed descriptions read like marketing copy that could apply to any service. If seed data becomes production data without rewriting, Google demotes the site for thin affiliate content.
**Why it happens:** Speed pressure leads to placeholder descriptions.
**How to avoid:** Write editorial-quality, opinionated, specific descriptions. Each provider needs differentiated pros/cons. Test: can you swap descriptions between two providers without noticing? If yes, too generic.
**Warning signs:** All descriptions follow the same template. Pros lists are interchangeable.

## Code Examples

### Query Utility Structure (Full Function List)
```typescript
// src/lib/queries.ts
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { CategoryType, DietaryTag } from "@/generated/prisma/client";

// -- Homepage (Phase 30) --
export const getFeaturedProviders = cache(async (limit = 6) => {
  return prisma.provider.findMany({
    where: { featured: true, active: true },
    include: { dietaryTags: true },
    orderBy: { averageRating: "desc" },
    take: limit,
  });
});

export const getCategoryCounts = cache(async () => {
  return prisma.provider.groupBy({
    by: ["category"],
    where: { active: true },
    _count: true,
  });
});

// -- Category Pages (Phase 40) --
interface ProviderListParams {
  category: CategoryType;
  dietary?: DietaryTag[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: "rating" | "price-asc" | "price-desc" | "reviews" | "newest";
  page?: number;
  pageSize?: number;
}

export const getProvidersByCategory = cache(async (params: ProviderListParams) => {
  const {
    category, dietary, minPrice, maxPrice, minRating,
    sortBy = "rating", page = 1, pageSize = 12,
  } = params;

  const where = {
    category,
    active: true,
    ...(dietary?.length && { dietaryTags: { some: { tag: { in: dietary } } } }),
    ...(minPrice != null && { minPricePerServing: { gte: minPrice } }),
    ...(maxPrice != null && { maxPricePerServing: { lte: maxPrice } }),
    ...(minRating != null && { averageRating: { gte: minRating } }),
  };

  const orderBy = {
    "rating": { averageRating: "desc" as const },
    "price-asc": { minPricePerServing: "asc" as const },
    "price-desc": { maxPricePerServing: "desc" as const },
    "reviews": { reviewCount: "desc" as const },
    "newest": { createdAt: "desc" as const },
  }[sortBy];

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      include: { dietaryTags: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.provider.count({ where }),
  ]);

  return { providers, total };
});

// -- Provider Detail (Phase 50) --
export const getProviderBySlug = cache(async (slug: string) => {
  return prisma.provider.findUnique({
    where: { slug, active: true },
    include: {
      plans: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      dietaryTags: true,
      faqs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
});

export const getRelatedProviders = cache(
  async (providerId: string, category: CategoryType, limit = 4) => {
    return prisma.provider.findMany({
      where: { category, active: true, id: { not: providerId } },
      include: { dietaryTags: true },
      orderBy: { averageRating: "desc" },
      take: limit,
    });
  }
);

export const getAllProviderSlugs = cache(async () => {
  return prisma.provider.findMany({
    where: { active: true },
    select: { slug: true },
  });
});

// -- Comparison (Phase 60) --
export const getProvidersBySlugs = cache(async (slugs: string[]) => {
  return prisma.provider.findMany({
    where: { slug: { in: slugs }, active: true },
    include: {
      plans: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      dietaryTags: true,
    },
  });
});

// -- Collections & Blog (Phase 70) --
export const getCollectionBySlug = cache(async (slug: string) => {
  return prisma.collection.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: { provider: { include: { dietaryTags: true } } },
      },
    },
  });
});

export const getAllCollections = cache(async () => {
  return prisma.collection.findMany({
    where: { status: "PUBLISHED" },
    include: { items: { select: { id: true } } },
    orderBy: { publishedAt: "desc" },
  });
});

export const getBlogPosts = cache(async (page = 1, pageSize = 10) => {
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
  ]);
  return { posts, total };
});

export const getBlogPostBySlug = cache(async (slug: string) => {
  return prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
});

// -- Search (Phase 80) --
export const searchProviders = cache(async (query: string, limit = 20) => {
  return prisma.provider.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { dietaryTags: true },
    take: limit,
  });
});

// -- Reviews (Phase 90) --
export const getReviewsByProvider = cache(async (providerId: string, page = 1, pageSize = 10) => {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { providerId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where: { providerId, status: "APPROVED" } }),
  ]);
  return { reviews, total };
});

// -- Admin (Phase 100) --
export const getAdminStats = cache(async () => {
  const [providers, pendingReviews, totalReviews, totalClicks, blogPosts] = await Promise.all([
    prisma.provider.count({ where: { active: true } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.review.count(),
    prisma.affiliateClick.count(),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
  ]);
  return { providers, pendingReviews, totalReviews, totalClicks, blogPosts };
});

export const getPendingReviews = cache(async () => {
  return prisma.review.findMany({
    where: { status: "PENDING" },
    include: { provider: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "asc" },
  });
});

// -- SEO (Phase 110) --
export const getSitemapData = cache(async () => {
  const [providers, collections, blogPosts] = await Promise.all([
    prisma.provider.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.collection.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);
  return { providers, collections, blogPosts };
});
```

### Seed Data Type Definitions
```typescript
// prisma/seed-data/types.ts
import type {
  CategoryType,
  DietaryTag,
  PlanFrequency,
  ReviewStatus,
  ContentStatus,
} from "../../src/generated/prisma/client";

export interface ProviderSeedData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  website: string;
  affiliateUrl?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  foundedYear?: number;
  headquarters?: string;
  deliveryAreaDescription?: string;
  prosJson: string;        // JSON.stringify(string[])
  consJson: string;        // JSON.stringify(string[])
  editorNote?: string;
  featured: boolean;
  active: boolean;
  metaTitle: string;
  metaDescription: string;
  category: CategoryType;
  // Denormalized fields (pre-computed from plans/reviews)
  averageRating: number;
  reviewCount: number;
  minPricePerServing: number | null;
  maxPricePerServing: number | null;
  // Nested data
  plans: PlanSeedData[];
  dietaryTags: DietaryTag[];
  faqs: FaqSeedData[];
  reviews: ReviewSeedData[];
}

export interface PlanSeedData {
  name: string;
  description?: string;
  pricePerServing?: number;
  pricePerWeek?: number;
  pricePerBox?: number;
  shippingCost: number;
  shippingNote?: string;
  servingsPerMeal?: number;
  mealsPerWeek?: number;
  frequency: PlanFrequency;
  canSkip: boolean;
  canCancel: boolean;
  cancelPolicy?: string;
  featured: boolean;
  sortOrder: number;
}

export interface FaqSeedData {
  question: string;
  answer: string;
  sortOrder: number;
}

export interface ReviewSeedData {
  authorName: string;
  rating: number;      // 1-5
  title?: string;
  body: string;
  status: ReviewStatus;
}

export interface CollectionSeedData {
  title: string;
  slug: string;
  description: string;
  body?: string;
  status: ContentStatus;
  publishedAt?: Date;
  metaTitle: string;
  metaDescription: string;
  providerSlugs: { slug: string; note?: string; sortOrder: number }[];
}

export interface BlogPostSeedData {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  status: ContentStatus;
  publishedAt?: Date;
  metaTitle: string;
  metaDescription: string;
}
```

## 18 Real Food Box Providers (Category Assignments)

| Category | Count | Providers |
|----------|-------|-----------|
| MEAL_KIT | 4 | HelloFresh, Blue Apron, Home Chef, EveryPlate |
| PREPARED_MEAL | 4 | Factor, CookUnity, Mosaic Foods, Snap Kitchen |
| PROTEIN_BOX | 3 | ButcherBox, Crowd Cow, Good Chop |
| PRODUCE_BOX | 3 | Misfits Market, Hungryroot, Farmbox Direct |
| SPECIALTY | 4 | Purple Carrot, Green Chef, Sunbasket, Trifecta |

**Provider replacements per PROJECT.md decisions:**
- Freshly: Discontinued by HelloFresh -- replaced by Snap Kitchen
- Imperfect Foods: Merged into Misfits Market -- replaced by Hungryroot + Farmbox Direct

**Rating distribution for seed data (realism):**
- 2 providers at 3.5 stars
- 5 providers at 3.8-4.0 stars
- 7 providers at 4.1-4.3 stars
- 4 providers at 4.4-4.7 stars

**Reviews per provider:** 3-5 APPROVED reviews with varied ratings (not all 5-star). Total: ~54-90 seeded reviews.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Seed in `package.json` `"prisma"` key | Seed in `prisma.config.ts` `migrations.seed` | Prisma 7.0 | Config location moved. Old approach silently ignored. |
| Optional driver adapters | Mandatory driver adapters | Prisma 7.0 | Every PrismaClient must specify adapter (PrismaPg for PostgreSQL). |
| TypeScript `enum` declarations | `const` objects + type aliases | Prisma 7.0 | `CategoryType.MEAL_KIT` is a const object access, not a TS enum member. Runtime identical (string values). |
| `prisma-client-js` generator | `prisma-client` generator | Prisma 7.0 | Rust-free architecture, requires `output` field in generator block. |
| Auto-seeding on `prisma migrate dev` | Explicit `npx prisma db seed` only | Prisma 7.0 | Must manually run seed command. |
| Prisma client in `node_modules` | Custom output directory | Prisma 7.0 | Client generated to `src/generated/prisma/` (already configured). |

**Deprecated/outdated:**
- `package.json` seed config: Silently ignored in Prisma 7.
- `prisma-client-js` generator: Replaced by `prisma-client`. Project already uses the new generator.
- `$executeRaw` for DDL: PostgreSQL PREPARE doesn't support ALTER. Must use `$executeRawUnsafe` for CHECK constraints.

## Open Questions

1. **Float vs Integer Cents for Pricing**
   - What we know: The schema uses `Float`. PITFALLS.md recommends integer cents. The PLAN.md uses Float. Industry standard (Stripe, Shopify) is integer cents.
   - What's unclear: Whether the project should change field names now (pricePerServing -> pricePerServingCents) or keep Float.
   - Recommendation: If keeping Float, always round to 2 decimal places when displaying and use >= / <= carefully in filters. If converting, do it now before any data is seeded -- it's a now-or-never decision.

2. **Collection Seeding Requires Provider IDs**
   - What we know: Collections reference Providers via CollectionItem join table. Provider IDs are auto-generated CUIDs.
   - What's unclear: Best approach to reference providers in collection seed data.
   - Recommendation: Seed providers first, then query by slug to get IDs when creating CollectionItems. Standard approach.

3. **Protein/Produce Box Pricing Model**
   - What we know: ButcherBox, Crowd Cow, Good Chop price per box/pound, not per serving. `pricePerServing` doesn't map cleanly.
   - What's unclear: Should we calculate approximate per-serving equivalents or leave null?
   - Recommendation: Leave `pricePerServing` null for protein/produce boxes that don't have a per-serving price. Use `pricePerBox` instead. Display "from $X/box" for these categories. Price-range filtering only applies when `pricePerServing` is non-null.

4. **prosJson/consJson: Keep String or Convert to Json Type**
   - What we know: Currently `String @db.Text`. Prisma `Json` type maps to PostgreSQL JSONB with database-level validation. PITFALLS.md recommends Json.
   - What's unclear: Whether Json type introduces Prisma serialization issues similar to Decimal.
   - Recommendation: Keep as `String @db.Text` for now (matches existing schema and PLAN.md). The seed script and all write paths should use `JSON.stringify()` consistently. If data corruption becomes an issue, convert to Json later.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed (no test framework in project) |
| Config file | None -- see Wave 0 |
| Quick run command | `npx tsc --noEmit` (type checking only) |
| Full suite command | `npx tsc --noEmit && npm run build` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DB-01 | Schema deploys to Neon without errors | smoke | `npx prisma db push` (exit code 0) | N/A (CLI) |
| DB-02 | Seed populates 18 providers across 5 categories | smoke | `npx prisma db seed` (exit code 0 + console output counts) | seed.ts in Wave 0 |
| DB-03 | Query functions compile and return correct types | unit | `npx tsc --noEmit` (type safety) | queries.ts in Wave 0 |
| DB-04 | Denormalized price fields populated | smoke | Verified by seed script console output | N/A (seed output) |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx tsc --noEmit && npm run build`
- **Phase gate:** Full build green + seed script completes without errors + record counts match expectations

### Wave 0 Gaps
- [ ] No test framework installed (Jest, Vitest, Playwright). Phase 10 relies on TypeScript compilation + seed script execution as verification.
- [ ] Seed script console output serves as runtime verification (record counts per model).
- [ ] Query function testing is compilation-only (type safety via `tsc --noEmit`). Runtime verification deferred.

*(No dedicated test files needed for Phase 10. TypeScript compilation and seed script execution provide sufficient coverage for a data foundation phase. Test framework installation deferred to a phase with behavioral UI requirements.)*

## Sources

### Primary (HIGH confidence)
- `prisma/schema.prisma` -- Existing 10-model schema with 5 enums, verified locally
- `src/lib/db.ts` -- Existing PrismaClient singleton with PrismaPg adapter, verified locally
- `src/generated/prisma/enums.ts` -- Verified Prisma 7 enum generation as const objects after `prisma generate`
- `prisma.config.ts` -- Existing config, verified locally (missing `seed` field, needs update)
- Prisma 7 seeding docs (prisma.io/docs/orm/prisma-migrate/workflows/seeding) -- Confirmed seed in `prisma.config.ts`, explicit-only seeding [verified via WebFetch]
- Prisma 7 upgrade docs (prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) -- Confirmed mandatory driver adapters, ESM, enum changes [verified via WebFetch]
- Prisma raw SQL docs (prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries) -- Confirmed `$executeRawUnsafe` required for ALTER/DDL [verified via WebFetch]
- Next.js 16 caching docs (local: `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`) -- Confirmed `React.cache()` for ORM query deduplication

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md` -- Query layer patterns, component boundaries, data flow
- `.planning/research/PITFALLS.md` -- Float pricing risks, seed data quality, E-E-A-T requirements
- `.planning/research/SCHEMA-EXTENDED.md` -- Post-MVP schema ideas (not relevant to Phase 10 implementation)

### Tertiary (LOW confidence)
- Real provider pricing data -- Based on general knowledge and existing research notes. Needs verification during seed creation. Document with "Prices last verified: YYYY-MM-DD" comments.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All packages installed except tsx. Versions verified against npm registry and local installs.
- Architecture: HIGH -- Patterns verified against Next.js 16 local docs, Prisma 7 generated code, and official Prisma docs.
- Pitfalls: HIGH -- Prisma 7 breaking changes verified via official docs. Seed script patterns confirmed by generated client code and prisma.config.ts structure.
- Seed data: MEDIUM -- Provider list and categories confirmed from PROJECT.md. Pricing is editorial and will need verification during implementation.

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable -- Prisma 7.5 and Next.js 16.2 are current releases, unlikely to change within 30 days)
