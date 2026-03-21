# Technology Stack

**Project:** FoodBoxFinder - Food Subscription Discovery Platform
**Researched:** 2026-03-21
**Mode:** Brownfield -- existing Next.js 16.2 + Prisma 7.5 + Tailwind 4 stack is committed and working

## Executive Assessment

The existing stack is well-chosen and nearly complete for the project's needs. This is not a greenfield stack decision -- it is a gap analysis. The codebase already has 60+ source files, a working query layer, comparison UI, filter system, admin CRUD, and affiliate tracking. **Most of what this project needs is already installed or built into the platform.**

The gaps are narrow and specific:
1. **Blog/content rendering** -- custom markdown parser exists but is fragile
2. **Tailwind prose styling** -- `prose` classes used in blog but plugin not installed
3. **Form validation** -- manual validation works but is verbose
4. **Analytics** -- no production analytics yet
5. **Testing** -- no test framework installed

## Existing Stack (Already Configured -- No Changes Needed)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Next.js | 16.2.0 | Full-stack framework, App Router, ISR | Installed, configured |
| React | 19.2.4 | UI rendering, Server Components | Installed |
| TypeScript | 5.9.3 | Type safety, strict mode | Installed, configured |
| Prisma | 7.5.0 | ORM, schema management | Installed, schema defined |
| @prisma/adapter-pg | 7.5.0 | Neon PostgreSQL driver | Installed, configured |
| Tailwind CSS | 4.2.2 | Utility-first CSS | Installed, custom theme configured |
| ESLint | 9.39.4 | Linting (flat config) | Installed, configured |
| tsx | 4.21.0 | Script runner for seed/admin | Installed |
| server-only | 0.0.1 | Prevent query leakage to client | Installed |
| dotenv | 17.3.1 | Env loading for Prisma | Installed |

These are the foundation. Do not change, upgrade, or replace any of them.

## Recommended Additions

### Tier 1: Add Now (Immediate Gaps)

#### @tailwindcss/typography 0.5.19
| | |
|------------|-------|
| **Purpose** | Prose typography classes for blog content and editorial text |
| **Why** | The blog page already uses `prose prose-gray prose-lg` classes (line 37 of blog/[slug]/page.tsx) but the plugin is NOT installed. These classes do nothing without it. Blog content renders without proper typography. |
| **Confidence** | HIGH -- verified peer dependency supports `tailwindcss >=4.0.0-beta.1`, confirmed via npm registry |
| **Install** | `npm install @tailwindcss/typography` |
| **Config** | Add `@import "@tailwindcss/typography"` to `src/app/globals.css` after `@import "tailwindcss"` (Tailwind v4 plugin import syntax) |

#### zod 4.3.6
| | |
|------------|-------|
| **Purpose** | Schema validation for Server Actions and search param parsing |
| **Why** | The codebase has ~80 lines of manual validation in `src/app/actions/reviews.ts` (type checking, length checks, email regex). The admin actions in `src/app/actions/admin.ts` likely have similar patterns. Zod replaces this with type-safe schemas that infer TypeScript types. Also valuable for `searchParams` parsing in filter pages -- the current `CategoryFilters` does manual parsing with fallback defaults. |
| **Confidence** | HIGH -- standard in Next.js ecosystem, no compatibility concerns |
| **Install** | `npm install zod` |
| **Priority** | Add when touching validation code next. Not a blocker for new features. |

### Tier 2: Add Before Launch

#### @vercel/analytics 2.0.1
| | |
|------------|-------|
| **Purpose** | Privacy-friendly page view analytics on Vercel |
| **Why** | Discovery/comparison site needs traffic data to understand which categories and providers drive engagement. Free on Vercel's free tier. Zero-config -- just wrap in layout. |
| **Confidence** | HIGH -- first-party Vercel integration |
| **Install** | `npm install @vercel/analytics` |
| **Config** | Add `<Analytics />` component to `src/app/layout.tsx` |

#### @vercel/speed-insights 2.0.0
| | |
|------------|-------|
| **Purpose** | Core Web Vitals monitoring |
| **Why** | SEO-first site needs CWV tracking. Google uses CWV as a ranking signal. Free on Vercel. |
| **Confidence** | HIGH -- first-party Vercel integration |
| **Install** | `npm install @vercel/speed-insights` |
| **Config** | Add `<SpeedInsights />` component to `src/app/layout.tsx` |

### Tier 3: Add If Needed (Conditional)

#### react-markdown 10.1.0 + remark-gfm 4.0.1
| | |
|------------|-------|
| **Purpose** | Full markdown rendering for blog posts |
| **Why** | The existing custom `BlogBody` component (blog/[slug]/page.tsx lines 29-109) handles headings, lists, bold, and italic manually. It works for simple content but will break on: tables, code blocks, blockquotes, links, images in markdown, nested lists, ordered lists. **However**, blog content is admin-created and could be HTML-only, in which case this is unnecessary. |
| **Confidence** | MEDIUM -- depends on whether blog content uses markdown or HTML |
| **Decision gate** | If blog posts are always entered as HTML via admin UI, skip this. If markdown support is needed, install `react-markdown` + `remark-gfm`. |
| **Install** | `npm install react-markdown remark-gfm` (only if markdown is the authoring format) |

#### @next/third-parties 16.2.1
| | |
|------------|-------|
| **Purpose** | Google Analytics / Tag Manager integration with Next.js performance optimization |
| **Why** | If affiliate revenue tracking needs GA4 conversion events, this provides optimized loading. Only needed if GA4 is used beyond Vercel Analytics. |
| **Confidence** | MEDIUM -- may not be needed if Vercel Analytics + affiliate click table suffices |
| **Decision gate** | Add only if GA4 or Google Tag Manager is required for affiliate network reporting |

## Explicitly NOT Recommended

### Libraries to Avoid

| Library | Why Not |
|---------|---------|
| **nuqs** (URL state manager) | The existing `CategoryFilters.tsx` already implements URL state management cleanly with `useSearchParams` + `useRouter` + `useTransition`. Adding nuqs would require rewriting working code for marginal benefit. The pattern is ~20 lines and well-understood. |
| **Zustand / Jotai / Redux** | No global state needed. Comparison selection uses `useSyncExternalStore` + `sessionStorage` (already built in `CompareProvider.tsx`). Filter state lives in URL params. This is correct architecture. |
| **Radix UI / Headless UI / shadcn/ui** | The project already has custom Button, Card, Badge, Input, Select, Skeleton, Breadcrumbs components built with Tailwind. Adding a component library now means rewriting all existing components for consistency. The existing components are simple, accessible, and purpose-built. |
| **next-mdx-remote** | MDX is overkill -- blog content doesn't need React components embedded in it. If markdown is needed, `react-markdown` is simpler. |
| **Prettier / Biome** | No formatter is configured, and adding one now would create a massive diff touching every file. Add only if the team grows beyond one person. |
| **next-sitemap** | The project already has `src/app/sitemap.ts` and `src/app/robots.ts` using Next.js built-in sitemap generation. No external library needed. |
| **sharp** | Next.js uses sharp internally for image optimization. No need to install separately unless doing custom image processing (which is out of scope). |
| **@upstash/ratelimit** | Rate limiting is already implemented via a Prisma query counting recent reviews by IP hash (reviews.ts line 45-56). The DB-based approach is simpler and requires no external service. Only consider Upstash if rate limiting needs become more sophisticated (e.g., API rate limiting for bots). |
| **lucide-react** | The project uses inline SVG icons throughout (home page, comparison table, compare bar, filter panel). This is intentional -- it avoids a 200KB+ icon library dependency for ~15 icons. Keep using inline SVGs. |
| **clsx / tailwind-merge** | The project uses template literals for dynamic classes (e.g., `${highlight ? "bg-gray-50/50" : "bg-white"}`). This is simpler and more explicit than `clsx()` for the patterns used. Only add if class composition becomes significantly more complex. |
| **class-variance-authority** | Overkill for a project with ~12 simple components. CVA shines in design systems with many variants -- this project has straightforward variant needs handled inline. |
| **Testing libraries (Vitest, Playwright)** | No tests exist and the project is pre-launch. Testing infrastructure should be added in a dedicated phase after the MVP is functional, not mixed into feature development. Defer to a testing phase. |

## Installation Summary

### Install Now
```bash
npm install @tailwindcss/typography
```

### Install Before Launch
```bash
npm install zod @vercel/analytics @vercel/speed-insights
```

### Install If Needed
```bash
# Only if blog uses markdown (not HTML):
npm install react-markdown remark-gfm

# Only if GA4/GTM is needed for affiliate reporting:
npm install @next/third-parties
```

## Configuration Notes

### @tailwindcss/typography with Tailwind v4
Tailwind v4 uses CSS-based plugin imports instead of `tailwind.config.js`:

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "@tailwindcss/typography";
```

This is all that's needed. No config file changes.

### Zod Integration Pattern
Use with Server Actions (replace manual validation):

```typescript
import { z } from "zod";

const ReviewSchema = z.object({
  providerId: z.string().cuid(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().min(10).max(5000),
  authorName: z.string().min(2).max(100),
  authorEmail: z.string().email().optional().or(z.literal("")),
  title: z.string().max(200).optional(),
});
```

Use with searchParams (replace manual filter parsing):

```typescript
const FilterSchema = z.object({
  diet: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  sort: z.enum(["rating", "price-asc", "price-desc", "reviews", "newest"]).default("rating"),
  page: z.coerce.number().int().min(1).default(1),
});
```

### Vercel Analytics / Speed Insights
Add to root layout:

```typescript
// src/app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Inside the body:
<Analytics />
<SpeedInsights />
```

## Confidence Assessment

| Recommendation | Confidence | Reasoning |
|---------------|------------|-----------|
| @tailwindcss/typography | HIGH | Plugin is already needed -- prose classes in use without it installed. Verified v4 compatibility via npm peer deps. |
| zod | HIGH | Standard validation library, no compatibility concerns, clear value over manual validation. |
| @vercel/analytics | HIGH | First-party, free tier, zero-config. |
| @vercel/speed-insights | HIGH | First-party, free tier, SEO-relevant. |
| react-markdown | MEDIUM | Depends on blog authoring format decision. Custom parser exists and works for simple content. |
| Avoid nuqs | HIGH | Existing URL state code works and is simple. |
| Avoid component libraries | HIGH | ~12 custom components already built and consistent. |
| Avoid state libraries | HIGH | Architecture is correct -- URL params + sessionStorage. |

## Key Insight

This project's biggest strength is its **lack of unnecessary dependencies**. The stack is minimal, the existing code solves real problems without abstraction layers, and the patterns are standard Next.js. The recommendation is to keep it that way: add only the Typography plugin (which is already implicitly needed), validation improvements (Zod), and analytics (Vercel). Everything else is either already built or not needed.

## Sources

- npm registry queries for version verification (all versions confirmed 2026-03-21)
- Codebase analysis: `package.json`, `src/app/globals.css`, `src/app/blog/[slug]/page.tsx`, `src/components/CategoryFilters.tsx`, `src/components/CompareProvider.tsx`, `src/app/actions/reviews.ts`
- @tailwindcss/typography peer dependency check: `tailwindcss >= 4.0.0-beta.1` confirmed compatible

---

*Research completed: 2026-03-21*
