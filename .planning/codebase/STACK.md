# Technology Stack

**Analysis Date:** 2026-03-20

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code, configuration files, and Prisma seed scripts. Strict mode enabled in `tsconfig.json`.

**Secondary:**
- CSS - Tailwind CSS 4 utility classes via `@import "tailwindcss"` in `src/app/globals.css`
- SQL - PostgreSQL via Prisma ORM (no raw SQL written)

## Runtime

**Environment:**
- Node.js v24.9.0 (no `.nvmrc` or `.node-version` pinning file)
- Vercel production target uses Node.js 24.x (configured in `.vercel/project.json`)

**Package Manager:**
- npm 11.6.0
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.2.0 - Full-stack React framework (App Router, Server Components)
  - Config: `next.config.ts` (currently empty/default)
  - CRITICAL: `params` and `searchParams` are Promises -- always `await` them
  - CRITICAL: Uses `proxy.ts` instead of `middleware.ts` for request interception
  - CRITICAL: `cookies()`, `headers()`, `draftMode()` must be awaited
  - CRITICAL: `useFormState` renamed to `useActionState` in React 19
  - `next lint` is removed -- use `npx eslint` directly
- React 19.2.4 - UI library
- React DOM 19.2.4

**ORM:**
- Prisma 7.5.0 - Database ORM and schema management
  - Schema: `prisma/schema.prisma`
  - Config: `prisma.config.ts` (loads `DATABASE_URL` from `.env` via dotenv)
  - Generated client output: `src/generated/prisma/` (gitignored)
  - Uses `@prisma/adapter-pg` 7.5.0 for direct PostgreSQL connection (not Prisma's default engine)

**Styling:**
- Tailwind CSS 4.2.2 - Utility-first CSS, configured via PostCSS
  - No `tailwind.config.ts` -- Tailwind 4 uses CSS-based configuration
  - Theme defined inline in `src/app/globals.css` via `@theme inline` directive

**Testing:**
- Not configured (no test framework installed)

**Build/Dev:**
- TypeScript 5.9.3 - Type checking (strict mode)
- ESLint 9.39.4 - Linting (flat config format)
  - Config: `eslint.config.mjs`
  - Extends: `eslint-config-next/core-web-vitals` 16.2.0, `eslint-config-next/typescript`
  - Run via: `npx eslint` (NOT `next lint`, which is removed in Next.js 16)
- PostCSS - CSS processing via `postcss.config.mjs`
  - Plugin: `@tailwindcss/postcss` 4.2.2

## Key Dependencies

**Critical (runtime):**
- `next` 16.2.0 - Application framework
- `react` 19.2.4 - UI rendering
- `react-dom` 19.2.4 - DOM rendering
- `@prisma/client` 7.5.0 - Database client (generated into `src/generated/prisma/`)
- `@prisma/adapter-pg` 7.5.0 - PostgreSQL adapter for Prisma (uses `pg` driver directly)
- `dotenv` 17.3.1 - Environment variable loading (used by `prisma.config.ts`)

**Dev Dependencies:**
- `prisma` 7.5.0 - Prisma CLI (schema management, generation)
- `tailwindcss` 4.2.2 - CSS utility framework
- `@tailwindcss/postcss` 4.x - PostCSS integration for Tailwind
- `typescript` 5.9.3 - TypeScript compiler
- `eslint` 9.39.4 - Linter
- `eslint-config-next` 16.2.0 - Next.js ESLint rules
- `@types/node` 20.x - Node.js type definitions
- `@types/react` 19.x - React type definitions
- `@types/react-dom` 19.x - React DOM type definitions

**NOT yet installed (planned per roadmap):**
- No test runner (Jest, Vitest, or Playwright)
- No markdown rendering library (needed for Phase 70 blog)
- No rate limiting library (needed for Phase 90 reviews)
- No image processing beyond Next.js built-in Image component
- No formatter (Prettier, Biome) -- no `.prettierrc` or `biome.json` present

## Configuration

**TypeScript (`tsconfig.json`):**
- `strict: true` - Full strict mode
- `target: ES2017`
- `module: esnext` with `moduleResolution: bundler`
- Path alias: `@/*` maps to `./src/*`
- Incremental compilation enabled
- Next.js plugin registered

**Tailwind CSS 4 (`src/app/globals.css`):**
- Imports via `@import "tailwindcss"`
- Custom CSS variables: `--background`, `--foreground`, `--font-sans`, `--font-mono`
- Dark mode: `prefers-color-scheme` media query (system preference)
- Fonts: Geist Sans and Geist Mono loaded via `next/font/google` in `src/app/layout.tsx`

**Next.js (`next.config.ts`):**
- Currently default/empty -- no custom configuration
- No `images.remotePatterns` configured (will need this for provider logos)
- No `cacheComponents` enabled yet
- No React Compiler enabled yet

**ESLint (`eslint.config.mjs`):**
- Flat config format (ESLint 9)
- Extends Next.js core-web-vitals and TypeScript presets
- Global ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

**PostCSS (`postcss.config.mjs`):**
- Single plugin: `@tailwindcss/postcss`

**Prisma (`prisma.config.ts`):**
- Schema location: `prisma/schema.prisma`
- Migrations path: `prisma/migrations`
- Datasource URL from `DATABASE_URL` environment variable
- Loads env via `import "dotenv/config"`

**Environment:**
- `.env` file present (contains database connection configuration)
- `.env*` files are gitignored
- No `.env.example` file to document required variables

## Database

**Provider:** Neon PostgreSQL (serverless)
**ORM:** Prisma 7.5.0
**Connection:** Via `@prisma/adapter-pg` (PrismaPg adapter with direct connection string)

**Client singleton:** `src/lib/db.ts`
- Uses global variable pattern to prevent multiple instances in development
- Exports `prisma` as the single client instance
- All database access must go through this import

**Schema models (9 total):**
- `Provider` - Core entity (food box services)
- `Plan` - Pricing plans per provider
- `ProviderDietaryTag` - Many-to-many dietary tag associations
- `Review` - User reviews with moderation status
- `ProviderFaq` - FAQ entries per provider
- `BlogPost` - Editorial blog content
- `Collection` - Curated "best of" lists
- `CollectionItem` - Junction table for Collection-Provider
- `AffiliateClick` - Click tracking analytics

**Enums (6):** `CategoryType`, `DietaryTag`, `PlanFrequency`, `ReviewStatus`, `ContentStatus`

**Schema sync approach:** `npx prisma db push` (no migration files)
**Client generation:** `npx prisma generate` (runs automatically in `build` script)
**Seed script:** `prisma/seed.ts` (convention, not yet created)

## Build & Scripts

**Available npm scripts:**
```bash
npm run dev          # next dev (development server)
npm run build        # prisma generate && next build (production build)
npm run start        # next start (production server)
npm run lint         # eslint (linting)
```

**Database commands:**
```bash
npx prisma db push       # Sync schema to Neon (no migrations)
npx prisma generate      # Regenerate client after schema changes
npx tsx prisma/seed.ts   # Run seed script (when created)
npx prisma studio        # Visual database browser
```

## Platform Requirements

**Development:**
- Node.js 24.x (current local version)
- PostgreSQL database (Neon serverless)
- `DATABASE_URL` environment variable

**Production:**
- Vercel hosting (`.vercel/` directory present, project initialized as `foodboxfinder`)
- Vercel Node.js 24.x runtime
- Neon PostgreSQL (serverless, connection pooling)
- No Docker, no CI/CD pipeline configured
- No pre-commit hooks (no Husky, no lint-staged)

---

*Stack analysis: 2026-03-20*
