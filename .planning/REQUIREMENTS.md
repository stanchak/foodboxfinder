# Requirements: FoodBoxFinder

**Defined:** 2026-03-20
**Core Value:** Consumers can quickly discover and compare food box subscriptions that match their dietary needs, budget, and preferences

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Database & Foundation

- [ ] **DB-01**: Database schema deployed to Neon with all models (Provider, Plan, Review, BlogPost, Collection, etc.)
- [ ] **DB-02**: Seed script populates 18 real food box providers across 5 categories with realistic plans, pricing, dietary tags, FAQs, and reviews
- [ ] **DB-03**: Query utility functions support all downstream page data needs (listings, detail, comparison, search, admin)
- [ ] **DB-04**: Denormalized price fields (minPricePerServing, maxPricePerServing) on Provider for filter performance

### Design System

- [ ] **DS-01**: Tailwind CSS 4 theme with brand colors, typography scale, and spacing tokens
- [ ] **DS-02**: Responsive root layout with header (logo, nav, mobile hamburger) and footer
- [ ] **DS-03**: Base component library: Button, Card, Badge, Input, Select, Rating stars, loading skeletons

### Homepage

- [ ] **HOME-01**: Hero section with headline, subheadline, search bar, and category quick links
- [ ] **HOME-02**: Featured providers section (horizontal scroll mobile, grid desktop)
- [ ] **HOME-03**: Category cards section with icons, descriptions, and provider counts
- [ ] **HOME-04**: "How it works" section and social proof / testimonials
- [ ] **HOME-05**: JSON-LD structured data (WebSite, Organization schemas) and SEO metadata

### Category Browsing

- [ ] **CAT-01**: Dynamic category pages at SEO-friendly URLs (/meal-kits, /prepared-meals, etc.)
- [ ] **CAT-02**: Provider cards with logo, name, rating, price range, dietary tags, CTA
- [ ] **CAT-03**: Filter sidebar/drawer: dietary tags, price range, rating, servings
- [ ] **CAT-04**: Sort options: rating, price low-to-high, most reviewed, newest
- [ ] **CAT-05**: URL search params drive all filter/sort state (shareable, bookmarkable)
- [ ] **CAT-06**: Pagination for provider listings
- [ ] **CAT-07**: JSON-LD ItemList schema and category-specific metadata

### Provider Detail

- [ ] **PROV-01**: Comprehensive provider profile at /providers/[slug] with all data fields
- [ ] **PROV-02**: Plans and pricing table comparing provider's own plan tiers
- [ ] **PROV-03**: Pros and cons list with editorial content
- [ ] **PROV-04**: User review list with rating breakdown chart
- [ ] **PROV-05**: FAQ accordion with FAQ JSON-LD schema
- [ ] **PROV-06**: Related providers section
- [ ] **PROV-07**: Breadcrumb navigation with BreadcrumbList JSON-LD
- [ ] **PROV-08**: generateMetadata with dynamic title/description and Product/Review JSON-LD
- [ ] **PROV-09**: generateStaticParams for all active providers

### Comparison Engine

- [ ] **COMP-01**: Comparison page at /compare?providers=slug1,slug2 supporting 2-4 providers
- [ ] **COMP-02**: "Add to compare" button on provider cards and detail pages
- [ ] **COMP-03**: Side-by-side comparison table (name, rating, price, dietary tags, shipping, features)
- [ ] **COMP-04**: Sticky comparison bar (floating bottom) when providers are selected
- [ ] **COMP-05**: Comparison state persists across page navigations
- [ ] **COMP-06**: SEO comparison pages at /compare/[slug-vs-slug] for top provider pairs

### Collections & Blog

- [ ] **CONT-01**: "Best of" collection pages at /best/[slug] with ranked provider lists and editorial notes
- [ ] **CONT-02**: Blog index at /blog with paginated post list and featured post hero
- [ ] **CONT-03**: Blog post pages at /blog/[slug] with markdown rendering and table of contents
- [ ] **CONT-04**: Blog post metadata and Article JSON-LD schema
- [ ] **CONT-05**: Collection metadata and ItemList JSON-LD schema
- [ ] **CONT-06**: Seed data: 5-8 collections, 3-5 blog posts

### Search

- [ ] **SRCH-01**: Full-text search API across providers, blog posts, and collections
- [ ] **SRCH-02**: Search results page at /search?q=... with results grouped by type
- [ ] **SRCH-03**: Search bar in header (expandable on mobile)
- [ ] **SRCH-04**: No results state with category suggestions

### Reviews

- [ ] **REV-01**: Review submission form on provider detail page (star rating, title, body, name, email)
- [ ] **REV-02**: Server Action with validation for review submission
- [ ] **REV-03**: Reviews default to PENDING status (require admin approval)
- [ ] **REV-04**: Provider averageRating recalculated on review approval
- [ ] **REV-05**: Basic rate limiting to prevent review spam

### Admin Dashboard

- [ ] **ADM-01**: Admin layout with sidebar navigation under /admin, protected by proxy.ts
- [ ] **ADM-02**: Dashboard with stats overview (provider count, review count, pending reviews, affiliate clicks)
- [ ] **ADM-03**: Provider list with search, filter, edit/create/delete
- [ ] **ADM-04**: Provider form with all fields including plans, FAQs, dietary tags
- [ ] **ADM-05**: Review moderation: list pending reviews, approve/reject actions
- [ ] **ADM-06**: Blog post CRUD with markdown editor
- [ ] **ADM-07**: Collection CRUD with provider picker and sorting

### SEO & Performance

- [ ] **SEO-01**: Dynamic sitemap.xml covering all providers, categories, collections, blog posts
- [ ] **SEO-02**: robots.txt with appropriate crawl rules
- [ ] **SEO-03**: Canonical URLs on all pages
- [ ] **SEO-04**: Open Graph and Twitter card metadata on all pages
- [ ] **SEO-05**: Core Web Vitals: LCP < 2.5s, CLS < 0.1
- [ ] **SEO-06**: Image optimization with Next.js Image and remotePatterns
- [ ] **SEO-07**: 404 page with search and category suggestions

### Affiliate & Launch

- [ ] **AFF-01**: Affiliate click tracking API route (logs click, redirects to affiliate URL)
- [ ] **AFF-02**: "Visit Provider" buttons use tracking route with source page attribution
- [ ] **AFF-03**: Click analytics visible in admin dashboard
- [ ] **AFF-04**: Error boundaries on all route segments
- [ ] **AFF-05**: Loading states for all data-dependent pages
- [ ] **AFF-06**: `next build` succeeds without errors or warnings

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Search

- **SRCH-05**: Autocomplete/suggestions as user types
- **SRCH-06**: PostgreSQL tsvector full-text search with weighted ranking

### Advanced Comparison

- **COMP-07**: Mobile swipe gesture for comparison cards
- **COMP-08**: Pre-generated SEO pages for top 30 provider pairs

### Content Enhancement

- **CONT-07**: Methodology page (/methodology) for E-E-A-T
- **CONT-08**: "Last verified" dates on all provider data

### Admin Enhancement

- **ADM-08**: Affiliate link management interface
- **ADM-09**: Staleness alerts for providers not updated in 90+ days
- **ADM-10**: Bulk import/export for provider data

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | Admin-only auth via env var; reviews are anonymous. Not needed for MVP. |
| Email notification system | No transactional email for MVP. No subscribers to notify. |
| Real-time price tracking / scraping | All data is editorial/curated. Manual updates only. |
| Provider API integrations | No provider has a public comparison API. Data is editorial. |
| Payment processing | Affiliate model only. No direct transactions. |
| Mobile app | Web-first. Responsive design covers mobile use cases. |
| Dark mode | Deprioritized. System preference support exists via Tailwind but no toggle. |
| Quiz / recommendation engine | High complexity, low MVP value. Can be added post-launch. |
| Promo code aggregation | Legal risk, maintenance burden, frequently stale. |
| Price history charts | Requires ongoing data collection infrastructure. Post-MVP. |
| Meal / recipe browsing | Out of scope — we compare services, not individual meals. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | Phase 10 | Pending |
| DB-02 | Phase 10 | Pending |
| DB-03 | Phase 10 | Pending |
| DB-04 | Phase 10 | Pending |
| DS-01 | Phase 20 | Pending |
| DS-02 | Phase 20 | Pending |
| DS-03 | Phase 20 | Pending |
| HOME-01 | Phase 30 | Pending |
| HOME-02 | Phase 30 | Pending |
| HOME-03 | Phase 30 | Pending |
| HOME-04 | Phase 30 | Pending |
| HOME-05 | Phase 30 | Pending |
| CAT-01 | Phase 40 | Pending |
| CAT-02 | Phase 40 | Pending |
| CAT-03 | Phase 40 | Pending |
| CAT-04 | Phase 40 | Pending |
| CAT-05 | Phase 40 | Pending |
| CAT-06 | Phase 40 | Pending |
| CAT-07 | Phase 40 | Pending |
| PROV-01 | Phase 50 | Pending |
| PROV-02 | Phase 50 | Pending |
| PROV-03 | Phase 50 | Pending |
| PROV-04 | Phase 50 | Pending |
| PROV-05 | Phase 50 | Pending |
| PROV-06 | Phase 50 | Pending |
| PROV-07 | Phase 50 | Pending |
| PROV-08 | Phase 50 | Pending |
| PROV-09 | Phase 50 | Pending |
| COMP-01 | Phase 60 | Pending |
| COMP-02 | Phase 60 | Pending |
| COMP-03 | Phase 60 | Pending |
| COMP-04 | Phase 60 | Pending |
| COMP-05 | Phase 60 | Pending |
| COMP-06 | Phase 60 | Pending |
| CONT-01 | Phase 70 | Pending |
| CONT-02 | Phase 70 | Pending |
| CONT-03 | Phase 70 | Pending |
| CONT-04 | Phase 70 | Pending |
| CONT-05 | Phase 70 | Pending |
| CONT-06 | Phase 70 | Pending |
| SRCH-01 | Phase 80 | Pending |
| SRCH-02 | Phase 80 | Pending |
| SRCH-03 | Phase 80 | Pending |
| SRCH-04 | Phase 80 | Pending |
| REV-01 | Phase 90 | Pending |
| REV-02 | Phase 90 | Pending |
| REV-03 | Phase 90 | Pending |
| REV-04 | Phase 90 | Pending |
| REV-05 | Phase 90 | Pending |
| ADM-01 | Phase 100 | Pending |
| ADM-02 | Phase 100 | Pending |
| ADM-03 | Phase 100 | Pending |
| ADM-04 | Phase 100 | Pending |
| ADM-05 | Phase 100 | Pending |
| ADM-06 | Phase 100 | Pending |
| ADM-07 | Phase 100 | Pending |
| SEO-01 | Phase 110 | Pending |
| SEO-02 | Phase 110 | Pending |
| SEO-03 | Phase 110 | Pending |
| SEO-04 | Phase 110 | Pending |
| SEO-05 | Phase 110 | Pending |
| SEO-06 | Phase 110 | Pending |
| SEO-07 | Phase 110 | Pending |
| AFF-01 | Phase 120 | Pending |
| AFF-02 | Phase 120 | Pending |
| AFF-03 | Phase 120 | Pending |
| AFF-04 | Phase 120 | Pending |
| AFF-05 | Phase 120 | Pending |
| AFF-06 | Phase 120 | Pending |

**Coverage:**
- v1 requirements: 69 total
- Mapped to phases: 69
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 after roadmap creation*
