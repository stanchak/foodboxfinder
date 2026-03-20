# Phase 10: Database & Foundation - Research

**Researched:** 2026-03-20
**Domain:** Prisma 7.5 + Neon PostgreSQL schema, seed data, and query utilities for a food box comparison site
**Confidence:** HIGH

## Summary

Phase 10 is the foundation layer that all 11 downstream phases depend on. The work divides into four areas: (1) schema enhancements to fix known issues before any data exists, (2) a seed script populating 18 real food box providers with editorial-quality data, (3) query utility functions that serve every downstream page type, and (4) infrastructure setup (prisma.config.ts seed command, env validation, remotePatterns).

The most critical decision is **how to store money**. The current schema uses `Float` for all pricing fields, which causes IEEE 754 precision errors that corrupt price comparisons -- the core value proposition of the site. The recommended approach is **integer cents** (`Int` type, store $7.99 as 799) rather than Prisma `Decimal`, because `Decimal` returns `Decimal.js` objects that cannot be serialized across the Next.js Server Component boundary without manual conversion on every query. Integer cents are natively serializable, trivially sortable, and used by Stripe and industry leaders.

The second critical decision is the single-category model. Research confirms at least 4 of the planned 18 providers span multiple categories (Hungryroot, Sunbasket, Green Chef, Purple Carrot). A `secondaryCategory` field is the pragmatic fix -- simpler than a junction table, sufficient for MVP where no provider needs more than 2 categories.

**Primary recommendation:** Convert all pricing to integer cents, add `secondaryCategory` to Provider, change `prosJson`/`consJson` to `Json` type, add `lastVerifiedAt` and denormalized price fields -- then seed with meticulously researched real-world provider data using editorial-quality prose.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DB-01 | Database schema deployed to Neon with all models | Schema enhancement patterns documented: Decimal->Int cents, Json type, secondaryCategory, denormalized price fields, composite indexes |
| DB-02 | Seed script populates 18 real providers across 5 categories with realistic plans, pricing, dietary tags, FAQs, and reviews | All 18 providers researched with verified 2026 pricing, category assignments, dietary tags, and editorial content guidelines |
| DB-03 | Query utility functions support all downstream page data needs | React.cache() deduplication pattern, unstable_cache for ISR, function signatures for listing/detail/comparison/search/admin documented |
| DB-04 | Denormalized price fields (minPricePerServing, maxPricePerServing) on Provider for filter performance | Integer cents approach, recalculation utility pattern, composite index strategy documented |
</phase_requirements>

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| prisma | 7.5.0 | ORM + schema management | Installed |
| @prisma/client | 7.5.0 | Database client | Installed |
| @prisma/adapter-pg | 7.5.0 | Neon PostgreSQL adapter | Installed |
| dotenv | 17.3.1 | Environment variable loading | Installed |

### Phase 10 Additions

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | 4.21.0 | Run TypeScript seed script directly | `npx tsx prisma/seed.ts` -- dev dependency |
| server-only | 0.0.1 | Prevent query utilities from being imported in client components | `import 'server-only'` at top of `src/lib/queries.ts` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Integer cents (Int) | Prisma Decimal | Decimal returns Decimal.js objects that fail RSC serialization. Every query would need `.toNumber()` conversion. Integer cents are natively serializable. |
| Integer cents (Int) | Float (current) | Float causes IEEE 754 precision errors: `$7.99 + $0.01 != $8.00`. Breaks price sorting and filtering -- the site's core feature. |
| `secondaryCategory` field | ProviderCategory junction table | Junction table is more flexible but adds query complexity. Only 4 of 18 providers need dual categories. secondaryCategory is sufficient for MVP. |
| `Json` type for pros/cons | String @db.Text (current) | Json maps to PostgreSQL JSONB with database-level validation. String allows malformed JSON that crashes page rendering. |

**Installation:**
```bash
npm install -D tsx
npm install server-only
```

**Version verification:** Confirmed via `npm view` on 2026-03-20:
- tsx: 4.21.0
- server-only: 0.0.1

## Architecture Patterns

### Recommended Project Structure
```
prisma/
  schema.prisma          # Enhanced schema (Decimal->Int, Json, denormalized fields)
  seed.ts                # Main seed script orchestrator
  seed-data/
    providers.ts         # 18 provider definitions with all nested data
    collections.ts       # 5-8 "best of" collection seeds
    blog-posts.ts        # 3-5 blog post seeds
    helpers.ts           # Price conversion, shared utilities
src/
  lib/
    db.ts                # Prisma singleton (existing)
    queries.ts           # All query functions with React.cache() deduplication
    format.ts            # Price formatting, rating display utilities
    env.ts               # Environment variable validation (optional, recommended)
```

### Pattern 1: Integer Cents for All Pricing
**What:** Store all monetary values as integers representing cents. `$7.99/serving` is stored as `799`.
**When to use:** Every pricing field in the schema.
**Why:** Prisma's `Decimal` type returns `Decimal.js` objects that are NOT serializable in React Server Components. Passing a query result containing `Decimal` fields from a Server Component to a Client Component throws: `"Error serializing props: object ("[object Decimal]") cannot be serialized as JSON"`. Integer cents avoid this entirely while maintaining exact precision.

```typescript
// prisma/schema.prisma
model Plan {
  pricePerServingCents Int?     // $7.99 = 799
  pricePerWeekCents    Int?     // $59.94 = 5994
  pricePerBoxCents     Int?     // $69.92 = 6992
  shippingCostCents    Int  @default(0)  // $9.99 = 999, free = 0
}

model Provider {
  minPricePerServingCents Int?  // Denormalized: cheapest plan
  maxPricePerServingCents Int?  // Denormalized: most expensive plan
}

// src/lib/format.ts
export function formatPrice(cents: number | null): string {
  if (cents === null) return "N/A";
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatPriceRange(minCents: number | null, maxCents: number | null): string {
  if (minCents === null || maxCents === null) return "Contact for pricing";
  if (minCents === maxCents) return formatPrice(minCents);
  return `${formatPrice(minCents)} - ${formatPrice(maxCents)}`;
}

// Seed data example:
{ pricePerServingCents: 799 }  // $7.99
{ pricePerServingCents: 1149 } // $11.49
```

**Source:** Industry standard (Stripe, PayPal, Shopify all use integer cents). Prisma Decimal serialization issue confirmed in prisma/prisma#9170, prisma/prisma Discussion #19983, and multiple community reports through January 2026.

### Pattern 2: React.cache() Query Deduplication
**What:** Wrap all Prisma queries with `React.cache()` to deduplicate within a single render pass. Combine with `unstable_cache` for ISR on read-heavy pages.
**When to use:** Every query function in `src/lib/queries.ts`.

```typescript
// src/lib/queries.ts
import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';

// React.cache deduplicates within a single request/render
export const getProviderBySlug = cache(async (slug: string) => {
  return prisma.provider.findUnique({
    where: { slug },
    include: {
      plans: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
      dietaryTags: true,
      faqs: { orderBy: { sortOrder: 'asc' } },
      reviews: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
});

// unstable_cache adds ISR-style time-based caching
export const getCachedProviderBySlug = unstable_cache(
  async (slug: string) => {
    return getProviderBySlug(slug);
  },
  ['provider-detail'],
  { tags: ['provider'], revalidate: 3600 }
);
```

**Source:** Next.js 16 official docs (`node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`) -- verified locally.

### Pattern 3: Prisma 7 Seed Script with Nested Creates
**What:** Use `prisma.provider.create()` with nested `plans`, `dietaryTags`, `faqs`, and `reviews` creates. Idempotent via deleteAll-then-create pattern.
**When to use:** The seed script.

```typescript
// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean slate: delete in dependency order (children first via cascade)
  await prisma.affiliateClick.deleteMany();
  await prisma.collectionItem.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.review.deleteMany();
  await prisma.providerFaq.deleteMany();
  await prisma.providerDietaryTag.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.provider.deleteMany();

  // Create providers with all nested data
  const hellofresh = await prisma.provider.create({
    data: {
      name: 'HelloFresh',
      slug: 'hellofresh',
      description: '...editorial content...',
      website: 'https://www.hellofresh.com',
      affiliateUrl: 'https://www.hellofresh.com/?ref=foodboxfinder',
      category: 'MEAL_KIT',
      averageRating: 4.2,
      reviewCount: 5,
      minPricePerServingCents: 799,
      maxPricePerServingCents: 1299,
      prosJson: ['Wide variety of 60+ weekly recipes', ...],
      consJson: ['Recipe instructions can be overly prescriptive', ...],
      plans: {
        create: [
          {
            name: 'Meat & Veggies',
            pricePerServingCents: 899,
            pricePerBoxCents: 7192,
            shippingCostCents: 1099,
            servingsPerMeal: 2,
            mealsPerWeek: 4,
            canSkip: true,
            canCancel: true,
          },
        ],
      },
      dietaryTags: {
        create: [
          { tag: 'VEGETARIAN' },
          { tag: 'LOW_CARB' },
          { tag: 'PESCATARIAN' },
        ],
      },
      faqs: {
        create: [
          { question: 'How does HelloFresh work?', answer: '...' },
        ],
      },
      reviews: {
        create: [
          {
            authorName: 'Sarah M.',
            rating: 4,
            title: 'Great for weeknight dinners',
            body: '...',
            status: 'APPROVED',
          },
        ],
      },
    },
  });

  console.log(`Seeded provider: ${hellofresh.name}`);
  // ... repeat for all 18 providers
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
```

**Source:** Prisma 7 seeding docs (prisma.io/docs/orm/prisma-migrate/workflows/seeding). PROJECT.md key decision: "deleteAll + create for seed idempotency."

### Pattern 4: Denormalized Price Recalculation
**What:** After seeding all plans, recalculate `minPricePerServingCents` and `maxPricePerServingCents` on each Provider.
**When to use:** End of seed script, and in every Server Action that modifies plans.

```typescript
// src/lib/queries.ts or prisma/seed-data/helpers.ts
export async function recalculateProviderPricing(
  prisma: PrismaClient,
  providerId: string
) {
  const plans = await prisma.plan.findMany({
    where: { providerId, active: true, pricePerServingCents: { not: null } },
    select: { pricePerServingCents: true },
  });

  const prices = plans
    .map((p) => p.pricePerServingCents)
    .filter((p): p is number => p !== null);

  await prisma.provider.update({
    where: { id: providerId },
    data: {
      minPricePerServingCents: prices.length ? Math.min(...prices) : null,
      maxPricePerServingCents: prices.length ? Math.max(...prices) : null,
    },
  });
}
```

### Anti-Patterns to Avoid
- **Using `Float` for money:** IEEE 754 causes `$7.99 != $7.99` in comparisons. Never use Float for financial data.
- **Using `Decimal` with RSC:** Prisma `Decimal` returns `Decimal.js` objects that break React Server Component serialization. Use integer cents instead.
- **Creating a separate PrismaClient in the seed script:** The seed script needs its OWN PrismaClient instance (not the app singleton) because it runs outside the Next.js process. This is correct and expected.
- **Forgetting to close the connection:** Seed scripts must call `prisma.$disconnect()` in both success and error paths, or the process hangs.
- **Promotional pricing as primary:** Always seed regular (non-promotional) pricing. Promos are marketing data, not comparison data.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON serialization of pros/cons | Custom String parsing with try/catch | Prisma `Json` type (PostgreSQL JSONB) | Database-level validation rejects malformed writes. No runtime parsing errors. |
| Price formatting | Inline `(price / 100).toFixed(2)` everywhere | Shared `formatPrice()` utility | Centralized formatting prevents inconsistencies. Single source of truth for currency display. |
| Query deduplication | Multiple identical Prisma calls hoping for cache | `React.cache()` wrapper | React deduplicates within a render pass. Without it, a layout and page querying the same provider make two DB calls. |
| Seed data provider research | Made-up fake providers | Real 2026 provider data | E-E-A-T compliance requires editorial-quality, factually accurate seed data from day one. Fake data hides UI problems. |
| Env validation | `process.env.X!` non-null assertion | Runtime check or Zod schema | Non-null assertion produces cryptic errors when env var is missing. Clear error message saves debugging time. |

## Common Pitfalls

### Pitfall 1: Prisma Decimal Serialization Failure in RSC
**What goes wrong:** Using Prisma `Decimal` type for price fields causes every Server Component that renders price data to throw: `"Error serializing: object ("[object Decimal]") cannot be serialized as JSON"`.
**Why it happens:** Prisma returns `Decimal.js` instances, not native JavaScript numbers. React Server Components can only serialize plain objects, arrays, strings, numbers, booleans, null, and undefined.
**How to avoid:** Use integer cents (`Int` type) for all monetary values. Native `number` type serializes without issues.
**Warning signs:** Build passes but pages crash at runtime with serialization errors when rendering any price field.

### Pitfall 2: Float Pricing Breaks Sort and Filter
**What goes wrong:** `$7.99` stored as Float becomes `7.990000000000001`. Sorting "price low to high" produces incorrect ordering. Filtering "under $8.00" excludes items at exactly $8.00.
**Why it happens:** IEEE 754 binary representation cannot exactly represent most decimal fractions.
**How to avoid:** Integer cents. `799 < 800` is always true. No precision issues.
**Warning signs:** Prices display with more than 2 decimal places. Two identical prices sort differently.

### Pitfall 3: Seed Data Too Generic for E-E-A-T
**What goes wrong:** Seed descriptions read like marketing copy: "HelloFresh delivers fresh ingredients to your door." Google's December 2025 Core Update demoted 71% of affiliate sites with thin content. Generic seed data becomes the real data if nobody rewrites it.
**Why it happens:** Speed pressure leads to placeholder descriptions that never get replaced.
**How to avoid:** Write editorial-quality, opinionated descriptions during seeding. Each provider needs specific, differentiated pros/cons that could only be written by someone who used the service.
**Warning signs:** Can you swap the description between two providers and nobody notices? It's too generic.

### Pitfall 4: Promotional vs. Regular Pricing Confusion
**What goes wrong:** Nearly every meal kit advertises a promotional introductory price ("First box 50% off!"). If the seed script uses promo prices, the entire comparison is meaningless.
**Why it happens:** Promotional pricing is the most prominent number on provider websites.
**How to avoid:** Always seed the REGULAR (non-promotional) price as `pricePerServingCents`. Document this convention in seed data comments. Optionally add `introOfferNote String?` to Plan for displaying promo info separately.
**Warning signs:** All providers seem suspiciously cheap ($3-5/serving) when regular prices are $8-13/serving.

### Pitfall 5: Multi-Category Providers Forced into Single Category
**What goes wrong:** Hungryroot is both a meal kit and produce/grocery service. Sunbasket offers both meal kits and prepared meals. Forcing them into one category means users searching the other category won't find them.
**Why it happens:** The schema uses a single `CategoryType` enum on Provider.
**How to avoid:** Add `secondaryCategory CategoryType?` to Provider. Query functions must include both `category` and `secondaryCategory` matches when listing providers for a category.
**Warning signs:** During seed data creation, the team debates which single category a provider belongs to more than twice.

### Pitfall 6: Stale Prisma Client After Schema Changes
**What goes wrong:** Schema changes (adding new fields) are pushed to Neon with `prisma db push`, but the TypeScript client is not regenerated. Code compiles with old types and fails at runtime.
**Why it happens:** Two-step process: `prisma db push` + `prisma generate`. Forgetting the second step.
**How to avoid:** Always run both: `npx prisma db push && npx prisma generate`. The CONCERNS.md already flags this.
**Warning signs:** TypeScript errors about missing properties on Prisma models.

## Code Examples

### Schema Enhancement: Provider Model with Integer Cents and New Fields
```typescript
// prisma/schema.prisma (relevant changes to Provider model)
model Provider {
  // ... existing fields ...

  // Category (enhanced)
  category          CategoryType
  secondaryCategory CategoryType?      // NEW: for multi-category providers

  // Pricing (denormalized, integer cents)
  minPricePerServingCents Int?          // NEW: cheapest active plan
  maxPricePerServingCents Int?          // NEW: most expensive active plan
  freeShipping            Boolean @default(false)  // NEW: any plan has free shipping

  // Data freshness
  lastVerifiedAt DateTime?              // NEW: when pricing was last verified

  // Editorial (JSON type for validation)
  prosJson       Json?                  // CHANGED: String -> Json (JSONB)
  consJson       Json?                  // CHANGED: String -> Json (JSONB)

  // ... rest unchanged ...

  @@index([category])
  @@index([secondaryCategory])          // NEW
  @@index([minPricePerServingCents])     // NEW: for price range filtering
  @@index([averageRating])
}
```

### Schema Enhancement: Plan Model with Integer Cents
```typescript
model Plan {
  // ... existing fields ...

  // Pricing (integer cents)
  pricePerServingCents Int?             // CHANGED: Float -> Int
  pricePerWeekCents    Int?             // CHANGED: Float -> Int
  pricePerBoxCents     Int?             // CHANGED: Float -> Int
  shippingCostCents    Int  @default(0) // CHANGED: Float -> Int

  // Optional promo tracking
  introOfferNote       String?          // NEW: e.g., "60% off first box"

  // ... rest unchanged ...
}
```

### Query Functions: Core Patterns
```typescript
// src/lib/queries.ts
import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/db';
import type { CategoryType, DietaryTag } from '@/generated/prisma/client';

// === Provider Listing (for category pages) ===
export const getProvidersByCategory = cache(
  async (options: {
    category: CategoryType;
    dietaryTags?: DietaryTag[];
    minPrice?: number;       // cents
    maxPrice?: number;       // cents
    minRating?: number;
    sortBy?: 'rating' | 'price-asc' | 'price-desc' | 'reviews' | 'newest';
    page?: number;
    pageSize?: number;
  }) => {
    const {
      category,
      dietaryTags,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'rating',
      page = 1,
      pageSize = 12,
    } = options;

    const where = {
      active: true,
      OR: [
        { category },
        { secondaryCategory: category },
      ],
      ...(minPrice !== undefined && {
        minPricePerServingCents: { gte: minPrice },
      }),
      ...(maxPrice !== undefined && {
        maxPricePerServingCents: { lte: maxPrice },
      }),
      ...(minRating !== undefined && {
        averageRating: { gte: minRating },
      }),
      ...(dietaryTags?.length && {
        dietaryTags: {
          some: { tag: { in: dietaryTags } },
        },
      }),
    };

    const orderBy = {
      'rating': { averageRating: 'desc' as const },
      'price-asc': { minPricePerServingCents: 'asc' as const },
      'price-desc': { maxPricePerServingCents: 'desc' as const },
      'reviews': { reviewCount: 'desc' as const },
      'newest': { createdAt: 'desc' as const },
    }[sortBy];

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          dietaryTags: true,
          plans: {
            where: { active: true, featured: true },
            take: 1,
          },
        },
      }),
      prisma.provider.count({ where }),
    ]);

    return { providers, total, page, pageSize };
  }
);

// === Provider Detail ===
export const getProviderBySlug = cache(async (slug: string) => {
  return prisma.provider.findUnique({
    where: { slug },
    include: {
      plans: {
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      },
      dietaryTags: true,
      faqs: { orderBy: { sortOrder: 'asc' } },
      reviews: {
        where: { status: 'APPROVED' },
        orderBy: [{ helpful: 'desc' }, { createdAt: 'desc' }],
        take: 10,
      },
    },
  });
});

// === Comparison ===
export const getProvidersForComparison = cache(
  async (slugs: string[]) => {
    return prisma.provider.findMany({
      where: { slug: { in: slugs }, active: true },
      include: {
        plans: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
        dietaryTags: true,
      },
    });
  }
);

// === Homepage ===
export const getFeaturedProviders = cache(async () => {
  return prisma.provider.findMany({
    where: { active: true, featured: true },
    include: { dietaryTags: true },
    orderBy: { averageRating: 'desc' },
    take: 8,
  });
});

export const getCategoryCounts = cache(async () => {
  const counts = await prisma.provider.groupBy({
    by: ['category'],
    where: { active: true },
    _count: true,
  });
  return counts;
});

// === Search (basic LIKE for MVP, tsvector in Phase 80) ===
export const searchProviders = cache(async (query: string) => {
  return prisma.provider.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: { dietaryTags: true },
    take: 20,
  });
});

// === All Providers (for generateStaticParams, sitemap) ===
export const getAllProviderSlugs = cache(async () => {
  return prisma.provider.findMany({
    where: { active: true },
    select: { slug: true },
  });
});
```

### prisma.config.ts Update (Seed Command)
```typescript
// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",  // ADD THIS
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

## 18 Real Food Box Providers (Verified 2026 Data)

Research compiled from CNET, Yahoo Health, EverydayHealth, The Quality Edit, and provider websites (March 2026).

### Meal Kits (4 providers)

| Provider | Price/Serving (regular) | Cents | Dietary Options | Key Differentiator |
|----------|------------------------|-------|-----------------|-------------------|
| HelloFresh | $7.99 - $12.99 | 799-1299 | Vegetarian, Pescatarian, Low-Carb | Largest variety (60+ weekly recipes), beginner-friendly |
| Blue Apron | $7.49 - $12.89 | 749-1289 | Vegetarian, Wellness, Chef Favorites | A la carte ordering, premium ingredients |
| Home Chef | $7.99 - $10.99 | 799-1099 | Low-Carb, Vegetarian | Oven-ready and grill-ready options, Kroger availability |
| EveryPlate | $5.99 - $6.99 | 599-699 | Limited (general audience) | Budget-friendly, simple 5-ingredient recipes |

### Prepared Meals (4 providers)

| Provider | Price/Serving (regular) | Cents | Dietary Options | Key Differentiator |
|----------|------------------------|-------|-----------------|-------------------|
| Factor | $11.49 - $13.99 | 1149-1399 | Keto, Paleo, Vegan, Low-Carb | HelloFresh-owned, macro-tracked, fresh not frozen |
| CookUnity | $9.99 - $12.99 | 999-1299 | Vegan, Gluten-Free, Paleo | 200+ chef-crafted meals, restaurant-quality |
| Snap Kitchen | $10.99 - $14.67 | 1099-1467 | Keto, Whole30, High-Protein | Dietitian-designed, smaller portions noted |
| Mosaic Foods | $7.99 - $9.99 | 799-999 | Vegan, Gluten-Free | 100% plant-based frozen meals, budget-friendly prepared |

### Protein/Meat Boxes (3 providers)

| Provider | Price/Box (regular) | Cents | Key Details | Key Differentiator |
|----------|-------------------|-------|-------------|-------------------|
| ButcherBox | $146 - $306/box | 14600-30600 | 9-26 lbs, grass-fed/organic | All grass-fed beef, free-range chicken, heritage pork |
| Crowd Cow | Varies by item | ~1200-3500/lb | Individual cuts or bundles | Craft/artisan farms, Japanese wagyu, transparency |
| Good Chop | $149 - $269/box | 14900-26900 | 36-72 portions | American-sourced only, no antibiotics/hormones |

### Produce/Grocery Boxes (3 providers)

| Provider | Price Range | Cents | Key Details | Key Differentiator |
|----------|------------|-------|-------------|-------------------|
| Misfits Market | $30+ minimum | 3000+ | Organic produce, pantry items | Up to 30% less than grocery stores, rescued produce |
| Hungryroot | $8.99 - $12.99/serving | 899-1299 | Meal kits + groceries + prepared | AI-powered personalization, hybrid grocery/meal kit |
| Farmbox Direct | $42.95 - $52.95/box | 4295-5295 | Organic/natural produce | 100% organic option, small-farm sourced |

### Specialty Diet (4 providers)

| Provider | Price/Serving (regular) | Cents | Dietary Focus | Key Differentiator |
|----------|------------------------|-------|--------------|-------------------|
| Green Chef | $11.99 - $13.99 | 1199-1399 | Keto, Paleo, Gluten-Free, Mediterranean | USDA-certified organic produce, specialty diets |
| Sunbasket | $8.99 - $12.99 | 899-1299 | Paleo, Gluten-Free, Vegetarian, Mediterranean | Organic, sustainable sourcing, meal kits + prepared |
| Purple Carrot | $9.99 - $12.99 | 999-1299 | Vegan | 100% plant-based, creative recipes, meal kits + prepared |
| Trifecta | $12.99 - $15.99 | 1299-1599 | Keto, Paleo, Whole30, Vegan | Macro-balanced for athletes, organic, as seen on Netflix |

### Multi-Category Assignments

| Provider | Primary Category | Secondary Category | Rationale |
|----------|-----------------|-------------------|-----------|
| Hungryroot | PRODUCE_BOX | MEAL_KIT | Hybrid grocery/meal kit service |
| Sunbasket | SPECIALTY | MEAL_KIT | Specialty diets but also standard meal kits |
| Green Chef | SPECIALTY | MEAL_KIT | Specialty focus but functions as a meal kit |
| Purple Carrot | SPECIALTY | MEAL_KIT | Vegan specialty but delivers meal kits |

**Confidence:** MEDIUM -- Pricing verified from multiple sources dated December 2025 through March 2026. Prices change frequently; the `lastVerifiedAt` field documents when data was verified. All prices are REGULAR (non-promotional) pricing.

**Providers requiring special handling:**
- Freshly: Discontinued by HelloFresh (replaced by Snap Kitchen per PROJECT.md decision)
- Imperfect Foods: Merged into Misfits Market (replaced by Hungryroot + Farmbox Direct per PROJECT.md decision)

## Seed Data Quality Guidelines

Editorial content must pass these quality tests (from PITFALLS.md Pitfall #1):

1. **Specificity test:** Can you swap the description between two providers without anyone noticing? If yes, it's too generic.
2. **Opinion test:** Does the description contain a specific editorial judgment? "HelloFresh's recipe cards are beginner-friendly, but experienced cooks may find the instructions overly prescriptive" passes. "HelloFresh delivers fresh ingredients" fails.
3. **Pros uniqueness test:** Each provider's pros list must contain at least one item that could ONLY apply to that provider.
4. **Cons honesty test:** Every provider must have at least 2 genuine cons. If all providers have 4+ stars and only minor cons, the site lacks credibility.
5. **Review variation test:** Seeded reviews should have a mix of ratings (3, 4, 5 stars). Not all reviews should be glowing.

**Rating distribution for seed data:**
- 2 providers at 3.5 stars
- 5 providers at 3.8-4.0 stars
- 7 providers at 4.1-4.3 stars
- 4 providers at 4.4-4.7 stars

**Reviews per provider:** 3-7 approved reviews each with varied ratings. Total: ~80-100 seeded reviews.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (testing explicitly out of scope per STACK.md -- no jest/vitest in MVP) |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DB-01 | Schema deploys to Neon | smoke | `npx prisma db push --accept-data-loss` (verify exit code 0) | N/A |
| DB-02 | Seed populates 18 providers | smoke | `npx prisma db seed` then verify counts via script | Wave 0: seed verify script |
| DB-03 | Query functions return expected data | manual | Import and call each function, inspect results | No framework |
| DB-04 | Denormalized prices populated | manual | Query provider with price fields, verify non-null | No framework |

### Sampling Rate
- **Per task commit:** `npx prisma db push && npx prisma generate` (schema validity)
- **Per wave merge:** `npx tsx prisma/seed.ts` (full seed cycle)
- **Phase gate:** Seed completes without errors, query functions return data for all page types

### Wave 0 Gaps
- [ ] No test framework installed (intentionally -- per project decision, testing is post-MVP)
- [ ] Seed verification relies on console.log output counts, not automated assertions
- [ ] Query function testing is manual inspection only

*(Testing infrastructure is explicitly deferred per STACK.md "What NOT to Install" section. Phase 10 verification uses `prisma db push` exit code, seed script console output, and manual query inspection.)*

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Float` for prices | Integer cents or `Decimal` | Industry standard | Exact arithmetic, no serialization issues with RSC |
| `package.json` prisma.seed | `prisma.config.ts` seed field | Prisma 7.x | Must configure seed command in `prisma.config.ts`, not `package.json` |
| Auto-seed on `prisma migrate dev` | Explicit `npx prisma db seed` only | Prisma 7.x | Seeding never runs automatically; must be invoked explicitly |
| `useFormState` | `useActionState` | React 19 | Renamed in React 19 (relevant for future phases) |
| `middleware.ts` | `proxy.ts` | Next.js 16 | File renamed, different export name (relevant for Phase 100) |
| Prisma generated to `node_modules` | Prisma generated to `src/generated/prisma/` | Prisma 7.x | Already configured correctly in this project |

## Open Questions

1. **Protein box pricing model differs from per-serving**
   - What we know: ButcherBox, Crowd Cow, and Good Chop price per box/pound, not per serving. `pricePerServingCents` doesn't map cleanly.
   - What's unclear: Should we calculate an approximate per-serving equivalent, or leave `pricePerServingCents` null for protein boxes and only populate `pricePerBoxCents`?
   - Recommendation: Leave `pricePerServingCents` null for protein boxes. Use `pricePerBoxCents` as the primary comparison metric for that category. The filter price range only applies when `pricePerServingCents` is non-null. Display "from $X/box" instead of "$X/serving" for these providers.

2. **Produce box pricing similarly non-standard**
   - What we know: Misfits Market has a minimum order ($30+), Farmbox Direct prices per box ($42.95-$52.95), Hungryroot prices per serving.
   - What's unclear: Consistent pricing display across categories.
   - Recommendation: Each category page can display its natural pricing metric. The `pricePerServingCents` field is optional; use it where it makes sense. The filter sidebar should only show price range when the majority of providers in that category have per-serving pricing.

3. **Connection pooling verification**
   - What we know: `DATABASE_URL` uses `ep-...-pooler.c-5.us-east-1.aws.neon.tech` which is the Neon pooled endpoint.
   - What's unclear: Whether `?connection_limit=5` is set in the connection string.
   - Recommendation: Verify and add `?connection_limit=5` during Phase 10. Not critical for development but important before production traffic.

## Sources

### Primary (HIGH confidence)
- Prisma 7.5 seeding documentation (prisma.io/docs/orm/prisma-migrate/workflows/seeding) -- seed configuration via prisma.config.ts, explicit-only seeding
- Next.js 16 caching docs (local: `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`) -- React.cache(), unstable_cache, preloading patterns
- Prisma Decimal serialization issue (github.com/prisma/prisma/issues/9170, github.com/prisma/prisma/discussions/19983) -- confirmed Decimal.js objects break RSC serialization
- Build with Matija blog (buildwithmatija.com, January 2026) -- centralized Prisma Decimal serialization pattern for Next.js
- Project codebase: `prisma/schema.prisma`, `src/lib/db.ts`, `prisma.config.ts`, `.env` -- verified connection pooling, adapter setup, existing schema

### Secondary (MEDIUM confidence)
- CNET "Best Meal Kits of 2026" (March 2026) -- pricing for HelloFresh, Blue Apron, EveryPlate, Marley Spoon
- CNET "Blue Apron vs HelloFresh" (December 2025) -- per-serving pricing comparison
- Yahoo Health "EveryPlate 2026 Review" (January 2026) -- EveryPlate pricing at $5.99-$6.99/serving
- EverydayHealth "Snap Kitchen Review" (November 2024) -- Snap Kitchen at $10.99-$14.67/serving
- Factor pricing guides (January-February 2026) -- Factor at $11.49-$13.99/meal
- The Quality Edit "Good Chop vs ButcherBox" (March 2026) -- protein box pricing
- Crowd Cow vs ButcherBox comparison page (January 2026) -- protein box pricing
- The Good Trade "Organic Produce Delivery" (March 2026) -- Misfits Market and Farmbox Direct pricing

### Tertiary (LOW confidence)
- Glam Vegan "Purple Carrot vs Sun Basket vs Green Chef" (January 2025) -- specialty pricing (may be outdated)
- PCMag meal kit reviews (2020 base, pricing likely changed) -- EveryPlate/Dinnerly historical reference only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed and verified, only tsx and server-only needed
- Architecture: HIGH -- patterns verified against Next.js 16 local docs and Prisma 7 docs
- Schema changes: HIGH -- integer cents is industry standard, Decimal serialization issue is well-documented
- Provider data: MEDIUM -- pricing verified from multiple 2025-2026 sources but changes frequently
- Pitfalls: HIGH -- all pitfalls sourced from project's own PITFALLS.md and CONCERNS.md, cross-referenced with community reports

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (30 days -- stable domain, but provider pricing may shift)
