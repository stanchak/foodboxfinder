# Codebase Structure

**Analysis Date:** 2026-03-20

## Directory Layout

```
foodboxfinder/
├── .planning/                # Project planning documents
│   ├── PROJECT.md            # Full project spec with architecture decisions
│   ├── ROADMAP.md            # 12-phase milestone plan (Phases 10-120)
│   ├── LOG.md                # Session activity log
│   ├── phases/               # Phase-specific plans
│   │   └── 10/PLAN.md        # Phase 10: Database & Foundation plan
│   ├── research/             # Research docs
│   │   ├── SCHEMA-EXTENDED.md
│   │   ├── SEO-STRATEGY.md
│   │   └── UX-STRATEGY.md
│   └── codebase/             # Codebase analysis docs (this directory)
├── prisma/
│   └── schema.prisma         # Database schema (10 models, 5 enums)
├── public/                   # Static assets served at /
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/                  # Next.js App Router (routes, layouts, pages)
│   │   ├── layout.tsx        # Root layout (HTML shell, fonts, global CSS)
│   │   ├── page.tsx          # Homepage (currently default create-next-app)
│   │   ├── globals.css       # Global styles + Tailwind CSS 4 theme
│   │   └── favicon.ico       # Site favicon
│   ├── generated/
│   │   └── prisma/           # Auto-generated Prisma client (gitignored)
│   │       ├── client.ts     # PrismaClient class export
│   │       ├── enums.ts      # Enum type exports
│   │       ├── models.ts     # Model type exports
│   │       ├── browser.ts    # Browser-safe exports (no Node.js APIs)
│   │       ├── commonInputTypes.ts
│   │       └── internal/     # Internal Prisma runtime
│   └── lib/
│       └── db.ts             # Prisma client singleton
├── CLAUDE.md                 # Agent instructions (project conventions)
├── AGENTS.md                 # Agent guidelines (Next.js 16 rules, tech stack)
├── README.md                 # Project readme
├── eslint.config.mjs         # ESLint 9 flat config with Next.js rules
├── next.config.ts            # Next.js configuration (currently empty/default)
├── postcss.config.mjs        # PostCSS config for Tailwind CSS 4
├── prisma.config.ts          # Prisma config (schema path, datasource URL)
├── tsconfig.json             # TypeScript config (strict, @/* path alias)
├── package.json              # Dependencies and scripts
└── package-lock.json         # Dependency lockfile
```

## Directory Purposes

**`src/app/` (App Router):**
- Purpose: All routes, pages, layouts, and route-level files
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` per route segment
- Key files: `src/app/layout.tsx` (root layout), `src/app/page.tsx` (homepage)
- Convention: Each route is a directory with a `page.tsx` file. Shared layouts via `layout.tsx` per segment.
- Current state: Only root layout and default homepage exist. All other routes are planned.

**`src/components/` (planned, does not exist yet):**
- Purpose: Shared, reusable React components used across multiple routes
- Will contain: UI primitives (Button, Card, Badge, Input, Select, Rating), layout components (Header, Footer, Nav), domain components (ProviderCard, ComparisonBar, FilterPanel)
- Convention: Flat structure. Only create subdirectories when a component group needs isolation (e.g., `src/components/admin/` if admin-specific components proliferate). No barrel files required.

**`src/lib/`:**
- Purpose: Shared utility modules, service configuration, and query helpers
- Contains: `db.ts` (database client singleton)
- Planned additions: `queries.ts` (database query functions), `categories.ts` (enum-to-slug mapping), `seo.ts` (JSON-LD helpers)
- Key file: `src/lib/db.ts` -- the ONLY way to access PrismaClient

**`src/generated/prisma/`:**
- Purpose: Auto-generated Prisma client code and TypeScript types
- Contains: PrismaClient class, model types, enum types, input types, internal runtime
- Generated: Yes, by `npx prisma generate`
- Committed: No (gitignored via `/src/generated/prisma` in `.gitignore`)
- Import pattern: `import { PrismaClient } from "@/generated/prisma/client"`

**`prisma/`:**
- Purpose: Database schema definition and seed data
- Contains: `schema.prisma` (source of truth for all models, enums, relations, indexes)
- Planned additions: `seed.ts` (seed runner), `seed-data/` directory (per-provider seed files)

**`public/`:**
- Purpose: Static assets served directly at root URL path
- Contains: SVG images (currently default create-next-app placeholders)
- Convention: Place images, fonts, and other static files here. Reference via absolute path (e.g., `/logo.svg`)

**`.planning/`:**
- Purpose: Project planning, research, and codebase analysis
- Contains: Project spec (`PROJECT.md`), roadmap (`ROADMAP.md`), phase plans (`phases/`), research docs (`research/`), codebase mapping (`codebase/`)
- Committed: Yes, tracked in git for continuity across sessions

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout wrapping all pages (fonts, global CSS, HTML shell)
- `src/app/page.tsx`: Homepage route (`/`)
- `src/lib/db.ts`: Database client initialization (PrismaClient singleton)

**Configuration:**
- `next.config.ts`: Next.js framework configuration (currently empty/default)
- `tsconfig.json`: TypeScript compiler options (strict mode, `@/*` path alias to `./src/*`)
- `eslint.config.mjs`: ESLint 9 flat config with `eslint-config-next` (core-web-vitals + TypeScript)
- `postcss.config.mjs`: PostCSS plugin for Tailwind CSS 4 (`@tailwindcss/postcss`)
- `prisma.config.ts`: Prisma datasource URL and migration path
- `prisma/schema.prisma`: Database schema (10 models, 5 enums, all relations and indexes)

**Styling:**
- `src/app/globals.css`: Tailwind CSS import (`@import "tailwindcss"`), CSS custom properties for theme (`--background`, `--foreground`, `--font-sans`, `--font-mono`), dark mode support via `prefers-color-scheme`

**Agent Configuration:**
- `CLAUDE.md`: Project-specific conventions (database commands, component rules, admin route rules)
- `AGENTS.md`: Technical guidelines and Next.js 16 breaking changes

## Naming Conventions

**Files:**
- Route files: lowercase (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) -- Next.js convention, mandatory
- Components: Use PascalCase (e.g., `ProviderCard.tsx`, `FilterPanel.tsx`, `RatingStars.tsx`)
- Utilities/lib: Use camelCase (e.g., `db.ts`, `queries.ts`, `categories.ts`)
- Config files: Use kebab-case with appropriate extension (e.g., `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`)
- Seed data: Use kebab-case (e.g., `hellofresh.ts`, `blue-apron.ts`)

**Directories:**
- Route segments: kebab-case (e.g., `providers/`, `admin/`, `best/`)
- Dynamic segments: bracket notation (e.g., `[slug]/`, `[category]/`, `[slugs]/`)
- Feature directories: kebab-case (e.g., `seed-data/`)

**Database:**
- Models: PascalCase singular (e.g., `Provider`, `BlogPost`, `CollectionItem`)
- Enums: PascalCase (e.g., `CategoryType`, `DietaryTag`)
- Enum values: SCREAMING_SNAKE_CASE (e.g., `MEAL_KIT`, `GLUTEN_FREE`)
- Fields: camelCase (e.g., `averageRating`, `pricePerServing`, `affiliateUrl`)

## Where to Add New Code

**New Page/Route:**
- Create directory under `src/app/` matching the URL path
- Add `page.tsx` as the page component (Server Component by default)
- Add `layout.tsx` if the route segment needs a shared layout (e.g., admin sidebar)
- Add `loading.tsx` for streaming/suspense loading states
- Add `error.tsx` for error boundaries (MUST use `"use client"`)
- Always export `metadata` or `generateMetadata()` for SEO
- Always `await params` and `await searchParams` -- they are Promises in Next.js 16
- Example: New category page at `/meal-kits` -> `src/app/[category]/page.tsx`

**New Shared Component:**
- Place in `src/components/` with PascalCase filename
- Example: `src/components/ProviderCard.tsx`, `src/components/FilterPanel.tsx`
- Default to Server Component. Add `"use client"` ONLY when needing browser APIs, event handlers, or React hooks (useState, useEffect, etc.)
- For admin-only components, still use `src/components/` unless volume warrants `src/components/admin/`

**New Server Action:**
- Place in `src/app/actions/` for global actions (e.g., `src/app/actions/reviews.ts`)
- Or colocate with the form component for page-specific actions
- Mark with `"use server"` directive at top of file
- Import `prisma` from `@/lib/db` for database mutations
- Return `{ success: boolean, errors?: Record<string, string[]> }` -- never throw

**New API Route:**
- Create `route.ts` in the appropriate `src/app/api/` directory
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`
- Example: Affiliate tracking -> `src/app/api/track/[providerId]/route.ts`
- Use for webhooks, affiliate click tracking, search API, or other non-page server logic

**New Utility/Library Module:**
- Place in `src/lib/` with camelCase filename
- Examples:
  - `src/lib/queries.ts` -- Database query functions
  - `src/lib/categories.ts` -- CategoryType enum to URL slug mapping
  - `src/lib/seo.ts` -- JSON-LD structured data helper functions
  - `src/lib/validation.ts` -- Input validation schemas

**New Database Query Helper:**
- Add to `src/lib/queries.ts` (single file for MVP; split when file exceeds ~300 lines)
- Always import `prisma` from `@/lib/db`
- Export typed `async` functions with descriptive names
- Use Prisma's `select` to fetch only needed fields (avoid over-fetching)
- For paginated queries, return `{ data: T[], total: number }`

**New Seed Data:**
- Per-provider files in `prisma/seed-data/providers/` (e.g., `prisma/seed-data/providers/hellofresh.ts`)
- Collection/blog seed data in `prisma/seed-data/collections.ts` and `prisma/seed-data/blog-posts.ts`
- Main seed runner: `prisma/seed.ts`

**Static Assets:**
- Place in `public/` directory
- Reference via absolute URL path in code (e.g., `/logo.svg`, not `../public/logo.svg`)
- Provider logos/images stored as external URLs in database, not in `public/`

## Special Directories

**`src/generated/prisma/`:**
- Purpose: Auto-generated Prisma client, types, and runtime
- Generated: Yes -- by `npx prisma generate` (also runs before `next build` via `"build": "prisma generate && next build"`)
- Committed: No (gitignored)
- Rebuild trigger: Run `npx prisma generate` after ANY change to `prisma/schema.prisma`
- Never edit files in this directory manually

**`.vercel/`:**
- Purpose: Vercel CLI deployment output and project configuration
- Generated: Yes -- by `vercel build` or `vercel deploy`
- Committed: No (gitignored)

**`.next/`:**
- Purpose: Next.js build output and dev server cache
- Generated: Yes -- by `next build` or `next dev`
- Committed: No (gitignored)

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes -- by `npm install`
- Committed: No
- Important: Contains Next.js 16 docs at `node_modules/next/dist/docs/` -- consult before using any unfamiliar Next.js API

## Path Aliases

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
npx prisma db push   # Push schema changes to Neon (no migration files)
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma studio    # Open Prisma Studio GUI for database browsing
npx prisma db seed   # Run seed script (requires seed.ts to exist and prisma.seed config in package.json)
npx tsx prisma/seed.ts  # Run seed script directly (planned, not yet created)

# Type checking
npx tsc --noEmit     # Type check without emitting files
```

## Planned Directory Structure (Post Phase 120)

After all 12 phases are complete, the `src/` directory will look like:

```
src/
├── app/
│   ├── layout.tsx              # Root layout (header, footer, nav)
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Tailwind + theme
│   ├── favicon.ico
│   ├── [category]/
│   │   └── page.tsx            # Category listing (/meal-kits, etc.)
│   ├── providers/
│   │   └── [slug]/
│   │       └── page.tsx        # Provider detail
│   ├── compare/
│   │   ├── page.tsx            # Flexible comparison (?providers=a,b,c)
│   │   └── [slugs]/
│   │       └── page.tsx        # SEO comparison (/compare/a-vs-b)
│   ├── methodology/
│   │   └── page.tsx            # How we review
│   ├── best/
│   │   └── [slug]/
│   │       └── page.tsx        # Collection pages
│   ├── blog/
│   │   ├── page.tsx            # Blog index
│   │   └── [slug]/
│   │       └── page.tsx        # Blog post
│   ├── search/
│   │   └── page.tsx            # Search results
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout (sidebar nav)
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── providers/
│   │   │   └── page.tsx        # Provider management
│   │   └── content/
│   │       └── page.tsx        # Blog/collection management
│   ├── api/
│   │   └── track/
│   │       └── [providerId]/
│   │           └── route.ts    # Affiliate click tracking
│   └── actions/
│       └── reviews.ts          # Review submission Server Action
├── components/
│   ├── Header.tsx              # Site header with nav
│   ├── Footer.tsx              # Site footer
│   ├── ProviderCard.tsx        # Provider listing card
│   ├── FilterPanel.tsx         # Filter sidebar (client component)
│   ├── ComparisonBar.tsx       # Floating comparison bar (client component)
│   ├── RatingStars.tsx         # Star rating display
│   ├── SearchBar.tsx           # Header search (client component)
│   ├── ReviewForm.tsx          # Review submission form (client component)
│   ├── Button.tsx              # Base button component
│   ├── Card.tsx                # Base card component
│   ├── Badge.tsx               # Tag/badge component
│   ├── Input.tsx               # Form input component
│   └── Select.tsx              # Form select component
├── generated/
│   └── prisma/                 # Auto-generated (gitignored)
└── lib/
    ├── db.ts                   # Prisma client singleton
    ├── queries.ts              # Database query functions
    ├── categories.ts           # CategoryType <-> slug mapping
    ├── seo.ts                  # JSON-LD helper functions
    └── validation.ts           # Input validation
```

---

*Structure analysis: 2026-03-20*
