# Technology Stack

**Analysis Date:** 2026-03-21

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code, configuration files, and Prisma seed scripts. Strict mode enabled in `tsconfig.json`.

**Secondary:**
- CSS - Tailwind CSS 4 utility classes via `@import "tailwindcss"` in `src/app/globals.css`
- SQL - PostgreSQL via Prisma ORM (no raw SQL written by hand)

## Runtime

**Environment:**
- Node.js 24.9.0 (local); 24.x on Vercel production (configured in `.vercel/project.json`)
- No `.nvmrc` or `.node-version` pinning file present

**Package Manager:**
- npm 11.6.0
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.2.0 - Full-stack React framework (App Router, Server Components, ISR)
- React 19.2.4 - UI library
- React DOM 19.2.4 - DOM rendering

**ORM:**
- Prisma 7.5.0 - Database ORM, schema management, and client generation

**CSS:**
- Tailwind CSS 4.2.2 - Utility-first CSS, configured via PostCSS (`postcss.config.mjs`)

**Testing:**
- Not configured. No Jest, Vitest, or Playwright installed.

**Build/Dev:**
- TypeScript 5.9.3 - Type checking (tsc, strict mode)
- ESLint 9.39.4 - Linting (flat config format at `eslint.config.mjs`)
- PostCSS - CSS processing via `@tailwindcss/postcss` plugin
- tsx 4.21.0 - TypeScript execution for seed scripts (`npx tsx prisma/seed.ts`)

## Key Dependencies

**Critical:**
- `next` 16.2.0 - Application framework (`package.json`)
- `react` 19.2.4 - UI rendering (`package.json`)
- `react-dom` 19.2.4 - DOM rendering (`package.json`)
- `@prisma/client` 7.5.0 - Database client, generated into `src/generated/prisma/` (`package.json`)
- `@prisma/adapter-pg` 7.5.0 - PostgreSQL adapter for Prisma using the `pg` driver directly (`src/lib/db.ts`)
- `server-only` 0.0.1 - Prevents query modules from being imported in client components (`src/lib/queries.ts` line 1)

**Infrastructure:**
- `pg` 8.20.0 - PostgreSQL driver (transitive dep of `@prisma/adapter-pg`)
- `dotenv` 17.3.1 - Environment variable loading for `prisma.config.ts`
- `prisma` 7.5.0 - Prisma CLI (schema management, codegen)

**Dev Tooling:**
- `tailwindcss` 4.2.2 - CSS framework (devDependency)
- `@tailwindcss/postcss` 4.2.2 - PostCSS integration for Tailwind
- `typescript` 5.9.3 - TypeScript compiler
- `eslint` 9.39.4 - Linter
- `eslint-config-next` 16.2.0 - Next.js ESLint rules (extends `core-web-vitals` and `typescript`)
- `tsx` 4.21.0 - Script runner for seed and one-off scripts

**Missing (noted for planning):**
- No test runner (Jest, Vitest, Playwright)
- No formatter (Prettier, Biome)
- No markdown rendering library (needed for blog body content)
- No rate limiting library (needed for review submissions)
- No image processing beyond Next.js built-in `<Image>`

## Configuration

**TypeScript (`tsconfig.json`):**
- `strict: true` — all strict sub-flags active: `strictNullChecks`, `noImplicitAny`, etc.
- `target: ES2017`, `module: esnext`, `moduleResolution: bundler`
- Path alias: `@/*` → `./src/*`
- Incremental compilation enabled (`tsconfig.tsbuildinfo` present)
- Next.js plugin registered under `plugins`

**ESLint (`eslint.config.mjs`):**
- Flat config format (ESLint 9)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Run with: `npx eslint .` (not `next lint` — removed in Next.js 16)

**PostCSS (`postcss.config.mjs`):**
- Single plugin: `@tailwindcss/postcss`

**Tailwind (`src/app/globals.css`):**
- Imported via `@import "tailwindcss"` (v4 syntax, not `@tailwind` directives)
- Custom CSS variables for brand colors (`--color-primary-*`, `--color-accent-*`) in `@theme` block
- Custom design tokens: `--shadow-card`, `--radius-card`, `--color-star`, etc.
- Dark mode: `prefers-color-scheme` media query (system preference, not class-based)
- Fonts: Geist Sans and Geist Mono via `next/font/google` in `src/app/layout.tsx`, applied as CSS variables

**Next.js (`next.config.ts`):**
- `images.remotePatterns` configured for: `images.unsplash.com`, `**.cloudinary.com`, `**.amazonaws.com`, `cdn.jsdelivr.net`, `*.imgix.net`, `logo.clearbit.com`, `img.logo.dev`
- No `cacheComponents` or React Compiler enabled

**Prisma (`prisma.config.ts`, `prisma/schema.prisma`):**
- Schema: `prisma/schema.prisma`
- Migrations path: `prisma/migrations`
- Datasource URL from `DATABASE_URL` environment variable
- Client output: `src/generated/prisma/` (git-ignored)
- Seed: `tsx prisma/seed.ts`
- `pg` adapter (not the default Prisma engine) — uses `PrismaPg` from `@prisma/adapter-pg`

**Environment variables required:**
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

**Seed:**
```bash
npx tsx prisma/seed.ts       # Seed database
npx prisma db push           # Sync schema to Neon (no migration files)
npx prisma generate          # Regenerate client after schema changes
```

## Platform Requirements

**Development:**
- Node.js 24.x
- PostgreSQL database (Neon serverless)
- `DATABASE_URL` and `ADMIN_SECRET` env vars

**Production:**
- Vercel hosting (project: `foodboxfinder`, org configured in `.vercel/project.json`)
- Vercel Node.js 24.x runtime
- Neon PostgreSQL (serverless, connection pooling via `pg` driver)
- No Docker, no CI/CD pipeline, no pre-commit hooks (no Husky or lint-staged)

---

*Stack analysis: 2026-03-21*
