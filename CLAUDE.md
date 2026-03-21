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

A live discovery, comparison, and directory website for food box subscription services. Consumers can find and compare meal kits, prepared meals, protein boxes, produce boxes, and specialty food subscriptions through mobile-first UX, comprehensive filtering, side-by-side comparisons, and SEO-optimized content. Includes an internal admin interface for content management and affiliate click tracking for revenue.

**Core Value:** Consumers can quickly discover and compare food box subscriptions that match their dietary needs, budget, and preferences — with trustworthy reviews and transparent pricing.

### Constraints

- **Tech Stack**: Next.js 16.2, React 19, Tailwind CSS 4, Prisma 7.5, Neon PostgreSQL — already configured, no changes
- **Hosting**: Vercel — serverless, ISR support, no deploy yet
- **Next.js 16 Breaking Changes**: `params`/`searchParams` are Promises (must await), `proxy.ts` replaces `middleware.ts`, async `cookies()`/`headers()`/`draftMode()`
- **No Auth**: Admin protected by `proxy.ts` + `ADMIN_SECRET` env var only. No user accounts.
- **Images**: Provider logos stored as URLs in database. Next.js Image with `remotePatterns`.
- **Budget**: Minimal — no paid APIs, no premium services beyond Neon and Vercel free tiers
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.3 - All application code, configuration files, and Prisma seed scripts. Strict mode enabled in `tsconfig.json`.
- CSS - Tailwind CSS 4 utility classes via `@import "tailwindcss"` in `src/app/globals.css`
- SQL - PostgreSQL via Prisma ORM (no raw SQL written)
## Runtime
- Node.js v24.9.0 (no `.nvmrc` or `.node-version` pinning file)
- Vercel production target uses Node.js 24.x (configured in `.vercel/project.json`)
- npm 11.6.0
- Lockfile: `package-lock.json` (present)
## Frameworks
- Next.js 16.2.0 - Full-stack React framework (App Router, Server Components)
- React 19.2.4 - UI library
- React DOM 19.2.4
- Prisma 7.5.0 - Database ORM and schema management
- Tailwind CSS 4.2.2 - Utility-first CSS, configured via PostCSS
- Not configured (no test framework installed)
- TypeScript 5.9.3 - Type checking (strict mode)
- ESLint 9.39.4 - Linting (flat config format)
- PostCSS - CSS processing via `postcss.config.mjs`
## Key Dependencies
- `next` 16.2.0 - Application framework
- `react` 19.2.4 - UI rendering
- `react-dom` 19.2.4 - DOM rendering
- `@prisma/client` 7.5.0 - Database client (generated into `src/generated/prisma/`)
- `@prisma/adapter-pg` 7.5.0 - PostgreSQL adapter for Prisma (uses `pg` driver directly)
- `dotenv` 17.3.1 - Environment variable loading (used by `prisma.config.ts`)
- `prisma` 7.5.0 - Prisma CLI (schema management, generation)
- `tailwindcss` 4.2.2 - CSS utility framework
- `@tailwindcss/postcss` 4.x - PostCSS integration for Tailwind
- `typescript` 5.9.3 - TypeScript compiler
- `eslint` 9.39.4 - Linter
- `eslint-config-next` 16.2.0 - Next.js ESLint rules
- `@types/node` 20.x - Node.js type definitions
- `@types/react` 19.x - React type definitions
- `@types/react-dom` 19.x - React DOM type definitions
- No test runner (Jest, Vitest, or Playwright)
- No markdown rendering library (needed for Phase 70 blog)
- No rate limiting library (needed for Phase 90 reviews)
- No image processing beyond Next.js built-in Image component
- No formatter (Prettier, Biome) -- no `.prettierrc` or `biome.json` present
## Configuration
- `strict: true` - Full strict mode
- `target: ES2017`
- `module: esnext` with `moduleResolution: bundler`
- Path alias: `@/*` maps to `./src/*`
- Incremental compilation enabled
- Next.js plugin registered
- Imports via `@import "tailwindcss"`
- Custom CSS variables: `--background`, `--foreground`, `--font-sans`, `--font-mono`
- Dark mode: `prefers-color-scheme` media query (system preference)
- Fonts: Geist Sans and Geist Mono loaded via `next/font/google` in `src/app/layout.tsx`
- Currently default/empty -- no custom configuration
- No `images.remotePatterns` configured (will need this for provider logos)
- No `cacheComponents` enabled yet
- No React Compiler enabled yet
- Flat config format (ESLint 9)
- Extends Next.js core-web-vitals and TypeScript presets
- Global ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`
- Single plugin: `@tailwindcss/postcss`
- Schema location: `prisma/schema.prisma`
- Migrations path: `prisma/migrations`
- Datasource URL from `DATABASE_URL` environment variable
- Loads env via `import "dotenv/config"`
- `.env` file present (contains database connection configuration)
- `.env*` files are gitignored
- No `.env.example` file to document required variables
## Database
- Uses global variable pattern to prevent multiple instances in development
- Exports `prisma` as the single client instance
- All database access must go through this import
- `Provider` - Core entity (food box services)
- `Plan` - Pricing plans per provider
- `ProviderDietaryTag` - Many-to-many dietary tag associations
- `Review` - User reviews with moderation status
- `ProviderFaq` - FAQ entries per provider
- `BlogPost` - Editorial blog content
- `Collection` - Curated "best of" lists
- `CollectionItem` - Junction table for Collection-Provider
- `AffiliateClick` - Click tracking analytics
## Build & Scripts
## Platform Requirements
- Node.js 24.x (current local version)
- PostgreSQL database (Neon serverless)
- `DATABASE_URL` environment variable
- Vercel hosting (`.vercel/` directory present, project initialized as `foodboxfinder`)
- Vercel Node.js 24.x runtime
- Neon PostgreSQL (serverless, connection pooling)
- No Docker, no CI/CD pipeline configured
- No pre-commit hooks (no Husky, no lint-staged)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Page components: `page.tsx` (Next.js App Router convention)
- Layout components: `layout.tsx` (Next.js App Router convention)
- Utility modules: `camelCase.ts` (e.g., `db.ts`)
- Config files: `camelCase.config.ts` or `camelCase.config.mjs` (e.g., `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `prisma.config.ts`)
- Global styles: `globals.css` in `src/app/`
- Prisma schema: `schema.prisma` in `prisma/`
- Future components: `PascalCase.tsx` (e.g., `ProviderCard.tsx`, `FilterSidebar.tsx`)
- Future Server Actions: `camelCase.ts` in `src/app/actions/` (e.g., `reviews.ts`)
- React components: `PascalCase` function declarations (not arrow functions):
- Utility functions: `camelCase` (e.g., `getProviders`, `formatPrice`)
- Server Actions: `camelCase` with verb prefix (e.g., `submitReview`, `updateProvider`)
- Local variables: `camelCase` (e.g., `geistSans`, `geistMono`, `globalForPrisma`)
- Config objects: `camelCase` (e.g., `nextConfig`, `eslintConfig`)
- Constants: `camelCase` (same as variables, no UPPER_CASE for JS constants)
- Environment variables: `UPPER_SNAKE_CASE` (e.g., `DATABASE_URL`, `NODE_ENV`)
- Type/interface names: `PascalCase`
- Use `import type` for type-only imports:
- Prisma-generated types: import from `@/generated/prisma/client`
- Inline prop types with `Readonly<{}>` wrapper (no separate interface files for simple props)
- Models: `PascalCase` (e.g., `Provider`, `Plan`, `BlogPost`, `ProviderDietaryTag`)
- Fields: `camelCase` (e.g., `providerId`, `averageRating`, `pricePerServing`)
- Enum type names: `PascalCase` (e.g., `CategoryType`, `DietaryTag`, `PlanFrequency`)
- Enum values: `UPPER_SNAKE_CASE` (e.g., `MEAL_KIT`, `GLUTEN_FREE`, `WEEKLY`)
- ID fields: `cuid()` default (not UUID)
- Section dividers: `// --- Section Name ---` style comments
## Code Style
- No dedicated formatter (Prettier/Biome) is configured
- 2-space indentation in all files
- Double quotes for all strings (imports, JSX attributes, values)
- Semicolons at end of statements
- Trailing commas in multi-line objects, arrays, and function parameters
- ESLint 9 with flat config: `eslint.config.mjs`
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Run with: `npx eslint .` (NOT `next lint` -- removed in Next.js 16)
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Strict mode enabled in `tsconfig.json` (`"strict": true`)
- All strict sub-flags active: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, `alwaysStrict`
- No `any` types allowed (enforced by project rules in `AGENTS.md`)
- No `@ts-ignore` allowed (enforced by project rules in `AGENTS.md`)
- Target: `ES2017`, Module: `esnext`, Module resolution: `bundler`
- Incremental compilation enabled
- Next.js compiler plugin active
## Import Organization
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Use `@/generated/prisma/client` for Prisma client types
- Use `@/lib/db` for the database singleton
- Use `@/components/` for shared components
- Use `@/app/actions/` for Server Actions
- Always use `import type` for type-only imports. This is enforced consistently.
## Component Patterns
- All pages and layouts are Server Components unless they need interactivity
- Data fetching happens directly in Server Components via Prisma
- Export `metadata` or `generateMetadata()` from every public page
- Include JSON-LD structured data on every public page
- Add `"use client"` directive ONLY for: browser APIs, event handlers, `useState`, `useEffect`, or other React hooks
- Never import Prisma in client components
- Use `useActionState` (NOT `useFormState` -- renamed in React 19)
- Inline destructured props with `Readonly<{}>` wrapper:
- `params` and `searchParams` are Promises -- always `await` them:
- `cookies()`, `headers()`, `draftMode()` must be awaited
- Use `proxy.ts` (NOT `middleware.ts`) -- renamed in Next.js 16
- Export `proxy` function (not `middleware`)
- Runs on Node.js runtime only (NOT Edge)
- Admin routes under `/admin/` are protected via `proxy.ts`
## Styling
- Config: `postcss.config.mjs` with `@tailwindcss/postcss` plugin
- Global import: `@import "tailwindcss"` in `src/app/globals.css` (Tailwind v4 syntax, NOT `@tailwind` directives)
- No CSS modules, no styled-components, no component libraries
- Uses `prefers-color-scheme` media query (system preference, not class-based toggle)
- Dark mode is deprioritized for launch (Out of Scope per `PROJECT.md`)
- Dark values set in `@media (prefers-color-scheme: dark)` block in `src/app/globals.css`
- Geist Sans and Geist Mono loaded via `next/font/google` in `src/app/layout.tsx`
- Applied as CSS variables on `<html>`: `--font-geist-sans`, `--font-geist-mono`
- Referenced in `@theme inline` block as `--font-sans` and `--font-mono`
- Tailwind utility classes directly in JSX `className`
- Template literals to compose dynamic classes:
- Use semantic HTML elements with Tailwind classes (`<main>`, `<nav>`, `<article>`, `<section>`, `<aside>`)
## Database Access
- Uses Neon PostgreSQL adapter (`@prisma/adapter-pg`)
- Hot-reload safe via `globalThis` caching pattern
- Import as: `import { prisma } from "@/lib/db"`
- All models use `cuid()` for primary keys (`@id @default(cuid())`)
- Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Slugs are `@unique` and used as canonical URL identifiers
- Denormalized fields for performance (e.g., `averageRating`, `reviewCount` on `Provider`)
- JSON stored as `String @db.Text` with `*Json` suffix (e.g., `prosJson`, `consJson`)
- SEO fields on content models: `metaTitle @db.VarChar(70)`, `metaDescription @db.VarChar(160)`
- Indexes on: foreign keys, filter columns, sort columns
- Cascade deletes on all child relations (`onDelete: Cascade`)
- Section dividers with comments: `// --- Section Name ---`
- Client generated to `src/generated/prisma/` (git-ignored)
- Build script runs `prisma generate` before `next build`:
## Error Handling
- No error handling patterns established yet (early-stage scaffolded project)
- Non-null assertion (`!`) used for required env vars: `process.env.DATABASE_URL!`
- No `error.tsx`, `not-found.tsx`, or `loading.tsx` files exist
- Add `error.tsx` boundary files at route segment levels for graceful error recovery
- Add `not-found.tsx` for custom 404 pages
- Add `loading.tsx` for Suspense boundaries / loading states
- Use `notFound()` from `next/navigation` when a resource is not found by slug
- Validate environment variables at startup rather than using `!` assertions
- In Server Actions: use try/catch and return typed result objects (not throw)
- Never expose raw database errors to the client
## Logging
- No structured logging library installed
- No monitoring/error tracking service integrated
## Comments
- Prisma schema: section separator comments (`// --- Section Name ---`)
- Prisma schema: inline field documentation (`// JSON array of strings`, `// 1-5`, `// hashed IP for dedup, never store raw IP`)
- Source code: minimal comments, prefer self-documenting code
- Config files: brief inline comments where helpful (`/* config options here */`)
- Not used in application code
- Prisma-generated code includes JSDoc (auto-generated, do not edit)
## Function Design
## Module Design
- Pages/layouts: `export default function` (required by Next.js)
- Metadata: `export const metadata` (named export)
- Prisma singleton: named export `export const prisma` from `src/lib/db.ts`
- Utilities: named exports (no default exports for non-page modules)
- Not used in application code
- Prisma-generated code uses barrel exports in `src/generated/prisma/`
- Server Actions: `src/app/actions/` or colocated with the form
- Shared components: `src/components/` (flat structure unless a group needs isolation)
- Library code: `src/lib/`
- Query helpers: `src/lib/queries.ts` (single file for MVP, split when exceeding 300 lines per `PROJECT.md`)
- Generated code: `src/generated/` (git-ignored)
## URL Conventions
- URL search params drive filter/sort state on listing pages
- Keep URLs shareable and bookmarkable
- Filters update URL and results synchronously
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Server Components by default; Client Components only for interactive UI (filters, forms, comparison tray, search bar)
- Central entity is `Provider`, which radiates to category listings, detail pages, comparisons, collections, and blog content
- All consumer-facing data fetching happens server-side via Prisma through a centralized query layer
- URL search params are the shared state contract between Server and Client Components (no global state store)
- Admin subsystem is isolated under `/admin` and protected by `proxy.ts` authentication
- On-demand revalidation from admin mutations keeps pages cached but fresh
- SEO-first: every public page requires metadata exports and JSON-LD structured data
## Layers
- Purpose: Render HTML via Server Components, define routes and metadata, export JSON-LD structured data
- Location: `src/app/`
- Contains: Page components (`page.tsx`), layouts (`layout.tsx`), loading states (`loading.tsx`), error boundaries (`error.tsx`), not-found pages (`not-found.tsx`)
- Depends on: Query Layer for data, Component Layer for UI
- Used by: Next.js router (browser requests)
- Rule: All pages are Server Components. Always `await params` and `await searchParams` (Promises in Next.js 16). Always export `metadata` or `generateMetadata()`.
- Purpose: Reusable UI building blocks, both Server and Client Components
- Location: `src/components/` (planned, does not exist yet)
- Contains: Domain components (ProviderCard, ComparisonTable, FilterPanel) and UI primitives in `ui/` subdirectory (Button, Card, Badge, Input, Select, Skeleton)
- Depends on: Tailwind CSS 4 for styling, props from Presentation Layer
- Used by: Pages and layouts in `src/app/`
- Rule: Flat structure unless a component group needs isolation. Server Components by default; add `"use client"` only when browser APIs, event handlers, or React hooks are needed.
- Purpose: Handle browser interactivity requiring state, effects, or event handlers
- Location: `src/components/` (files with `"use client"` directive)
- Contains: FilterPanel (URL-driven filters), ComparisonTray (floating bar), SearchBar (expandable input), ReviewForm (star rating + text), mobile navigation
- Depends on: URL search params (for filter state), props from Server Components
- Used by: Composed as children of Server Components
- Rule: NEVER import Prisma or `@/lib/db`. NEVER fetch data directly. Receive all data as props or interact via Server Actions and URL params.
- Purpose: All database queries, centralized data access, React.cache() deduplication
- Location: `src/lib/queries.ts` (single file for MVP, split when exceeding 300 lines)
- Contains: ~20 named async functions for every data need (listings, detail, comparison, search, admin stats)
- Depends on: Database Layer (Prisma Client via `src/lib/db.ts`)
- Used by: Server Components in Presentation Layer, Server Actions
- Rule: Wrap all functions in `React.cache()` for request-level deduplication. Export named functions. Use Prisma's type-safe API (no raw SQL in MVP). All functions are `async`.
- Purpose: Type-safe database client with connection pooling via Neon adapter
- Location: `src/lib/db.ts` (singleton), `prisma/schema.prisma` (schema definition)
- Contains: PrismaClient instance configured with `@prisma/adapter-pg` (PrismaPg) for Neon PostgreSQL
- Depends on: `DATABASE_URL` environment variable, generated types in `src/generated/prisma/`
- Used by: Query Layer exclusively (never imported directly in pages or client components)
- Rule: Always import `prisma` from `@/lib/db`. Never instantiate PrismaClient elsewhere. Singleton cached on `globalThis` in development to survive HMR.
- Purpose: Handle mutations (review submission, admin CRUD) with validation
- Location: `src/app/actions/` for global actions, or colocated with forms
- Contains: `"use server"` functions for form submissions and admin operations
- Depends on: Database Layer, Query Layer for reads, validation logic
- Used by: Client Components via `action={serverAction}` on forms
- Rule: Mark with `"use server"` directive. Return `{ success: boolean, errors?: Record<string, string[]> }` -- never throw exceptions to the client. Call `revalidatePath()` after mutations.
- Purpose: Protect admin routes from unauthorized access
- Location: `src/proxy.ts` (Next.js 16 replaces `middleware.ts` with `proxy.ts`)
- Contains: Request interception checking `ADMIN_SECRET` env var against request headers/cookies
- Depends on: `ADMIN_SECRET` environment variable
- Used by: Next.js runtime (intercepts all requests; gates `/admin/*` routes)
- Rule: Uses Node.js runtime only (NOT Edge). Export `proxy` function (NOT `middleware`).
- Purpose: Shared helpers, type mappings, filter parsing, formatting
- Location: `src/lib/`
- Contains: `categories.ts` (slug-to-enum bidirectional mapping), `filters.ts` (searchParams parser with validation), `utils.ts` (formatPrice, etc.)
- Depends on: Generated Prisma enums from `@/generated/prisma/enums`
- Used by: All server-side layers
- Purpose: Auto-generated TypeScript types and Prisma client runtime
- Location: `src/generated/prisma/`
- Contains: PrismaClient class (`client.ts`), model types (`models.ts`), enum types (`enums.ts`), input types (`commonInputTypes.ts`), internal runtime (`internal/`)
- Generated by: `npx prisma generate` (output configured in `prisma/schema.prisma` line 6-7)
- Rule: Never edit directly. Regenerate after any `prisma/schema.prisma` change. Gitignored.
## Data Flow
- No global state library (no Redux, Zustand, or Context for application data)
- URL search params are the single source of truth for filter/sort state on listing pages
- Comparison selection uses React state in a layout-level Client Component (ComparisonTray), transfers to URL params when navigating to comparison page
- Server Actions return structured result objects for form state management via `useActionState` (React 19)
## Key Abstractions
- Purpose: Represents a food box subscription service; the hub of all consumer-facing content
- Schema: `prisma/schema.prisma` lines 63-112
- Relations: has many Plans, ProviderDietaryTags, Reviews, ProviderFaqs, AffiliateClicks, CollectionItems
- Pattern: Denormalized fields (`averageRating`, `reviewCount`, planned: `minPricePerServing`, `maxPricePerServing`, `freeShipping`) for listing query performance. Slug is the canonical URL identifier.
- Purpose: Classifies providers into 5 fixed categories
- Schema: `prisma/schema.prisma` lines 15-21
- Values: MEAL_KIT, PREPARED_MEAL, PROTEIN_BOX, PRODUCE_BOX, SPECIALTY
- Pattern: Mapped to URL slugs via bidirectional utility in `src/lib/categories.ts`: `"meal-kits"` <-> `CategoryType.MEAL_KIT`. Only 5 values, so an enum is simpler than a model.
- Purpose: Represents a specific subscription plan within a provider
- Schema: `prisma/schema.prisma` lines 114-149
- Pattern: Multiple plans per provider; `sortOrder` for display ordering; `pricePerServing` as primary comparison metric; includes flexibility data (`canSkip`, `canCancel`, `cancelPolicy`)
- Purpose: "Best of" content grouping providers with ranked order and editorial notes
- Schema: `prisma/schema.prisma` lines 223-258
- Pattern: Many-to-many with Provider through CollectionItem join model (with `sortOrder` and editorial `note` per item)
- Purpose: Named, typed, cached query functions as the sole interface to the database
- Pattern: All wrapped in `React.cache()` for deduplication within a single render pass (prevents duplicate Prisma calls when both `generateMetadata()` and page component need the same data)
- Example functions: `getFeaturedProviders()`, `getProviderBySlug()`, `getProvidersByCategory()`, `getProvidersBySlugs()`, `searchProviders()`, `getAdminStats()`
- Purpose: Parse untrusted URL search params into typed, validated filter objects with safe defaults
- Pattern: Returns typed `ProviderFilters` object; invalid values silently fall back to defaults; server is the authority on valid filter values
## Entry Points
- Location: `src/app/layout.tsx`
- Triggers: Every page request (wraps all routes)
- Responsibilities: HTML shell (`<html>`, `<body>`), Geist Sans and Geist Mono font loading via `next/font/google`, global CSS import (`globals.css`), antialiased text, flex column body for sticky footer pattern
- Location: `src/app/page.tsx`
- Triggers: Request to `/`
- Responsibilities: Currently renders default Next.js create-next-app template. Will become homepage with hero section, featured providers, category cards, social proof, WebSite/Organization JSON-LD.
- Location: `src/lib/db.ts`
- Triggers: First import in any server-side module
- Responsibilities: Creates and caches PrismaClient with `PrismaPg` adapter connected to Neon via `DATABASE_URL`. Cached on `globalThis` in development to survive hot module replacement.
- Location: `package.json` `"build"` script
- Command: `prisma generate && next build`
- Ensures Prisma client is regenerated before every production build
- Location: `src/proxy.ts`
- Triggers: All incoming requests (Next.js 16 request interception)
- Responsibilities: Check `ADMIN_SECRET` for `/admin/*` routes; pass through all other requests. Node.js runtime only.
## Error Handling
- Call `notFound()` from `next/navigation` before any Suspense boundary for missing providers/content (ensures HTTP 404 status code)
- `error.tsx` error boundaries on all route segments (must use `"use client"`)
- `loading.tsx` streaming loading states with skeleton components
- `not-found.tsx` with search bar and category suggestions
- `global-error.tsx` for unrecoverable application errors
- Server Actions return `{ success, errors }` objects -- never throw exceptions to the client
- JSON-LD XSS prevention: `.replace(/</g, "\\u003c")` on all `JSON.stringify` output in structured data
## Cross-Cutting Concerns
## Database Schema
| Model | Purpose | Location in Schema |
|-------|---------|-------------------|
| `Provider` | Central entity: food box subscription service with slug, category, ratings, editorial content, SEO fields | `prisma/schema.prisma` line 63 |
| `Plan` | Pricing plan per Provider with per-serving/per-week/per-box pricing, frequency, skip/cancel policies | `prisma/schema.prisma` line 114 |
| `ProviderDietaryTag` | Join: Provider to DietaryTag enum. Unique on `[providerId, tag]` | `prisma/schema.prisma` line 151 |
| `Review` | User-submitted review with 1-5 rating, moderation status (PENDING/APPROVED/REJECTED) | `prisma/schema.prisma` line 162 |
| `ProviderFaq` | FAQ entries per provider with sortOrder | `prisma/schema.prisma` line 183 |
| Model | Purpose | Location in Schema |
|-------|---------|-------------------|
| `BlogPost` | Editorial content with slug, body, status (DRAFT/PUBLISHED/ARCHIVED), SEO fields | `prisma/schema.prisma` line 200 |
| `Collection` | Curated "best of" lists with editorial body content | `prisma/schema.prisma` line 223 |
| `CollectionItem` | Join: Collection to Provider with sortOrder and editorial note | `prisma/schema.prisma` line 246 |
| Model | Purpose | Location in Schema |
|-------|---------|-------------------|
| `AffiliateClick` | Tracks affiliate link clicks with source, referrer, hashed IP for dedup | `prisma/schema.prisma` line 262 |
- `CategoryType`: MEAL_KIT, PREPARED_MEAL, PROTEIN_BOX, PRODUCE_BOX, SPECIALTY
- `DietaryTag`: 16 values (VEGAN, VEGETARIAN, PESCATARIAN, KETO, PALEO, GLUTEN_FREE, DAIRY_FREE, NUT_FREE, LOW_CARB, LOW_SODIUM, ORGANIC, HALAL, KOSHER, DIABETIC_FRIENDLY, WHOLE30, MEDITERRANEAN)
- `PlanFrequency`: WEEKLY, BIWEEKLY, MONTHLY, FLEXIBLE
- `ReviewStatus`: PENDING, APPROVED, REJECTED
- `ContentStatus`: DRAFT, PUBLISHED, ARCHIVED
- `Provider`: `[category]`, `[featured]`, `[active]`, `[averageRating]` (planned composite: `[category, active, averageRating]`)
- `Plan`: `[providerId]`, `[pricePerServing]`
- `Review`: `[providerId]`, `[status]`, `[rating]`
- `BlogPost`: `[status]`, `[publishedAt]`
- `ProviderDietaryTag`: `[tag]`, unique `[providerId, tag]`
- `AffiliateClick`: `[providerId]`, `[createdAt]`
- `Collection`: `[status]`
- `CollectionItem`: `[collectionId]`, unique `[collectionId, providerId]`
## Planned Route Structure
```
```
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
