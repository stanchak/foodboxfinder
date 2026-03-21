# Codebase Structure

**Analysis Date:** 2026-03-21

## Directory Layout

```
foodboxfinder/
├── prisma/
│   ├── schema.prisma          # Database schema (source of truth)
│   ├── seed.ts                # Seed script (run with npx tsx prisma/seed.ts)
│   └── seed-data/             # JSON/TS seed data files
├── public/
│   └── assets/
│       └── providers/         # Static provider image assets
├── src/
│   ├── app/                   # Next.js App Router (all routes)
│   │   ├── layout.tsx         # Root layout (HTML shell, fonts, CompareProvider)
│   │   ├── page.tsx           # Homepage (/)
│   │   ├── error.tsx          # Root error boundary (Client Component)
│   │   ├── global-error.tsx   # Unrecoverable error fallback
│   │   ├── not-found.tsx      # 404 page
│   │   ├── globals.css        # Global styles, Tailwind import
│   │   ├── sitemap.ts         # /sitemap.xml generation
│   │   ├── robots.ts          # /robots.txt generation
│   │   ├── favicon.ico
│   │   ├── [category]/        # Category listing (e.g., /meal-kits)
│   │   │   └── page.tsx
│   │   ├── providers/
│   │   │   └── [slug]/        # Provider detail (/providers/{slug})
│   │   │       └── page.tsx
│   │   ├── compare/
│   │   │   ├── page.tsx       # Flexible comparison (/compare?providers=...)
│   │   │   └── [versus]/      # SEO comparison (/compare/a-vs-b)
│   │   │       └── page.tsx
│   │   ├── best/
│   │   │   ├── page.tsx       # Collections index (/best)
│   │   │   └── [slug]/        # Collection detail (/best/{slug})
│   │   │       └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx       # Blog index (/blog)
│   │   │   └── [slug]/        # Blog post (/blog/{slug})
│   │   │       └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx       # Search results (/search?q=...)
│   │   ├── methodology/
│   │   │   └── page.tsx       # Editorial methodology page
│   │   ├── admin/             # Admin CMS (protected by src/proxy.ts)
│   │   │   ├── layout.tsx     # Admin layout (sidebar nav, logout)
│   │   │   ├── page.tsx       # Admin dashboard
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── providers/
│   │   │   │   ├── page.tsx   # Provider list
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx   # Review moderation queue
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   └── collections/
│   │   │       ├── page.tsx
│   │   │       ├── new/page.tsx
│   │   │       └── [id]/edit/page.tsx
│   │   ├── actions/           # Server Actions
│   │   │   ├── reviews.ts     # submitReview (consumer)
│   │   │   └── admin.ts       # All admin CRUD + auth actions
│   │   └── api/
│   │       └── affiliate/
│   │           └── [providerId]/
│   │               └── route.ts  # Affiliate click tracking + redirect
│   ├── components/            # Shared UI components (flat structure)
│   │   ├── admin/             # Admin-only form components
│   │   │   ├── BlogPostForm.tsx
│   │   │   ├── CollectionForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── PlanForm.tsx
│   │   │   ├── PlanManager.tsx
│   │   │   └── ProviderForm.tsx
│   │   ├── AddToCompareButton.tsx   # "use client" — compare selection button
│   │   ├── AffiliateLink.tsx        # Affiliate link wrapper
│   │   ├── Badge.tsx                # Pill/badge UI primitive
│   │   ├── Breadcrumbs.tsx          # Breadcrumb navigation
│   │   ├── Button.tsx               # Button UI primitive
│   │   ├── Card.tsx                 # Card UI primitive
│   │   ├── CategoryFilters.tsx      # "use client" — filter sidebar + mobile drawer
│   │   ├── CompareBar.tsx           # "use client" — floating comparison tray
│   │   ├── CompareProvider.tsx      # "use client" — sessionStorage compare context
│   │   ├── ComparisonTable.tsx      # Side-by-side comparison grid
│   │   ├── FaqAccordion.tsx         # Provider FAQ accordion
│   │   ├── Footer.tsx               # Site footer
│   │   ├── Header.tsx               # Site header with nav
│   │   ├── HeaderSearchForm.tsx     # "use client" — header search input
│   │   ├── Input.tsx                # Input UI primitive
│   │   ├── MobileNav.tsx            # "use client" — mobile hamburger nav
│   │   ├── Pagination.tsx           # URL-based pagination links
│   │   ├── PricingTable.tsx         # Plan pricing comparison table
│   │   ├── ProviderCard.tsx         # Provider listing card
│   │   ├── RatingBreakdown.tsx      # Star rating distribution bars
│   │   ├── RatingStars.tsx          # Read-only star display
│   │   ├── ReviewCard.tsx           # Individual review display
│   │   ├── ReviewForm.tsx           # "use client" — review submission form
│   │   ├── SearchInput.tsx          # "use client" — controlled search input
│   │   ├── Select.tsx               # Select UI primitive
│   │   ├── Skeleton.tsx             # Loading skeleton primitive
│   │   └── StarRatingInput.tsx      # "use client" — interactive star rating input
│   ├── lib/                   # Server-side utilities and data access
│   │   ├── categories.ts      # CategoryType ↔ URL slug bidirectional mapping
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── format.ts          # Price formatting utilities
│   │   └── queries.ts         # All database query functions (server-only)
│   ├── generated/
│   │   └── prisma/            # Auto-generated Prisma client (gitignored)
│   │       ├── client.ts
│   │       ├── models.ts
│   │       ├── enums.ts
│   │       └── internal/
│   └── proxy.ts               # Next.js 16 request interceptor (admin auth)
├── .planning/                 # GSD planning artifacts
│   ├── PROJECT.md
│   ├── ROADMAP.md
│   ├── phases/
│   └── codebase/
├── .claude/                   # Claude/GSD memory files
├── CLAUDE.md                  # Project instructions for Claude
├── AGENTS.md                  # Agent guidelines
├── next.config.ts             # Next.js config (image remotePatterns)
├── prisma.config.ts           # Prisma config (dotenv loading)
├── tsconfig.json              # TypeScript strict config
├── eslint.config.mjs          # ESLint 9 flat config
├── postcss.config.mjs         # PostCSS with @tailwindcss/postcss
├── package.json               # npm scripts, dependencies
└── package-lock.json
```

## Directory Purposes

**`src/app/`:**
- Purpose: All routes, pages, layouts, and API handlers (Next.js App Router)
- Contains: Server Component pages, route layouts, error/not-found boundaries, sitemap, robots, Server Actions, API route handlers
- Key files: `layout.tsx` (root shell), `page.tsx` (homepage), `sitemap.ts`, `robots.ts`, `error.tsx`, `not-found.tsx`, `global-error.tsx`

**`src/app/[category]/`:**
- Purpose: Category listing pages at `/{category-slug}` (e.g., `/meal-kits`, `/protein-boxes`)
- Pattern: Single dynamic segment; resolved via `getCategoryBySlug()` — returns 404 for unknown slugs
- Static generation: `generateStaticParams()` pre-renders all 5 category slugs

**`src/app/providers/[slug]/`:**
- Purpose: Provider detail pages at `/providers/{slug}`
- Pattern: Slug is unique canonical identifier; `getProviderBySlug()` returns null → `notFound()`

**`src/app/compare/`:**
- Purpose: Two comparison entry points — SEO (`/compare/{a}-vs-{b}`) and flexible (`/compare?providers=...`)
- `[versus]/page.tsx`: Canonical, indexable, statically generated for known pairs
- `page.tsx`: Dynamic, `noindex`, driven by `?providers=` search param (from CompareBar navigation)

**`src/app/best/`:**
- Purpose: Curated collection pages at `/best` (index) and `/best/{slug}` (detail)
- Statically generated via `getAllCollectionSlugs()`

**`src/app/blog/`:**
- Purpose: Editorial blog at `/blog` (paginated index) and `/blog/{slug}` (post)
- Statically generated via `getAllBlogPostSlugs()`

**`src/app/admin/`:**
- Purpose: Internal CMS for content management — all routes under `/admin/` are protected
- Contains: Dashboard, Providers CRUD, Reviews moderation, Blog CRUD, Collections CRUD
- Auth: `src/proxy.ts` intercepts before any admin page renders; login page at `/admin/login` is exempt

**`src/app/actions/`:**
- Purpose: Server Actions for mutations
- `reviews.ts`: Consumer review submission with honeypot, validation, IP-based rate limiting
- `admin.ts`: Full CRUD for all admin entities + auth (login/logout); exports ~15 Server Action functions

**`src/app/api/`:**
- Purpose: API Route handlers (minimal — only affiliate tracking)
- `affiliate/[providerId]/route.ts`: GET endpoint that logs click and redirects

**`src/components/`:**
- Purpose: Shared reusable components — flat structure by convention
- Divide: Server Components (no directive) vs. Client Components (`"use client"` at top of file)
- Client Components: `CategoryFilters`, `CompareBar`, `CompareProvider`, `AddToCompareButton`, `ReviewForm`, `StarRatingInput`, `SearchInput`, `HeaderSearchForm`, `MobileNav`

**`src/components/admin/`:**
- Purpose: Admin-only form components used by admin pages
- All are Client Components (interactive forms with `useActionState`)

**`src/lib/`:**
- Purpose: Server-side shared utilities
- `categories.ts`: Bidirectional enum ↔ slug mapping; navigation item array
- `db.ts`: Prisma singleton (always import from here, never instantiate PrismaClient directly)
- `format.ts`: Price formatting helpers (all prices stored as cents)
- `queries.ts`: All Prisma queries wrapped in `React.cache()`; marked `"server-only"`

**`src/generated/prisma/`:**
- Purpose: Auto-generated Prisma client output
- Generated by: `npx prisma generate` (also runs as part of `npm run build`)
- Status: Gitignored — never commit, never edit manually

**`prisma/`:**
- Purpose: Database schema and seed data
- `schema.prisma`: Single source of truth for all models, enums, indexes, and relations
- `seed.ts`: Seed script using `tsx` (not `ts-node`)
- `seed-data/`: Supporting data files for seeding

**`public/assets/providers/`:**
- Purpose: Static provider logo/image files
- Note: Provider images can also reference external URLs (Unsplash, Cloudinary, S3, imgix, Clearbit, Logo.dev) via `next/image` with configured `remotePatterns` in `next.config.ts`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout — wraps every page, loads fonts, provides CompareProvider context
- `src/app/page.tsx`: Homepage
- `src/proxy.ts`: Admin auth interceptor (Next.js 16 proxy, not middleware)
- `src/lib/db.ts`: Prisma client singleton

**Configuration:**
- `next.config.ts`: Image `remotePatterns` (Unsplash, Cloudinary, S3, imgix, Clearbit, Logo.dev)
- `prisma/schema.prisma`: Full database schema
- `prisma.config.ts`: Prisma config with dotenv loading
- `tsconfig.json`: TypeScript strict config, `@/*` path alias
- `eslint.config.mjs`: ESLint 9 flat config
- `postcss.config.mjs`: Tailwind CSS 4 PostCSS plugin
- `src/app/globals.css`: Global CSS, Tailwind v4 import, CSS custom properties

**Core Logic:**
- `src/lib/queries.ts`: All database queries (start here for any data access)
- `src/lib/categories.ts`: Category enum ↔ URL slug mapping (required for any category-related code)
- `src/lib/format.ts`: Price formatting (cents to display strings)
- `src/app/actions/admin.ts`: All admin mutations
- `src/app/actions/reviews.ts`: Consumer review submission

**Database:**
- `prisma/schema.prisma`: Schema definition
- `src/generated/prisma/`: Generated client types (reference for model types)

## Naming Conventions

**Files:**
- Pages and layouts: `page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`, `loading.tsx` (Next.js conventions)
- Components: `PascalCase.tsx` (e.g., `ProviderCard.tsx`, `CategoryFilters.tsx`)
- Library modules: `camelCase.ts` (e.g., `db.ts`, `queries.ts`, `categories.ts`, `format.ts`)
- Config files: `camelCase.config.ts` or `camelCase.config.mjs` (e.g., `next.config.ts`, `eslint.config.mjs`)
- Route handlers: `route.ts`
- Server Actions files: `camelCase.ts` in `src/app/actions/`

**Directories:**
- Route segments: `kebab-case` matching URL path (e.g., `[category]`, `[slug]`, `[versus]`)
- Non-route directories: `camelCase` (e.g., `actions/`, `admin/`)

**Functions and Variables:**
- React components: `PascalCase` function declarations (not arrow functions)
- Utility functions: `camelCase` (e.g., `getProviders`, `formatPrice`, `getCategoryBySlug`)
- Server Actions: `camelCase` with verb prefix (e.g., `submitReview`, `updateProvider`, `deleteBlogPost`)
- Constants/config objects: `camelCase` (e.g., `CATEGORY_MAP` is UPPER_SNAKE for exported constants)
- Exported constants: `UPPER_SNAKE_CASE` (e.g., `CATEGORY_MAP`, `CATEGORY_NAV_ITEMS`)
- Environment variables: `UPPER_SNAKE_CASE` (e.g., `DATABASE_URL`, `ADMIN_SECRET`)

**Types:**
- Type/interface names: `PascalCase`
- Props: inline `Readonly<{}>` wrapper, no separate interface files for simple props
- Prisma model types: import from `@/generated/prisma/client`
- Type-only imports: always use `import type` syntax

**Database:**
- Models: `PascalCase` (e.g., `Provider`, `Plan`, `BlogPost`)
- Fields: `camelCase` (e.g., `providerId`, `averageRating`, `pricePerServing`)
- Enum type names: `PascalCase` (e.g., `CategoryType`, `DietaryTag`)
- Enum values: `UPPER_SNAKE_CASE` (e.g., `MEAL_KIT`, `GLUTEN_FREE`)
- Primary keys: `cuid()` default
- JSON fields: `*Json` suffix (e.g., `prosJson`, `consJson`)

## Where to Add New Code

**New Consumer Page:**
- Create route: `src/app/{route-name}/page.tsx` (Server Component)
- Must export: `metadata` or `generateMetadata()`
- Must include: JSON-LD structured data
- Data: Call functions from `src/lib/queries.ts`
- `await params` and `await searchParams` before accessing their values

**New Admin Page:**
- Create route: `src/app/admin/{entity}/page.tsx`
- Protected automatically by `src/proxy.ts` (no additional auth needed)
- Forms: Create component in `src/components/admin/{Entity}Form.tsx`
- Mutations: Add Server Action to `src/app/actions/admin.ts`
- Call `revalidatePath()` after any mutation that affects public pages

**New Database Query:**
- Add function to `src/lib/queries.ts`
- Wrap in `cache()` from React
- File is already marked `"server-only"` — import only in Server Components and Server Actions
- If `queries.ts` exceeds 300 lines significantly, split by domain (e.g., `src/lib/queries/providers.ts`)

**New Component:**
- Server Component (no interactivity): `src/components/{ComponentName}.tsx` — no directive needed
- Client Component (needs state/events/browser APIs): `src/components/{ComponentName}.tsx` — add `"use client"` at line 1
- Admin-only form component: `src/components/admin/{ComponentName}.tsx`
- Export as default function with `PascalCase` name

**New Server Action:**
- Consumer actions: `src/app/actions/reviews.ts` or new file in `src/app/actions/`
- Admin actions: add to `src/app/actions/admin.ts`
- All Server Actions must be marked `"use server"` and return `{ success, message, errors }` (never throw to client)

**New Utility/Helper:**
- Price or display formatting: `src/lib/format.ts`
- Category/enum mapping: `src/lib/categories.ts`
- Other shared server utilities: `src/lib/{name}.ts`

**New API Route:**
- Create: `src/app/api/{path}/route.ts`
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`, etc.
- Import Prisma from `@/lib/db` (never from client components)

**New Schema Model:**
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (dev) or create migration
3. Run `npx prisma generate` to regenerate `src/generated/prisma/`
4. Add query functions to `src/lib/queries.ts`
5. Add Server Actions to `src/app/actions/admin.ts` if CMS-managed

**New Image Source:**
- Add hostname to `images.remotePatterns` in `next.config.ts`
- Use `<Image>` from `next/image` with `width`, `height`, and `alt` props

## Special Directories

**`.planning/`:**
- Purpose: GSD planning artifacts (project spec, roadmap, phase plans, codebase docs)
- Generated: Partially (phase plans generated by GSD commands)
- Committed: Yes

**`.claude/`:**
- Purpose: Claude/GSD memory files (project memory index, per-topic memory files)
- Committed: No (user-local)

**`src/generated/prisma/`:**
- Purpose: Auto-generated Prisma client code
- Generated: Yes (by `npx prisma generate`)
- Committed: No (gitignored)
- Contents: `client.ts`, `models.ts`, `enums.ts`, `commonInputTypes.ts`, `internal/`

**`.vercel/`:**
- Purpose: Vercel project configuration and build output cache
- Committed: Partially (`.vercel/project.json` for project ID, output files excluded)

**`prisma/seed-data/`:**
- Purpose: Supporting data for the seed script
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-21*
