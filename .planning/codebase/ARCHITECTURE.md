# Architecture

**Analysis Date:** 2026-03-20

## Pattern Overview

**Overall:** Hub-and-spoke content site built on Next.js 16 App Router with Server Components as the rendering backbone

**Key Characteristics:**
- Server Components by default; Client Components only for interactive UI (filters, forms, comparison tray, search bar)
- Central entity is `Provider`, which radiates to category listings, detail pages, comparisons, collections, and blog content
- All consumer-facing data fetching happens server-side via Prisma through a centralized query layer
- URL search params are the shared state contract between Server and Client Components (no global state store)
- Admin subsystem is isolated under `/admin` and protected by `proxy.ts` authentication
- On-demand revalidation from admin mutations keeps pages cached but fresh
- SEO-first: every public page requires metadata exports and JSON-LD structured data

**Current State:** Scaffolded via `create-next-app`. Only the default homepage (`src/app/page.tsx`) and root layout (`src/app/layout.tsx`) exist. The Prisma schema defines 10 models and 5 enums but no application routes, components, query helpers, or seed data have been built. The project follows a 12-phase roadmap (Phases 10-120) defined in `.planning/ROADMAP.md`.

## Layers

**Presentation Layer (Pages & Layouts):**
- Purpose: Render HTML via Server Components, define routes and metadata, export JSON-LD structured data
- Location: `src/app/`
- Contains: Page components (`page.tsx`), layouts (`layout.tsx`), loading states (`loading.tsx`), error boundaries (`error.tsx`), not-found pages (`not-found.tsx`)
- Depends on: Query Layer for data, Component Layer for UI
- Used by: Next.js router (browser requests)
- Rule: All pages are Server Components. Always `await params` and `await searchParams` (Promises in Next.js 16). Always export `metadata` or `generateMetadata()`.

**Component Layer:**
- Purpose: Reusable UI building blocks, both Server and Client Components
- Location: `src/components/` (planned, does not exist yet)
- Contains: Domain components (ProviderCard, ComparisonTable, FilterPanel) and UI primitives in `ui/` subdirectory (Button, Card, Badge, Input, Select, Skeleton)
- Depends on: Tailwind CSS 4 for styling, props from Presentation Layer
- Used by: Pages and layouts in `src/app/`
- Rule: Flat structure unless a component group needs isolation. Server Components by default; add `"use client"` only when browser APIs, event handlers, or React hooks are needed.

**Interactive Layer (Client Components):**
- Purpose: Handle browser interactivity requiring state, effects, or event handlers
- Location: `src/components/` (files with `"use client"` directive)
- Contains: FilterPanel (URL-driven filters), ComparisonTray (floating bar), SearchBar (expandable input), ReviewForm (star rating + text), mobile navigation
- Depends on: URL search params (for filter state), props from Server Components
- Used by: Composed as children of Server Components
- Rule: NEVER import Prisma or `@/lib/db`. NEVER fetch data directly. Receive all data as props or interact via Server Actions and URL params.

**Query Layer (planned):**
- Purpose: All database queries, centralized data access, React.cache() deduplication
- Location: `src/lib/queries.ts` (single file for MVP, split when exceeding 300 lines)
- Contains: ~20 named async functions for every data need (listings, detail, comparison, search, admin stats)
- Depends on: Database Layer (Prisma Client via `src/lib/db.ts`)
- Used by: Server Components in Presentation Layer, Server Actions
- Rule: Wrap all functions in `React.cache()` for request-level deduplication. Export named functions. Use Prisma's type-safe API (no raw SQL in MVP). All functions are `async`.

**Database Layer:**
- Purpose: Type-safe database client with connection pooling via Neon adapter
- Location: `src/lib/db.ts` (singleton), `prisma/schema.prisma` (schema definition)
- Contains: PrismaClient instance configured with `@prisma/adapter-pg` (PrismaPg) for Neon PostgreSQL
- Depends on: `DATABASE_URL` environment variable, generated types in `src/generated/prisma/`
- Used by: Query Layer exclusively (never imported directly in pages or client components)
- Rule: Always import `prisma` from `@/lib/db`. Never instantiate PrismaClient elsewhere. Singleton cached on `globalThis` in development to survive HMR.

**Server Actions (planned):**
- Purpose: Handle mutations (review submission, admin CRUD) with validation
- Location: `src/app/actions/` for global actions, or colocated with forms
- Contains: `"use server"` functions for form submissions and admin operations
- Depends on: Database Layer, Query Layer for reads, validation logic
- Used by: Client Components via `action={serverAction}` on forms
- Rule: Mark with `"use server"` directive. Return `{ success: boolean, errors?: Record<string, string[]> }` -- never throw exceptions to the client. Call `revalidatePath()` after mutations.

**Authentication Layer (planned):**
- Purpose: Protect admin routes from unauthorized access
- Location: `src/proxy.ts` (Next.js 16 replaces `middleware.ts` with `proxy.ts`)
- Contains: Request interception checking `ADMIN_SECRET` env var against request headers/cookies
- Depends on: `ADMIN_SECRET` environment variable
- Used by: Next.js runtime (intercepts all requests; gates `/admin/*` routes)
- Rule: Uses Node.js runtime only (NOT Edge). Export `proxy` function (NOT `middleware`).

**Utility Layer:**
- Purpose: Shared helpers, type mappings, filter parsing, formatting
- Location: `src/lib/`
- Contains: `categories.ts` (slug-to-enum bidirectional mapping), `filters.ts` (searchParams parser with validation), `utils.ts` (formatPrice, etc.)
- Depends on: Generated Prisma enums from `@/generated/prisma/enums`
- Used by: All server-side layers

**Generated Layer:**
- Purpose: Auto-generated TypeScript types and Prisma client runtime
- Location: `src/generated/prisma/`
- Contains: PrismaClient class (`client.ts`), model types (`models.ts`), enum types (`enums.ts`), input types (`commonInputTypes.ts`), internal runtime (`internal/`)
- Generated by: `npx prisma generate` (output configured in `prisma/schema.prisma` line 6-7)
- Rule: Never edit directly. Regenerate after any `prisma/schema.prisma` change. Gitignored.

## Data Flow

**Primary Flow: Server-Rendered Content Page**

1. Browser requests URL (e.g., `/meal-kits?diet=vegan&sort=rating`)
2. Next.js router matches `src/app/[category]/page.tsx`
3. Server Component awaits `params` -> `{ category: "meal-kits" }` and `searchParams` -> `{ diet: "vegan", sort: "rating" }` (both are Promises in Next.js 16)
4. Utility function maps URL slug to `CategoryType` enum via `src/lib/categories.ts`
5. Filter parser validates `searchParams` into typed filter object via `src/lib/filters.ts`
6. Page calls Query Layer function (e.g., `getProvidersByCategory()`) with parsed category and filters
7. Query Layer executes Prisma query against Neon PostgreSQL
8. Server Component renders HTML with data, generates metadata via `generateMetadata()`, and outputs JSON-LD `<script>` tag
9. Filter state passed as props to FilterPanel (Client Component)
10. HTML streamed to browser; Client Components hydrate for interactivity

**Filter/Sort Interaction (URL-Driven State):**

1. User clicks filter checkbox or selects sort option in FilterPanel (Client Component)
2. FilterPanel calls `router.push()` with updated URL search params (e.g., `/meal-kits?diet=vegan,keto&sort=price-asc`)
3. Next.js soft navigation triggers server re-render of `[category]/page.tsx`
4. Server Component awaits new `searchParams`, parses filters, queries with new values
5. Streaming response replaces page content via React reconciliation (no full page reload)
6. FilterPanel maintains visual state (checkboxes stay checked via URL params)

**Form Submission (Server Actions):**

1. User fills form in Client Component (e.g., ReviewForm on provider detail page)
2. Client Component calls Server Action via `action={submitReview}`
3. Server Action validates all fields (rating 1-5, required fields, sanitization)
4. Server Action executes Prisma mutation (e.g., `prisma.review.create({ status: PENDING })`)
5. Server Action returns `{ success: true }` or `{ success: false, errors: [...] }`
6. Client Component shows success toast or inline error messages
7. Review does NOT appear publicly until admin approval

**Affiliate Click Tracking:**

1. User clicks "Visit Provider" CTA on any page
2. Link routes to `/api/track/[providerId]` (Route Handler)
3. Route Handler creates `AffiliateClick` record (providerId, source page from referer header, userAgent, ipHash)
4. Route Handler returns `NextResponse.redirect(provider.affiliateUrl)`
5. User lands on provider's external website

**Admin Mutation with Revalidation:**

1. Admin submits form in `/admin/*` page
2. Form calls Server Action (e.g., `updateProvider()`)
3. Server Action validates input, executes Prisma mutation
4. Server Action calls `revalidatePath()` for all affected public routes:
   - `revalidatePath('/providers/${slug}')` (detail page)
   - `revalidatePath('/${categorySlug}')` (category listing)
   - `revalidatePath('/')` (homepage, if featured)
5. Admin sees success feedback; public pages regenerate on next request

**State Management:**
- No global state library (no Redux, Zustand, or Context for application data)
- URL search params are the single source of truth for filter/sort state on listing pages
- Comparison selection uses React state in a layout-level Client Component (ComparisonTray), transfers to URL params when navigating to comparison page
- Server Actions return structured result objects for form state management via `useActionState` (React 19)

## Key Abstractions

**Provider (Central Entity):**
- Purpose: Represents a food box subscription service; the hub of all consumer-facing content
- Schema: `prisma/schema.prisma` lines 63-112
- Relations: has many Plans, ProviderDietaryTags, Reviews, ProviderFaqs, AffiliateClicks, CollectionItems
- Pattern: Denormalized fields (`averageRating`, `reviewCount`, planned: `minPricePerServing`, `maxPricePerServing`, `freeShipping`) for listing query performance. Slug is the canonical URL identifier.

**CategoryType (Enum, not Model):**
- Purpose: Classifies providers into 5 fixed categories
- Schema: `prisma/schema.prisma` lines 15-21
- Values: MEAL_KIT, PREPARED_MEAL, PROTEIN_BOX, PRODUCE_BOX, SPECIALTY
- Pattern: Mapped to URL slugs via bidirectional utility in `src/lib/categories.ts`: `"meal-kits"` <-> `CategoryType.MEAL_KIT`. Only 5 values, so an enum is simpler than a model.

**Plan (Pricing Tier):**
- Purpose: Represents a specific subscription plan within a provider
- Schema: `prisma/schema.prisma` lines 114-149
- Pattern: Multiple plans per provider; `sortOrder` for display ordering; `pricePerServing` as primary comparison metric; includes flexibility data (`canSkip`, `canCancel`, `cancelPolicy`)

**Collection (Curated Editorial List):**
- Purpose: "Best of" content grouping providers with ranked order and editorial notes
- Schema: `prisma/schema.prisma` lines 223-258
- Pattern: Many-to-many with Provider through CollectionItem join model (with `sortOrder` and editorial `note` per item)

**Query Layer Functions (planned, `src/lib/queries.ts`):**
- Purpose: Named, typed, cached query functions as the sole interface to the database
- Pattern: All wrapped in `React.cache()` for deduplication within a single render pass (prevents duplicate Prisma calls when both `generateMetadata()` and page component need the same data)
- Example functions: `getFeaturedProviders()`, `getProviderBySlug()`, `getProvidersByCategory()`, `getProvidersBySlugs()`, `searchProviders()`, `getAdminStats()`

**URL SearchParams Parser (planned, `src/lib/filters.ts`):**
- Purpose: Parse untrusted URL search params into typed, validated filter objects with safe defaults
- Pattern: Returns typed `ProviderFilters` object; invalid values silently fall back to defaults; server is the authority on valid filter values

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page request (wraps all routes)
- Responsibilities: HTML shell (`<html>`, `<body>`), Geist Sans and Geist Mono font loading via `next/font/google`, global CSS import (`globals.css`), antialiased text, flex column body for sticky footer pattern

**Homepage:**
- Location: `src/app/page.tsx`
- Triggers: Request to `/`
- Responsibilities: Currently renders default Next.js create-next-app template. Will become homepage with hero section, featured providers, category cards, social proof, WebSite/Organization JSON-LD.

**Database Client Singleton:**
- Location: `src/lib/db.ts`
- Triggers: First import in any server-side module
- Responsibilities: Creates and caches PrismaClient with `PrismaPg` adapter connected to Neon via `DATABASE_URL`. Cached on `globalThis` in development to survive hot module replacement.

**Build Script:**
- Location: `package.json` `"build"` script
- Command: `prisma generate && next build`
- Ensures Prisma client is regenerated before every production build

**Proxy (planned):**
- Location: `src/proxy.ts`
- Triggers: All incoming requests (Next.js 16 request interception)
- Responsibilities: Check `ADMIN_SECRET` for `/admin/*` routes; pass through all other requests. Node.js runtime only.

## Error Handling

**Strategy:** Not yet implemented. Planned for Phase 120 (error boundaries on all route segments with loading states for data-dependent pages).

**Patterns to implement:**
- Call `notFound()` from `next/navigation` before any Suspense boundary for missing providers/content (ensures HTTP 404 status code)
- `error.tsx` error boundaries on all route segments (must use `"use client"`)
- `loading.tsx` streaming loading states with skeleton components
- `not-found.tsx` with search bar and category suggestions
- `global-error.tsx` for unrecoverable application errors
- Server Actions return `{ success, errors }` objects -- never throw exceptions to the client
- JSON-LD XSS prevention: `.replace(/</g, "\\u003c")` on all `JSON.stringify` output in structured data

## Cross-Cutting Concerns

**Logging:** Not configured. Console logging only. No structured logging framework planned for MVP.

**Validation:** Not yet implemented. Planned in Server Actions: validate all fields before database mutations. URL search params parsed and validated through `src/lib/filters.ts` utility with safe defaults for invalid values. Prisma schema provides database-level constraints (unique slugs, required fields, enum values). CHECK constraints planned for Phase 10 (`rating >= 1 AND rating <= 5`, `averageRating >= 0 AND averageRating <= 5`).

**Authentication:** No user authentication. Admin access controlled by `proxy.ts` + `ADMIN_SECRET` environment variable. Reviews are anonymous (name + optional email, no login required).

**SEO:** Every public page MUST export `metadata` or `generateMetadata()` plus JSON-LD structured data rendered as `<script type="application/ld+json">` in Server Components. Dynamic sitemap.xml and robots.txt planned for Phase 110. All slugs are canonical URL identifiers. Canonical URLs on all pages.

**Caching:** On-demand revalidation via `revalidatePath()` from admin Server Actions. Content pages aggressively cached since all data is editorial (updated infrequently by admins). Dynamic pages (search, flexible comparison) are not cached. Next.js 16 supports `use cache` directive with `cacheLife()` when `cacheComponents: true` is enabled in `next.config.ts` (not yet enabled).

**Image Optimization:** Next.js `Image` component with `remotePatterns` in `next.config.ts` for external provider logos/hero images (not yet configured -- `next.config.ts` is currently empty). Provider images stored as URLs in database.

## Database Schema

**10 Models across 3 domains:**

**Core Domain (5 models):**

| Model | Purpose | Location in Schema |
|-------|---------|-------------------|
| `Provider` | Central entity: food box subscription service with slug, category, ratings, editorial content, SEO fields | `prisma/schema.prisma` line 63 |
| `Plan` | Pricing plan per Provider with per-serving/per-week/per-box pricing, frequency, skip/cancel policies | `prisma/schema.prisma` line 114 |
| `ProviderDietaryTag` | Join: Provider to DietaryTag enum. Unique on `[providerId, tag]` | `prisma/schema.prisma` line 151 |
| `Review` | User-submitted review with 1-5 rating, moderation status (PENDING/APPROVED/REJECTED) | `prisma/schema.prisma` line 162 |
| `ProviderFaq` | FAQ entries per provider with sortOrder | `prisma/schema.prisma` line 183 |

**Content Domain (3 models):**

| Model | Purpose | Location in Schema |
|-------|---------|-------------------|
| `BlogPost` | Editorial content with slug, body, status (DRAFT/PUBLISHED/ARCHIVED), SEO fields | `prisma/schema.prisma` line 200 |
| `Collection` | Curated "best of" lists with editorial body content | `prisma/schema.prisma` line 223 |
| `CollectionItem` | Join: Collection to Provider with sortOrder and editorial note | `prisma/schema.prisma` line 246 |

**Analytics Domain (1 model):**

| Model | Purpose | Location in Schema |
|-------|---------|-------------------|
| `AffiliateClick` | Tracks affiliate link clicks with source, referrer, hashed IP for dedup | `prisma/schema.prisma` line 262 |

**5 Enums:**
- `CategoryType`: MEAL_KIT, PREPARED_MEAL, PROTEIN_BOX, PRODUCE_BOX, SPECIALTY
- `DietaryTag`: 16 values (VEGAN, VEGETARIAN, PESCATARIAN, KETO, PALEO, GLUTEN_FREE, DAIRY_FREE, NUT_FREE, LOW_CARB, LOW_SODIUM, ORGANIC, HALAL, KOSHER, DIABETIC_FRIENDLY, WHOLE30, MEDITERRANEAN)
- `PlanFrequency`: WEEKLY, BIWEEKLY, MONTHLY, FLEXIBLE
- `ReviewStatus`: PENDING, APPROVED, REJECTED
- `ContentStatus`: DRAFT, PUBLISHED, ARCHIVED

**Key Indexes:**
- `Provider`: `[category]`, `[featured]`, `[active]`, `[averageRating]` (planned composite: `[category, active, averageRating]`)
- `Plan`: `[providerId]`, `[pricePerServing]`
- `Review`: `[providerId]`, `[status]`, `[rating]`
- `BlogPost`: `[status]`, `[publishedAt]`
- `ProviderDietaryTag`: `[tag]`, unique `[providerId, tag]`
- `AffiliateClick`: `[providerId]`, `[createdAt]`
- `Collection`: `[status]`
- `CollectionItem`: `[collectionId]`, unique `[collectionId, providerId]`

**Planned Schema Enhancement (Phase 10):** Add denormalized fields to Provider: `minPricePerServing Float?`, `maxPricePerServing Float?`, `freeShipping Boolean @default(false)`. Add composite index `[category, active, averageRating]`. Add CHECK constraints via raw SQL.

## Planned Route Structure

Per `.planning/PROJECT.md` URL structure:

```
src/app/
  page.tsx                          # / (Homepage)
  [category]/page.tsx               # /meal-kits, /prepared-meals, /protein-boxes, /produce-boxes, /specialty
  providers/[slug]/page.tsx         # /providers/hello-fresh
  compare/page.tsx                  # /compare?providers=a,b,c (flexible, noindex)
  compare/[slugs]/page.tsx          # /compare/hello-fresh-vs-blue-apron (SEO, indexed)
  methodology/page.tsx              # /methodology (E-E-A-T page)
  best/[slug]/page.tsx              # /best/best-keto-meal-kits
  blog/page.tsx                     # /blog (paginated index)
  blog/[slug]/page.tsx              # /blog/how-to-choose-meal-kit
  search/page.tsx                   # /search?q=...
  admin/page.tsx                    # /admin (dashboard, protected)
  admin/providers/page.tsx          # /admin/providers (CRUD)
  admin/content/page.tsx            # /admin/content (blog, collections)
  api/track/[providerId]/route.ts   # Affiliate click tracking API
  actions/reviews.ts                # Review submission Server Action
  actions/admin.ts                  # Admin CRUD Server Actions
  sitemap.ts                        # Dynamic sitemap generation
  robots.ts                         # robots.txt generation
  error.tsx                         # Global error boundary
  not-found.tsx                     # Global 404 page
```

**Note:** Only `src/app/page.tsx` and `src/app/layout.tsx` exist. All other routes are planned for Phases 30-120.

## Caching Strategy

| Page Type | Strategy | Revalidation Trigger |
|-----------|----------|---------------------|
| Homepage | `revalidate = 3600` (1 hour) + on-demand | `revalidatePath("/")` from admin actions |
| Category Listing | `revalidate = 3600` + on-demand | `revalidatePath("/${category}")` from admin actions |
| Provider Detail | `generateStaticParams` + on-demand | `revalidatePath("/providers/${slug}")` from admin actions |
| Collection/Best-Of | `generateStaticParams` + on-demand | `revalidatePath("/best/${slug}")` from admin actions |
| Blog Post | `generateStaticParams` + on-demand | `revalidatePath("/blog/${slug}")` from admin actions |
| SEO Comparison | `generateStaticParams` + on-demand | `revalidatePath("/compare/${slugs}")` from admin actions |
| Flexible Comparison | Dynamic (noindex, unique per request) | No caching needed |
| Search | Dynamic (depends on query) | No caching needed |
| Admin pages | Dynamic (always fresh) | No caching needed |

---

*Architecture analysis: 2026-03-20*
