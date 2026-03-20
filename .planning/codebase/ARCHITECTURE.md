# Architecture

**Analysis Date:** 2026-03-20

## Pattern Overview

**Overall:** Next.js 16 App Router with React Server Components, Prisma ORM over Neon PostgreSQL, file-based routing, URL-driven state

**Key Characteristics:**
- Server Components by default; Client Components only for interactive UI (filters, modals, mobile nav)
- File-based routing via Next.js App Router in `src/app/`
- Database access exclusively through Prisma singleton in `src/lib/db.ts` -- server-side only
- URL search params drive filter/sort state for shareable, SEO-indexable URLs
- No user authentication -- admin protected by `proxy.ts` with `ADMIN_SECRET` env var
- Affiliate revenue model: click tracking on outbound provider links
- SEO-first: every public page requires `metadata`/`generateMetadata()` and JSON-LD structured data

**Current State:** Scaffolded via `create-next-app`. Only the default homepage exists (`src/app/page.tsx`). The Prisma schema defines 10 models and 5 enums, but no application routes, components, query helpers, or seed data have been built yet. The project follows a 12-phase roadmap defined in `.planning/ROADMAP.md`.

## Layers

**Presentation Layer (React Server Components):**
- Purpose: Render pages with data fetched directly via Prisma queries
- Location: `src/app/` (route segments), `src/components/` (shared UI, not yet created)
- Contains: Page components, layouts, metadata exports, JSON-LD structured data
- Depends on: Prisma client via `src/lib/db.ts`, query helpers in `src/lib/`
- Used by: End users via browser
- Rule: All pages are Server Components. Fetch data here, pass to children as props.

**Interactive Layer (React Client Components):**
- Purpose: Handle browser interactivity requiring state, effects, or event handlers
- Location: `src/components/` (files must include `"use client"` directive at top)
- Contains: Filter panels, comparison selector, mobile navigation, search bar, review forms, star rating inputs
- Depends on: URL search params (for filter state), props from Server Components
- Used by: Server Components (composed as children or receive data via props)
- Rule: NEVER import Prisma or access the database. NEVER import from `@/lib/db`.

**Data Layer (Prisma ORM):**
- Purpose: Type-safe database queries against Neon PostgreSQL
- Location: `src/lib/db.ts` (singleton client), `prisma/schema.prisma` (schema)
- Contains: PrismaClient instance configured with `@prisma/adapter-pg` for Neon
- Depends on: `DATABASE_URL` environment variable
- Used by: Server Components, Server Actions, API routes
- Rule: Always import from `src/lib/db.ts`. Never instantiate PrismaClient elsewhere.

**Query Layer (planned):**
- Purpose: Reusable typed query functions consumed by pages and API routes
- Location: `src/lib/queries.ts` (planned, not yet created)
- Contains: Functions like `getFeaturedProviders()`, `getProviderBySlug()`, `getProvidersByCategory()`
- Depends on: Prisma client from `src/lib/db.ts`
- Used by: Server Components in `src/app/`
- Rule: All functions are `async`, export named functions, use Prisma's type-safe API (no raw SQL in MVP)

**Mutation Layer (Server Actions, planned):**
- Purpose: Handle form submissions and data mutations
- Location: `src/app/actions/` for global actions, or colocated with forms
- Contains: Review submission, admin CRUD operations
- Depends on: Prisma client, validation logic
- Used by: Client Components via `action={serverAction}` on forms
- Rule: Mark with `"use server"` directive. Return structured results, do not throw.

**Admin Layer (planned):**
- Purpose: Internal content management interface
- Location: `src/app/admin/` (not yet created)
- Contains: Provider CRUD, review moderation, blog/collection management, affiliate analytics
- Depends on: Prisma client, `proxy.ts` for access control
- Used by: Site administrators only
- Rule: Protected by `proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`). Uses `ADMIN_SECRET` env var.

**Generated Layer (Prisma Client Types):**
- Purpose: Auto-generated TypeScript types and client code from schema
- Location: `src/generated/prisma/`
- Contains: PrismaClient class (`client.ts`), model types (`models.ts`), enum types (`enums.ts`), input types (`commonInputTypes.ts`)
- Depends on: `prisma/schema.prisma`
- Used by: All server-side code via `import { PrismaClient } from "@/generated/prisma/client"`
- Rule: Never edit directly. Regenerate with `npx prisma generate` after any schema change.

## Data Flow

**Server-Rendered Page (primary pattern):**

1. User requests a URL (e.g., `/meal-kits?diet=vegan&sort=rating`)
2. Next.js App Router matches the route segment in `src/app/`
3. Server Component receives `params` and `searchParams` as **Promises** (MUST `await` both -- Next.js 16 breaking change)
4. Server Component calls a query function from `src/lib/queries.ts` with parsed params
5. Query function imports `prisma` from `@/lib/db` and executes a Prisma query
6. Results are passed as props to child components (Server or Client)
7. Page renders HTML with `metadata`/`generateMetadata()` and JSON-LD
8. Client Components hydrate for interactivity (filters, comparison bar)

**Filter/Sort Interaction (URL-driven state):**

1. User interacts with a Client Component (filter checkbox, sort dropdown)
2. Client Component updates URL search params via `router.push()` or `<Link>`
3. New URL triggers server-side re-render with updated `searchParams`
4. Server Component awaits `searchParams`, parses filters, calls query function
5. Updated results render via React Server Component streaming (no full page reload)

**Form Submission (Server Actions):**

1. User fills out a form (e.g., review submission on provider detail page)
2. Client Component calls a Server Action via `action={submitReview}`
3. Server Action validates input, executes Prisma mutation
4. Server Action returns structured result `{ success: boolean, errors?: ... }`
5. Client Component shows feedback based on result

**Affiliate Click Tracking:**

1. User clicks "Visit Provider" button on any page
2. Click routes through API endpoint (e.g., `/api/track/[providerId]`)
3. API creates `AffiliateClick` record (provider, source page, user agent, hashed IP)
4. User is HTTP-redirected to provider's `affiliateUrl`

**State Management:**
- No global state library. URL search params are the primary state mechanism.
- Comparison state (selected providers) uses client-side React state, persisted across navigations via context or URL params
- Filter state always in URL search params for shareability and SEO

## Database Schema

**10 Models across 3 domains:**

**Core Domain (5 models):**
- `Provider` -- Central entity. Food box subscription service with slug, category, ratings, editorial content, SEO fields. All consumer pages revolve around this model. Schema: `prisma/schema.prisma` line 63.
- `Plan` -- Pricing plan per Provider. Tracks per-serving/per-week/per-box pricing, frequency, skip/cancel policies. Schema: `prisma/schema.prisma` line 114.
- `ProviderDietaryTag` -- Join model: Provider to `DietaryTag` enum. Unique on `[providerId, tag]`. Schema: `prisma/schema.prisma` line 151.
- `Review` -- User-submitted review. 1-5 rating, moderation status (PENDING/APPROVED/REJECTED). Provider has denormalized `averageRating` and `reviewCount`. Schema: `prisma/schema.prisma` line 162.
- `ProviderFaq` -- FAQ entries per provider with `sortOrder`. Schema: `prisma/schema.prisma` line 183.

**Content Domain (3 models):**
- `BlogPost` -- Editorial content with slug, body, status (DRAFT/PUBLISHED/ARCHIVED), SEO fields. Schema: `prisma/schema.prisma` line 200.
- `Collection` -- Curated "best of" lists (e.g., "Best Keto Meal Kits") with editorial body. Schema: `prisma/schema.prisma` line 223.
- `CollectionItem` -- Join model: Collection to Provider with `sortOrder` and editorial `note`. Schema: `prisma/schema.prisma` line 246.

**Analytics Domain (1 model):**
- `AffiliateClick` -- Tracks affiliate link clicks with source, referrer, hashed IP for dedup. Schema: `prisma/schema.prisma` line 262.

**5 Enums:**
- `CategoryType`: MEAL_KIT, PREPARED_MEAL, PROTEIN_BOX, PRODUCE_BOX, SPECIALTY
- `DietaryTag`: 16 values (VEGAN, VEGETARIAN, PESCATARIAN, KETO, PALEO, GLUTEN_FREE, DAIRY_FREE, NUT_FREE, LOW_CARB, LOW_SODIUM, ORGANIC, HALAL, KOSHER, DIABETIC_FRIENDLY, WHOLE30, MEDITERRANEAN)
- `PlanFrequency`: WEEKLY, BIWEEKLY, MONTHLY, FLEXIBLE
- `ReviewStatus`: PENDING, APPROVED, REJECTED
- `ContentStatus`: DRAFT, PUBLISHED, ARCHIVED

**Key Indexes:** Provider: `[category]`, `[featured]`, `[active]`, `[averageRating]`. Plan: `[providerId]`, `[pricePerServing]`. Review: `[providerId]`, `[status]`, `[rating]`. BlogPost: `[status]`, `[publishedAt]`. ProviderDietaryTag: `[tag]`. AffiliateClick: `[providerId]`, `[createdAt]`.

**Planned Schema Enhancement (Phase 10):** Add `minPricePerServing`, `maxPricePerServing`, `freeShipping` denormalized fields to `Provider` model plus composite index `[category, active, averageRating]`.

## Planned Route Structure

Per AD-2 in `.planning/PROJECT.md`:

```
src/app/
  page.tsx                          # / (Homepage)
  [category]/page.tsx               # /meal-kits, /prepared-meals, etc.
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
```

**Note:** Only `src/app/page.tsx` and `src/app/layout.tsx` exist. All other routes are planned.

## Key Abstractions

**Prisma Client Singleton (`src/lib/db.ts`):**
- Purpose: Single PrismaClient instance across hot reloads in development
- Pattern: Global singleton cached on `globalThis` in non-production
- Usage: `import { prisma } from "@/lib/db"` in any server-side module
- Implementation uses `PrismaPg` adapter with `DATABASE_URL` connection string

**Provider as Central Entity:**
- The core data model. All consumer-facing pages revolve around Provider queries.
- Relations fan out: Provider -> Plans, Reviews, FAQs, DietaryTags, AffiliateClicks, CollectionItems
- Slug is the canonical URL identifier: `/providers/[slug]`

**CategoryType as Route Segment:**
- `CategoryType` enum maps to URL slugs: `MEAL_KIT` -> `/meal-kits`, `PREPARED_MEAL` -> `/prepared-meals`, etc.
- Dynamic route `[category]` resolves enum from slug for Prisma queries
- Must maintain a mapping utility (slug <-> enum) in `src/lib/`

**URL Search Params as State:**
- All filter/sort state encoded in URL params (e.g., `?diet=vegan&sort=price-asc&page=2`)
- `searchParams` is a Promise in Next.js 16 -- always await
- Enables shareable, bookmarkable, SEO-indexable filtered views

## Entry Points

**Application Root:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render (wraps all routes)
- Responsibilities: Root HTML structure (`<html>`, `<body>`), font loading (Geist Sans, Geist Mono via `next/font/google`), global CSS import (`globals.css`), dark mode class setup

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: Request to `/`
- Responsibilities: Currently default create-next-app content. Will become homepage with hero, featured providers, category cards, social proof.

**Database Client:**
- Location: `src/lib/db.ts`
- Triggers: First import in any server-side module
- Responsibilities: Creates and caches PrismaClient with Neon adapter (`@prisma/adapter-pg`)

**Request Interception (planned):**
- Location: `src/proxy.ts` (does not exist yet)
- Triggers: Every incoming request
- Responsibilities: Admin route protection (`/admin/*`) via `ADMIN_SECRET` env var
- Note: Uses `proxy.ts` NOT `middleware.ts` -- Next.js 16 renamed this file

**Build Entry:**
- Location: `package.json` script `"build": "prisma generate && next build"`
- Ensures Prisma client is regenerated before every production build

## Error Handling

**Strategy:** Not yet implemented. Planned per Phase 120:

**Patterns to implement:**
- `error.tsx` error boundaries on all route segments (must use `"use client"`)
- `loading.tsx` streaming loading states for data-dependent pages
- `not-found.tsx` with search and category suggestions
- `global-error.tsx` for unrecoverable application errors
- Server Actions return `{ success, errors }` objects -- never throw exceptions to the client

## Cross-Cutting Concerns

**Logging:** Not configured. Use `console` methods. No structured logging framework planned for MVP.

**Validation:** Not yet implemented. Server Action validation for review forms and admin forms. Prisma schema provides database-level constraints (unique slugs, required fields, enum values, CHECK constraints planned in Phase 10).

**Authentication:** No user authentication. Admin access controlled by `proxy.ts` + `ADMIN_SECRET` env var. Reviews are anonymous (name + optional email, no login).

**SEO:** Every public page MUST export `metadata` or `generateMetadata()` plus JSON-LD structured data. Sitemap and robots.txt planned for Phase 110. All slugs are canonical URL identifiers.

**Caching/ISR:** Next.js 16 supports `use cache` directive with `cacheLife()` when `cacheComponents: true` is enabled in `next.config.ts` (not yet enabled). ISR planned for provider listings and detail pages.

**Image Optimization:** Next.js `Image` component with `remotePatterns` in `next.config.ts` for external provider logos/hero images (not yet configured -- `next.config.ts` is currently empty).

---

*Architecture analysis: 2026-03-20*
