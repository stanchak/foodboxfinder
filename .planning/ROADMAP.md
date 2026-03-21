# Roadmap: FoodBoxFinder

## Overview

This milestone extends FoodBoxFinder from a scaffolded v1.0 into a fully populated discovery and comparison platform. The arc follows strict data dependencies: seed 95 providers into an extended schema, build the query and filter infrastructure those providers need, add visual identity with logos, then construct the consumer-facing pages from deepest (detail) to broadest (homepage). Comparison, search, collections, and SEO polish layer on top. Admin tooling and UX hardening close the milestone.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Data Foundation** - Extend schema with new enum fields and seed 95 providers from research dataset
- [ ] **Phase 2: Query Layer and Filter Infrastructure** - Centralized query functions with React.cache() and type-safe filter parsing module
- [x] **Phase 3: Provider Logos** - Reusable logo component with fallback behavior and consistent rendering across surfaces (completed 2026-03-21)
- [ ] **Phase 4: Provider Detail Pages** - Full provider detail pages with plans, FAQ, affiliate tracking, and SEO metadata
- [ ] **Phase 5: Category Browsing and Filtering** - Category hub pages with multi-criteria filtering across 9 dimensions and mobile filter drawer
- [ ] **Phase 6: Homepage** - Hero section, featured providers, category cards, social proof, and site-level SEO
- [ ] **Phase 7: Side-by-Side Comparison** - Comparison page with field matrix, floating tray, and shareable canonical URLs
- [ ] **Phase 8: Search** - Server-side provider search with results page and debounced search bar
- [ ] **Phase 9: SEO and Collections** - Cross-site SEO verification, sitemap, canonical URLs, and curated "Best for X" collection pages
- [x] **Phase 10: Admin** - Admin dashboard with stats, provider CRUD for new fields, and on-demand revalidation (completed 2026-03-21)
- [ ] **Phase 11: UX Polish** - Error boundaries, 404 pages, loading states, mobile responsiveness, and sticky header

## Phase Details

### Phase 1: Data Foundation
**Goal**: 95 providers exist in the database with all extended fields, logo paths, and correct status values
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Success Criteria** (what must be TRUE):
  1. Running the seed script populates 95 providers in the database with all new enum fields mapped from the research dataset
  2. Each provider has a logoUrl field populated from the manifest (or null for missing logos)
  3. The 5 .ico logo files have been converted to .png and render correctly
  4. Provider status field uses the new enum (ACTIVE, HYBRID, UNCLEAR, DISCONTINUED) instead of a boolean
  5. Running `npx prisma db push` succeeds with the extended schema against Neon
**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md -- Extend Prisma schema with ProviderStatus/ValueTier enums and 13 new fields; convert 5 .ico logos to .png and update manifest
- [x] 01-02-PLAN.md -- Update seed script to import 95 providers with merge strategy; migrate codebase from Provider.active to Provider.status

### Phase 2: Query Layer and Filter Infrastructure
**Goal**: All database access flows through cached, typed query functions and a centralized filter parser handles all URL search param dimensions
**Depends on**: Phase 1
**Requirements**: QUERY-01, QUERY-02, QUERY-03, FILTER-01
**Success Criteria** (what must be TRUE):
  1. A centralized queries module exports React.cache()-wrapped functions for listings, detail, comparison, search, admin stats, featured providers, and category counts
  2. The filter parsing module (src/lib/filters.ts) accepts raw URL search params and returns a typed, validated filter object with safe defaults for all 9 filter dimensions
  3. Invalid or malicious filter values silently fall back to defaults without errors
  4. The queries module is split into logical files if it exceeds 300 lines
**Plans:** 2 plans

Plans:
- [x] 02-01-PLAN.md -- Create filter parsing module (src/lib/filters.ts) with typed ProviderFilters, known value groups, and parseProviderFilters; split queries.ts into domain files (providers, content, admin) with barrel re-export
- [x] 02-02-PLAN.md -- Add getFilteredProviders query with 9-dimension null-aware filtering using ProviderFilters type and Prisma AND composition

### Phase 3: Provider Logos
**Goal**: Provider logos render consistently with appropriate fallbacks everywhere a provider is displayed
**Depends on**: Phase 1
**Requirements**: LOGO-01, LOGO-02, LOGO-03, LOGO-04
**Success Criteria** (what must be TRUE):
  1. A reusable ProviderLogo component renders logos using Next.js Image optimization with size variants (sm/md/lg)
  2. Providers without logos display a styled fallback SVG placeholder
  3. Logos render consistently on provider cards, detail pages, and comparison headers
  4. next.config.ts includes images.remotePatterns configuration if any external logo URLs are used
**Plans:** 1/1 plans complete

Plans:
- [x] 03-01-PLAN.md -- Create ProviderLogo component with sm/md/lg size variants and first-initial fallback; replace inline logo rendering in ProviderCard, ComparisonTable, and provider detail page

### Phase 4: Provider Detail Pages
**Goal**: Users can view complete information about any provider and click through to the provider's website with tracking
**Depends on**: Phase 2, Phase 3
**Requirements**: DETAIL-01, DETAIL-02, DETAIL-03, DETAIL-04, DETAIL-05, DETAIL-06, DETAIL-07, AFF-01, AFF-02
**Success Criteria** (what must be TRUE):
  1. Navigating to /providers/[slug] shows the provider's logo, name, summary, pros/cons, dietary tags, prep style, value tier, flexibility, shipping info, and geography
  2. Available plans display with per-serving and per-box pricing in a clear layout
  3. FAQ section renders from ProviderFaq records when present
  4. Clicking "Visit Site" records an affiliate click (providerId, source, referrer, hashed IP) and opens the provider's website
  5. The page has correct metadata (title, description) and Product JSON-LD structured data with breadcrumbs
**Plans:** 1 plan

Plans:
- [x] 04-01-PLAN.md -- Add new provider field sections (prepStyle, valueTier, householdFit, modelType, geography, flexibility, shippingNotes, status badge) and fix JSON-LD XSS safety on detail page and Breadcrumbs

### Phase 5: Category Browsing and Filtering
**Goal**: Users can browse providers by category and narrow results using composable multi-criteria filters with shareable URLs
**Depends on**: Phase 2, Phase 3, Phase 4
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04, FILTER-02, FILTER-03, FILTER-04, FILTER-05, FILTER-06, FILTER-07, FILTER-08, FILTER-09, FILTER-10, FILTER-11, FILTER-12, FILTER-13
**Success Criteria** (what must be TRUE):
  1. Each of the 5 category hub pages shows an editorial intro and a listing of providers in that category with logo, name, category badge, value tier, summary, and CTA
  2. Users can filter by any combination of category, dietary tags, prep style, value tier, household fit, model type, and geography -- all encoded in URL search params
  3. Providers with null/unknown values for a filter field pass through (are not excluded) when that filter is active
  4. Sort options (featured, rating, name A-Z, value tier) change provider ordering
  5. The filter UI collapses to a drawer/sheet on mobile screens
  6. Filtered pages include a noindex meta tag to prevent SEO duplicate content
  7. Category pages have correct metadata and ItemList + BreadcrumbList JSON-LD
**Plans:** 2 plans

Plans:
- [x] 05-01-PLAN.md -- Rewrite CategoryFilters with all 9 filter dimensions, active filter chips, mobile drawer, and updated sort options
- [x] 05-02-PLAN.md -- Rewrite category page to use getFilteredProviders, add editorial intros, breadcrumbs, noindex, XSS-safe JSON-LD, and value tier on ProviderCard

### Phase 6: Homepage
**Goal**: Users landing on the site immediately understand its purpose and can navigate to category pages or featured providers
**Depends on**: Phase 4, Phase 5
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05
**Success Criteria** (what must be TRUE):
  1. The homepage hero section clearly communicates what FoodBoxFinder does and who it is for
  2. Featured providers section shows editorially-selected provider cards that link to detail pages
  3. Category cards for all 5 categories link to their respective hub pages
  4. A social proof / trust signals section establishes credibility
  5. The page has title/description metadata and WebSite + Organization JSON-LD
**Plans:** 1 plan

Plans:
- [x] 06-01-PLAN.md -- Fix XSS-unsafe JSON-LD and misleading social proof stats; verify homepage renders correctly with seeded data

### Phase 7: Side-by-Side Comparison
**Goal**: Users can select 2-3 providers and compare them side-by-side with all relevant attributes in a shareable URL
**Depends on**: Phase 4
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, TRAY-01, TRAY-02, TRAY-03, TRAY-04
**Success Criteria** (what must be TRUE):
  1. The comparison page at /compare/[slugs] renders 2-3 providers in a field matrix showing category, prep style, diet tags, value tier, pricing, flexibility, shipping, and pros/cons
  2. Comparison URLs use alphabetically-sorted slugs to prevent duplicate content
  3. Rows where all compared providers have N/A values are hidden automatically
  4. A floating comparison tray at the bottom of the viewport lets users add/remove providers (max 3) and navigate to the comparison page
  5. The comparison page has appropriate metadata and JSON-LD structured data
**Plans:** 1 plan

Plans:
- [x] 07-01-PLAN.md -- Expand comparison query with new fields, add N/A row hiding to ComparisonTable, enforce canonical slug ordering via redirect, fix JSON-LD XSS safety

### Phase 8: Search
**Goal**: Users can find providers by typing a query and see matching results
**Depends on**: Phase 2
**Requirements**: SEARCH-01, SEARCH-02, SEARCH-03
**Success Criteria** (what must be TRUE):
  1. Server-side search matches against provider names, descriptions, and categories
  2. A search results page displays matching providers as provider cards
  3. A debounced, expandable search bar in the site header lets users initiate searches from any page
**Plans:** 1 plan

Plans:
- [x] 08-01-PLAN.md -- Expand searchProviders query with category label and shortDescription matching; fix search page JSON-LD XSS safety

### Phase 9: SEO and Collections
**Goal**: Every public page has verified SEO metadata, the site has a sitemap, and curated "Best for X" collection pages provide editorial value
**Depends on**: Phase 4, Phase 5, Phase 6, Phase 7, Phase 8
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, COLL-01, COLL-02, COLL-03
**Success Criteria** (what must be TRUE):
  1. Every public page exports metadata (title, description) and includes appropriate JSON-LD structured data
  2. All JSON-LD output uses XSS-safe rendering with < character escaping
  3. A generated sitemap includes all public pages (providers, categories, collections, homepage)
  4. Canonical URLs are set on all pages to prevent duplicate content
  5. "Best for X" collection pages at /best/[slug] show curated, ranked provider lists with editorial notes
**Plans:** 2 plans

Plans:
- [x] 09-01-PLAN.md -- Fix XSS-safe JSON-LD on 5 remaining pages and add canonical URLs to all indexable public pages
- [x] 09-02-PLAN.md -- Verify collection pages work end-to-end (detail, index, seed data, sitemap)

### Phase 10: Admin
**Goal**: Site operators can manage providers (including all new fields), view site statistics, and trigger page revalidation
**Depends on**: Phase 1
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04
**Success Criteria** (what must be TRUE):
  1. The admin dashboard shows provider count, category breakdown, review stats, and affiliate click stats
  2. Admins can create, read, update, and delete providers with all schema fields (including modelType, prepStyle, valueTier, householdFit, geography, flexibility)
  3. The admin provider list supports search, sort, and status filtering
  4. Saving a provider in admin triggers revalidation of the affected public pages
**Plans:** 2/2 plans complete

Plans:
- [x] 10-01-PLAN.md -- Add 8 dataset fields to ProviderForm and server actions; improve revalidation to cover category pages
- [x] 10-02-PLAN.md -- Add category breakdown to dashboard; add sort and granular status filter to provider list

### Phase 11: UX Polish
**Goal**: The site handles errors gracefully, loads smoothly, and works well on all screen sizes with consistent navigation
**Depends on**: Phase 4, Phase 5, Phase 6
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05
**Success Criteria** (what must be TRUE):
  1. Every route segment has an error.tsx boundary that displays a recovery UI instead of a blank screen
  2. Custom not-found pages show search and category suggestions instead of a generic 404
  3. Loading states with skeleton components appear during page transitions
  4. All pages render correctly on mobile, tablet, and desktop breakpoints
  5. A sticky header with navigation links and search is visible on all pages
**Plans**: TBD

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11
Note: Phase 3 and Phase 10 can run in parallel with their neighbors (3 depends only on 1; 10 depends only on 1).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Foundation | 0/2 | Not started | - |
| 2. Query Layer and Filter Infrastructure | 0/2 | Not started | - |
| 3. Provider Logos | 1/1 | Complete   | 2026-03-21 |
| 4. Provider Detail Pages | 0/1 | Not started | - |
| 5. Category Browsing and Filtering | 0/2 | Not started | - |
| 6. Homepage | 0/1 | Not started | - |
| 7. Side-by-Side Comparison | 0/1 | Not started | - |
| 8. Search | 0/1 | Not started | - |
| 9. SEO and Collections | 0/2 | Not started | - |
| 10. Admin | 2/2 | Complete   | 2026-03-21 |
| 11. UX Polish | 0/2 | Not started | - |
