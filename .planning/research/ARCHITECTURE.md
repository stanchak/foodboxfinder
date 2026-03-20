# Architecture Patterns

**Domain:** Food box subscription discovery/comparison site
**Researched:** 2026-03-20
**Overall confidence:** HIGH (stack is decided, patterns verified against Next.js 16 docs)

## Recommended Architecture

A **hub-and-spoke content site** built on Next.js 16 App Router with Server Components as the rendering backbone. The central entity (Provider) radiates outward to category listings, detail pages, comparisons, collections, and blog content. All consumer-facing pages are Server Components that fetch data directly via Prisma. A thin Client Component layer handles interactive UI (filters, comparison tray, forms). An isolated admin subsystem manages content behind `proxy.ts` authentication.

### Architecture Diagram

```
                          +------------------+
                          |    proxy.ts      |  (admin auth gate)
                          +--------+---------+
                                   |
                    +--------------+--------------+
                    |                             |
            +-------+--------+           +-------+--------+
            |  Public Routes |           |  Admin Routes  |
            |  (Server Comp) |           |  (Admin Shell) |
            +-------+--------+           +-------+--------+
                    |                             |
          +---------+---------+                   |
          |         |         |                   |
    +-----+--+ +---+----+ +--+-----+     +------+------+
    |Homepage| |Category | |Provider|     |Admin CRUD   |
    |        | |Listing  | |Detail  |     |Server Actions|
    +--------+ +---+-----+ +--+-----+     +------+------+
                   |           |                  |
             +-----+-----+    |           +------+------+
             |FilterPanel | +--+-----+    |revalidatePath|
             |(Client)    | |Compare |    |revalidateTag |
             +-----------+  |Tool    |    +-------------+
                            +--------+
                    |           |
              +-----+-----------+-----+
              |    Query Layer         |
              |  src/lib/queries.ts    |
              +----------+------------+
                         |
              +----------+------------+
              |    Prisma Client      |
              |    src/lib/db.ts      |
              +----------+------------+
                         |
              +----------+------------+
              |  Neon PostgreSQL      |
              |  (10 models, 5 enums)|
              +-----------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Render Type |
|-----------|---------------|-------------------|-------------|
| **Root Layout** | HTML shell, fonts, global CSS, nav, footer | All pages (wraps everything) | Server Component |
| **Homepage** | Hero, featured providers, category cards, social proof | Query Layer (getFeaturedProviders, getCategories) | Server Component |
| **Category Listing** | Provider cards, filter/sort, pagination for one category | Query Layer (getProvidersByCategory), FilterPanel | Server Component (page) + Client (filters) |
| **Provider Detail** | Full provider profile, plans, reviews, FAQs, affiliate CTA | Query Layer (getProviderBySlug, getRelatedProviders) | Server Component |
| **Comparison Tool** | Side-by-side provider comparison table | Query Layer (getProvidersBySlug[]), ComparisonTray | Server Component (page) + Client (tray) |
| **Collections/Best-Of** | Curated ranked lists with editorial content | Query Layer (getCollectionBySlug) | Server Component |
| **Blog** | Blog index and post pages | Query Layer (getBlogPosts, getBlogPostBySlug) | Server Component |
| **Search** | Full-text search results grouped by type | Query Layer (search), SearchBar Client Component | Server Component (results) + Client (input) |
| **Review Form** | Star rating, text inputs, submission | Server Action (submitReview) | Client Component |
| **Admin Shell** | Admin layout, sidebar nav, dashboard stats | Query Layer (admin queries), Server Actions | Server + Client mix |
| **FilterPanel** | Dietary tag checkboxes, price range, sort dropdown | URL searchParams via router.push | Client Component |
| **ComparisonTray** | Floating bottom bar with selected providers | React context/state, URL params | Client Component |
| **SearchBar** | Expandable search input in header | URL navigation to /search?q= | Client Component |
| **AffiliateTracker** | API route that logs click and redirects | AffiliateClick model, provider affiliateUrl | Route Handler (API) |
| **proxy.ts** | Admin route protection | ADMIN_SECRET env var, request headers | Node.js runtime |
| **Query Layer** | All Prisma queries, centralized data access | Prisma Client singleton | Server-only module |

### Boundary Rules

1. **Server Components never import from Client Components.** Data flows down: Server Components fetch data and pass it as props to Client Components.
2. **Client Components never import Prisma.** The `src/lib/db.ts` and `src/lib/queries.ts` modules are server-only. Client Components receive data as props or interact via Server Actions/URL params.
3. **The Query Layer is the only code that touches Prisma.** Pages, layouts, and Server Actions all call query functions rather than using `prisma` directly. This provides a single place to add caching, logging, or query optimization.
4. **URL searchParams are the shared state contract between Server and Client Components.** FilterPanel (Client) writes to the URL; the Category page (Server) reads from the URL. No global state store needed.
5. **Admin routes are a separate subtree.** Everything under `/admin` is protected by `proxy.ts` and has its own layout. Admin never leaks into public UI.

## Data Flow

### Primary Flow: Server-Rendered Content Page

```
Browser Request (e.g., /meal-kits?diet=vegan&sort=rating)
  |
  v
Next.js Router --> matches src/app/[category]/page.tsx
  |
  v
Server Component: await params --> { category: "meal-kits" }
Server Component: await searchParams --> { diet: "vegan", sort: "rating" }
  |
  v
Query Layer: getProvidersByCategory("meal-kits", { diet: "vegan", sort: "rating" })
  |
  v
Prisma Client --> SQL query to Neon PostgreSQL
  |
  v
Server Component receives typed Provider[] array
  |
  v
Renders: page metadata (generateMetadata), JSON-LD, ProviderCard list
Passes filter state as props to FilterPanel (Client Component)
  |
  v
HTML streamed to browser
FilterPanel hydrates for interactivity
```

### Filter/Sort Interaction (URL-Driven State)

```
User clicks "Vegan" checkbox in FilterPanel (Client Component)
  |
  v
FilterPanel calls router.push("/meal-kits?diet=vegan&sort=rating")
  |
  v
Next.js soft navigation --> Server re-renders [category]/page.tsx
  |
  v
Server Component awaits new searchParams, calls query with new filters
  |
  v
Streaming response replaces page content (React reconciliation)
FilterPanel maintains its visual state (checkbox stays checked)
```

**Why URL state, not React state:** Every filter combination is a unique URL that can be shared, bookmarked, and indexed by search engines. The server always has the authoritative filter state, so there is no client/server state sync problem. This is the standard pattern for e-commerce and comparison sites.

### Comparison Flow (Client + Server Hybrid)

```
User clicks "Compare" checkbox on ProviderCard
  |
  v
ComparisonTray (Client Component, persists in layout)
  --> adds provider slug to internal React state (max 4)
  --> renders floating bottom bar showing selected providers
  |
  v
User clicks "Compare Now" button on ComparisonTray
  |
  v
ComparisonTray navigates to /compare?providers=slug1,slug2
  |
  v
compare/page.tsx (Server Component) reads searchParams
  --> fetches full provider data for comparison table
  --> renders side-by-side comparison grid
```

**Comparison state persistence:** The ComparisonTray lives in the root layout so it persists across navigations. When the user navigates to the comparison page, the state transfers to URL params (becoming shareable). For SEO comparison pages (`/compare/slug-vs-slug`), the state is entirely in the URL.

### Review Submission Flow (Server Action)

```
User fills review form on /providers/[slug]
  |
  v
ReviewForm (Client Component) with "use client"
  --> Star rating input, name, email, title, body fields
  --> form action={submitReview} (Server Action)
  |
  v
submitReview (Server Action, "use server")
  --> validates all fields (rating 1-5, required fields)
  --> prisma.review.create({ status: PENDING })
  --> returns { success: true } or { success: false, errors: [...] }
  |
  v
ReviewForm shows success toast or inline error messages
(Review does NOT appear yet -- requires admin approval)
```

### Affiliate Click Tracking Flow

```
User clicks "Visit [Provider]" CTA on any page
  |
  v
Link points to /api/track/[providerId] (Route Handler)
  |
  v
Route Handler:
  --> prisma.affiliateClick.create({
        providerId, source: referer header, userAgent, ipHash
      })
  --> return NextResponse.redirect(provider.affiliateUrl)
  |
  v
User lands on provider's external website
```

### Admin Mutation Flow (On-Demand Revalidation)

```
Admin edits a provider in /admin/providers
  |
  v
Admin form calls Server Action (e.g., updateProvider)
  |
  v
Server Action:
  --> validates input
  --> prisma.provider.update(...)
  --> revalidatePath(`/providers/${slug}`)     // detail page
  --> revalidatePath(`/${categorySlug}`)        // category listing
  --> revalidatePath('/')                       // homepage (if featured)
  --> returns { success: true }
  |
  v
Admin sees success feedback
Public pages regenerate on next request with fresh data
```

## Patterns to Follow

### Pattern 1: Query Layer with React Cache Deduplication

**What:** Wrap all Prisma queries in `React.cache()` to deduplicate within a single render pass. Multiple components requesting the same provider data in one page render hit the database only once.

**When:** Always, for all query functions.

**Example:**
```typescript
// src/lib/queries.ts
import { cache } from "react";
import { prisma } from "@/lib/db";

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

**Why:** Both `generateMetadata()` and the page component may need the same provider data. `React.cache()` ensures Prisma is called once per render, not twice.

**Confidence:** HIGH -- verified in Next.js 16 docs (`caching-without-cache-components.md` section on deduplicating requests).

### Pattern 2: Slug-to-Enum Mapping Utility

**What:** A bidirectional mapping between URL slugs and Prisma `CategoryType` enums, centralized in one utility file.

**When:** Every category page load, every category link render, every query involving categories.

**Example:**
```typescript
// src/lib/categories.ts
import { CategoryType } from "@/generated/prisma/enums";

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
```

**Why:** Category is an enum (not a model) for simplicity with only 5 values. The mapping must be consistent everywhere -- URL routing, navigation, queries, display. Centralizing it prevents scattered string literals.

### Pattern 3: SearchParams Parsing and Validation

**What:** A utility that parses and validates URL search params into a typed filter object, with safe defaults for invalid values.

**When:** Every listing page (category, search, comparison).

**Example:**
```typescript
// src/lib/filters.ts
import { DietaryTag } from "@/generated/prisma/enums";

export interface ProviderFilters {
  diet: DietaryTag[];
  sort: "rating" | "price-asc" | "price-desc" | "reviews" | "newest";
  page: number;
  perPage: number;
}

export function parseSearchParams(
  params: Record<string, string | string[] | undefined>
): ProviderFilters {
  const diet = (params.diet?.toString().split(",") ?? [])
    .filter((d): d is DietaryTag => Object.values(DietaryTag).includes(d as DietaryTag));

  const validSorts = ["rating", "price-asc", "price-desc", "reviews", "newest"] as const;
  const sort = validSorts.includes(params.sort as any)
    ? (params.sort as ProviderFilters["sort"])
    : "rating";

  const page = Math.max(1, parseInt(params.page?.toString() ?? "1", 10) || 1);

  return { diet, sort, page, perPage: 12 };
}
```

**Why:** Search params are untrusted user input. Parsing them once into a typed object prevents bugs from invalid values leaking into queries. The server is the authority on what filter values are valid.

### Pattern 4: Granular Suspense Boundaries on Detail Pages

**What:** Use nested `<Suspense>` boundaries to stream provider detail pages progressively: header and core info first, reviews and FAQ later.

**When:** Provider detail pages and any page with multiple data sections of varying query cost.

**Example:**
```typescript
// src/app/providers/[slug]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProviderBySlug } from "@/lib/queries";

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound(); // Real 404 before any Suspense

  return (
    <article>
      <ProviderHeader provider={provider} />
      <ProviderPlans plans={provider.plans} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProviderReviews providerId={provider.id} />
      </Suspense>
      <Suspense fallback={<FaqSkeleton />}>
        <ProviderFaqs faqs={provider.faqs} />
      </Suspense>
    </article>
  );
}
```

**Why:** The `notFound()` call before any Suspense boundary ensures a real HTTP 404 status code. The header and pricing render immediately (part of the static shell). Reviews (potentially many) stream in after, keeping LCP fast.

**Confidence:** HIGH -- verified in Next.js 16 streaming docs (the HTTP contract section explicitly recommends this pattern).

### Pattern 5: JSON-LD as Server Component Output

**What:** Render JSON-LD structured data as a `<script type="application/ld+json">` tag directly in Server Components, using `JSON.stringify` with XSS sanitization.

**When:** Every public page.

**Example:**
```typescript
function ProviderJsonLd({ provider }: { provider: ProviderWithRelations }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: provider.name,
    description: provider.shortDescription ?? provider.description,
    image: provider.logoUrl,
    aggregateRating: provider.reviewCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: provider.averageRating,
      reviewCount: provider.reviewCount,
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
```

**Why:** JSON-LD must be in the initial HTML for search engines. Server Components guarantee it is there. The `.replace(/</g, "\\u003c")` prevents XSS via script injection in user-provided strings (like provider names).

**Confidence:** HIGH -- pattern directly from Next.js 16 JSON-LD guide.

### Pattern 6: On-Demand Revalidation from Admin Actions

**What:** When admin creates/updates/deletes content, call `revalidatePath()` for all affected routes so public pages reflect changes on the next request.

**When:** Every admin mutation Server Action.

**Example:**
```typescript
// src/app/actions/admin.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { CATEGORY_ENUM_MAP } from "@/lib/categories";

export async function updateProvider(id: string, data: ProviderUpdateInput) {
  const provider = await prisma.provider.update({
    where: { id },
    data,
  });

  // Revalidate all pages that display this provider
  revalidatePath(`/providers/${provider.slug}`);
  revalidatePath(`/${CATEGORY_ENUM_MAP[provider.category]}`);
  revalidatePath("/"); // homepage may show featured

  return { success: true };
}
```

**Why:** Since data is editorial (updated infrequently by admins), on-demand revalidation is more appropriate than time-based ISR. Pages stay cached until explicitly invalidated, giving excellent performance while ensuring freshness after edits.

**Confidence:** HIGH -- `revalidatePath` is the documented approach for Prisma/ORM-based apps in Next.js 16.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Fetching Data in Client Components

**What:** Using `useEffect` + `fetch` to load provider data in Client Components.
**Why bad:** Causes waterfall requests, loses SEO (data not in initial HTML), adds loading spinners to content that should render instantly on the server.
**Instead:** Fetch all data in Server Components via the Query Layer. Pass results as props to Client Components that need to display data.

### Anti-Pattern 2: Global State for Filters

**What:** Using React Context, Zustand, or Redux to manage filter state across category pages.
**Why bad:** Filter state becomes invisible to the server, loses URL shareability, breaks SEO for filtered pages, adds unnecessary client JS.
**Instead:** URL search params are the filter state. Client Components read/write URL params. Server Components read URL params and query accordingly.

### Anti-Pattern 3: Awaiting params/searchParams at Layout Level

**What:** Destructuring `await params` or `await searchParams` in a layout component.
**Why bad:** Makes the entire layout dynamic, preventing the static shell (header, nav, footer) from streaming instantly. Every page under that layout becomes slower.
**Instead:** Pass the params/searchParams promise down to the component that actually needs it, inside a Suspense boundary. The layout renders as part of the static shell.

**Confidence:** HIGH -- explicitly documented in Next.js 16 streaming guide ("Push dynamic access down" section).

### Anti-Pattern 4: Direct Prisma Calls in Page Components

**What:** Importing `prisma` directly in `page.tsx` files and writing inline queries.
**Why bad:** Duplicates query logic across pages (category listing, homepage featured, comparison tool all need similar provider queries). Makes it impossible to add caching, logging, or optimization in one place.
**Instead:** All Prisma queries go through `src/lib/queries.ts`. Pages call named functions like `getProvidersByCategory()`.

### Anti-Pattern 5: Heavy Client Components for Static Content

**What:** Making the comparison table or pricing table a Client Component because it "might need interactivity."
**Why bad:** Sends unnecessary JavaScript to the browser. Most of the comparison table is static rendered data.
**Instead:** Render the comparison table as a Server Component. Only wrap interactive elements (e.g., "remove from comparison" button, tab switcher) in Client Components.

## Scalability Considerations

| Concern | At 20 providers (launch) | At 100 providers | At 500+ providers |
|---------|--------------------------|------------------|-------------------|
| **Query performance** | Trivial. No optimization needed. | Add composite indexes (`[category, active, averageRating]`). | Consider Prisma query caching or materialized views for listing pages. |
| **Build time** | < 30 seconds. generateStaticParams for all providers. | Still fast (< 2 min). Static generation scales linearly with provider count. | Consider on-demand generation only (`dynamicParams: true` without generateStaticParams). |
| **Comparison pages** | Pre-generate top 20 SEO comparison combos. | Combinations grow quadratically (n*(n-1)/2). Only pre-generate high-traffic pairs. | SEO comparisons must be curated (editorial picks), not generated for all pairs. |
| **Search** | PostgreSQL `ILIKE` is sufficient. | PostgreSQL full-text search (`tsvector`). | Consider external search (Algolia, Typesense) if PG full-text becomes slow. |
| **Image loading** | Next.js Image with remotePatterns. | Same. CDN handles caching. | Consider image proxy/resize service if providers have inconsistent image sizes. |
| **Admin operations** | Direct Prisma mutations. | Same. Add pagination to admin lists. | Add search/filter to admin lists, batch operations. |

## File Structure (Target State)

```
src/
  app/
    layout.tsx                        # Root layout: HTML, fonts, nav, footer
    page.tsx                          # Homepage
    [category]/
      page.tsx                        # Category listing (Server Component)
      loading.tsx                     # Category listing skeleton
    providers/
      [slug]/
        page.tsx                      # Provider detail (Server Component)
        loading.tsx                   # Provider detail skeleton
    compare/
      page.tsx                        # Flexible comparison (?providers=a,b,c)
      [slugs]/
        page.tsx                      # SEO comparison (slug-vs-slug)
    best/
      [slug]/
        page.tsx                      # Collection/best-of page
    blog/
      page.tsx                        # Blog index
      [slug]/
        page.tsx                      # Blog post
    methodology/
      page.tsx                        # E-E-A-T methodology page
    search/
      page.tsx                        # Search results
    admin/
      layout.tsx                      # Admin layout with sidebar
      page.tsx                        # Dashboard
      providers/
        page.tsx                      # Provider list
        [id]/
          page.tsx                    # Provider edit form
        new/
          page.tsx                    # Provider create form
      content/
        page.tsx                      # Blog & collection management
    actions/
      reviews.ts                      # submitReview Server Action
      admin.ts                        # Admin CRUD Server Actions
    api/
      track/
        [providerId]/
          route.ts                    # Affiliate click tracking
    error.tsx                         # Global error boundary
    not-found.tsx                     # Global 404 page
    sitemap.ts                        # Dynamic sitemap generation
    robots.ts                         # robots.txt generation
  components/
    ProviderCard.tsx                   # Provider card for listings
    ComparisonTable.tsx               # Side-by-side comparison grid
    ComparisonTray.tsx                # "use client" floating bar
    FilterPanel.tsx                   # "use client" filter sidebar/drawer
    SearchBar.tsx                     # "use client" expandable search
    ReviewForm.tsx                    # "use client" review submission
    RatingStars.tsx                   # Star display (Server) + input (Client variant)
    PricingTable.tsx                  # Provider plan comparison
    FaqAccordion.tsx                  # Collapsible FAQ with JSON-LD
    BreadcrumbNav.tsx                 # Breadcrumb navigation
    JsonLd.tsx                        # Reusable JSON-LD helper
    ui/                               # Base UI primitives
      Button.tsx
      Card.tsx
      Badge.tsx
      Input.tsx
      Select.tsx
      Skeleton.tsx
  lib/
    db.ts                             # Prisma client singleton (exists)
    queries.ts                        # All query functions (server-only)
    categories.ts                     # Slug <-> enum mapping
    filters.ts                        # SearchParams parser
    utils.ts                          # Shared utilities (formatPrice, etc.)
  generated/
    prisma/                           # Auto-generated Prisma client (exists)
  proxy.ts                            # Admin auth gate (Next.js 16)
prisma/
  schema.prisma                       # Database schema (exists)
  seed.ts                             # Seed script
```

## Suggested Build Order (Dependencies)

The architecture has clear dependency layers that dictate build order:

### Layer 0: Data Foundation (Phase 10)
**Must build first.** Everything depends on having data.
- Prisma schema (exists) --> seed script --> query functions
- No pages can be built without query functions returning real data

### Layer 1: Layout Shell (Phase 20)
**Depends on:** Layer 0 (category data for nav)
- Root layout, header, footer, navigation
- Base UI components (Button, Card, Badge, etc.)
- These are reused by every subsequent page

### Layer 2: Core Content Pages (Phases 30-50)
**Depends on:** Layer 0 (queries), Layer 1 (layout, components)
- Homepage (Phase 30): uses featured providers query + category data
- Category Listings (Phase 40): uses filtered provider query + FilterPanel
- Provider Detail (Phase 50): uses provider-by-slug query + all sub-components

**Phase 40 must come before Phase 50** because ProviderCard (built in Phase 40) is reused on detail pages for "related providers."

### Layer 3: Cross-Cutting Features (Phases 60-70)
**Depends on:** Layer 2 (provider pages must exist)
- Comparison Tool (Phase 60): needs ProviderCard, provider queries
- Collections & Blog (Phase 70): needs provider queries, ProviderCard

### Layer 4: Interactive Features (Phases 80-90)
**Depends on:** Layer 2 (pages where search/reviews appear)
- Search (Phase 80): needs all content types to exist for indexing
- Reviews (Phase 90): needs provider detail page to host the form

### Layer 5: Admin & Infrastructure (Phases 100-120)
**Depends on:** Layers 0-4 (admin manages all content types)
- Admin Dashboard (Phase 100): needs all models to have CRUD
- SEO Optimization (Phase 110): needs all public pages to exist
- Affiliate Tracking & Polish (Phase 120): needs provider detail pages, admin dashboard

### Critical Path

```
Schema/Seed --> Layout Shell --> Category Pages --> Provider Detail
     |                |               |                  |
     |                |               +-> Comparison --> Collections
     |                |               +-> Search
     |                |
     |                +-> Homepage
     |
     +-> Query Layer (unblocks everything)
```

The **query layer** (`src/lib/queries.ts`) is the single most critical dependency. Building it thoroughly in Phase 10 unblocks all subsequent phases. If queries are incomplete, every page phase will be blocked by "need to add another query function."

## Caching Strategy

For a content site with editorial data (updated infrequently by admins), the optimal approach is:

| Page Type | Strategy | Revalidation Trigger |
|-----------|----------|---------------------|
| Homepage | `revalidate = 3600` (1 hour) + on-demand when admin updates featured | `revalidatePath("/")` from admin actions |
| Category Listing | `revalidate = 3600` + on-demand | `revalidatePath("/${category}")` from admin actions |
| Provider Detail | `generateStaticParams` + on-demand | `revalidatePath("/providers/${slug}")` from admin actions |
| Collection/Best-Of | `generateStaticParams` + on-demand | `revalidatePath("/best/${slug}")` from admin actions |
| Blog Post | `generateStaticParams` + on-demand | `revalidatePath("/blog/${slug}")` from admin actions |
| SEO Comparison | `generateStaticParams` + on-demand | `revalidatePath("/compare/${slugs}")` from admin actions |
| Flexible Comparison | Dynamic (noindex, unique per request) | No caching needed |
| Search | Dynamic (depends on query) | No caching needed |
| Admin pages | Dynamic (always fresh) | No caching needed |

**Key insight:** Since all content is managed by admins (no user-generated content is visible without approval), pages can be aggressively cached and only revalidated when admins make changes. This gives near-static-site performance with full dynamic capabilities.

## Sources

- Next.js 16 docs: `node_modules/next/dist/docs/01-app/02-guides/streaming.md` -- streaming, Suspense patterns, HTTP contract
- Next.js 16 docs: `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` -- React.cache(), unstable_cache, revalidation
- Next.js 16 docs: `node_modules/next/dist/docs/01-app/02-guides/incremental-static-regeneration.md` -- ISR patterns, generateStaticParams
- Next.js 16 docs: `node_modules/next/dist/docs/01-app/02-guides/json-ld.md` -- JSON-LD implementation
- Next.js 16 docs: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` -- proxy.ts for admin auth
- Prisma schema: `prisma/schema.prisma` -- 10 models, 5 enums, index definitions
- Project spec: `.planning/PROJECT.md` -- URL structure, constraints, decisions
- UX strategy: `.planning/research/UX-STRATEGY.md` -- component hierarchy, layout strategy
- SEO strategy: `.planning/research/SEO-STRATEGY.md` -- JSON-LD schemas, URL patterns

---

*Architecture research: 2026-03-20*
