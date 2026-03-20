# Coding Conventions

**Analysis Date:** 2026-03-20

## Naming Patterns

**Files:**
- Page components: `page.tsx` (Next.js App Router convention)
- Layout components: `layout.tsx` (Next.js App Router convention)
- Utility modules: `camelCase.ts` (e.g., `db.ts`)
- Config files: `camelCase.config.ts` or `camelCase.config.mjs` (e.g., `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `prisma.config.ts`)
- Global styles: `globals.css` in `src/app/`
- Prisma schema: `schema.prisma` in `prisma/`
- Future components: `PascalCase.tsx` (e.g., `ProviderCard.tsx`, `FilterSidebar.tsx`)
- Future Server Actions: `camelCase.ts` in `src/app/actions/` (e.g., `reviews.ts`)

**Functions:**
- React components: `PascalCase` function declarations (not arrow functions):
```typescript
export default function Home() { ... }
export default function RootLayout({ children }: ...) { ... }
```
- Utility functions: `camelCase` (e.g., `getProviders`, `formatPrice`)
- Server Actions: `camelCase` with verb prefix (e.g., `submitReview`, `updateProvider`)

**Variables:**
- Local variables: `camelCase` (e.g., `geistSans`, `geistMono`, `globalForPrisma`)
- Config objects: `camelCase` (e.g., `nextConfig`, `eslintConfig`)
- Constants: `camelCase` (same as variables, no UPPER_CASE for JS constants)
- Environment variables: `UPPER_SNAKE_CASE` (e.g., `DATABASE_URL`, `NODE_ENV`)

**Types:**
- Type/interface names: `PascalCase`
- Use `import type` for type-only imports:
```typescript
import type { Metadata } from "next";
import type { NextConfig } from "next";
```
- Prisma-generated types: import from `@/generated/prisma/client`
- Inline prop types with `Readonly<{}>` wrapper (no separate interface files for simple props)

**Prisma Schema (`prisma/schema.prisma`):**
- Models: `PascalCase` (e.g., `Provider`, `Plan`, `BlogPost`, `ProviderDietaryTag`)
- Fields: `camelCase` (e.g., `providerId`, `averageRating`, `pricePerServing`)
- Enum type names: `PascalCase` (e.g., `CategoryType`, `DietaryTag`, `PlanFrequency`)
- Enum values: `UPPER_SNAKE_CASE` (e.g., `MEAL_KIT`, `GLUTEN_FREE`, `WEEKLY`)
- ID fields: `cuid()` default (not UUID)
- Section dividers: `// --- Section Name ---` style comments

## Code Style

**Formatting:**
- No dedicated formatter (Prettier/Biome) is configured
- 2-space indentation in all files
- Double quotes for all strings (imports, JSX attributes, values)
- Semicolons at end of statements
- Trailing commas in multi-line objects, arrays, and function parameters

**Linting:**
- ESLint 9 with flat config: `eslint.config.mjs`
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Run with: `npx eslint .` (NOT `next lint` -- removed in Next.js 16)
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

**TypeScript:**
- Strict mode enabled in `tsconfig.json` (`"strict": true`)
- All strict sub-flags active: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, `alwaysStrict`
- No `any` types allowed (enforced by project rules in `AGENTS.md`)
- No `@ts-ignore` allowed (enforced by project rules in `AGENTS.md`)
- Target: `ES2017`, Module: `esnext`, Module resolution: `bundler`
- Incremental compilation enabled
- Next.js compiler plugin active

## Import Organization

**Order (observed in `src/app/layout.tsx`, `src/lib/db.ts`):**
1. Type-only imports from external packages (`import type { Metadata } from "next"`)
2. External package imports (`import { Geist, Geist_Mono } from "next/font/google"`)
3. Internal imports using `@/` alias (`import { PrismaClient } from "@/generated/prisma/client"`)
4. Relative imports (`import "./globals.css"`)

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Use `@/generated/prisma/client` for Prisma client types
- Use `@/lib/db` for the database singleton
- Use `@/components/` for shared components
- Use `@/app/actions/` for Server Actions

**Type Import Rule:**
- Always use `import type` for type-only imports. This is enforced consistently.

## Component Patterns

**Server Components (default):**
- All pages and layouts are Server Components unless they need interactivity
- Data fetching happens directly in Server Components via Prisma
- Export `metadata` or `generateMetadata()` from every public page
- Include JSON-LD structured data on every public page

```typescript
// Pattern for every public page
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
};

export default function PageName() {
  return ( ... );
}
```

**Client Components (opt-in only):**
- Add `"use client"` directive ONLY for: browser APIs, event handlers, `useState`, `useEffect`, or other React hooks
- Never import Prisma in client components
- Use `useActionState` (NOT `useFormState` -- renamed in React 19)

**Props Pattern:**
- Inline destructured props with `Readonly<{}>` wrapper:
```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
```

**Next.js 16 Async Params (CRITICAL):**
- `params` and `searchParams` are Promises -- always `await` them:
```typescript
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const filters = await searchParams;
}
```

**Next.js 16 Async APIs (CRITICAL):**
- `cookies()`, `headers()`, `draftMode()` must be awaited

**Request Interception:**
- Use `proxy.ts` (NOT `middleware.ts`) -- renamed in Next.js 16
- Export `proxy` function (not `middleware`)
- Runs on Node.js runtime only (NOT Edge)
- Admin routes under `/admin/` are protected via `proxy.ts`

## Styling

**Framework:** Tailwind CSS 4 via PostCSS
- Config: `postcss.config.mjs` with `@tailwindcss/postcss` plugin
- Global import: `@import "tailwindcss"` in `src/app/globals.css` (Tailwind v4 syntax, NOT `@tailwind` directives)
- No CSS modules, no styled-components, no component libraries

**CSS Custom Properties (defined in `src/app/globals.css`):**
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

**Dark Mode:**
- Uses `prefers-color-scheme` media query (system preference, not class-based toggle)
- Dark mode is deprioritized for launch (Out of Scope per `PROJECT.md`)
- Dark values set in `@media (prefers-color-scheme: dark)` block in `src/app/globals.css`

**Fonts:**
- Geist Sans and Geist Mono loaded via `next/font/google` in `src/app/layout.tsx`
- Applied as CSS variables on `<html>`: `--font-geist-sans`, `--font-geist-mono`
- Referenced in `@theme inline` block as `--font-sans` and `--font-mono`

**Class Application:**
- Tailwind utility classes directly in JSX `className`
- Template literals to compose dynamic classes:
```typescript
className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
```
- Use semantic HTML elements with Tailwind classes (`<main>`, `<nav>`, `<article>`, `<section>`, `<aside>`)

## Database Access

**Prisma Client Singleton:** `src/lib/db.ts`
- Uses Neon PostgreSQL adapter (`@prisma/adapter-pg`)
- Hot-reload safe via `globalThis` caching pattern
- Import as: `import { prisma } from "@/lib/db"`

**Singleton Pattern:**
```typescript
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Schema Conventions (in `prisma/schema.prisma`):**
- All models use `cuid()` for primary keys (`@id @default(cuid())`)
- Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Slugs are `@unique` and used as canonical URL identifiers
- Denormalized fields for performance (e.g., `averageRating`, `reviewCount` on `Provider`)
- JSON stored as `String @db.Text` with `*Json` suffix (e.g., `prosJson`, `consJson`)
- SEO fields on content models: `metaTitle @db.VarChar(70)`, `metaDescription @db.VarChar(160)`
- Indexes on: foreign keys, filter columns, sort columns
- Cascade deletes on all child relations (`onDelete: Cascade`)
- Section dividers with comments: `// --- Section Name ---`

**Database Commands:**
```bash
npx prisma db push       # Sync schema to Neon (no migration files)
npx prisma generate       # Regenerate client after schema changes
npx tsx prisma/seed.ts    # Run seed script
```

**Generated Output:**
- Client generated to `src/generated/prisma/` (git-ignored)
- Build script runs `prisma generate` before `next build`:
```json
"build": "prisma generate && next build"
```

## Error Handling

**Current State:**
- No error handling patterns established yet (early-stage scaffolded project)
- Non-null assertion (`!`) used for required env vars: `process.env.DATABASE_URL!`
- No `error.tsx`, `not-found.tsx`, or `loading.tsx` files exist

**Prescriptive Guidance for New Code:**
- Add `error.tsx` boundary files at route segment levels for graceful error recovery
- Add `not-found.tsx` for custom 404 pages
- Add `loading.tsx` for Suspense boundaries / loading states
- Use `notFound()` from `next/navigation` when a resource is not found by slug
- Validate environment variables at startup rather than using `!` assertions
- In Server Actions: use try/catch and return typed result objects (not throw)
- Never expose raw database errors to the client

## Logging

**Framework:** None configured -- use `console` for development
- No structured logging library installed
- No monitoring/error tracking service integrated

## Comments

**When to Comment:**
- Prisma schema: section separator comments (`// --- Section Name ---`)
- Prisma schema: inline field documentation (`// JSON array of strings`, `// 1-5`, `// hashed IP for dedup, never store raw IP`)
- Source code: minimal comments, prefer self-documenting code
- Config files: brief inline comments where helpful (`/* config options here */`)

**JSDoc/TSDoc:**
- Not used in application code
- Prisma-generated code includes JSDoc (auto-generated, do not edit)

## Function Design

**Size:** Keep components small and focused. Extract reusable pieces into `src/components/`.

**Parameters:** Destructured props with `Readonly<>` wrapper for React components.

**Return Values:** JSX returned directly from component functions (no intermediate render variables).

## Module Design

**Exports:**
- Pages/layouts: `export default function` (required by Next.js)
- Metadata: `export const metadata` (named export)
- Prisma singleton: named export `export const prisma` from `src/lib/db.ts`
- Utilities: named exports (no default exports for non-page modules)

**Barrel Files:**
- Not used in application code
- Prisma-generated code uses barrel exports in `src/generated/prisma/`

**File Organization:**
- Server Actions: `src/app/actions/` or colocated with the form
- Shared components: `src/components/` (flat structure unless a group needs isolation)
- Library code: `src/lib/`
- Query helpers: `src/lib/queries.ts` (single file for MVP, split when exceeding 300 lines per `PROJECT.md`)
- Generated code: `src/generated/` (git-ignored)

## URL Conventions

**SEO URLs use slugs as canonical identifiers:**
```
/                              -> Homepage
/meal-kits                     -> Category: Meal Kits
/prepared-meals                -> Category: Prepared Meals
/protein-boxes                 -> Category: Protein/Meat Boxes
/produce-boxes                 -> Category: Produce/Grocery Boxes
/specialty                     -> Category: Specialty Diet Boxes
/providers/[slug]              -> Provider detail page
/compare/[slug-vs-slug]        -> SEO comparison (2 providers, indexed)
/compare?providers=a,b,c       -> Flexible comparison (3-4 providers, noindex)
/methodology                   -> How we review (E-E-A-T)
/best/[slug]                   -> "Best of" collection pages
/blog                          -> Blog index
/blog/[slug]                   -> Blog post
/admin                         -> Admin dashboard (protected)
/admin/providers               -> Manage providers
/admin/content                 -> Manage blog/collections
```

**Filter/Sort State:**
- URL search params drive filter/sort state on listing pages
- Keep URLs shareable and bookmarkable
- Filters update URL and results synchronously

---

*Convention analysis: 2026-03-20*
