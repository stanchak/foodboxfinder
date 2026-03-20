# Research Summary: FoodBoxFinder

**Domain:** Food box subscription comparison/discovery site
**Researched:** 2026-03-20
**Overall confidence:** HIGH

## Executive Summary

FoodBoxFinder's core technology stack (Next.js 16.2, React 19, Prisma 7.5, Tailwind CSS 4, Neon PostgreSQL, Vercel) is already decided and installed. Research focused on identifying the additional libraries, patterns, and caching strategies needed to build a production-ready SEO-first comparison site on this foundation.

The additional library footprint is deliberately small: 13 runtime/dev packages beyond the core stack. Every recommendation was verified against the Next.js 16 official docs bundled with the installed version and against npm registry for version/compatibility. Key decisions include using `react-markdown` (not MDX) for database-driven blog content, PostgreSQL full-text search (not external search services) for the search feature, `schema-dts` for type-safe JSON-LD, and an in-memory rate limiter (not Upstash) to stay within the budget constraint.

The food box comparison space has a well-established feature set. FoodBoxFinder's planned features cover all table stakes and include genuine differentiators: advanced multi-dimensional filtering, dual comparison URL strategy for SEO, fast performance without ad clutter, and user-generated reviews. The architecture follows a hub-and-spoke content model with Server Components as the rendering backbone and a thin client layer for interactive UI.

The most important technical decisions are: (1) URL search params as the single source of truth for filter state, (2) a centralized query layer with `React.cache()` deduplication, (3) on-demand revalidation from admin Server Actions rather than time-based ISR, and (4) avoiding premature library adoption -- install dependencies only when their phase begins.

## Key Findings

**Stack:** 13 additional packages needed beyond core. `react-markdown` for blog, `schema-dts` for SEO, `clsx` + `tailwind-merge` + `lucide-react` for UI, `zod` for validation, `sharp` for images, PostgreSQL full-text search for search.
**Architecture:** Hub-and-spoke content site with Server Components, centralized query layer, URL-driven filter state, on-demand revalidation.
**Critical pitfall:** Stale provider data destroying trust. Display "last verified" dates and build admin alerts for stale content.

## Implications for Roadmap

The existing 12-phase ROADMAP.md structure is well-aligned with both feature dependencies and library installation order. No structural changes needed.

Based on research, suggested phase structure (confirms existing roadmap):

1. **Phase 10: Database & Foundation** - Install `tsx`, `server-only`. Build query layer with `React.cache()` dedup. Invest in realistic seed data quality.
   - Addresses: data foundation all phases depend on
   - Avoids: low-quality seed data pitfall

2. **Phase 20: Design System & Layout** - Install `clsx`, `tailwind-merge`, `lucide-react`, `sharp`. Build `cn()` utility. Configure `next.config.ts` with `images.remotePatterns`.
   - Addresses: reusable components, responsive layout
   - Avoids: over-engineering base components pitfall

3. **Phase 30: Homepage** - Install `schema-dts`, `serialize-javascript` (needed for JSON-LD from this phase onward).
   - Addresses: hero, featured providers, category cards

4. **Phase 40: Category Pages & Filtering** - Highest-complexity consumer feature. URL-driven filter state is the primary differentiator.
   - Addresses: category browsing, dietary filtering, price filtering
   - Avoids: filter/URL state sync pitfall (needs careful testing)

5. **Phase 50: Provider Detail Pages** - Comprehensive profiles with JSON-LD structured data.
   - Addresses: provider detail, plan comparison, FAQ, breadcrumbs

6. **Phase 60: Comparison Engine** - Most complex interactive feature. Dual URL approach.
   - Addresses: side-by-side comparison, comparison tray persistence
   - Avoids: comparison state management pitfall, SEO canonical chaos pitfall

7. **Phase 70: Collections & Blog** - Install `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `@tailwindcss/typography`.
   - Addresses: "best of" pages, blog content, methodology page
   - Avoids: over-engineering blog into full CMS pitfall

8. **Phase 80: Search** - PostgreSQL full-text search via `$queryRaw`. Add tsvector column via raw SQL.
   - Addresses: full-text search across providers, blog, collections

9. **Phase 90: Review System** - Install `zod`. Build in-memory rate limiter. Add honeypot field.
   - Addresses: review submission, moderation workflow
   - Avoids: review spam pitfall

10. **Phase 100: Admin Dashboard** - Keep scope minimal: provider CRUD, review moderation, stats.
    - Addresses: content management
    - Avoids: admin scope creep pitfall

11. **Phase 110: SEO & Performance** - Native `sitemap.ts`, `robots.ts`. Audit structured data. Core Web Vitals optimization.
    - Addresses: sitemap, canonical URLs, OG images, performance

12. **Phase 120: Affiliate & Polish** - Click tracking route handler, error boundaries, final QA.
    - Addresses: affiliate revenue, error handling, launch readiness
    - Avoids: missing FTC disclosure pitfall

**Phase ordering rationale:**
- Phases 10-20 build the foundation everything else depends on
- Phases 30-50 are the core consumer experience (highest SEO value)
- Phase 60 depends on provider cards from Phase 40 and provider data from Phase 50
- Phase 70 can be built in parallel with Phase 60 (no dependency)
- Phases 80-90 are interactive features that enhance but don't block the core experience
- Phases 100-120 are infrastructure/polish that can be deferred if needed

**Research flags for phases:**
- Phase 40: Likely needs deeper research on mobile filter drawer patterns (Sheet/Drawer component)
- Phase 60: Likely needs deeper research on comparison state persistence across App Router navigations
- Phase 80: Likely needs deeper research on Prisma raw query patterns for tsvector
- Phase 100: Standard CRUD patterns, unlikely to need research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm registry. Peer deps checked for React 19 compatibility. Recommendations verified against Next.js 16 bundled docs. |
| Features | HIGH | Well-established domain. Project's own research files are comprehensive. |
| Architecture | HIGH | All patterns verified against Next.js 16 docs. Prisma + App Router patterns documented. |
| Pitfalls | MEDIUM | Based on training data + project-specific analysis. No live competitor audit. |

## Gaps to Address

- Live competitor audit would increase confidence on differentiator claims
- Prisma 7.5 raw query ergonomics for tsvector search need phase-specific investigation
- Exact `remotePatterns` config for provider logo domains needs to be determined during Phase 10 seed data creation
- `@tailwindcss/typography` v0.5.x compatibility with Tailwind CSS 4 needs verification during Phase 70 installation (the plugin may need the v4-specific import pattern)
- In-memory rate limiter limitations on Vercel serverless (no shared state across function instances) may require revisiting for production traffic
