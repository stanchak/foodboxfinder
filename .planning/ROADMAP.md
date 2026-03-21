# Roadmap: FoodBoxFinder

## Overview

Build a complete food box subscription discovery and comparison website from a scaffolded Next.js 16 codebase. Starting with database foundation and seed data, progressively deliver consumer-facing pages (homepage, category browsing, provider detail, comparison), content engine (collections, blog, search), user interaction (reviews), admin tooling, SEO optimization, and affiliate tracking -- culminating in a Vercel-deployable site with 18 real providers across 5 categories.

## Phases

**Phase Numbering:**
- Integer phases (10, 20, 30, ...): Planned milestone work (10-step numbering)
- Decimal phases (e.g., 30.1): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 10: Database & Foundation** - Schema deployed, seed data populated, query layer built (completed 2026-03-21)
- [x] **Phase 20: Design System & Layout** - Theme tokens, responsive layout shell, base component library (completed 2026-03-21)
- [ ] **Phase 30: Homepage** - Hero, featured providers, category cards, structured data
- [ ] **Phase 40: Category Browsing** - Filterable provider listings with URL-driven state
- [ ] **Phase 50: Provider Detail** - Comprehensive provider profiles with plans, reviews, FAQs
- [ ] **Phase 60: Comparison Engine** - Side-by-side provider comparison with persistent selection
- [ ] **Phase 70: Collections & Blog** - "Best of" pages, blog with markdown rendering
- [ ] **Phase 80: Search** - Full-text search across providers, blog, and collections
- [ ] **Phase 90: Review System** - Anonymous review submission with moderation workflow
- [ ] **Phase 100: Admin Dashboard** - Provider CRUD, review moderation, content management
- [ ] **Phase 110: SEO & Performance** - Sitemap, canonical URLs, OG metadata, Core Web Vitals
- [ ] **Phase 120: Affiliate & Launch Readiness** - Click tracking, error boundaries, final QA

## Phase Details

### Phase 10: Database & Foundation
**Goal**: All downstream pages have a reliable data layer with realistic seed data to build against
**Depends on**: Nothing (first phase -- Prisma schema and Neon connection already exist)
**Requirements**: DB-01, DB-02, DB-03, DB-04
**Success Criteria** (what must be TRUE):
  1. Running `npx prisma db push` deploys the schema to Neon without errors
  2. Running the seed script populates 18 providers across 5 categories with realistic plans, pricing, dietary tags, FAQs, and reviews
  3. Query utility functions return correct data for listing, detail, comparison, and search use cases
  4. Denormalized price fields (minPricePerServing, maxPricePerServing) are populated and queryable for filter operations
**Plans:** 3/3 plans complete
Plans:
- [x] 10-01-PLAN.md -- Schema enhancements (integer cents, secondaryCategory, denormalized fields), deploy to Neon, install deps, format utilities
- [x] 10-02-PLAN.md -- Seed script with 18 real food box providers, plans, dietary tags, FAQs, reviews, denormalized price recalculation
- [x] 10-03-PLAN.md -- Centralized query layer (src/lib/queries.ts) with React.cache() wrapped functions for all page types

### Phase 20: Design System & Layout
**Goal**: Every subsequent page can be built with consistent, responsive components inside a complete layout shell
**Depends on**: Phase 10 (layout needs provider data for nav/counts)
**Requirements**: DS-01, DS-02, DS-03
**Success Criteria** (what must be TRUE):
  1. A branded Tailwind theme with defined colors, typography scale, and spacing tokens is applied site-wide
  2. The root layout renders a responsive header (logo, navigation, mobile hamburger) and footer from 375px through 1440px
  3. Base components (Button, Card, Badge, Input, Select, Rating stars, loading skeletons) render correctly and are importable from `src/components/`
**Plans:** 3/3 plans complete
Plans:
- [x] 20-01-PLAN.md -- Tailwind CSS 4 theme tokens (brand colors, shadows, radii), category mapping utility, dark mode cleanup
- [x] 20-02-PLAN.md -- Responsive layout shell (Header, MobileNav, Footer) and root layout refactor
- [x] 20-03-PLAN.md -- Base component library (Button, Card, Badge, Input, Select, RatingStars, Skeleton)

### Phase 30: Homepage
**Goal**: A visitor landing on the site immediately understands the value proposition and can navigate to any category or featured provider
**Depends on**: Phase 20 (needs layout shell and base components)
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05
**Success Criteria** (what must be TRUE):
  1. The homepage displays a hero section with headline, subheadline, search bar, and category quick links
  2. Featured providers render with real database data (horizontal scroll on mobile, grid on desktop)
  3. All 5 category cards display with icons, descriptions, and accurate provider counts
  4. "How it works" section and social proof / testimonials section are visible
  5. Page includes WebSite and Organization JSON-LD structured data and SEO metadata
**Plans**: TBD

### Phase 40: Category Browsing
**Goal**: A visitor can browse providers within any category using filters and sorting, with shareable URL state
**Depends on**: Phase 20 (needs Card, Badge, Rating components), Phase 10 (needs query layer)
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, CAT-06, CAT-07
**Success Criteria** (what must be TRUE):
  1. Each of the 5 categories renders at its SEO-friendly URL (/meal-kits, /prepared-meals, etc.) with provider cards showing logo, name, rating, price range, dietary tags, and CTA
  2. The filter sidebar/drawer allows filtering by dietary tags, price range, rating, and servings -- and results update accordingly
  3. Sort options (rating, price, most reviewed, newest) reorder the listing correctly
  4. All filter and sort state is reflected in URL search params -- copying the URL and opening it in a new tab reproduces the exact same filtered view
  5. Pagination works and category pages include ItemList JSON-LD and category-specific metadata
**Plans**: TBD

### Phase 50: Provider Detail
**Goal**: A visitor can evaluate any provider thoroughly -- plans, pricing, reviews, FAQs -- on a single comprehensive page
**Depends on**: Phase 40 (provider cards link to detail), Phase 10 (needs query layer)
**Requirements**: PROV-01, PROV-02, PROV-03, PROV-04, PROV-05, PROV-06, PROV-07, PROV-08, PROV-09
**Success Criteria** (what must be TRUE):
  1. Every provider renders at /providers/[slug] with all data fields (logo, name, description, rating, category, dietary tags)
  2. The plans and pricing table displays all plan tiers with per-serving prices for comparison
  3. Pros/cons list, user reviews with rating breakdown chart, and FAQ accordion all render with seeded data
  4. Related providers section shows relevant alternatives from the same category
  5. Page includes breadcrumb navigation, dynamic metadata, and Product/Review/FAQ/BreadcrumbList JSON-LD structured data
**Plans**: TBD

### Phase 60: Comparison Engine
**Goal**: A visitor can select 2-4 providers and compare them side by side with a persistent, shareable comparison
**Depends on**: Phase 50 (needs provider detail data), Phase 40 (needs provider cards for "add to compare")
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06
**Success Criteria** (what must be TRUE):
  1. The comparison page at /compare?providers=slug1,slug2 renders a side-by-side table comparing 2-4 providers across name, rating, price, dietary tags, shipping, and features
  2. "Add to compare" buttons on provider cards and detail pages add providers to the comparison selection
  3. A sticky comparison bar floats at the bottom of the screen when providers are selected, showing count and a "Compare" CTA
  4. Comparison selection persists across page navigations (visiting different pages does not clear the selection)
  5. SEO comparison pages at /compare/[slug-vs-slug] render pre-built content for top provider pairs
**Plans**: TBD

### Phase 70: Collections & Blog
**Goal**: The site has editorial content pages that drive organic traffic and establish topical authority
**Depends on**: Phase 10 (needs seed data for collections and posts), Phase 20 (needs layout and components)
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06
**Success Criteria** (what must be TRUE):
  1. "Best of" collection pages at /best/[slug] display ranked provider lists with editorial notes and ItemList JSON-LD
  2. Blog index at /blog shows a paginated post list with a featured post hero section
  3. Individual blog posts at /blog/[slug] render markdown content with a table of contents and Article JSON-LD
  4. Seed data includes 5-8 collections and 3-5 blog posts that render correctly
**Plans**: TBD

### Phase 80: Search
**Goal**: A visitor can find any provider, blog post, or collection by typing a query into the site search
**Depends on**: Phase 10 (needs database with searchable content), Phase 20 (needs header component for search bar)
**Requirements**: SRCH-01, SRCH-02, SRCH-03, SRCH-04
**Success Criteria** (what must be TRUE):
  1. A full-text search API returns relevant results across providers, blog posts, and collections
  2. The search results page at /search?q=... displays results grouped by type (Providers, Blog Posts, Collections)
  3. The search bar is accessible from the header on every page (expandable on mobile)
  4. A "no results" state shows category suggestions to help the visitor continue browsing
**Plans**: TBD

### Phase 90: Review System
**Goal**: Visitors can submit reviews for providers, with reviews held for admin moderation before publishing
**Depends on**: Phase 50 (review form lives on provider detail page), Phase 10 (needs review model and queries)
**Requirements**: REV-01, REV-02, REV-03, REV-04, REV-05
**Success Criteria** (what must be TRUE):
  1. A review submission form on the provider detail page accepts star rating, title, body, name, and email
  2. Submitting a review via Server Action validates all fields and stores the review with PENDING status
  3. The provider's averageRating is recalculated when a review is approved (not on submission)
  4. Basic rate limiting prevents the same visitor from submitting multiple reviews in rapid succession
**Plans**: TBD

### Phase 100: Admin Dashboard
**Goal**: An admin can manage all site content -- providers, reviews, blog posts, and collections -- through a protected internal interface
**Depends on**: Phase 90 (review moderation needs reviews), Phase 70 (blog/collection CRUD needs content models)
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-06, ADM-07
**Success Criteria** (what must be TRUE):
  1. The admin layout at /admin is protected by proxy.ts using ADMIN_SECRET env var -- unauthenticated visitors cannot access any admin page
  2. The dashboard displays accurate stats: provider count, review count, pending reviews, and affiliate clicks
  3. An admin can create, edit, and delete providers with all fields including plans, FAQs, and dietary tags
  4. An admin can view pending reviews and approve or reject them, with the provider's averageRating updating on approval
  5. An admin can create, edit, and publish blog posts (with markdown editor) and collections (with provider picker and sorting)
**Plans**: TBD

### Phase 110: SEO & Performance
**Goal**: The site is fully optimized for search engine crawling, indexing, and Core Web Vitals performance
**Depends on**: All consumer-facing phases (10-90) -- this phase audits and optimizes existing pages
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07
**Success Criteria** (what must be TRUE):
  1. A dynamic sitemap.xml includes all providers, categories, collections, and blog post URLs
  2. robots.txt serves appropriate crawl rules and every page has a canonical URL
  3. All public pages include Open Graph and Twitter card metadata
  4. Core Web Vitals meet targets: LCP < 2.5s, CLS < 0.1 (measured via Lighthouse)
  5. Images use Next.js Image component with remotePatterns configured and proper sizes/priority attributes
  6. A custom 404 page displays search and category suggestions
**Plans**: TBD

### Phase 120: Affiliate & Launch Readiness
**Goal**: The site generates revenue through tracked affiliate clicks and is production-ready with no errors
**Depends on**: Phase 100 (click analytics in admin), all consumer pages (error boundaries, loading states)
**Requirements**: AFF-01, AFF-02, AFF-03, AFF-04, AFF-05, AFF-06
**Success Criteria** (what must be TRUE):
  1. An affiliate click tracking API route logs the click (provider, source page, timestamp) and redirects to the provider's affiliate URL
  2. All "Visit Provider" buttons across the site use the tracking route with source page attribution
  3. Affiliate click analytics are visible in the admin dashboard with per-provider counts
  4. Error boundaries are present on all route segments, and loading states display for all data-dependent pages
  5. `next build` succeeds without errors or warnings and the site is ready for Vercel deployment
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 10 -> 20 -> 30 -> ... -> 120
(Decimal phases, if inserted, execute between their surrounding integers.)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 10. Database & Foundation | 3/3 | Complete    | 2026-03-21 |
| 20. Design System & Layout | 3/3 | Complete   | 2026-03-21 |
| 30. Homepage | 0/? | Not started | - |
| 40. Category Browsing | 0/? | Not started | - |
| 50. Provider Detail | 0/? | Not started | - |
| 60. Comparison Engine | 0/? | Not started | - |
| 70. Collections & Blog | 0/? | Not started | - |
| 80. Search | 0/? | Not started | - |
| 90. Review System | 0/? | Not started | - |
| 100. Admin Dashboard | 0/? | Not started | - |
| 110. SEO & Performance | 0/? | Not started | - |
| 120. Affiliate & Launch Readiness | 0/? | Not started | - |
