@AGENTS.md

# FoodBoxFinder Project

## Planning
- Project spec: `.planning/PROJECT.md`
- Roadmap: `.planning/ROADMAP.md`
- Phase plans go in `.planning/phases/XX/PLAN.md`

## Conventions
- All pages are Server Components by default. Use "use client" only for interactive UI (filters, modals, mobile nav).
- Data fetching happens in Server Components via Prisma. Never expose Prisma to client components.
- URL search params drive filter/sort state on listing pages. Keep URLs shareable.
- All public pages must have metadata (title, description) and JSON-LD structured data.
- Slugs are the canonical identifier for SEO URLs.
- Use `src/lib/db.ts` for the Prisma client singleton.
- Keep components in `src/components/` with flat structure unless a component group needs isolation.
- Server Actions go in `src/app/actions/` or colocated with the form.
- Admin routes live under `src/app/admin/` and are protected by `proxy.ts` (NOT middleware.ts — renamed in Next.js 16).
- `params` and `searchParams` are Promises in Next.js 16 — always `await` them.

## Database
- Run `npx prisma db push` to sync schema to Neon (no migration files for now).
- Run `npx prisma generate` to regenerate the client after schema changes.
- Seed script: `prisma/seed.ts` — run with `npx tsx prisma/seed.ts`.

## Agent Delegation
When working on this project, delegate to specialist agents:
- **agency-backend-architect**: Database queries, API routes, Server Actions, data modeling
- **agency-frontend-developer**: React components, pages, layouts, client interactivity
- **agency-ui-designer**: Visual design decisions, component styling, color/typography
- **agency-ux-researcher**: User flows, information architecture, usability concerns
- **agency-accessibility-auditor**: WCAG compliance, screen reader testing, keyboard nav
- **agency-security-engineer**: Input validation, XSS prevention, admin auth

<!-- GSD:project-start source:PROJECT.md -->
## Project

**FoodBoxFinder**

A Kayak-like discovery and comparison website for food box subscription services. Consumers can browse 95+ providers across meal kits, prepared meals, protein boxes, produce boxes, and specialty subscriptions — filtering by many criteria (diet, prep style, value tier, household fit, flexibility, geography) and comparing 2-3 providers side-by-side. Built on Next.js 16 with a Prisma/Neon PostgreSQL backend, deployed on Vercel.

**Core Value:** Consumers can quickly discover and compare food box subscriptions that match their dietary needs, budget, and preferences — with transparent criteria and visual brand identity.

### Constraints

- **Tech Stack**: Next.js 16.2, React 19, Tailwind CSS 4, Prisma 7.5, Neon PostgreSQL — already configured, no changes
- **Hosting**: Vercel free tier — serverless, ISR support
- **Next.js 16 Breaking Changes**: params/searchParams are Promises (must await), proxy.ts replaces middleware.ts, async cookies()/headers()/draftMode()
- **No Auth**: Admin protected by proxy.ts + ADMIN_SECRET env var only. No user accounts.
- **Images**: Provider logos in public/assets/providers/ with manifest.json. Next.js Image with remotePatterns for any external images.
- **Budget**: Minimal — no paid APIs, no premium services beyond Neon and Vercel free tiers
- **Data source**: food-box-companies.json is the source of truth for initial provider data. Many fields are sparsely populated (conservative defaults from research).
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.3 - All application code, configuration files, and Prisma seed scripts. Strict mode enabled in `tsconfig.json`.
- CSS - Tailwind CSS 4 utility classes via `@import "tailwindcss"` in `src/app/globals.css`
- SQL - PostgreSQL via Prisma ORM (no raw SQL written by hand)
## Runtime
- Node.js 24.9.0 (local); 24.x on Vercel production (configured in `.vercel/project.json`)
- No `.nvmrc` or `.node-version` pinning file present
- npm 11.6.0
- Lockfile: `package-lock.json` (present)
## Frameworks
- Next.js 16.2.0 - Full-stack React framework (App Router, Server Components, ISR)
- React 19.2.4 - UI library
- React DOM 19.2.4 - DOM rendering
- Prisma 7.5.0 - Database ORM, schema management, and client generation
- Tailwind CSS 4.2.2 - Utility-first CSS, configured via PostCSS (`postcss.config.mjs`)
- Not configured. No Jest, Vitest, or Playwright installed.
- TypeScript 5.9.3 - Type checking (tsc, strict mode)
- ESLint 9.39.4 - Linting (flat config format at `eslint.config.mjs`)
- PostCSS - CSS processing via `@tailwindcss/postcss` plugin
- tsx 4.21.0 - TypeScript execution for seed scripts (`npx tsx prisma/seed.ts`)
## Key Dependencies
- `next` 16.2.0 - Application framework (`package.json`)
- `react` 19.2.4 - UI rendering (`package.json`)
- `react-dom` 19.2.4 - DOM rendering (`package.json`)
- `@prisma/client` 7.5.0 - Database client, generated into `src/generated/prisma/` (`package.json`)
- `@prisma/adapter-pg` 7.5.0 - PostgreSQL adapter for Prisma using the `pg` driver directly (`src/lib/db.ts`)
- `server-only` 0.0.1 - Prevents query modules from being imported in client components (`src/lib/queries.ts` line 1)
- `pg` 8.20.0 - PostgreSQL driver (transitive dep of `@prisma/adapter-pg`)
- `dotenv` 17.3.1 - Environment variable loading for `prisma.config.ts`
- `prisma` 7.5.0 - Prisma CLI (schema management, codegen)
- `tailwindcss` 4.2.2 - CSS framework (devDependency)
- `@tailwindcss/postcss` 4.2.2 - PostCSS integration for Tailwind
- `typescript` 5.9.3 - TypeScript compiler
- `eslint` 9.39.4 - Linter
- `eslint-config-next` 16.2.0 - Next.js ESLint rules (extends `core-web-vitals` and `typescript`)
- `tsx` 4.21.0 - Script runner for seed and one-off scripts
- No test runner (Jest, Vitest, Playwright)
- No formatter (Prettier, Biome)
- No markdown rendering library (needed for blog body content)
- No rate limiting library (needed for review submissions)
- No image processing beyond Next.js built-in `<Image>`
## Configuration
- `strict: true` — all strict sub-flags active: `strictNullChecks`, `noImplicitAny`, etc.
- `target: ES2017`, `module: esnext`, `moduleResolution: bundler`
- Path alias: `@/*` → `./src/*`
- Incremental compilation enabled (`tsconfig.tsbuildinfo` present)
- Next.js plugin registered under `plugins`
- Flat config format (ESLint 9)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Run with: `npx eslint .` (not `next lint` — removed in Next.js 16)
- Single plugin: `@tailwindcss/postcss`
- Imported via `@import "tailwindcss"` (v4 syntax, not `@tailwind` directives)
- Custom CSS variables for brand colors (`--color-primary-*`, `--color-accent-*`) in `@theme` block
- Custom design tokens: `--shadow-card`, `--radius-card`, `--color-star`, etc.
- Dark mode: `prefers-color-scheme` media query (system preference, not class-based)
- Fonts: Geist Sans and Geist Mono via `next/font/google` in `src/app/layout.tsx`, applied as CSS variables
- `images.remotePatterns` configured for: `images.unsplash.com`, `**.cloudinary.com`, `**.amazonaws.com`, `cdn.jsdelivr.net`, `*.imgix.net`, `logo.clearbit.com`, `img.logo.dev`
- No `cacheComponents` or React Compiler enabled
- Schema: `prisma/schema.prisma`
- Migrations path: `prisma/migrations`
- Datasource URL from `DATABASE_URL` environment variable
- Client output: `src/generated/prisma/` (git-ignored)
- Seed: `tsx prisma/seed.ts`
- `pg` adapter (not the default Prisma engine) — uses `PrismaPg` from `@prisma/adapter-pg`
- `DATABASE_URL` — Neon PostgreSQL connection string
- `ADMIN_SECRET` — Admin cookie token (compared in `src/proxy.ts`)
- `NEXT_PUBLIC_BASE_URL` — Production base URL (defaults to `https://foodboxfinder.com`)
- `NEXT_PUBLIC_SITE_URL` — Used in structured data URLs in `src/app/[category]/page.tsx`
- `NODE_ENV` — Standard Node.js environment flag
## Build & Scripts
| Script | Command | Notes |
|--------|---------|-------|
| `dev` | `next dev` | Development server |
| `build` | `prisma generate && next build` | Regenerates Prisma client before every build |
| `start` | `next start` | Production server |
| `lint` | `eslint` | Runs ESLint flat config |
## Platform Requirements
- Node.js 24.x
- PostgreSQL database (Neon serverless)
- `DATABASE_URL` and `ADMIN_SECRET` env vars
- Vercel hosting (project: `foodboxfinder`, org configured in `.vercel/project.json`)
- Vercel Node.js 24.x runtime
- Neon PostgreSQL (serverless, connection pooling via `pg` driver)
- No Docker, no CI/CD pipeline, no pre-commit hooks (no Husky or lint-staged)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Next.js App Router pages: `page.tsx` (e.g., `src/app/providers/[slug]/page.tsx`)
- Next.js layouts: `layout.tsx` (e.g., `src/app/admin/layout.tsx`)
- Next.js special files: `error.tsx`, `not-found.tsx`, `loading.tsx`, `global-error.tsx`
- Shared components: `PascalCase.tsx` (e.g., `ProviderCard.tsx`, `ReviewForm.tsx`, `CompareBar.tsx`)
- Admin-specific components: colocated in `src/components/admin/` subdirectory (e.g., `ProviderForm.tsx`, `PlanManager.tsx`)
- Server Actions files: `camelCase.ts` in `src/app/actions/` (e.g., `reviews.ts`, `admin.ts`)
- Library/utility modules: `camelCase.ts` (e.g., `db.ts`, `format.ts`, `categories.ts`, `queries.ts`)
- Config files: `camelCase.config.ts` or `camelCase.config.mjs` (e.g., `next.config.ts`, `eslint.config.mjs`, `prisma.config.ts`)
- React components: `PascalCase` function declarations (not arrow functions): `export default function ProviderCard(...)`
- Utility/helper functions: `camelCase` (e.g., `formatPrice`, `getCategoryBySlug`, `parseSearchParams`)
- Server Actions: `camelCase` with action verb prefix (e.g., `submitReview`, `createProvider`, `updateBlogPost`, `deleteCollection`)
- Custom hooks: `camelCase` with `use` prefix (e.g., `useCompare`)
- Local variables and constants: `camelCase` (e.g., `geistSans`, `featuredProviders`, `orderByMap`)
- Environment variables: `UPPER_SNAKE_CASE` (e.g., `DATABASE_URL`, `ADMIN_SECRET`, `NODE_ENV`)
- Module-level constants: `UPPER_SNAKE_CASE` for semantic sets (e.g., `CATEGORY_MAP`, `VALID_SORT_VALUES`, `MAX_COMPARE`, `STORAGE_KEY`)
- Interface names: `PascalCase` (e.g., `ReviewFormErrors`, `ReviewFormState`, `AdminFormState`, `CompareEntry`, `CompareContextValue`, `ProviderCardData`)
- Type aliases: `PascalCase` (e.g., `SortOption`)
- Prisma-generated types imported from `@/generated/prisma/client`
- Models: `PascalCase` (e.g., `Provider`, `Plan`, `BlogPost`)
- Fields: `camelCase` (e.g., `providerId`, `averageRating`, `pricePerServing`)
- Enum type names: `PascalCase` (e.g., `CategoryType`, `DietaryTag`, `PlanFrequency`)
- Enum values: `UPPER_SNAKE_CASE` (e.g., `MEAL_KIT`, `GLUTEN_FREE`, `WEEKLY`)
## Code Style
- No formatter (Prettier or Biome) configured
- 2-space indentation in all files
- Double quotes for all strings (imports, JSX attributes, string values)
- Semicolons at end of statements
- Trailing commas in multi-line objects, arrays, function parameters
- Template literals for dynamic class composition in JSX
- ESLint 9 flat config: `eslint.config.mjs`
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Run with: `npx eslint .` (NOT `next lint` — removed in Next.js 16)
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- No `any` types allowed
- No `@ts-ignore` allowed
- Use type narrowing with type predicates (e.g., `(item): item is string => typeof item === "string"`)
- Non-null assertion (`!`) only for required env vars: `process.env.DATABASE_URL!`
## Import Organization
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- `@/generated/prisma/client` — Prisma client types and enums
- `@/lib/db` — database singleton
- `@/lib/queries` — all query functions
- `@/lib/categories` — slug/enum mapping utilities
- `@/lib/format` — price formatting utilities
- `@/components/` — shared components
- Always use `import type` for type-only imports: `import type { Metadata } from "next"`
- Use `import type { CategoryType, DietaryTag } from "@/generated/prisma/client"`
- Mix type and value imports with `import { cache } from "react"` and `import type { ... }` on separate lines
- `src/lib/queries.ts` starts with `import "server-only"` to prevent client-side import
- Never import `@/lib/db` or `@/lib/queries` in client components
## Component Patterns
- Always wrap props in `Readonly<{}>`: `Readonly<{ children: React.ReactNode; color?: keyof typeof colorMap }>`
- Inline prop types — no separate interface files for component props
- Export named interface only when the type is shared across files (e.g., `export interface ProviderCardData`)
- Define as a function returning a `<script>` tag: `function WebsiteJsonLd() { ... }`
- Use `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}`
- Required on every public page
## Styling
- Import in `src/app/globals.css`: `@import "tailwindcss"` (NOT `@tailwind` directives)
- Custom theme tokens defined in `@theme` blocks in `globals.css`:
- Font variables: `--font-sans` (Geist Sans), `--font-mono` (Geist Mono) loaded via `next/font/google`
- No CSS modules, no styled-components, no component libraries
- Utility classes applied directly in JSX `className`
- Template literals for conditional classes: `` `inline-flex ... ${variants[variant]} ${sizes[size]} ${className ?? ""}` ``
- Variant/size maps as `const` objects with `as const` assertions (see `Button.tsx`, `Badge.tsx`)
- Responsive modifiers: `sm:`, `lg:`, `xl:` prefixes used consistently
- Interactive states: `hover:`, `focus-visible:`, `disabled:` with transitions: `transition-colors`
- Semantic HTML elements: `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<header>`
- Accessibility: `aria-hidden="true"` on decorative SVGs, `aria-label` on icon-only buttons, `role="alert"` on error messages, `role="status"` on success messages
## Error Handling
- Return `{ success: boolean, message: string, errors: Record<string, string> }` — never throw exceptions to the client
- Validate all inputs before database operations
- Use try/catch wrapping database calls
- `redirect()` in Next.js 16 throws a special error — always rethrow it:
- Silent failure pattern for non-critical operations (click tracking, delete cleanups): `} catch { // Silently fail }`
- Call `notFound()` from `next/navigation` when a resource is not found by slug
- `error.tsx` (client component) at route segment level with `reset` callback
- `not-found.tsx` with search bar and category suggestions
- `global-error.tsx` for unrecoverable errors (uses inline styles, not Tailwind, since CSS may not load)
- `getString(formData, key)` — trims string, returns `""`
- `getOptionalString(formData, key)` — returns `null` if empty
- `getOptionalInt(formData, key)` — parses int, returns `null` if empty/NaN
- `getBoolean(formData, key)` — handles `"on"` (checkbox) and `"true"`
- `getStringArray(formData, key)` — uses `formData.getAll()`, filters non-strings
## Logging
## Comments
## Function Design
## Module Design
- Pages/layouts: `export default function` (Next.js requirement)
- Named exports for everything else: `export const`, `export function`, `export interface`
- No barrel files in application code — import directly from source files
- Prisma-generated code uses barrel exports (do not edit)
- URL search params are the source of truth for filter/sort state
- Parse with `await searchParams` (Promise in Next.js 16), then call a local `parseSearchParams()` helper
- Invalid values silently fall back to defaults (server is the authority on valid values)
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Server Components are the default for all pages; Client Components used only for interactive UI (filters, comparison tray, search inputs, review form, mobile nav)
- `Provider` is the central domain entity — all consumer-facing routes radiate from it
- URL search params are the sole shared state contract for filter/sort on listing pages (no global client state for data)
- `src/lib/queries.ts` is the single gateway to the database — all Server Components go through it
- Admin subsystem is fully isolated under `/admin` with its own layout, protected by `src/proxy.ts`
- SEO-first: every public page exports `metadata`/`generateMetadata()` and renders JSON-LD structured data inline
## Layers
- Purpose: Render HTML via Server Components, define routes and metadata, output JSON-LD structured data
- Location: `src/app/`
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`, `sitemap.ts`, `robots.ts`
- Depends on: Query Layer for data, Component Layer for UI primitives
- Used by: Next.js router (browser requests)
- Rule: Always `await params` and `await searchParams` (Promises in Next.js 16). Always export `metadata` or `generateMetadata()`. Call `notFound()` on missing slugs.
- Purpose: Reusable UI building blocks — both Server and Client Components
- Location: `src/components/` (flat structure with `admin/` subdirectory)
- Contains: Domain components (`ProviderCard.tsx`, `ComparisonTable.tsx`, `CategoryFilters.tsx`, `ReviewForm.tsx`, `FaqAccordion.tsx`, `PricingTable.tsx`, `ReviewCard.tsx`, `RatingBreakdown.tsx`, `RatingStars.tsx`, `Breadcrumbs.tsx`, `Badge.tsx`, `Pagination.tsx`, `AffiliateLink.tsx`, `Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, `HeaderSearchForm.tsx`), UI primitives (`Button.tsx`, `Card.tsx`, `Input.tsx`, `Select.tsx`, `Skeleton.tsx`), and comparison state management (`CompareProvider.tsx`, `CompareBar.tsx`, `AddToCompareButton.tsx`)
- Admin components: `src/components/admin/` — `ProviderForm.tsx`, `PlanForm.tsx`, `PlanManager.tsx`, `BlogPostForm.tsx`, `CollectionForm.tsx`, `LoginForm.tsx`
- Depends on: Tailwind CSS 4 for styling, props from Presentation Layer
- Used by: Pages and layouts in `src/app/`
- Purpose: Handle browser interactivity requiring state, effects, or event handlers
- Location: `src/components/` (files with `"use client"` directive)
- Contains: `CategoryFilters.tsx` (URL-driven filter sidebar + mobile drawer), `CompareProvider.tsx` (sessionStorage-backed context), `CompareBar.tsx` (floating bar), `SearchInput.tsx` (controlled input), `ReviewForm.tsx` (star rating + validation), `StarRatingInput.tsx`, `MobileNav.tsx`, `HeaderSearchForm.tsx`, `AddToCompareButton.tsx`
- Depends on: URL search params (for filter state), `useRouter`/`useSearchParams`/`usePathname`
- Rule: NEVER import Prisma or `@/lib/db`. NEVER fetch data directly. Use `useActionState` (React 19, not `useFormState`).
- Purpose: All database queries, centralized data access, `React.cache()` deduplication
- Location: `src/lib/queries.ts` (single file, 336 lines)
- Contains: Named async functions for every data need — `getFeaturedProviders`, `getCategoryCounts`, `getProvidersByCategory`, `getProviderBySlug`, `getProvidersForComparison`, `getRelatedProviders`, `searchProviders`, `searchBlogPosts`, `searchCollections`, `getAllProviderSlugs`, `getAllCollectionSlugs`, `getAllBlogPostSlugs`, `getPublishedCollections`, `getCollectionBySlug`, `getPublishedBlogPosts`, `getBlogPostBySlug`, `getAdminStats`, `getTopAffiliateProviders`, `getProviderReviewStats`
- Depends on: Database Layer (`@/lib/db`), Prisma types from `@/generated/prisma/client`
- Used by: Server Components in Presentation Layer, Server Actions
- Rule: All functions wrapped in `cache()` from React for request-level deduplication. Marked `"server-only"`.
- Purpose: Type-safe Prisma client with Neon PostgreSQL via `@prisma/adapter-pg`
- Location: `src/lib/db.ts` (singleton), `prisma/schema.prisma` (schema definition)
- Contains: PrismaClient instance cached on `globalThis` to survive dev HMR
- Depends on: `DATABASE_URL` env var, generated types in `src/generated/prisma/`
- Used by: Query Layer exclusively (never imported in pages or client components)
- Rule: Always import `prisma` from `@/lib/db`. Never instantiate PrismaClient elsewhere.
- Purpose: Handle mutations (review submission, admin CRUD) with validation
- Location: `src/app/actions/reviews.ts`, `src/app/actions/admin.ts`
- Contains: `submitReview` (review submission with honeypot + rate limiting), `loginAction`, `logoutAction`, `createProvider`, `updateProvider`, `deleteProvider`, `savePlan`, `deletePlan`, `approveReview`, `rejectReview`, `createBlogPost`, `updateBlogPost`, `deleteBlogPost`, `createCollection`, `updateCollection`, `deleteCollection`
- Depends on: Database Layer directly, `revalidatePath()` for cache busting
- Used by: Client Components via form `action=` prop
- Rule: Marked `"use server"`. Return `{ success: boolean, message: string, errors: Record<string, string> }`. Never throw exceptions to client. Call `revalidatePath()` after mutations.
- Purpose: Shared helpers, type mappings, formatting
- Location: `src/lib/`
- Contains: `categories.ts` (bidirectional `CategoryType` enum ↔ URL slug mapping with `CATEGORY_MAP`, `getCategoryBySlug`, `getSlugByCategory`, `CATEGORY_NAV_ITEMS`), `format.ts` (price formatting: `formatPrice`, `formatPriceRange`, `formatPriceLabel`, `dollarsToCents`), `db.ts` (Prisma singleton), `queries.ts` (data access)
- Depends on: Generated Prisma enums from `@/generated/prisma/client`
- Used by: All server-side layers
- Purpose: Protect admin routes from unauthorized access
- Location: `src/proxy.ts`
- Contains: `proxy` function checking `admin_token` cookie against `ADMIN_SECRET` env var; gates all `/admin/*` routes except `/admin/login`
- Rule: Uses Node.js runtime (not Edge). Exports `proxy` function (not `middleware`).
- Purpose: Server-side API endpoint for affiliate click tracking
- Location: `src/app/api/affiliate/[providerId]/route.ts`
- Contains: `GET` handler that resolves provider, logs `AffiliateClick` (fire-and-forget), and redirects to `affiliateUrl` or `website`
- Purpose: Auto-generated TypeScript types and Prisma client runtime
- Location: `src/generated/prisma/`
- Generated by: `npx prisma generate` (output configured in `prisma/schema.prisma`)
- Rule: Never edit. Gitignored. Regenerate after any schema change.
## Data Flow
- No global state library (no Redux, Zustand, or React Context for application data)
- URL search params: sole source of truth for filter/sort state on category listing pages
- `sessionStorage`: comparison selection (up to 4 providers), managed by `CompareProvider` using `useSyncExternalStore`
- Server Actions: form state management via `useActionState` (React 19)
## Key Abstractions
- Purpose: Represents a food box subscription service; hub of all consumer content
- Schema: `prisma/schema.prisma` line 63
- Relations: has many `Plan`, `ProviderDietaryTag`, `Review`, `ProviderFaq`, `AffiliateClick`, `CollectionItem`
- Pattern: Denormalized fields (`averageRating`, `reviewCount`, `minPricePerServingCents`, `maxPricePerServingCents`, `freeShipping`) updated by Server Actions on review approve/reject and plan save/delete. `slug` is the canonical URL identifier.
- Purpose: 5 fixed categories mapping between Prisma enum values and URL slugs
- Enum values: `MEAL_KIT`, `PREPARED_MEAL`, `PROTEIN_BOX`, `PRODUCE_BOX`, `SPECIALTY`
- Slug mapping: `src/lib/categories.ts` — bidirectional (`"meal-kits"` ↔ `CategoryType.MEAL_KIT`)
- Used by: Category pages, sitemap, navigation, filter parsing
- Purpose: Deduplicate Prisma calls within a single render pass
- Pattern: Every function in `src/lib/queries.ts` is wrapped in `cache()` — both `generateMetadata()` and the page component can call `getProviderBySlug()` for the same slug and only one DB round-trip happens
- File marked `"server-only"` to prevent accidental client imports
- Purpose: Client-side comparison selection state across the entire app
- Location: `src/components/CompareProvider.tsx`
- Pattern: `useSyncExternalStore` backed by `sessionStorage` for SSR-safe hydration; stable snapshot caching prevents infinite render loops; max 4 providers; exports `useCompare()` hook for child components
- Purpose: Typed result objects for form state
- Pattern: `{ success: boolean, message: string, errors: Record<string, string> }` from admin actions; `{ success: boolean, message: string, errors: ReviewFormErrors }` from review submission. Never throw to client.
## Entry Points
- Location: `src/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: HTML shell, Geist Sans/Mono font loading, global CSS import, `CompareProvider` context wrapper, `Header`, `Footer`, `CompareBar`
- Location: `src/app/page.tsx`
- Triggers: Request to `/`
- Responsibilities: Hero section, featured providers grid, category cards with counts, "How It Works", social proof stats, WebSite + Organization JSON-LD. Fetches `getFeaturedProviders()` and `getCategoryCounts()` in parallel.
- Location: `src/app/[category]/page.tsx`
- Triggers: Requests to `/{category-slug}` (e.g., `/meal-kits`, `/protein-boxes`)
- Responsibilities: Filter parsing from URL, `getProvidersByCategory()`, provider grid, `CategoryFilters` sidebar, pagination, `ItemList` JSON-LD. Statically generated for all 5 category slugs.
- Location: `src/app/providers/[slug]/page.tsx`
- Triggers: Requests to `/providers/{slug}`
- Responsibilities: Full provider page — hero, pricing table, dietary badges, pros/cons, reviews with rating breakdown, FAQ accordion, related providers, review form, affiliate link, `Product` JSON-LD. Statically generated for all active provider slugs.
- Location: `src/app/compare/[versus]/page.tsx`
- Triggers: Requests to `/compare/{slug-a}-vs-{slug-b}` (canonical, indexable)
- Responsibilities: Two-provider comparison with structured URL, `ComparisonTable`, JSON-LD
- Location: `src/app/compare/page.tsx`
- Triggers: Requests to `/compare?providers=slug1,slug2,...`
- Responsibilities: 2-4 provider comparison driven by search params, `noindex` robots directive
- Location: `src/app/admin/page.tsx`
- Triggers: Authenticated requests to `/admin`
- Responsibilities: Stats overview (provider/review/blog/collection counts, affiliate click count, top affiliate providers by click volume)
- Location: `src/lib/db.ts`
- Triggers: First import in any server-side module
- Responsibilities: Creates and caches `PrismaClient` with `PrismaPg` adapter for Neon. `globalThis` caching survives HMR in development.
- Location: `src/proxy.ts`
- Triggers: All incoming requests (Next.js 16 request interception)
- Responsibilities: Passes through non-admin routes immediately. For `/admin/*` (except `/admin/login`), checks `admin_token` cookie equals `ADMIN_SECRET`. Redirects to `/admin/login` on mismatch.
- Location: `src/app/api/affiliate/[providerId]/route.ts`
- Triggers: GET requests to `/api/affiliate/{providerId}`
- Responsibilities: Looks up provider, logs `AffiliateClick` asynchronously (fire-and-forget), redirects browser to `affiliateUrl` or `website`
- Location: `src/app/sitemap.ts`
- Triggers: `GET /sitemap.xml`
- Responsibilities: Generates sitemap entries for all public routes (static pages, 5 category pages, all active provider slugs, all published collection slugs, all published blog post slugs)
## Error Handling
- `src/app/error.tsx`: Root-level error boundary (must be Client Component) with "Try again" / "Go to homepage" actions
- `src/app/global-error.tsx`: Unrecoverable application error fallback
- `src/app/not-found.tsx`: Custom 404 with search input and category links
- `notFound()` from `next/navigation`: Called in page components when a slug returns `null` from the Query Layer — triggers HTTP 404 and renders `not-found.tsx`
- Server Actions: Return `{ success: false, errors }` — never throw raw database errors to the client
- Affiliate route: Falls back to homepage redirect if provider not found
- Admin actions: Silently catch errors on delete operations (entity may already be deleted); rethrow `NEXT_REDIRECT` exceptions
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
