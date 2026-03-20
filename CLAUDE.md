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

A ready-to-launch discovery, comparison, and directory website for food box subscription services. Helps consumers find and compare meal kits, prepared meals, protein boxes, produce boxes, and specialty food subscriptions through beautiful mobile-first UX, comprehensive filtering, side-by-side comparisons, and SEO-optimized content. Includes an internal admin interface for content management and affiliate click tracking for revenue.

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
- `.env` file present (contains `DATABASE_URL` for Neon PostgreSQL)
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
- Vercel hosting (`.vercel/` directory present, project initialized)
- Neon PostgreSQL (serverless, connection pooling)
- No Docker, no CI/CD pipeline configured
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Page components: `page.tsx` (Next.js App Router convention)
- Layout components: `layout.tsx` (Next.js App Router convention)
- Utility modules: `camelCase.ts` (e.g., `db.ts`)
- Config files: `camelCase.config.ts` or `camelCase.config.mjs` (e.g., `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `prisma.config.ts`)
- Global styles: `globals.css`
- Prisma schema: `schema.prisma` in `prisma/` directory
- React components: `PascalCase` (e.g., `Home`, `RootLayout`)
- Use `function` declarations for page/layout exports (not arrow functions):
- Use `camelCase` for all variables (e.g., `geistSans`, `geistMono`, `globalForPrisma`)
- Use `camelCase` for config constants (e.g., `nextConfig`, `eslintConfig`)
- Environment variables: `UPPER_SNAKE_CASE` (e.g., `DATABASE_URL`, `NODE_ENV`)
- Use `PascalCase` for types and interfaces
- Use `import type` for type-only imports:
- Prisma-generated types come from `@/generated/prisma/client`
- Inline type annotations for component props using `Readonly<{}>` pattern
- Models: `PascalCase` (e.g., `Provider`, `Plan`, `BlogPost`, `ProviderDietaryTag`)
- Fields: `camelCase` (e.g., `providerId`, `averageRating`, `pricePerServing`)
- Enum type names: `PascalCase` (e.g., `CategoryType`, `DietaryTag`, `PlanFrequency`)
- Enum values: `UPPER_SNAKE_CASE` (e.g., `MEAL_KIT`, `GLUTEN_FREE`, `WEEKLY`)
- ID fields: `cuid()` default (not UUID)
## Code Style
- No dedicated formatter (Prettier/Biome) configured
- 2-space indentation (observed in all source files)
- Double quotes for all strings (imports, JSX attributes, etc.)
- Semicolons at end of statements
- Trailing commas in multi-line objects, arrays, and function params
- ESLint 9 with flat config format: `eslint.config.mjs`
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Run with: `npx eslint .` (NOT `next lint` -- removed in Next.js 16)
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Strict mode enabled in `tsconfig.json` (`"strict": true`)
- All strict sub-flags active: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, `alwaysStrict`
- No `any` types allowed (enforced by project rules in `AGENTS.md`)
- No `@ts-ignore` allowed
- Target: `ES2017`, Module: `esnext`, Module resolution: `bundler`
- Incremental compilation enabled
- Next.js compiler plugin active
## Import Organization
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Use `@/generated/prisma/client` for Prisma client types
- Use `@/lib/db` for the database singleton
- Use `@/components/` for shared components (create when adding first component)
- Always use `import type` for type-only imports. This is a project convention observed consistently.
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
- Admin routes under `/admin/` are protected via proxy.ts
## Styling
- Config: `postcss.config.mjs` with `@tailwindcss/postcss` plugin
- Global import: `@import "tailwindcss"` in `src/app/globals.css` (Tailwind v4 syntax, NOT `@tailwind` directives)
- No CSS modules, no styled-components, no component libraries
- Uses `prefers-color-scheme` media query (system preference, not class-based toggle)
- Dark values set in `@media (prefers-color-scheme: dark)` block
- Geist Sans and Geist Mono loaded via `next/font/google`
- Applied as CSS variables on `<html>`: `--font-geist-sans`, `--font-geist-mono`
- Tailwind utility classes directly in JSX `className`
- Template literals to compose variable classes:
- Semantic HTML elements with Tailwind classes (`<main>`, `<nav>`, `<article>`, etc.)
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
- Client generated to `src/generated/prisma/` (git-ignored in `.gitignore`)
- Build script runs `prisma generate` before `next build`:
## Error Handling
- No error handling patterns established yet (early-stage project)
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
- Not used in application code
- Prisma-generated code uses barrel exports in `src/generated/prisma/`
- Server Actions: `src/app/actions/` or colocated with the form
- Shared components: `src/components/` (flat structure unless a group needs isolation)
- Library code: `src/lib/`
- Generated code: `src/generated/` (git-ignored)
## URL Conventions
- URL search params drive filter/sort state on listing pages
- Keep URLs shareable and bookmarkable
- Filters update URL and results in real time
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Server Components by default; Client Components only for interactive UI (filters, modals, mobile nav)
- File-based routing via Next.js App Router in `src/app/`
- Database access exclusively through Prisma singleton in `src/lib/db.ts` -- server-side only
- URL search params drive filter/sort state for shareable, SEO-indexable URLs
- No user authentication -- admin protected by `proxy.ts` with `ADMIN_SECRET` env var
- Affiliate revenue model: click tracking on outbound provider links
- SEO-first: every public page requires `metadata`/`generateMetadata()` and JSON-LD structured data
## Layers
- Purpose: Render pages with data fetched directly via Prisma queries
- Location: `src/app/` (route segments), `src/components/` (shared UI, not yet created)
- Contains: Page components, layouts, metadata exports, JSON-LD structured data
- Depends on: Prisma client via `src/lib/db.ts`, query helpers in `src/lib/`
- Used by: End users via browser
- Rule: All pages are Server Components. Fetch data here, pass to children as props.
- Purpose: Handle browser interactivity requiring state, effects, or event handlers
- Location: `src/components/` (files must include `"use client"` directive at top)
- Contains: Filter panels, comparison selector, mobile navigation, search bar, review forms, star rating inputs
- Depends on: URL search params (for filter state), props from Server Components
- Used by: Server Components (composed as children or receive data via props)
- Rule: NEVER import Prisma or access the database. NEVER import from `@/lib/db`.
- Purpose: Type-safe database queries against Neon PostgreSQL
- Location: `src/lib/db.ts` (singleton client), `prisma/schema.prisma` (schema)
- Contains: PrismaClient instance configured with `@prisma/adapter-pg` for Neon
- Depends on: `DATABASE_URL` environment variable
- Used by: Server Components, Server Actions, API routes
- Rule: Always import from `src/lib/db.ts`. Never instantiate PrismaClient elsewhere.
- Purpose: Reusable typed query functions consumed by pages and API routes
- Location: `src/lib/queries.ts` (planned, not yet created)
- Contains: Functions like `getFeaturedProviders()`, `getProviderBySlug()`, `getProvidersByCategory()`
- Depends on: Prisma client from `src/lib/db.ts`
- Used by: Server Components in `src/app/`
- Rule: All functions are `async`, export named functions, use Prisma's type-safe API (no raw SQL in MVP)
- Purpose: Handle form submissions and data mutations
- Location: `src/app/actions/` for global actions, or colocated with forms
- Contains: Review submission, admin CRUD operations
- Depends on: Prisma client, validation logic
- Used by: Client Components via `action={serverAction}` on forms
- Rule: Mark with `"use server"` directive. Return structured results, do not throw.
- Purpose: Internal content management interface
- Location: `src/app/admin/` (not yet created)
- Contains: Provider CRUD, review moderation, blog/collection management, affiliate analytics
- Depends on: Prisma client, `proxy.ts` for access control
- Used by: Site administrators only
- Rule: Protected by `proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`). Uses `ADMIN_SECRET` env var.
- Purpose: Auto-generated TypeScript types and client code from schema
- Location: `src/generated/prisma/`
- Contains: PrismaClient class (`client.ts`), model types (`models.ts`), enum types (`enums.ts`), input types (`commonInputTypes.ts`)
- Depends on: `prisma/schema.prisma`
- Used by: All server-side code via `import { PrismaClient } from "@/generated/prisma/client"`
- Rule: Never edit directly. Regenerate with `npx prisma generate` after any schema change.
## Data Flow
- No global state library. URL search params are the primary state mechanism.
- Comparison state (selected providers) uses client-side React state, persisted across navigations via context or URL params
- Filter state always in URL search params for shareability and SEO
## Database Schema
- `Provider` -- Central entity. Food box subscription service with slug, category, ratings, editorial content, SEO fields. All consumer pages revolve around this model. Schema: `prisma/schema.prisma` line 63.
- `Plan` -- Pricing plan per Provider. Tracks per-serving/per-week/per-box pricing, frequency, skip/cancel policies. Schema: `prisma/schema.prisma` line 114.
- `ProviderDietaryTag` -- Join model: Provider to `DietaryTag` enum. Unique on `[providerId, tag]`. Schema: `prisma/schema.prisma` line 151.
- `Review` -- User-submitted review. 1-5 rating, moderation status (PENDING/APPROVED/REJECTED). Provider has denormalized `averageRating` and `reviewCount`. Schema: `prisma/schema.prisma` line 162.
- `ProviderFaq` -- FAQ entries per provider with `sortOrder`. Schema: `prisma/schema.prisma` line 183.
- `BlogPost` -- Editorial content with slug, body, status (DRAFT/PUBLISHED/ARCHIVED), SEO fields. Schema: `prisma/schema.prisma` line 200.
- `Collection` -- Curated "best of" lists (e.g., "Best Keto Meal Kits") with editorial body. Schema: `prisma/schema.prisma` line 223.
- `CollectionItem` -- Join model: Collection to Provider with `sortOrder` and editorial `note`. Schema: `prisma/schema.prisma` line 246.
- `AffiliateClick` -- Tracks affiliate link clicks with source, referrer, hashed IP for dedup. Schema: `prisma/schema.prisma` line 262.
- `CategoryType`: MEAL_KIT, PREPARED_MEAL, PROTEIN_BOX, PRODUCE_BOX, SPECIALTY
- `DietaryTag`: 16 values (VEGAN, VEGETARIAN, PESCATARIAN, KETO, PALEO, GLUTEN_FREE, DAIRY_FREE, NUT_FREE, LOW_CARB, LOW_SODIUM, ORGANIC, HALAL, KOSHER, DIABETIC_FRIENDLY, WHOLE30, MEDITERRANEAN)
- `PlanFrequency`: WEEKLY, BIWEEKLY, MONTHLY, FLEXIBLE
- `ReviewStatus`: PENDING, APPROVED, REJECTED
- `ContentStatus`: DRAFT, PUBLISHED, ARCHIVED
## Planned Route Structure
```
```
## Key Abstractions
- Purpose: Single PrismaClient instance across hot reloads in development
- Pattern: Global singleton cached on `globalThis` in non-production
- Usage: `import { prisma } from "@/lib/db"` in any server-side module
- Implementation uses `PrismaPg` adapter with `DATABASE_URL` connection string
- The core data model. All consumer-facing pages revolve around Provider queries.
- Relations fan out: Provider -> Plans, Reviews, FAQs, DietaryTags, AffiliateClicks, CollectionItems
- Slug is the canonical URL identifier: `/providers/[slug]`
- `CategoryType` enum maps to URL slugs: `MEAL_KIT` -> `/meal-kits`, `PREPARED_MEAL` -> `/prepared-meals`, etc.
- Dynamic route `[category]` resolves enum from slug for Prisma queries
- Must maintain a mapping utility (slug <-> enum) in `src/lib/`
- All filter/sort state encoded in URL params (e.g., `?diet=vegan&sort=price-asc&page=2`)
- `searchParams` is a Promise in Next.js 16 -- always await
- Enables shareable, bookmarkable, SEO-indexable filtered views
## Entry Points
- Location: `src/app/layout.tsx`
- Triggers: Every page render (wraps all routes)
- Responsibilities: Root HTML structure (`<html>`, `<body>`), font loading (Geist Sans, Geist Mono via `next/font/google`), global CSS import (`globals.css`), dark mode class setup
- Location: `src/app/page.tsx`
- Triggers: Request to `/`
- Responsibilities: Currently default create-next-app content. Will become homepage with hero, featured providers, category cards, social proof.
- Location: `src/lib/db.ts`
- Triggers: First import in any server-side module
- Responsibilities: Creates and caches PrismaClient with Neon adapter (`@prisma/adapter-pg`)
- Location: `src/proxy.ts` (does not exist yet)
- Triggers: Every incoming request
- Responsibilities: Admin route protection (`/admin/*`) via `ADMIN_SECRET` env var
- Note: Uses `proxy.ts` NOT `middleware.ts` -- Next.js 16 renamed this file
- Location: `package.json` script `"build": "prisma generate && next build"`
- Ensures Prisma client is regenerated before every production build
## Error Handling
- `error.tsx` error boundaries on all route segments (must use `"use client"`)
- `loading.tsx` streaming loading states for data-dependent pages
- `not-found.tsx` with search and category suggestions
- `global-error.tsx` for unrecoverable application errors
- Server Actions return `{ success, errors }` objects -- never throw exceptions to the client
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
