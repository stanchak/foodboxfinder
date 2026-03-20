# Technology Stack

**Project:** FoodBoxFinder
**Researched:** 2026-03-20
**Overall confidence:** HIGH (core stack verified against installed packages and Next.js 16 docs)

## Core Stack (Already Decided -- No Changes)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Next.js | 16.2.0 | Full-stack framework (App Router, Server Components) | Installed |
| React | 19.2.4 | UI rendering | Installed |
| TypeScript | 5.9.3 | Type safety, strict mode | Installed |
| Prisma | 7.5.0 | ORM + database client (with `@prisma/adapter-pg`) | Installed |
| Tailwind CSS | 4.2.2 | Utility-first styling via PostCSS | Installed |
| Neon PostgreSQL | -- | Serverless database | Provisioned |
| Vercel | -- | Hosting, CDN, serverless functions | Initialized |

## Recommended Additional Libraries

### Content Rendering (Phase 70: Blog & Collections)

| Library | Version | Purpose | Why This |
|---------|---------|---------|----------|
| `react-markdown` | 10.1.0 | Render markdown stored in DB to React components | Blog content is stored in Prisma `body: String @db.Text` -- this is database-driven markdown, NOT file-based MDX. `react-markdown` renders markdown strings directly in Server Components without build-time compilation. Lighter than MDX for DB-sourced content. |
| `remark-gfm` | 4.0.1 | GitHub Flavored Markdown (tables, strikethrough, task lists) | Blog posts need tables for comparison content and GFM formatting. |
| `rehype-slug` | 6.0.0 | Add `id` attributes to headings | Required for table-of-contents linking in blog posts. |
| `rehype-autolink-headings` | 7.1.0 | Add anchor links to headings | Improves UX for sharing specific sections of blog posts. |
| `@tailwindcss/typography` | 0.5.19 | `prose` classes for rendered markdown/HTML | Next.js official docs recommend this for MDX/markdown content. Provides beautiful default typography for blog body content with zero custom CSS. |

**Confidence:** HIGH -- `react-markdown` is the standard for rendering DB-stored markdown. Verified React 19 compatibility via peer deps (`react: >=18`). The `@next/mdx` approach is wrong here because MDX is for file-based content, not database-driven content.

**Why NOT `@next/mdx` or `next-mdx-remote`:** The blog content lives in the Prisma database as plain text strings, not as `.mdx` files. `@next/mdx` requires file-based routing with `.mdx` extensions. `next-mdx-remote` could work but adds unnecessary complexity (JSX compilation at runtime) when the blog does not need embedded React components -- it only needs formatted text. `react-markdown` is simpler, faster, and purpose-built for this use case.

### Structured Data & SEO (Phase 110: SEO)

| Library | Version | Purpose | Why This |
|---------|---------|---------|----------|
| `schema-dts` | 1.1.5 | TypeScript types for JSON-LD structured data | Recommended by Next.js official docs (verified in `node_modules/next/dist/docs/01-app/02-guides/json-ld.md`). Provides `WithContext<Product>`, `WithContext<ItemList>`, etc. for type-safe schema.org markup. Zero runtime cost -- types only. |
| `serialize-javascript` | 7.0.4 | Safe JSON-LD serialization (XSS prevention) | Next.js official docs warn that `JSON.stringify` does not sanitize malicious strings. This library is explicitly recommended as an alternative. Used for `dangerouslySetInnerHTML` in `<script type="application/ld+json">` tags. |

**Confidence:** HIGH -- both libraries recommended directly in the Next.js 16 official documentation.

**Why NOT `next-seo`:** Next.js App Router has native `generateMetadata()` and `metadata` exports. `next-seo` was designed for Pages Router and is redundant in App Router. The JSON-LD approach is a plain `<script>` tag as recommended by Next.js docs.

**Why NOT `next-sitemap`:** Next.js 16 has native `app/sitemap.ts` support that generates sitemaps dynamically from code. Verified in official docs. No third-party library needed.

### UI Utilities (Phase 20: Design System)

| Library | Version | Purpose | Why This |
|---------|---------|---------|----------|
| `clsx` | 2.1.1 | Conditional CSS class merging | Industry standard for conditionally joining classNames. Tiny (228B). Works perfectly with Tailwind. |
| `tailwind-merge` | 3.5.0 | Intelligent Tailwind class deduplication | Resolves Tailwind class conflicts (e.g., `px-4` + `px-2` = `px-2`). Essential when composing component variants with overrides. |
| `lucide-react` | 0.577.0 | Icon library | Tree-shakeable SVG icons (only used icons in bundle). Consistent design language. React 19 compatible (`react: >=16.5.1`). 1400+ icons covering all UI needs (star, filter, search, menu, chevron, external-link, etc.). |

**Confidence:** HIGH -- `clsx` + `tailwind-merge` is the de facto standard pattern. `lucide-react` is the successor to Feather icons with broader coverage.

**Why NOT `class-variance-authority` (CVA):** CVA adds a variant API layer that is useful for complex design systems, but FoodBoxFinder has a small, focused component set (~15 components). The overhead of learning CVA's API is not justified. Use plain `clsx` + `tailwind-merge` through a `cn()` utility function:

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Why NOT `@heroicons/react`:** Heroicons has fewer icons (300 vs 1400+) and is Tailwind-specific. Lucide has better coverage for food/commerce UIs and is framework-agnostic.

### Form Validation (Phase 90: Reviews, Phase 100: Admin)

| Library | Version | Purpose | Why This |
|---------|---------|---------|----------|
| `zod` | 4.3.6 | Runtime schema validation for Server Actions and forms | TypeScript-first validation. Works seamlessly with React 19 Server Actions -- validate `FormData` on the server before database writes. Generates TypeScript types from schemas. Used for review submission, admin forms, and search query validation. |

**Confidence:** HIGH -- Zod is the dominant validation library in the Next.js ecosystem. Compatible with Server Actions pattern shown in Next.js 16 docs.

**Why NOT `yup` or `joi`:** Zod is TypeScript-native (infers types from schemas), smaller, and designed for the server-first paradigm. Yup and Joi predate the Server Components era.

### Rate Limiting (Phase 90: Reviews)

| Library | Version | Purpose | Why This |
|---------|---------|---------|----------|
| In-memory rate limiter (custom) | -- | Basic rate limiting for review submissions | See rationale below |

**Confidence:** MEDIUM -- approach depends on deployment specifics.

**Rationale for custom over Upstash:** The project constraint is "minimal budget -- no paid APIs, no premium services beyond Neon and Vercel free tiers." Upstash Rate Limit (`@upstash/ratelimit` 2.0.8) requires an Upstash Redis instance, which is a paid dependency (free tier exists but adds operational complexity and another service to manage).

For MVP with low traffic, a simple in-memory Map-based rate limiter in the Server Action is sufficient:

```typescript
// src/lib/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitMap.set(key, { count: 1, lastReset: now })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}
```

**Upgrade path:** When traffic grows beyond a single Vercel serverless instance, switch to `@upstash/ratelimit` + `@upstash/redis`. The API surface is nearly identical.

### Image Optimization (All Phases)

| Library | Version | Purpose | Why This |
|---------|---------|---------|----------|
| `sharp` | 0.34.5 | Image optimization for Next.js Image component | Next.js uses `sharp` for production image optimization on Vercel. Installing it explicitly ensures consistent behavior in local development and avoids the `squoosh` fallback (which is slower and deprecated). |

**Confidence:** HIGH -- Next.js recommends installing `sharp` for production deployments.

### Search (Phase 80)

| Library | Version | Purpose | Why This |
|---------|---------|---------|----------|
| PostgreSQL `tsvector` (via Prisma `$queryRaw`) | -- | Full-text search | Use PostgreSQL's built-in full-text search via Prisma raw queries. No external search service needed. Neon supports all PG full-text features. |

**Confidence:** HIGH -- PostgreSQL full-text search is mature and sufficient for a site with <100 providers and <50 blog posts. No need for Elasticsearch, Typesense, or Algolia at this scale.

**Implementation approach:**
1. Add a `searchVector tsvector` column to Provider and BlogPost models (via raw SQL migration since Prisma does not natively support tsvector)
2. Create a GIN index on the vector column
3. Use `$queryRaw` with `to_tsquery` for search queries
4. Weight provider names higher than descriptions using `setweight()`

### Development Utilities

| Library | Version | Purpose | Why This |
|---------|---------|---------|----------|
| `tsx` | 4.21.0 | Run TypeScript files directly | Already needed for `prisma/seed.ts` (per CLAUDE.md: `npx tsx prisma/seed.ts`). Not installed yet. |
| `server-only` | 0.0.1 | Prevent server code from being imported in client components | Tiny marker package. `import 'server-only'` in data-fetching modules ensures they never accidentally end up in client bundles. Recommended in Next.js caching docs. |

**Confidence:** HIGH -- both are standard Next.js ecosystem utilities.

## What NOT to Install

| Library | Why NOT |
|---------|---------|
| `next-seo` | Redundant with App Router's native `metadata` / `generateMetadata()` |
| `next-sitemap` | Redundant with Next.js 16 native `app/sitemap.ts` |
| `next-mdx-remote` | Blog content is DB-stored plain markdown, not MDX with embedded components |
| `@next/mdx` | Same reason -- content is in Prisma, not file-based |
| `class-variance-authority` | Overkill for ~15 components; `cn()` utility is sufficient |
| `@upstash/ratelimit` | Adds paid dependency; in-memory limiter sufficient for MVP |
| `@upstash/redis` | Same as above |
| `framer-motion` | No complex animations needed; CSS transitions via Tailwind sufficient |
| `react-query` / `@tanstack/query` | Data fetching happens in Server Components, not client-side |
| `axios` | Native `fetch` is sufficient; no HTTP client library needed |
| `prisma-client-extensions` | Overkill for the query patterns in this project |
| `next-auth` / `auth.js` | No user auth; admin uses simple `ADMIN_SECRET` via `proxy.ts` |
| `jest` / `vitest` | Testing is not configured and not in MVP scope |
| `playwright` | Same -- no e2e testing in MVP scope |
| `contentlayer` | Deprecated/unmaintained; blog content is DB-driven anyway |

## Installation Commands

```bash
# Content rendering (Phase 70)
npm install react-markdown remark-gfm rehype-slug rehype-autolink-headings
npm install -D @tailwindcss/typography

# SEO & structured data (Phase 110, but schema-dts useful from Phase 30)
npm install schema-dts serialize-javascript

# UI utilities (Phase 20)
npm install clsx tailwind-merge lucide-react

# Validation (Phase 90)
npm install zod

# Image optimization (Phase 20)
npm install sharp

# Development utilities (Phase 10)
npm install -D tsx
npm install server-only
```

**Recommended install order:** Install in phase order. Do not front-load all dependencies. Each phase should add only what it needs to reduce complexity during development.

## Next.js Configuration Updates Required

The `next.config.ts` is currently empty. It needs these settings:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Add domains for provider logos as needed
      // e.g., { protocol: 'https', hostname: '*.example.com' }
    ],
  },
  // Enable when ready for Cache Components (Phase 110)
  // cacheComponents: true,
};

export default nextConfig;
```

## Caching Strategy (Prisma + Next.js)

Since FoodBoxFinder uses Prisma (not `fetch`), caching is done via:

1. **`unstable_cache` from `next/cache`** -- Wrap Prisma queries for time-based caching with tags
2. **`React.cache`** -- Deduplicate Prisma queries within a single render pass
3. **`revalidatePath` / `revalidateTag`** -- On-demand revalidation in admin Server Actions
4. **`export const revalidate = N`** -- Route-level ISR timing

All four patterns are documented in the Next.js 16 caching guide (verified in `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`).

**Per-page strategy:**
| Page | Caching Approach | Revalidate |
|------|------------------|------------|
| Homepage | `unstable_cache` + ISR | 3600s (1 hour) |
| Category listings | Dynamic (filter params vary) | No cache, but use `React.cache` for dedup |
| Provider detail | `unstable_cache` with `['provider', slug]` tag | 3600s |
| Blog posts | `unstable_cache` with `['blog', slug]` tag | 86400s (1 day) |
| Collections | `unstable_cache` with `['collection', slug]` tag | 3600s |
| Comparison | Dynamic (query params) | No ISR, use `React.cache` |
| Search | Dynamic | No cache |
| Admin | `force-dynamic` | Never cached |

## Sources

- Next.js 16 official docs: `node_modules/next/dist/docs/01-app/02-guides/json-ld.md` (JSON-LD approach, schema-dts recommendation)
- Next.js 16 official docs: `node_modules/next/dist/docs/01-app/02-guides/mdx.md` (MDX vs markdown approaches)
- Next.js 16 official docs: `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` (unstable_cache, React.cache, revalidation)
- Next.js 16 official docs: `node_modules/next/dist/docs/01-app/02-guides/incremental-static-regeneration.md` (ISR patterns)
- Next.js 16 official docs: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md` (native sitemap)
- npm registry: version verification for all recommended packages (via `npm view`)
- Peer dependency verification: confirmed React 19 compatibility for all libraries
