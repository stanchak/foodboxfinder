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
- [x] **Phase 11: UX Polish** - Error boundaries, 404 pages, loading states, mobile responsiveness, and sticky header (completed 2026-03-22)

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
**Plans:** 1/1 plans complete

Plans:
- [x] 11-01-PLAN.md -- Create 5 missing loading.tsx skeleton files (compare, compare/[versus], best, blog, methodology) and verify all UX requirements

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
| 10. Admin | 2/2 | Complete    | 2026-03-21 |
| 11. UX Polish | 1/1 | Complete    | 2026-03-22 |

### Phase 12: Critical Design & Accessibility Fixes

**Goal:** All P0 design and accessibility issues from UX/UI/A11y agent reviews are fixed -- skip navigation, focus traps, keyboard accessibility, visual consistency, and comparison flow from listing pages
**Requirements**: P0-SKIP-NAV, P0-FOCUS-VISIBLE, P0-LOGO-CONTRAST, P0-ICON-CONSISTENCY, P0-SECTION-NAV, P0-COMPARE-PADDING, P0-MOBILE-SEARCH, P0-MOBILENAV-FOCUS-TRAP, P0-FILTERS-FOCUS-TRAP, P0-COMPARE-BUTTON, P0-STRETCHED-LINK
**Depends on:** Phase 11
**Success Criteria** (what must be TRUE):
  1. Keyboard users can skip to main content via a visible skip link
  2. All interactive elements show a visible :focus-visible ring
  3. MobileNav and CategoryFilters drawers trap focus, close on Escape, and return focus on close
  4. ProviderCard uses stretched-link pattern with a working AddToCompareButton
  5. Check/X icons use consistent colors across ComparisonTable and PricingTable
  6. Provider detail section nav does not overlap the sticky header
  7. Page content is not hidden behind CompareBar
  8. Search is accessible on mobile viewports
**Plans:** 3/3 plans complete

Plans:
- [x] 12-01-PLAN.md -- Skip nav, focus-visible baseline, ProviderLogo contrast, icon standardization, section nav z-index, CompareBar padding, mobile search visibility
- [x] 12-02-PLAN.md -- MobileNav and CategoryFilters focus traps, Escape handlers, focus return, ARIA attributes
- [x] 12-03-PLAN.md -- AddToCompareButton component and ProviderCard stretched-link refactor

### Phase 13: Design Polish & UX Improvements

**Goal:** All P1/P2 design, accessibility, and UX issues from UX Architect, UI Designer, and Accessibility Auditor reviews are fixed -- radio inputs for single-select filters, collapsible filter groups, table semantics, visual hierarchy, ARIA attributes, screen reader text, and visual polish
**Requirements**: P1-RADIO-INPUTS, P1-COLLAPSIBLE-FILTERS, P1-FILTERS-FOCUS-VISIBLE, P1-HEADER-NAV-LINKS, P1-SEMANTIC-TOKENS, P2-HEADER-ARIA-LABEL, P1-TH-SCOPE-ROW, P1-CTA-ROW-BG, P1-VIEW-DETAILS-LINK, P1-COMPARE-BAR-LIVE, P1-PRICING-SR-ONLY, P2-VIEW-DETAILS-ARIA, P2-FAQ-TRANSITION, P1-COMPAREBAR-ARIA-LIVE, P1-COMPAREBAR-CLEAR-LABEL, P1-RATINGSTARS-ARIA-HIDDEN, P1-PROVIDERLOGO-A11Y, P1-PRICE-EMPHASIS, P1-FREE-SHIPPING-BADGE, P2-AFFILIATELINK-NEW-TAB, P2-PAGINATION-ARIA-DISABLED, P2-REVIEW-COUNT-STYLE, P2-LOGO-AREA-HEIGHT, P2-SCROLL-INDICATOR
**Depends on:** Phase 12
**Success Criteria** (what must be TRUE):
  1. Single-select filter groups use radio inputs instead of checkboxes
  2. Filter groups are collapsible/expandable to reduce visual clutter
  3. Desktop header shows Compare, Best Of, Blog links
  4. ComparisonTable row labels use th with scope="row"
  5. CompareBar has aria-live region and descriptive Clear label
  6. ProviderCard has emphasized pricing, reduced logo area, and Badge-based Free Shipping
  7. All components have proper ARIA attributes and sr-only text where needed
  8. Semantic color tokens (success/error/warning) exist in CSS
**Plans:** 4/4 plans complete

Plans:
- [x] 13-01-PLAN.md -- CategoryFilters radio inputs, collapsible groups, focus-visible buttons; Header nav links and aria-label; semantic color tokens
- [x] 13-02-PLAN.md -- ComparisonTable th scope=row, CTA background, View Details text link with aria-labels; PricingTable sr-only boolean text
- [x] 13-03-PLAN.md -- ProviderCard visual fixes, ProviderLogo accessibility, RatingStars aria-hidden; CompareBar aria-live, AffiliateLink sr-only, FaqAccordion cleanup, Pagination fix
- [x] 13-04-PLAN.md -- Homepage scroll indicator gradient for mobile featured providers

### Phase 14: Visual Rebrand - Design System Foundation

**Goal:** Replace the entire design token system (colors, shadows, radii) with the new brand identity (deep teal primary, warm amber accent, warm neutrals) and swap typography from Geist Sans to Inter + Source Serif 4, then update Badge and Button foundation components to the new design language
**Requirements**: REBRAND-TOKENS, REBRAND-FONTS, REBRAND-BADGE, REBRAND-BUTTON
**Depends on:** Phase 13
**Success Criteria** (what must be TRUE):
  1. All color tokens use the new oklch values from BRAND_BRIEF.md (teal primary hue ~190, amber accent hue ~48-80, warm neutral hue ~40-80)
  2. Page background is warm off-white (oklch 0.985 0.004 80) instead of pure white
  3. Inter is the primary sans font, Source Serif 4 is available as serif, Geist Mono remains for monospace
  4. Shadows use warm oklch tinting instead of rgb black
  5. Badge has 6 differentiated variants with distinct shapes per badge type
  6. Button has press feedback (active:scale), shadow states, and font-semibold
  7. The build succeeds without errors
**Plans:** 2/2 plans complete

Plans:
- [x] 14-01-PLAN.md -- Replace all design tokens in globals.css (colors, shadows, radii, root vars) and swap fonts in layout.tsx to Inter + Source Serif 4 + Geist Mono
- [x] 14-02-PLAN.md -- Update Badge.tsx with 6 differentiated variants and new typography; update Button.tsx with press feedback, shadows, and refined styling

### Phase 15: Visual Rebrand - Component Restyling

**Goal:** Restyle all 15 shared components to the new brand design language -- frosted glass chrome, elevated cards with hover lift, warm alternating table rows, pill search, dark footer, and consistent use of the new oklch color tokens
**Requirements**: REBRAND-HEADER, REBRAND-FOOTER, REBRAND-MOBILENAV, REBRAND-PROVIDERCARD, REBRAND-PROVIDERLOGO, REBRAND-BREADCRUMBS, REBRAND-COMPARISONTABLE, REBRAND-PRICINGTABLE, REBRAND-COMPAREBAR, REBRAND-CATEGORYFILTERS, REBRAND-HEADERSEARCHFORM, REBRAND-FAQACCORDION, REBRAND-REVIEWCARD, REBRAND-RATINGBREAKDOWN, REBRAND-AFFILIATELINK
**Depends on:** Phase 14
**Plans:** 2/5 plans executed

Plans:
- [ ] 15-01-PLAN.md -- Restyle Header (frosted glass, font-extrabold logo), Footer (dark bg-gray-900, uppercase headings), MobileNav (wider drawer, neutral hover)
- [ ] 15-02-PLAN.md -- Restyle ProviderCard (rounded-2xl, hover lift, gradient logo area, bold pricing), ProviderLogo (rounded-2xl, shadow-xs), Breadcrumbs (text-xs text-gray-400)
- [x] 15-03-PLAN.md -- Restyle ComparisonTable (rounded-2xl, p-6 headers, warm rows), PricingTable (featured scale, text-4xl prices), CompareBar (frosted glass, dark chips, accent button)
- [ ] 15-04-PLAN.md -- Restyle CategoryFilters (card container, divide-y groups, active chips), HeaderSearchForm (pill shape, focus expand)
- [x] 15-05-PLAN.md -- Restyle FaqAccordion (rounded-xl container, hover:bg-gray-50), ReviewCard (py-8, neutral avatar), RatingBreakdown (h-2 bars, font-extrabold), AffiliateLink (rounded-xl, hover lift)

### Phase 16: Visual Rebrand - Page Restyling

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 15
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 16 to break down)
