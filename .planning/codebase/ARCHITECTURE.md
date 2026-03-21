# Architecture

**Analysis Date:** 2026-03-21

## Pattern Overview

**Overall:** Layered Server-Component-First Next.js App Router architecture

**Key Characteristics:**
- Server Components are the default for all pages; Client Components used only for interactive UI (filters, comparison tray, search inputs, review form, mobile nav)
- `Provider` is the central domain entity — all consumer-facing routes radiate from it
- URL search params are the sole shared state contract for filter/sort on listing pages (no global client state for data)
- `src/lib/queries.ts` is the single gateway to the database — all Server Components go through it
- Admin subsystem is fully isolated under `/admin` with its own layout, protected by `src/proxy.ts`
- SEO-first: every public page exports `metadata`/`generateMetadata()` and renders JSON-LD structured data inline

## Layers

**Presentation Layer (Route Pages & Layouts):**
- Purpose: Render HTML via Server Components, define routes and metadata, output JSON-LD structured data
- Location: `src/app/`
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`, `sitemap.ts`, `robots.ts`
- Depends on: Query Layer for data, Component Layer for UI primitives
- Used by: Next.js router (browser requests)
- Rule: Always `await params` and `await searchParams` (Promises in Next.js 16). Always export `metadata` or `generateMetadata()`. Call `notFound()` on missing slugs.

**Component Layer:**
- Purpose: Reusable UI building blocks — both Server and Client Components
- Location: `src/components/` (flat structure with `admin/` subdirectory)
- Contains: Domain components (`ProviderCard.tsx`, `ComparisonTable.tsx`, `CategoryFilters.tsx`, `ReviewForm.tsx`, `FaqAccordion.tsx`, `PricingTable.tsx`, `ReviewCard.tsx`, `RatingBreakdown.tsx`, `RatingStars.tsx`, `Breadcrumbs.tsx`, `Badge.tsx`, `Pagination.tsx`, `AffiliateLink.tsx`, `Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, `HeaderSearchForm.tsx`), UI primitives (`Button.tsx`, `Card.tsx`, `Input.tsx`, `Select.tsx`, `Skeleton.tsx`), and comparison state management (`CompareProvider.tsx`, `CompareBar.tsx`, `AddToCompareButton.tsx`)
- Admin components: `src/components/admin/` — `ProviderForm.tsx`, `PlanForm.tsx`, `PlanManager.tsx`, `BlogPostForm.tsx`, `CollectionForm.tsx`, `LoginForm.tsx`
- Depends on: Tailwind CSS 4 for styling, props from Presentation Layer
- Used by: Pages and layouts in `src/app/`

**Client Interactivity Layer:**
- Purpose: Handle browser interactivity requiring state, effects, or event handlers
- Location: `src/components/` (files with `"use client"` directive)
- Contains: `CategoryFilters.tsx` (URL-driven filter sidebar + mobile drawer), `CompareProvider.tsx` (sessionStorage-backed context), `CompareBar.tsx` (floating bar), `SearchInput.tsx` (controlled input), `ReviewForm.tsx` (star rating + validation), `StarRatingInput.tsx`, `MobileNav.tsx`, `HeaderSearchForm.tsx`, `AddToCompareButton.tsx`
- Depends on: URL search params (for filter state), `useRouter`/`useSearchParams`/`usePathname`
- Rule: NEVER import Prisma or `@/lib/db`. NEVER fetch data directly. Use `useActionState` (React 19, not `useFormState`).

**Query Layer:**
- Purpose: All database queries, centralized data access, `React.cache()` deduplication
- Location: `src/lib/queries.ts` (single file, 336 lines)
- Contains: Named async functions for every data need — `getFeaturedProviders`, `getCategoryCounts`, `getProvidersByCategory`, `getProviderBySlug`, `getProvidersForComparison`, `getRelatedProviders`, `searchProviders`, `searchBlogPosts`, `searchCollections`, `getAllProviderSlugs`, `getAllCollectionSlugs`, `getAllBlogPostSlugs`, `getPublishedCollections`, `getCollectionBySlug`, `getPublishedBlogPosts`, `getBlogPostBySlug`, `getAdminStats`, `getTopAffiliateProviders`, `getProviderReviewStats`
- Depends on: Database Layer (`@/lib/db`), Prisma types from `@/generated/prisma/client`
- Used by: Server Components in Presentation Layer, Server Actions
- Rule: All functions wrapped in `cache()` from React for request-level deduplication. Marked `"server-only"`.

**Database Layer:**
- Purpose: Type-safe Prisma client with Neon PostgreSQL via `@prisma/adapter-pg`
- Location: `src/lib/db.ts` (singleton), `prisma/schema.prisma` (schema definition)
- Contains: PrismaClient instance cached on `globalThis` to survive dev HMR
- Depends on: `DATABASE_URL` env var, generated types in `src/generated/prisma/`
- Used by: Query Layer exclusively (never imported in pages or client components)
- Rule: Always import `prisma` from `@/lib/db`. Never instantiate PrismaClient elsewhere.

**Server Actions Layer:**
- Purpose: Handle mutations (review submission, admin CRUD) with validation
- Location: `src/app/actions/reviews.ts`, `src/app/actions/admin.ts`
- Contains: `submitReview` (review submission with honeypot + rate limiting), `loginAction`, `logoutAction`, `createProvider`, `updateProvider`, `deleteProvider`, `savePlan`, `deletePlan`, `approveReview`, `rejectReview`, `createBlogPost`, `updateBlogPost`, `deleteBlogPost`, `createCollection`, `updateCollection`, `deleteCollection`
- Depends on: Database Layer directly, `revalidatePath()` for cache busting
- Used by: Client Components via form `action=` prop
- Rule: Marked `"use server"`. Return `{ success: boolean, message: string, errors: Record<string, string> }`. Never throw exceptions to client. Call `revalidatePath()` after mutations.

**Utility/Helper Layer:**
- Purpose: Shared helpers, type mappings, formatting
- Location: `src/lib/`
- Contains: `categories.ts` (bidirectional `CategoryType` enum ↔ URL slug mapping with `CATEGORY_MAP`, `getCategoryBySlug`, `getSlugByCategory`, `CATEGORY_NAV_ITEMS`), `format.ts` (price formatting: `formatPrice`, `formatPriceRange`, `formatPriceLabel`, `dollarsToCents`), `db.ts` (Prisma singleton), `queries.ts` (data access)
- Depends on: Generated Prisma enums from `@/generated/prisma/client`
- Used by: All server-side layers

**Auth / Request Interception:**
- Purpose: Protect admin routes from unauthorized access
- Location: `src/proxy.ts`
- Contains: `proxy` function checking `admin_token` cookie against `ADMIN_SECRET` env var; gates all `/admin/*` routes except `/admin/login`
- Rule: Uses Node.js runtime (not Edge). Exports `proxy` function (not `middleware`).

**Route Handlers:**
- Purpose: Server-side API endpoint for affiliate click tracking
- Location: `src/app/api/affiliate/[providerId]/route.ts`
- Contains: `GET` handler that resolves provider, logs `AffiliateClick` (fire-and-forget), and redirects to `affiliateUrl` or `website`

**Generated Code:**
- Purpose: Auto-generated TypeScript types and Prisma client runtime
- Location: `src/generated/prisma/`
- Generated by: `npx prisma generate` (output configured in `prisma/schema.prisma`)
- Rule: Never edit. Gitignored. Regenerate after any schema change.

## Data Flow

**Consumer Request (Category Listing):**

1. Browser requests `/{category-slug}?diet=VEGAN&sort=price-asc`
2. Next.js router hits `src/app/[category]/page.tsx` (Server Component)
3. Page `await`s both `params` and `searchParams` (Promises in Next.js 16)
4. `getCategoryBySlug(slug)` resolves URL slug to `CategoryType` enum via `src/lib/categories.ts`
5. `parseSearchParams()` validates/sanitizes URL params into typed filter object
6. `getProvidersByCategory(options)` executes cached Prisma query in `src/lib/queries.ts`
7. Page renders Server Components (grid, pagination) and passes props to `CategoryFilters` (Client Component)
8. `CategoryFilters` reads URL params via `useSearchParams()` and updates them via `useRouter().push()` on user interaction
9. URL change triggers re-render of the Server Component page

**User Review Submission:**

1. `ReviewForm` (Client Component) submits form to `submitReview` Server Action
2. `submitReview` checks honeypot field, validates fields, rate-limits by IP hash, creates `Review` with `status: "PENDING"`
3. Returns `{ success, message, errors }` — client displays result via `useActionState`
4. Review appears in admin queue; `approveReview` action triggers denormalized rating recalculation on `Provider`

**Admin Mutation:**

1. Admin form submits to Server Action (e.g., `updateProvider`)
2. Server Action validates, writes to Prisma, calls `revalidatePath()` on affected public routes
3. On-demand ISR revalidation: cached pages for that provider/collection/blog post are invalidated
4. Admin is redirected or shown success/error message

**Comparison Flow:**

1. `CompareProvider` (Client Component wrapping root layout) reads/writes to `sessionStorage` via `useSyncExternalStore`
2. `AddToCompareButton` (per-card Client Component) calls `addProvider(slug, name)` from `useCompare()` context
3. `CompareBar` (floating, Client Component) renders when `selected.length > 0`; `handleCompare()` navigates to `/compare?providers=slug1,slug2`
4. `src/app/compare/page.tsx` (Server Component) reads `providers` search param and fetches via `getProvidersForComparison()`

**State Management:**
- No global state library (no Redux, Zustand, or React Context for application data)
- URL search params: sole source of truth for filter/sort state on category listing pages
- `sessionStorage`: comparison selection (up to 4 providers), managed by `CompareProvider` using `useSyncExternalStore`
- Server Actions: form state management via `useActionState` (React 19)

## Key Abstractions

**Provider (Central Entity):**
- Purpose: Represents a food box subscription service; hub of all consumer content
- Schema: `prisma/schema.prisma` line 63
- Relations: has many `Plan`, `ProviderDietaryTag`, `Review`, `ProviderFaq`, `AffiliateClick`, `CollectionItem`
- Pattern: Denormalized fields (`averageRating`, `reviewCount`, `minPricePerServingCents`, `maxPricePerServingCents`, `freeShipping`) updated by Server Actions on review approve/reject and plan save/delete. `slug` is the canonical URL identifier.

**CategoryType Enum + CATEGORY_MAP:**
- Purpose: 5 fixed categories mapping between Prisma enum values and URL slugs
- Enum values: `MEAL_KIT`, `PREPARED_MEAL`, `PROTEIN_BOX`, `PRODUCE_BOX`, `SPECIALTY`
- Slug mapping: `src/lib/categories.ts` — bidirectional (`"meal-kits"` ↔ `CategoryType.MEAL_KIT`)
- Used by: Category pages, sitemap, navigation, filter parsing

**React.cache() Query Functions:**
- Purpose: Deduplicate Prisma calls within a single render pass
- Pattern: Every function in `src/lib/queries.ts` is wrapped in `cache()` — both `generateMetadata()` and the page component can call `getProviderBySlug()` for the same slug and only one DB round-trip happens
- File marked `"server-only"` to prevent accidental client imports

**CompareProvider + useCompare:**
- Purpose: Client-side comparison selection state across the entire app
- Location: `src/components/CompareProvider.tsx`
- Pattern: `useSyncExternalStore` backed by `sessionStorage` for SSR-safe hydration; stable snapshot caching prevents infinite render loops; max 4 providers; exports `useCompare()` hook for child components

**Server Action Return Contract:**
- Purpose: Typed result objects for form state
- Pattern: `{ success: boolean, message: string, errors: Record<string, string> }` from admin actions; `{ success: boolean, message: string, errors: ReviewFormErrors }` from review submission. Never throw to client.

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: HTML shell, Geist Sans/Mono font loading, global CSS import, `CompareProvider` context wrapper, `Header`, `Footer`, `CompareBar`

**Homepage:**
- Location: `src/app/page.tsx`
- Triggers: Request to `/`
- Responsibilities: Hero section, featured providers grid, category cards with counts, "How It Works", social proof stats, WebSite + Organization JSON-LD. Fetches `getFeaturedProviders()` and `getCategoryCounts()` in parallel.

**Category Listing:**
- Location: `src/app/[category]/page.tsx`
- Triggers: Requests to `/{category-slug}` (e.g., `/meal-kits`, `/protein-boxes`)
- Responsibilities: Filter parsing from URL, `getProvidersByCategory()`, provider grid, `CategoryFilters` sidebar, pagination, `ItemList` JSON-LD. Statically generated for all 5 category slugs.

**Provider Detail:**
- Location: `src/app/providers/[slug]/page.tsx`
- Triggers: Requests to `/providers/{slug}`
- Responsibilities: Full provider page — hero, pricing table, dietary badges, pros/cons, reviews with rating breakdown, FAQ accordion, related providers, review form, affiliate link, `Product` JSON-LD. Statically generated for all active provider slugs.

**SEO Comparison:**
- Location: `src/app/compare/[versus]/page.tsx`
- Triggers: Requests to `/compare/{slug-a}-vs-{slug-b}` (canonical, indexable)
- Responsibilities: Two-provider comparison with structured URL, `ComparisonTable`, JSON-LD

**Flexible Comparison:**
- Location: `src/app/compare/page.tsx`
- Triggers: Requests to `/compare?providers=slug1,slug2,...`
- Responsibilities: 2-4 provider comparison driven by search params, `noindex` robots directive

**Admin Dashboard:**
- Location: `src/app/admin/page.tsx`
- Triggers: Authenticated requests to `/admin`
- Responsibilities: Stats overview (provider/review/blog/collection counts, affiliate click count, top affiliate providers by click volume)

**Prisma Singleton:**
- Location: `src/lib/db.ts`
- Triggers: First import in any server-side module
- Responsibilities: Creates and caches `PrismaClient` with `PrismaPg` adapter for Neon. `globalThis` caching survives HMR in development.

**Request Interceptor:**
- Location: `src/proxy.ts`
- Triggers: All incoming requests (Next.js 16 request interception)
- Responsibilities: Passes through non-admin routes immediately. For `/admin/*` (except `/admin/login`), checks `admin_token` cookie equals `ADMIN_SECRET`. Redirects to `/admin/login` on mismatch.

**Affiliate Redirect:**
- Location: `src/app/api/affiliate/[providerId]/route.ts`
- Triggers: GET requests to `/api/affiliate/{providerId}`
- Responsibilities: Looks up provider, logs `AffiliateClick` asynchronously (fire-and-forget), redirects browser to `affiliateUrl` or `website`

**Sitemap:**
- Location: `src/app/sitemap.ts`
- Triggers: `GET /sitemap.xml`
- Responsibilities: Generates sitemap entries for all public routes (static pages, 5 category pages, all active provider slugs, all published collection slugs, all published blog post slugs)

## Error Handling

**Strategy:** Boundary-based per route segment, structured returns from Server Actions

**Patterns:**
- `src/app/error.tsx`: Root-level error boundary (must be Client Component) with "Try again" / "Go to homepage" actions
- `src/app/global-error.tsx`: Unrecoverable application error fallback
- `src/app/not-found.tsx`: Custom 404 with search input and category links
- `notFound()` from `next/navigation`: Called in page components when a slug returns `null` from the Query Layer — triggers HTTP 404 and renders `not-found.tsx`
- Server Actions: Return `{ success: false, errors }` — never throw raw database errors to the client
- Affiliate route: Falls back to homepage redirect if provider not found
- Admin actions: Silently catch errors on delete operations (entity may already be deleted); rethrow `NEXT_REDIRECT` exceptions

## Cross-Cutting Concerns

**SEO:** Every public page exports `metadata` or `generateMetadata()`. Every public page renders JSON-LD structured data (WebSite/Organization on homepage, ItemList on category pages, Product on provider detail, custom on collections/blog). Sitemap generated dynamically. `robots.ts` present. Admin pages set `noindex, nofollow`. Search result pages set `robots: { index: false }`.

**Caching:** Category pages and provider detail pages use `generateStaticParams()` for ISR. Admin mutations call `revalidatePath()` to invalidate affected cached routes on-demand. Query Layer uses `React.cache()` for per-request deduplication.

**Authentication:** `src/proxy.ts` intercepts all `/admin/*` requests (except `/admin/login`). Checks `admin_token` cookie (set by `loginAction`, expires 7 days, `httpOnly: true`, `secure` in production). No user accounts, no JWT, no OAuth.

**Affiliate Tracking:** `AffiliateLink` component renders an `<a>` pointing to `/api/affiliate/{providerId}?source={currentPath}`. API route logs click with hashed IP and redirects. Fire-and-forget — never blocks navigation.

**Price Denormalization:** `minPricePerServingCents`, `maxPricePerServingCents`, `freeShipping` on `Provider` are recalculated by `savePlan` and `deletePlan` Server Actions whenever plans change. `averageRating` and `reviewCount` are recalculated by `approveReview` and `rejectReview`.

**IP Privacy:** All IP addresses are SHA-256 hashed before storage (both `Review.ipHash` for rate limiting and `AffiliateClick.ipHash` for dedup). Raw IPs are never persisted.

---

*Architecture analysis: 2026-03-21*
