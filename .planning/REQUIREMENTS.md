# Requirements: FoodBoxFinder

**Defined:** 2026-03-21
**Core Value:** Consumers can quickly discover and compare food box subscriptions that match their dietary needs, budget, and preferences — with transparent criteria and visual brand identity.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Data Foundation

- [ ] **DATA-01**: Extend Provider schema with dataset fields: modelType, prepStyle, householdFit, valueTier, geography, shippingNotes, flexibility, pricingSignal, secondaryTags, affiliateSignal, sourceUrls, sourceFiles, notes
- [ ] **DATA-02**: Add status enum (ACTIVE, HYBRID, UNCLEAR, DISCONTINUED) to replace boolean active field on Provider
- [ ] **DATA-03**: Seed script imports all 95 providers from food-box-companies.json into database with field mapping
- [ ] **DATA-04**: Seed script maps provider logo paths from manifest.json to Provider logoUrl field
- [ ] **DATA-05**: Convert 5 .ico logo files to .png format before seeding (Blue Apron, Farm Fresh to You, Farmbox Delivery, Full Circle, Crowd Cow)

### Provider Logos

- [ ] **LOGO-01**: Reusable ProviderLogo component renders logo from manifest path with Next.js Image optimization
- [ ] **LOGO-02**: Fallback SVG placeholder shown when provider logo is missing or fails to load
- [ ] **LOGO-03**: Configure next.config.ts images.remotePatterns if any external logo URLs are used
- [ ] **LOGO-04**: Logos display consistently on provider cards, detail pages, and comparison headers

### Homepage

- [ ] **HOME-01**: Homepage with hero section communicating the value proposition
- [ ] **HOME-02**: Featured providers section showing editorially-selected providers with cards
- [ ] **HOME-03**: Category cards linking to each of 5 category hub pages
- [ ] **HOME-04**: Social proof / trust signals section
- [ ] **HOME-05**: Homepage metadata (title, description) and WebSite + Organization JSON-LD

### Category Browsing

- [ ] **CAT-01**: Category hub page for each of 5 categories with editorial intro and provider listing
- [ ] **CAT-02**: Provider cards in listings showing logo, name, category badge, value tier, summary, and CTA
- [ ] **CAT-03**: Category pages have metadata and ItemList JSON-LD structured data
- [ ] **CAT-04**: Breadcrumb navigation on category pages with BreadcrumbList JSON-LD

### Provider Detail

- [ ] **DETAIL-01**: Provider detail page at /providers/[slug] with full provider information
- [ ] **DETAIL-02**: Detail page shows: logo, name, summary, pros/cons, dietary tags, prep style, value tier, flexibility, shipping info, geography
- [ ] **DETAIL-03**: Plans/pricing section showing available plans with per-serving and per-box pricing
- [ ] **DETAIL-04**: FAQ section on detail page rendered from ProviderFaq model
- [ ] **DETAIL-05**: "Visit Site" CTA button with affiliate click tracking
- [ ] **DETAIL-06**: Detail page metadata (title, description) and Product JSON-LD structured data
- [ ] **DETAIL-07**: Breadcrumb navigation on detail pages

### Multi-Criteria Filtering

- [ ] **FILTER-01**: Centralized filter parsing module (src/lib/filters.ts) with typed, validated filter objects and safe defaults
- [ ] **FILTER-02**: Filter by category (meal kits, prepared meals, protein boxes, produce boxes, specialty)
- [ ] **FILTER-03**: Filter by dietary tags (16 diet tag values)
- [ ] **FILTER-04**: Filter by prep style (cook-it-yourself, prepared fresh, prepared frozen, raw, snacks)
- [ ] **FILTER-05**: Filter by value tier (budget, mid, premium, luxury)
- [ ] **FILTER-06**: Filter by household fit (single-serve, couples, family, freezer-stocking, gifting)
- [ ] **FILTER-07**: Filter by model type (subscription-first, store-first, marketplace, gift-club, hybrid)
- [ ] **FILTER-08**: Filter by geography (national-us, regional, multi-market)
- [ ] **FILTER-09**: All filters composable — URL search params encode all active filters (shareable URLs)
- [ ] **FILTER-10**: Null-aware filtering — providers with empty filter fields pass through rather than being excluded
- [ ] **FILTER-11**: Sort options: featured/editorial order, rating, name A-Z, value tier
- [ ] **FILTER-12**: Filter UI collapses to drawer/sheet on mobile
- [ ] **FILTER-13**: noindex meta tag on filtered pages to prevent SEO duplicate content

### Search

- [ ] **SEARCH-01**: Server-side search across provider names, descriptions, and categories
- [ ] **SEARCH-02**: Search results page with provider cards
- [ ] **SEARCH-03**: Debounced search input with expandable search bar in header

### Side-by-Side Comparison

- [ ] **COMP-01**: Comparison page at /compare/[slugs] rendering 2-3 providers side-by-side
- [ ] **COMP-02**: Field matrix showing all comparison axes (category, prep style, diet tags, value tier, pricing, flexibility, shipping, pros/cons)
- [ ] **COMP-03**: Canonical slug ordering in comparison URLs (alphabetical) to prevent duplicate content
- [ ] **COMP-04**: Comparison page hides rows where all compared providers have N/A values
- [ ] **COMP-05**: Comparison page metadata and JSON-LD structured data

### Comparison Tray

- [ ] **TRAY-01**: Floating comparison tray bar at bottom of viewport showing 0-3 selected providers
- [ ] **TRAY-02**: "Add to Compare" button on provider cards
- [ ] **TRAY-03**: "Compare Now" button navigates to comparison page with selected provider slugs in URL
- [ ] **TRAY-04**: Comparison tray state managed client-side, transfers to URL params on navigation

### SEO and Content

- [ ] **SEO-01**: Every public page exports metadata (title, description) via generateMetadata or static metadata
- [ ] **SEO-02**: JSON-LD structured data on every public page (appropriate schema type per page)
- [ ] **SEO-03**: XSS-safe JSON-LD rendering with .replace(/</g, "\\u003c") on all JSON.stringify output
- [ ] **SEO-04**: Sitemap generation for all public pages
- [ ] **SEO-05**: Canonical URLs on all pages to prevent duplicate content

### Collections

- [ ] **COLL-01**: "Best for X" collection pages at /best/[slug] showing curated provider lists
- [ ] **COLL-02**: Collection pages with editorial intro, ranked provider list with editorial notes
- [ ] **COLL-03**: Collection page metadata and JSON-LD structured data

### Admin

- [ ] **ADMIN-01**: Admin dashboard showing provider count, category breakdown, review stats, click stats
- [ ] **ADMIN-02**: Admin CRUD for providers including new schema fields (modelType, prepStyle, valueTier, etc.)
- [ ] **ADMIN-03**: Admin provider list with search, sort, and status filtering
- [ ] **ADMIN-04**: On-demand revalidation from admin mutations (revalidatePath for affected pages)

### Affiliate Tracking

- [ ] **AFF-01**: Affiliate click tracking on all outbound provider links (record to AffiliateClick model)
- [ ] **AFF-02**: Click tracking captures: providerId, source page, referrer, hashed IP for dedup

### Error Handling and UX

- [ ] **UX-01**: error.tsx error boundaries on all route segments
- [ ] **UX-02**: not-found.tsx custom 404 pages with search and category suggestions
- [ ] **UX-03**: loading.tsx streaming loading states with skeleton components
- [ ] **UX-04**: Mobile-responsive design across all pages
- [ ] **UX-05**: Sticky header with navigation and search

### Query Layer

- [ ] **QUERY-01**: Centralized query layer in src/lib/queries.ts with React.cache() wrapped functions
- [ ] **QUERY-02**: Query functions for: listings with filters, provider detail by slug, comparison by slugs, search, admin stats, featured providers, category counts
- [ ] **QUERY-03**: Split queries.ts if exceeding 300 lines

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
| Provider self-service portal | Requires auth, permissions, moderation — premature at 95 providers |
| Price comparison charts/graphs | Implies precision that manually-updated data cannot deliver |
| Real-time chat/support | Not relevant for discovery product |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | TBD | Pending |
| DATA-02 | TBD | Pending |
| DATA-03 | TBD | Pending |
| DATA-04 | TBD | Pending |
| DATA-05 | TBD | Pending |
| LOGO-01 | TBD | Pending |
| LOGO-02 | TBD | Pending |
| LOGO-03 | TBD | Pending |
| LOGO-04 | TBD | Pending |
| HOME-01 | TBD | Pending |
| HOME-02 | TBD | Pending |
| HOME-03 | TBD | Pending |
| HOME-04 | TBD | Pending |
| HOME-05 | TBD | Pending |
| CAT-01 | TBD | Pending |
| CAT-02 | TBD | Pending |
| CAT-03 | TBD | Pending |
| CAT-04 | TBD | Pending |
| DETAIL-01 | TBD | Pending |
| DETAIL-02 | TBD | Pending |
| DETAIL-03 | TBD | Pending |
| DETAIL-04 | TBD | Pending |
| DETAIL-05 | TBD | Pending |
| DETAIL-06 | TBD | Pending |
| DETAIL-07 | TBD | Pending |
| FILTER-01 | TBD | Pending |
| FILTER-02 | TBD | Pending |
| FILTER-03 | TBD | Pending |
| FILTER-04 | TBD | Pending |
| FILTER-05 | TBD | Pending |
| FILTER-06 | TBD | Pending |
| FILTER-07 | TBD | Pending |
| FILTER-08 | TBD | Pending |
| FILTER-09 | TBD | Pending |
| FILTER-10 | TBD | Pending |
| FILTER-11 | TBD | Pending |
| FILTER-12 | TBD | Pending |
| FILTER-13 | TBD | Pending |
| SEARCH-01 | TBD | Pending |
| SEARCH-02 | TBD | Pending |
| SEARCH-03 | TBD | Pending |
| COMP-01 | TBD | Pending |
| COMP-02 | TBD | Pending |
| COMP-03 | TBD | Pending |
| COMP-04 | TBD | Pending |
| COMP-05 | TBD | Pending |
| TRAY-01 | TBD | Pending |
| TRAY-02 | TBD | Pending |
| TRAY-03 | TBD | Pending |
| TRAY-04 | TBD | Pending |
| SEO-01 | TBD | Pending |
| SEO-02 | TBD | Pending |
| SEO-03 | TBD | Pending |
| SEO-04 | TBD | Pending |
| SEO-05 | TBD | Pending |
| COLL-01 | TBD | Pending |
| COLL-02 | TBD | Pending |
| COLL-03 | TBD | Pending |
| ADMIN-01 | TBD | Pending |
| ADMIN-02 | TBD | Pending |
| ADMIN-03 | TBD | Pending |
| ADMIN-04 | TBD | Pending |
| AFF-01 | TBD | Pending |
| AFF-02 | TBD | Pending |
| UX-01 | TBD | Pending |
| UX-02 | TBD | Pending |
| UX-03 | TBD | Pending |
| UX-04 | TBD | Pending |
| UX-05 | TBD | Pending |
| QUERY-01 | TBD | Pending |
| QUERY-02 | TBD | Pending |
| QUERY-03 | TBD | Pending |

**Coverage:**
- v1 requirements: 66 total
- Mapped to phases: 0
- Unmapped: 66

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 after initial definition*
