# Codebase Structure

**Analysis Date:** 2026-03-20

## Directory Layout

```
foodboxfinder/
├── prisma/
│   └── schema.prisma              # Database schema (10 models, 5 enums)
├── public/                        # Static assets served at /
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/                       # Next.js App Router (pages, layouts, routes)
│   │   ├── layout.tsx             # Root layout (HTML shell, fonts, global CSS)
│   │   ├── page.tsx               # Homepage (default template, to be replaced)
│   │   ├── globals.css            # Tailwind CSS 4 import + theme variables
│   │   └── favicon.ico            # Favicon
│   ├── generated/
│   │   └── prisma/                # Auto-generated Prisma client (gitignored)
│   │       ├── client.ts          # PrismaClient class export
│   │       ├── enums.ts           # Enum type exports
│   │       ├── models.ts          # Model type exports
│   │       ├── browser.ts         # Browser-safe types (no Node.js APIs)
│   │       ├── commonInputTypes.ts # Sort/input/filter types
│   │       └── internal/          # Prisma internals (do not import directly)
│   └── lib/
│       └── db.ts                  # Prisma Client singleton (PrismaPg adapter)
├── .planning/                     # Project planning docs (not deployed)
│   ├── PROJECT.md                 # Project spec with architecture decisions
│   ├── ROADMAP.md                 # 12-phase roadmap (Phases 10-120)
│   ├── REQUIREMENTS.md            # 60 v1 requirements with traceability
│   ├── STATE.md                   # Current execution state
│   ├── LOG.md                     # Session activity log
│   ├── codebase/                  # Codebase analysis docs (this directory)
│   ├── phases/                    # Phase-specific plans
│   │   └── 10/PLAN.md            # Phase 10: Database & Foundation
│   └── research/                  # Domain research docs
│       ├── ARCHITECTURE.md        # Architecture patterns research
│       ├── FEATURES.md            # Feature research
│       ├── PITFALLS.md            # Known pitfalls
│       ├── SCHEMA-EXTENDED.md     # Extended schema research
│       ├── SEO-STRATEGY.md        # SEO strategy
│       ├── STACK.md               # Stack research
│       ├── SUMMARY.md             # Research summary
│       └── UX-STRATEGY.md         # UX strategy
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Dependency lockfile (committed)
├── tsconfig.json                  # TypeScript config (strict mode, @/* alias)
├── next.config.ts                 # Next.js config (currently empty)
├── prisma.config.ts               # Prisma config (schema path, datasource)
├── eslint.config.mjs              # ESLint 9 flat config (Next.js + TypeScript)
├── postcss.config.mjs             # PostCSS config (Tailwind CSS 4 plugin)
├── CLAUDE.md                      # Agent instructions (project conventions)
├── AGENTS.md                      # Agent guidelines (Next.js 16 rules)
└── README.md                      # Project readme
```

## Directory Purposes

**`src/app/` (App Router):**
- Purpose: All routes, pages, layouts, and route-level files via Next.js file-based routing
- Contains: `page.tsx` (page components), `layout.tsx` (shared layouts), `loading.tsx` (streaming skeletons), `error.tsx` (error boundaries), `not-found.tsx` (404 pages), `route.ts` (API routes)
- Key files: `src/app/layout.tsx` (root layout), `src/app/page.tsx` (homepage)
- Convention: Each route is a directory with a `page.tsx` file. Directory name = URL segment.
- Current state: Only root layout and default homepage exist. All other routes are planned.

**`src/components/` (planned, does not exist yet):**
- Purpose: Shared, reusable React components used across multiple routes
- Will contain: Domain components (ProviderCard, FilterPanel, ComparisonTable, ReviewForm, SearchBar, RatingStars, PricingTable, FaqAccordion, BreadcrumbNav) and UI primitives in `ui/` subdirectory (Button, Card, Badge, Input, Select, Skeleton)
- Convention: Flat structure by default. Only create subdirectories when a component group needs isolation. UI primitives go in `ui/` subdirectory.
- Rule: Server Components by default. Add `"use client"` ONLY when needing browser APIs, event handlers, or React hooks.

**`src/lib/`:**
- Purpose: Shared server-side utilities, database access, query helpers, and type mappings
- Contains: `db.ts` (Prisma client singleton)
- Planned additions: `queries.ts` (all database query functions), `categories.ts` (CategoryType enum <-> URL slug mapping), `filters.ts` (searchParams parser), `utils.ts` (formatting helpers)
- Key file: `src/lib/db.ts` -- the ONLY way to access PrismaClient
- Rule: Server-only code. Never import from `src/lib/` in Client Components.

**`src/generated/prisma/`:**
- Purpose: Auto-generated Prisma client code and TypeScript types from schema
- Contains: PrismaClient class, model types, enum types, input types, internal runtime
- Generated by: `npx prisma generate` (output path configured in `prisma/schema.prisma` lines 6-7)
- Committed: No (gitignored via `/src/generated/prisma` in `.gitignore`)
- Import pattern: `import { PrismaClient } from "@/generated/prisma/client"`
- Rule: Never edit directly. Regenerate after any `prisma/schema.prisma` change.

**`prisma/`:**
- Purpose: Database schema definition and seed data
- Contains: `schema.prisma` (source of truth for all models, enums, relations, indexes)
- Planned additions: `seed.ts` (seed runner), `seed-data/` directory with per-provider seed files and collection/blog seed data
- Sync command: `npx prisma db push` (no migration files for now)

**`public/`:**
- Purpose: Static assets served directly at root URL path
- Contains: SVG images (currently default create-next-app placeholders)
- Convention: Place images and static files here. Reference via absolute path (e.g., `/logo.svg`).
- Note: Provider logos/images stored as external URLs in database, not in `public/`.

**`.planning/`:**
- Purpose: Project planning, research, phase plans, and codebase analysis
- Contains: Project spec, roadmap, requirements, phase plans, domain research, codebase maps
- Committed: Yes (tracked in git for continuity across sessions)
- Not deployed to production.

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout wrapping all pages. Loads Geist Sans + Geist Mono fonts via `next/font/google`. Imports `globals.css`. Sets `lang="en"`, antialiased text, flex column body.
- `src/app/page.tsx`: Homepage route (`/`). Currently default create-next-app template.
- `src/lib/db.ts`: Database client initialization. PrismaClient singleton with PrismaPg adapter. Cached on `globalThis` in development.

**Configuration:**
- `tsconfig.json`: TypeScript strict mode, path alias `@/*` -> `./src/*`, bundler module resolution, ES2017 target, incremental compilation.
- `next.config.ts`: Next.js framework configuration. Currently empty -- add `remotePatterns`, `cacheComponents`, etc. here.
- `eslint.config.mjs`: ESLint 9 flat config with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- `postcss.config.mjs`: PostCSS with `@tailwindcss/postcss` plugin (Tailwind CSS 4).
- `prisma.config.ts`: Prisma config -- schema path (`prisma/schema.prisma`), migration path, datasource URL from `DATABASE_URL` env var.
- `prisma/schema.prisma`: Database schema -- 10 models, 5 enums, all relations, indexes, and generator/datasource config.

**Styling:**
- `src/app/globals.css`: Tailwind CSS 4 import (`@import "tailwindcss"`), `@theme inline` block mapping CSS custom properties (`--background`, `--foreground`, `--font-sans`, `--font-mono`) to Tailwind theme, dark mode via `prefers-color-scheme`.

**Agent Configuration:**
- `CLAUDE.md`: Project-specific conventions (database commands, component rules, admin route rules, params/searchParams await rules).
- `AGENTS.md`: Technical guidelines, tech stack reference, Next.js 16 breaking changes checklist.

## Naming Conventions

**Files:**
- Route files: lowercase, Next.js conventions (mandatory): `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, `sitemap.ts`, `robots.ts`
- Components: PascalCase: `ProviderCard.tsx`, `FilterPanel.tsx`, `RatingStars.tsx`, `FaqAccordion.tsx`
- Utilities/lib: camelCase: `db.ts`, `queries.ts`, `categories.ts`, `filters.ts`, `utils.ts`
- Config files: lowercase with dots: `next.config.ts`, `prisma.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`
- Seed data: kebab-case: `hellofresh.ts`, `blue-apron.ts`, `good-chop.ts`

**Directories:**
- Route segments: kebab-case matching URL slugs: `providers/`, `admin/`, `best/`, `blog/`
- Dynamic segments: bracket notation: `[slug]/`, `[category]/`, `[slugs]/`, `[providerId]/`
- Feature directories: kebab-case: `seed-data/`
- Component groups: lowercase: `ui/` for primitives

**Database (Prisma):**
- Models: PascalCase singular: `Provider`, `Plan`, `BlogPost`, `CollectionItem`, `AffiliateClick`
- Enums: PascalCase: `CategoryType`, `DietaryTag`, `PlanFrequency`, `ReviewStatus`, `ContentStatus`
- Enum values: SCREAMING_SNAKE_CASE: `MEAL_KIT`, `GLUTEN_FREE`, `DAIRY_FREE`, `DIABETIC_FRIENDLY`
- Fields: camelCase: `averageRating`, `pricePerServing`, `affiliateUrl`, `shortDescription`, `deliveryAreaDescription`

## Where to Add New Code

**New Page Route:**
- Create directory under `src/app/` matching the URL path
- Add `page.tsx` as the page component (Server Component by default)
- Add `layout.tsx` if the route segment needs a shared layout (e.g., admin sidebar)
- Add `loading.tsx` for streaming/suspense loading states (skeleton components)
- Add `error.tsx` for error boundaries (MUST use `"use client"`)
- Always export `metadata` or `generateMetadata()` for SEO
- Always `await params` and `await searchParams` -- they are Promises in Next.js 16
- Example: Category page at `/meal-kits` -> `src/app/[category]/page.tsx`

**New Server Component:**
- Place in `src/components/` with PascalCase filename
- No `"use client"` directive needed (Server Component is default)
- Receive data as props from parent Server Components
- Can import from `src/lib/` (including `@/lib/db` and `@/lib/queries`)
- Example: `src/components/ProviderCard.tsx`

**New Client Component:**
- Place in `src/components/` with PascalCase filename
- Add `"use client"` directive as the first line
- Receive ALL data as props (never import Prisma or `@/lib/db`)
- Use for: event handlers, useState, useEffect, useActionState, browser APIs
- Example: `src/components/FilterPanel.tsx`

**New UI Primitive:**
- Place in `src/components/ui/` with PascalCase filename
- Examples: `Button.tsx`, `Card.tsx`, `Badge.tsx`, `Input.tsx`, `Select.tsx`, `Skeleton.tsx`
- Keep generic and reusable. Style with Tailwind CSS 4.

**New Query Function:**
- Add to `src/lib/queries.ts` (single file for MVP, split when exceeding ~300 lines)
- Wrap in `React.cache()` for request-level deduplication
- Export as named async function with descriptive name
- Import `prisma` from `@/lib/db`
- Use Prisma's `select` to fetch only needed fields (avoid over-fetching)
- For paginated queries, return `{ data: T[], total: number }`
- Example: `export const getProviderBySlug = cache(async (slug: string) => { ... })`

**New Server Action:**
- Place in `src/app/actions/` with descriptive filename (e.g., `reviews.ts`, `admin.ts`)
- Or colocate with the form component for page-specific actions
- Add `"use server"` directive at top of file
- Import `prisma` from `@/lib/db` for database mutations
- Return `{ success: boolean, errors?: Record<string, string[]> }` -- never throw
- Call `revalidatePath()` after mutations to invalidate cached public pages

**New API Route:**
- Create `route.ts` in the appropriate `src/app/api/` directory
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`
- Example: Affiliate tracking -> `src/app/api/track/[providerId]/route.ts`
- Use for: webhook receivers, affiliate click tracking, search API, or other non-page server logic

**New Utility/Helper:**
- Place in `src/lib/` with camelCase filename
- Examples:
  - `src/lib/categories.ts` -- CategoryType enum to URL slug bidirectional mapping
  - `src/lib/filters.ts` -- URL searchParams parser with validation and safe defaults
  - `src/lib/utils.ts` -- Formatting helpers (formatPrice, formatDate, truncate, etc.)
  - `src/lib/validation.ts` -- Input validation schemas for Server Actions

**New Seed Data:**
- Per-provider files in `prisma/seed-data/providers/` (e.g., `prisma/seed-data/providers/hellofresh.ts`)
- Each file exports a typed seed object with provider data + nested plans, tags, FAQs, reviews
- Collection seed data in `prisma/seed-data/collections.ts`
- Blog post seed data in `prisma/seed-data/blog-posts.ts`
- Barrel exports in `prisma/seed-data/providers/index.ts` and `prisma/seed-data/index.ts`
- Main seed runner: `prisma/seed.ts`

**New Static Asset:**
- Place in `public/` directory
- Accessible at root URL path (e.g., `public/logo.svg` -> `/logo.svg`)
- Provider logos/images are stored as external URLs in the database, not in `public/`

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and dev server cache
- Generated: Yes (by `next dev` and `next build`)
- Committed: No (gitignored)

**`src/generated/prisma/`:**
- Purpose: Auto-generated Prisma client types and runtime
- Generated: Yes (by `npx prisma generate`)
- Committed: No (gitignored)
- Must regenerate after any `prisma/schema.prisma` change
- Also regenerated automatically during `npm run build` (script: `prisma generate && next build`)

**`.vercel/`:**
- Purpose: Vercel CLI output, deployment artifacts, and project configuration
- Generated: Yes (by `vercel build` or `vercel deploy`)
- Committed: No (gitignored)

**`.planning/`:**
- Purpose: Project planning, phase plans, codebase analysis, domain research
- Generated: No (manually maintained by agents and developers)
- Committed: Yes (tracked in git)

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (gitignored)
- Important: Contains Next.js 16 documentation at `node_modules/next/dist/docs/01-app/` -- consult before using any unfamiliar Next.js API

## Path Alias

Configured in `tsconfig.json`:

- `@/*` maps to `./src/*`
- Usage: `import { prisma } from "@/lib/db"` instead of relative paths
- Apply to ALL imports within `src/` -- never use relative paths like `../../lib/db`

## Scripts

```bash
npm run dev          # Start development server (next dev with Turbopack)
npm run build        # Generate Prisma client + build for production (prisma generate && next build)
npm run start        # Start production server (next start)
npm run lint         # Run ESLint (npx eslint .)

# Database commands
npx prisma db push   # Push schema changes to Neon (no migration files for now)
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma studio    # Open Prisma Studio GUI for database browsing
npx prisma db seed   # Run seed script (requires seed.ts and prisma.seed config in package.json)
npx tsx prisma/seed.ts  # Run seed script directly (planned, not yet created)

# Type checking
npx tsc --noEmit     # Type check without emitting files
```

## Planned Target Structure (Post Phase 120)

After all 12 phases are complete, the `src/` directory will expand to:

```
src/
├── app/
│   ├── layout.tsx                 # Root layout (header, footer, nav)
│   ├── page.tsx                   # Homepage
│   ├── globals.css                # Tailwind + theme
│   ├── favicon.ico
│   ├── error.tsx                  # Global error boundary
│   ├── not-found.tsx              # Global 404 page
│   ├── sitemap.ts                 # Dynamic sitemap generation
│   ├── robots.ts                  # robots.txt generation
│   ├── [category]/
│   │   ├── page.tsx               # Category listing (/meal-kits, etc.)
│   │   └── loading.tsx            # Category skeleton
│   ├── providers/
│   │   └── [slug]/
│   │       ├── page.tsx           # Provider detail
│   │       └── loading.tsx        # Provider detail skeleton
│   ├── compare/
│   │   ├── page.tsx               # Flexible comparison (?providers=a,b,c)
│   │   └── [slugs]/
│   │       └── page.tsx           # SEO comparison (/compare/a-vs-b)
│   ├── methodology/
│   │   └── page.tsx               # How we review (E-E-A-T)
│   ├── best/
│   │   └── [slug]/
│   │       └── page.tsx           # Collection pages
│   ├── blog/
│   │   ├── page.tsx               # Blog index
│   │   └── [slug]/
│   │       └── page.tsx           # Blog post
│   ├── search/
│   │   └── page.tsx               # Search results
│   ├── admin/
│   │   ├── layout.tsx             # Admin layout (sidebar nav)
│   │   ├── page.tsx               # Admin dashboard
│   │   ├── providers/
│   │   │   ├── page.tsx           # Provider list
│   │   │   ├── new/
│   │   │   │   └── page.tsx       # Provider create form
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Provider edit form
│   │   └── content/
│   │       └── page.tsx           # Blog/collection management
│   ├── api/
│   │   └── track/
│   │       └── [providerId]/
│   │           └── route.ts       # Affiliate click tracking
│   └── actions/
│       ├── reviews.ts             # Review submission Server Action
│       └── admin.ts               # Admin CRUD Server Actions
├── components/
│   ├── ProviderCard.tsx            # Provider card for listings
│   ├── ComparisonTable.tsx         # Side-by-side comparison grid
│   ├── ComparisonTray.tsx          # "use client" floating comparison bar
│   ├── FilterPanel.tsx             # "use client" filter sidebar/drawer
│   ├── SearchBar.tsx               # "use client" expandable search input
│   ├── ReviewForm.tsx              # "use client" review submission form
│   ├── RatingStars.tsx             # Star display (Server) + star input (Client)
│   ├── PricingTable.tsx            # Provider plan comparison table
│   ├── FaqAccordion.tsx            # Collapsible FAQ with JSON-LD
│   ├── BreadcrumbNav.tsx           # Breadcrumb navigation
│   ├── JsonLd.tsx                  # Reusable JSON-LD helper component
│   └── ui/                         # Base UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Skeleton.tsx
├── generated/
│   └── prisma/                     # Auto-generated (gitignored)
├── lib/
│   ├── db.ts                       # Prisma client singleton (exists)
│   ├── queries.ts                  # All query functions (server-only)
│   ├── categories.ts               # Slug <-> CategoryType enum mapping
│   ├── filters.ts                  # SearchParams parser with validation
│   └── utils.ts                    # Shared utilities (formatPrice, etc.)
└── proxy.ts                        # Admin auth gate (Next.js 16)
```

Additional files at project root:

```
prisma/
├── schema.prisma                   # Database schema (exists)
├── seed.ts                         # Seed script runner
└── seed-data/
    ├── index.ts                    # Barrel export
    ├── providers/
    │   ├── index.ts                # Barrel export all providers
    │   ├── hellofresh.ts           # Individual provider seed data
    │   ├── blue-apron.ts
    │   └── ... (18 provider files total)
    ├── collections.ts              # 5-8 "Best Of" collection seeds
    └── blog-posts.ts               # 3-5 blog post seeds
```

---

*Structure analysis: 2026-03-20*
