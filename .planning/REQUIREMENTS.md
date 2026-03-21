# Requirements: FoodBoxFinder

**Defined:** 2026-03-21
**Core Value:** Consumers can quickly discover and compare food box subscriptions that match their dietary needs, budget, and preferences -- with transparent criteria and visual brand identity.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Data Foundation

- [x] **DATA-01**: Extend Provider schema with dataset fields: modelType, prepStyle, householdFit, valueTier, geography, shippingNotes, flexibility, pricingSignal, secondaryTags, affiliateSignal, sourceUrls, sourceFiles, notes
- [x] **DATA-02**: Add status enum (ACTIVE, HYBRID, UNCLEAR, DISCONTINUED) to replace boolean active field on Provider
- [x] **DATA-03**: Seed script imports all 95 providers from food-box-companies.json into database with field mapping
- [x] **DATA-04**: Seed script maps provider logo paths from manifest.json to Provider logoUrl field
- [x] **DATA-05**: Convert 5 .ico logo files to .png format before seeding (Blue Apron, Farm Fresh to You, Farmbox Delivery, Full Circle, Crowd Cow)

### Provider Logos

- [x] **LOGO-01**: Reusable ProviderLogo component renders logo from manifest path with Next.js Image optimization
- [x] **LOGO-02**: Fallback SVG placeholder shown when provider logo is missing or fails to load
- [x] **LOGO-03**: Configure next.config.ts images.remotePatterns if any external logo URLs are used
- [x] **LOGO-04**: Logos display consistently on provider cards, detail pages, and comparison headers

### Homepage

- [x] **HOME-01**: Homepage with hero section communicating the value proposition
- [x] **HOME-02**: Featured providers section showing editorially-selected providers with cards
- [x] **HOME-03**: Category cards linking to each of 5 category hub pages
- [x] **HOME-04**: Social proof / trust signals section
- [x] **HOME-05**: Homepage metadata (title, description) and WebSite + Organization JSON-LD

### Category Browsing

- [x] **CAT-01**: Category hub page for each of 5 categories with editorial intro and provider listing
- [x] **CAT-02**: Provider cards in listings showing logo, name, category badge, value tier, summary, and CTA
- [x] **CAT-03**: Category pages have metadata and ItemList JSON-LD structured data
- [x] **CAT-04**: Breadcrumb navigation on category pages with BreadcrumbList JSON-LD

### Provider Detail

- [x] **DETAIL-01**: Provider detail page at /providers/[slug] with full provider information
- [x] **DETAIL-02**: Detail page shows: logo, name, summary, pros/cons, dietary tags, prep style, value tier, flexibility, shipping info, geography
- [x] **DETAIL-03**: Plans/pricing section showing available plans with per-serving and per-box pricing
- [x] **DETAIL-04**: FAQ section on detail page rendered from ProviderFaq model
- [x] **DETAIL-05**: "Visit Site" CTA button with affiliate click tracking
- [x] **DETAIL-06**: Detail page metadata (title, description) and Product JSON-LD structured data
- [x] **DETAIL-07**: Breadcrumb navigation on detail pages

### Multi-Criteria Filtering

- [x] **FILTER-01**: Centralized filter parsing module (src/lib/filters.ts) with typed, validated filter objects and safe defaults
- [x] **FILTER-02**: Filter by category (meal kits, prepared meals, protein boxes, produce boxes, specialty)
- [x] **FILTER-03**: Filter by dietary tags (16 diet tag values)
- [x] **FILTER-04**: Filter by prep style (cook-it-yourself, prepared fresh, prepared frozen, raw, snacks)
- [x] **FILTER-05**: Filter by value tier (budget, mid, premium, luxury)
- [x] **FILTER-06**: Filter by household fit (single-serve, couples, family, freezer-stocking, gifting)
- [x] **FILTER-07**: Filter by model type (subscription-first, store-first, marketplace, gift-club, hybrid)
- [x] **FILTER-08**: Filter by geography (national-us, regional, multi-market)
- [x] **FILTER-09**: All filters composable -- URL search params encode all active filters (shareable URLs)
- [x] **FILTER-10**: Null-aware filtering -- providers with empty filter fields pass through rather than being excluded
- [x] **FILTER-11**: Sort options: featured/editorial order, rating, name A-Z, value tier
- [x] **FILTER-12**: Filter UI collapses to drawer/sheet on mobile
- [x] **FILTER-13**: noindex meta tag on filtered pages to prevent SEO duplicate content

### Search

- [x] **SEARCH-01**: Server-side search across provider names, descriptions, and categories
- [x] **SEARCH-02**: Search results page with provider cards
- [x] **SEARCH-03**: Debounced search input with expandable search bar in header

### Side-by-Side Comparison

- [x] **COMP-01**: Comparison page at /compare/[slugs] rendering 2-3 providers side-by-side
- [x] **COMP-02**: Field matrix showing all comparison axes (category, prep style, diet tags, value tier, pricing, flexibility, shipping, pros/cons)
- [x] **COMP-03**: Canonical slug ordering in comparison URLs (alphabetical) to prevent duplicate content
- [x] **COMP-04**: Comparison page hides rows where all compared providers have N/A values
- [x] **COMP-05**: Comparison page metadata and JSON-LD structured data

### Comparison Tray

- [x] **TRAY-01**: Floating comparison tray bar at bottom of viewport showing 0-3 selected providers
- [x] **TRAY-02**: "Add to Compare" button on provider cards
- [x] **TRAY-03**: "Compare Now" button navigates to comparison page with selected provider slugs in URL
- [x] **TRAY-04**: Comparison tray state managed client-side, transfers to URL params on navigation

### SEO and Content

- [x] **SEO-01**: Every public page exports metadata (title, description) via generateMetadata or static metadata
- [x] **SEO-02**: JSON-LD structured data on every public page (appropriate schema type per page)
- [x] **SEO-03**: XSS-safe JSON-LD rendering with .replace(/</g, "\\u003c") on all JSON.stringify output
- [x] **SEO-04**: Sitemap generation for all public pages
- [x] **SEO-05**: Canonical URLs on all pages to prevent duplicate content

### Collections

- [x] **COLL-01**: "Best for X" collection pages at /best/[slug] showing curated provider lists
- [x] **COLL-02**: Collection pages with editorial intro, ranked provider list with editorial notes
- [x] **COLL-03**: Collection page metadata and JSON-LD structured data

### Admin

- [x] **ADMIN-01**: Admin dashboard showing provider count, category breakdown, review stats, click stats
- [x] **ADMIN-02**: Admin CRUD for providers including new schema fields (modelType, prepStyle, valueTier, etc.)
- [x] **ADMIN-03**: Admin provider list with search, sort, and status filtering
- [x] **ADMIN-04**: On-demand revalidation from admin mutations (revalidatePath for affected pages)

### Affiliate Tracking

- [x] **AFF-01**: Affiliate click tracking on all outbound provider links (record to AffiliateClick model)
- [x] **AFF-02**: Click tracking captures: providerId, source page, referrer, hashed IP for dedup

### Error Handling and UX

- [ ] **UX-01**: error.tsx error boundaries on all route segments
- [ ] **UX-02**: not-found.tsx custom 404 pages with search and category suggestions
- [ ] **UX-03**: loading.tsx streaming loading states with skeleton components
- [ ] **UX-04**: Mobile-responsive design across all pages
- [ ] **UX-05**: Sticky header with navigation and search

### Query Layer

- [x] **QUERY-01**: Centralized query layer in src/lib/queries.ts with React.cache() wrapped functions
- [x] **QUERY-02**: Query functions for: listings with filters, provider detail by slug, comparison by slugs, search, admin stats, featured providers, category counts
- [x] **QUERY-03**: Split queries.ts if exceeding 300 lines

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### User Reviews

- **REV-01**: Review submission form with star rating, pros/cons text, and anonymous identity
- **REV-02**: Review moderation workflow (pending/approved/rejected)
- **REV-03**: Aggregate rating display on provider cards and detail pages

### Blog

- **BLOG-01**: Blog listing page with published posts
- **BLOG-02**: Blog post detail page with markdown/HTML rendering
- **BLOG-03**: Blog post admin CRUD

### Advanced Features

- **ADV-01**: Recommendation quiz/wizard for guided discovery
- **ADV-02**: Price alert notifications
- **ADV-03**: Provider self-service portal

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts / authentication | No personalization needed; admin uses ADMIN_SECRET |
| Live price scraping | Maintenance burden, accuracy risk, anti-scraping measures |
| Coupon/deal aggregation | Race to bottom, cheapens brand, attracts low-quality traffic |
| Dark mode polish | Styling complexity doubles, deprioritized for launch |
| Infinite scroll | Hurts SEO, complicates sharing, 95 providers fits single page |
| Social features (favorites, wishlists) | Requires user identity, low engagement on comparison sites |
| Notification/alert system | Requires real-time infrastructure, premature |
| WYSIWYG blog editor | Engineering effort for low initial ROI |
| Provider self-service portal | Requires auth, permissions, moderation -- premature at 95 providers |
| Price comparison charts/graphs | Implies precision that manually-updated data cannot deliver |
| Real-time chat/support | Not relevant for discovery product |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| DATA-04 | Phase 1 | Complete |
| DATA-05 | Phase 1 | Complete |
| LOGO-01 | Phase 3 | Complete |
| LOGO-02 | Phase 3 | Complete |
| LOGO-03 | Phase 3 | Complete |
| LOGO-04 | Phase 3 | Complete |
| HOME-01 | Phase 6 | Complete |
| HOME-02 | Phase 6 | Complete |
| HOME-03 | Phase 6 | Complete |
| HOME-04 | Phase 6 | Complete |
| HOME-05 | Phase 6 | Complete |
| CAT-01 | Phase 5 | Complete |
| CAT-02 | Phase 5 | Complete |
| CAT-03 | Phase 5 | Complete |
| CAT-04 | Phase 5 | Complete |
| DETAIL-01 | Phase 4 | Complete |
| DETAIL-02 | Phase 4 | Complete |
| DETAIL-03 | Phase 4 | Complete |
| DETAIL-04 | Phase 4 | Complete |
| DETAIL-05 | Phase 4 | Complete |
| DETAIL-06 | Phase 4 | Complete |
| DETAIL-07 | Phase 4 | Complete |
| FILTER-01 | Phase 2 | Complete |
| FILTER-02 | Phase 5 | Complete |
| FILTER-03 | Phase 5 | Complete |
| FILTER-04 | Phase 5 | Complete |
| FILTER-05 | Phase 5 | Complete |
| FILTER-06 | Phase 5 | Complete |
| FILTER-07 | Phase 5 | Complete |
| FILTER-08 | Phase 5 | Complete |
| FILTER-09 | Phase 5 | Complete |
| FILTER-10 | Phase 5 | Complete |
| FILTER-11 | Phase 5 | Complete |
| FILTER-12 | Phase 5 | Complete |
| FILTER-13 | Phase 5 | Complete |
| SEARCH-01 | Phase 8 | Complete |
| SEARCH-02 | Phase 8 | Complete |
| SEARCH-03 | Phase 8 | Complete |
| COMP-01 | Phase 7 | Complete |
| COMP-02 | Phase 7 | Complete |
| COMP-03 | Phase 7 | Complete |
| COMP-04 | Phase 7 | Complete |
| COMP-05 | Phase 7 | Complete |
| TRAY-01 | Phase 7 | Complete |
| TRAY-02 | Phase 7 | Complete |
| TRAY-03 | Phase 7 | Complete |
| TRAY-04 | Phase 7 | Complete |
| SEO-01 | Phase 9 | Complete |
| SEO-02 | Phase 9 | Complete |
| SEO-03 | Phase 9 | Complete |
| SEO-04 | Phase 9 | Complete |
| SEO-05 | Phase 9 | Complete |
| COLL-01 | Phase 9 | Complete |
| COLL-02 | Phase 9 | Complete |
| COLL-03 | Phase 9 | Complete |
| ADMIN-01 | Phase 10 | Complete |
| ADMIN-02 | Phase 10 | Complete |
| ADMIN-03 | Phase 10 | Complete |
| ADMIN-04 | Phase 10 | Complete |
| AFF-01 | Phase 4 | Complete |
| AFF-02 | Phase 4 | Complete |
| UX-01 | Phase 11 | Pending |
| UX-02 | Phase 11 | Pending |
| UX-03 | Phase 11 | Pending |
| UX-04 | Phase 11 | Pending |
| UX-05 | Phase 11 | Pending |
| QUERY-01 | Phase 2 | Complete |
| QUERY-02 | Phase 2 | Complete |
| QUERY-03 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 72 total
- Mapped to phases: 72
- Unmapped: 0

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 after roadmap creation*
