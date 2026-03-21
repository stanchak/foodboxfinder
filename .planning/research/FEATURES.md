# Feature Landscape

**Domain:** Food subscription discovery and comparison platform (Kayak-like model)
**Researched:** 2026-03-21
**Overall confidence:** MEDIUM (grounded in project research corpus + training data knowledge of comparison platforms; web search and web fetch were unavailable for live competitor verification)

## Reference Platforms Analyzed

The feature analysis draws from these platform archetypes:

- **Kayak / Google Flights** -- multi-criteria filtering, instant sort/filter, compare shortlist, shareable URLs, price signals
- **NerdWallet** -- category hubs, editorial reviews, side-by-side comparison tables, "best of" curated lists, recommendation quizzes, star ratings, pros/cons
- **WireCutter (NYT)** -- opinionated editorial picks, "best for X" structure, detailed reviews with structured data, transparent methodology
- **MealFinds** -- meal kit directory, category filtering, coupon/deal aggregation, provider detail pages
- **Top10.com** -- numbered ranked lists, quick comparison tables, brief reviews, strong SEO structure
- **The Points Guy** -- card comparison tables, editorial scoring, affiliate-first design, category landing pages

## Table Stakes

Features users expect. Missing any of these and the product feels incomplete or untrustworthy for a comparison/discovery site.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Category browsing | Users think in categories: "meal kits" vs "prepared meals" vs "protein boxes." Every comparison site organizes by category. | Low | 5 categories already defined in schema. Need hub pages per category. |
| Provider detail pages | Users need a single page per provider with comprehensive info. This is the core content unit. WireCutter, NerdWallet, and every directory have them. | Medium | Slug-based routes. Must show: name, logo, summary, pros/cons, plans/pricing, dietary tags, flexibility, shipping, editorial note, FAQ. |
| Multi-criteria filtering | Kayak's defining feature. Users filter by diet, price tier, prep style, household size, etc. Without this, it is just a blog. | High | URL-param driven. Must support: category, prep style, diet tags, value tier, household fit, geography, flexibility, model type. All filters composable. |
| Side-by-side comparison | The core decision-making tool. NerdWallet, Kayak, and every serious comparison platform offer 2-3 item comparison tables. Users explicitly asked for this in the PRD acceptance criteria. | High | Compare 2-3 providers. Field matrix showing all comparison axes. Shareable URL. |
| Provider logos/branding | Visual identity is critical for trust and scannability. Users recognize brands by logo. NerdWallet and every card comparison site shows logos prominently. | Low | 95 logo assets already exist. Need fallback SVG for missing. Display on cards, detail, compare headers. |
| Sort options | Users expect to sort by relevance, rating, price, name. Kayak defaults to "best" sort. NerdWallet sorts by recommendation. | Low | Default: editorial/featured order. Options: rating, price (low-high, high-low), name A-Z. |
| Mobile-responsive design | 60%+ of comparison site traffic is mobile. Non-negotiable for a consumer product. | Medium | Filters must collapse to a drawer/sheet on mobile. Comparison table must scroll horizontally or stack. |
| SEO metadata + structured data | Discovery sites live or die by organic search. NerdWallet and WireCutter invest heavily in structured data. Without this, no traffic. | Medium | Every page needs: title, description, JSON-LD (Product, ItemList, FAQPage, BreadcrumbList as appropriate). |
| Provider cards in listings | The primary browse surface. Every comparison site uses cards with: logo, name, category badge, price signal, rating, and a primary CTA. | Medium | Must be scannable. Key info visible without clicking through. |
| Pros/cons per provider | WireCutter and NerdWallet both show structured pros/cons. Users expect a quick "should I or shouldn't I" summary. | Low | Already in schema as prosJson/consJson. Render as bullet lists. |
| Search | Users type a brand name to find it. Even basic text search is table stakes for 95+ providers. | Medium | Server-side search across provider names, descriptions, categories. Debounced input. Search results page. |
| Breadcrumb navigation | Standard for SEO and UX on any site with category hierarchy. Google uses breadcrumbs in search results. | Low | Home > Category > Provider. Implement with JSON-LD BreadcrumbList. |
| Loading states + error boundaries | Users expect visual feedback during navigation. Broken pages destroy trust. | Low | loading.tsx skeletons, error.tsx boundaries, not-found.tsx for 404s. |
| External links to provider sites | The entire business model depends on sending users to provider websites. Must be prominent and trackable. | Low | Affiliate URLs with click tracking. Clear "Visit Site" or "Get Started" CTAs. |
| Price signal display | Users need to see approximate pricing without visiting each provider site. Kayak shows prices prominently. WireCutter mentions price ranges. | Low | Display min/max price per serving. Use "starting at $X.XX/serving" format. Already in schema. |

## Differentiators

Features that set FoodBoxFinder apart from existing "best meal kits" blog posts and affiliate roundup articles. Not expected by users walking in, but create competitive advantage.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Comparison tray (floating bar) | Kayak-like "add to compare" interaction. Users select providers while browsing and compare later. No existing meal kit site does this well. | High | Floating bar at bottom of viewport. Shows 0-3 selected providers with logos. "Compare Now" button navigates to compare page. State managed client-side, transfers to URL params. |
| Shareable comparison URLs | Users can share a comparison link with a partner/roommate. Kayak and NerdWallet support this. Meal kit blogs do not. | Medium | Encode provider slugs in URL: /compare/hellofresh-vs-home-chef. Bookmarkable and shareable. |
| Cross-category discovery | Most sites only cover meal kits. FoodBoxFinder spans 5 categories + 95 providers. The breadth IS the differentiator. Users shopping for "food delivery" can discover protein boxes or produce boxes they did not know existed. | Low (data exists) | The research corpus and dataset already provide this breadth. Taxonomy and category hubs make it navigable. |
| "Best for X" curated collections | WireCutter's signature pattern. "Best for families," "Best budget," "Best keto." These are high-intent SEO pages and trust builders. | Medium | Collection model already in schema. Need editorial curation and rendering. Map to intent-driven URL slugs: /best/budget-meal-kits. |
| Flexibility transparency | No competitor surfaces skip/pause/cancel policies clearly. This is a major buying criterion (per the MASTER-LANDSCAPE research). Making it a first-class comparison field builds trust. | Low | Already in dataset. Display on detail pages and in comparison matrix. |
| Shipping coverage clarity | Regional availability is a real pain point. Surfacing "national," "excludes AK/HI," "regional only" prominently helps users avoid dead ends. | Low | Geography field in dataset. Show as a badge or tag on provider cards. |
| Diet-tag filtering across categories | Users with dietary needs (keto, vegan, gluten-free) want to discover options across ALL categories, not just meal kits. This cross-cutting filter is rare in existing sites. | Medium | 16 DietaryTag enum values. Filter should work globally and within categories. |
| Introductory offer display | Users heavily factor in first-box discounts. Surfacing "60% off first box" prominently on cards and detail pages is a conversion driver and differentiator vs. editorial roundups. | Low | introOfferNote field on Plan model. Show as a badge/callout on provider cards. |
| Transparent editorial methodology | WireCutter publishes their testing methodology. Explaining how providers are evaluated (not just affiliate commission ranking) builds trust and differentiates from affiliate sludge sites. | Low | Static "How We Evaluate" page. Reference in footer and on review pages. |
| Category hub pages with editorial context | Not just a filtered list, but a page with editorial introduction, market context, and recommended picks per category. Combines WireCutter editorial with Kayak filtering. | Medium | 5 category pages. Each has: editorial intro, featured picks, full filterable provider list, related comparisons. |
| Quick-glance comparison badges | On listing cards, show small visual indicators for key attributes (free shipping, skip anytime, organic, etc.) so users can scan without clicking. NerdWallet does this with feature checkmarks. | Medium | Badge component rendering key boolean/enum fields. Must not clutter cards. |

## Anti-Features

Features to explicitly NOT build. Each would waste time, damage trust, or add complexity without commensurate value.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User accounts / login | Adds authentication complexity, cookie consent, GDPR concerns. No user personalization needed for a discovery site. NerdWallet does not require login to compare. | Admin-only auth via proxy.ts + ADMIN_SECRET. Users browse anonymously. |
| Live price scraping | Provider pricing changes constantly and sites actively block scrapers. Maintaining accuracy is a full-time operation. Wrong prices destroy trust faster than no prices. | Manual price updates via admin UI. Show "starting at" ranges with "last verified" dates. |
| Recommendation quiz/wizard | Tempting (NerdWallet has one for credit cards), but premature. Requires deep understanding of user preferences and provider matching logic. High effort, low initial payoff. | Instead, use clear category hubs and "best for X" collections as guided discovery. Consider quiz as a v2 feature. |
| User reviews (UI for now) | Review moderation is a significant operational burden. Fake reviews are rampant. The schema exists but launching without review UI is correct. | Keep Review model in schema for future use. Use editorial pros/cons as the trust signal initially. |
| Coupon/deal aggregation | Coupon sites are a race to the bottom. They attract low-quality traffic and create a "deal hunter" brand perception. MealFinds does this and it cheapens the experience. | Show introductory offer notes where they exist, but do not build a coupon engine. Link to provider sites directly. |
| Blog authoring UI | Building a CMS is a significant engineering effort for low initial ROI. Content can be managed via admin or directly in the database. | Keep BlogPost schema. Author content via admin CRUD or database seeds. No WYSIWYG editor needed. |
| Notification/alert system | "Alert me when price drops" adds real-time infrastructure complexity (queues, email service, user accounts). Premature for a discovery site. | Omit entirely. Users visit when they are ready to decide. |
| Social features (sharing, wishlists, favorites) | Requires user identity, adds state management complexity, and comparison sites rarely see engagement with social features. | Shareable comparison URLs cover the core sharing use case. No wishlists/favorites. |
| Provider self-service portal | Letting providers update their own listings requires authentication, permissions, content moderation, and dispute resolution. Premature. | Admin manages all provider data. Consider provider portal only at significant scale (500+ providers). |
| Dark mode | Styling complexity doubles. Not a priority for a content-heavy SEO discovery site. The project spec explicitly defers this. | System preference detection exists in CSS but do not invest in dark mode polish. |
| Infinite scroll | Feels modern but hurts SEO (Google needs paginated or single-page content), makes it harder to share "I was looking at something on page 3," and complicates loading states. | Show all providers in category (95 max is fine for a single page). If lists grow past 200, add traditional pagination. |
| Real-time chat/support | Not relevant for a discovery/comparison product. Users are reading, not conversing. | Omit entirely. Add a simple contact form or email link if needed. |
| Price comparison charts/graphs | Visually appealing but misleading when prices change and data is manually maintained. Charts imply precision that manually-updated data cannot deliver. | Show simple price ranges and "starting at" figures. Let comparison tables handle side-by-side pricing. |

## Feature Dependencies

```
Provider Data Import (seed) ──> Provider Detail Pages
                            ──> Provider Cards in Listings
                            ──> Category Hub Pages
                            ──> Side-by-Side Comparison

Provider Logos (manifest)   ──> Provider Cards
                            ──> Provider Detail Pages
                            ──> Comparison Headers
                            ──> Comparison Tray

Category Hub Pages          ──> Multi-Criteria Filtering (filters live on category pages)
                            ──> "Best for X" Collections (linked from hubs)

Multi-Criteria Filtering    ──> URL Search Param State (filters encoded in URL)
                            ──> Sort Options (sort is a filter dimension)

Side-by-Side Comparison     ──> Comparison Tray (selection mechanism)
                            ──> Shareable Comparison URLs (state in URL)

Provider Detail Pages       ──> Pros/Cons Display
                            ──> Plan/Pricing Display
                            ──> FAQ Display
                            ──> Affiliate Click Tracking (outbound links)

Search                      ──> Provider Data (search target)

SEO Metadata                ──> Every public page (parallel concern, not sequential)

Error Boundaries            ──> Every route segment (parallel concern)

Admin CRUD                  ──> Provider Data (management after import)
                            ──> Admin Dashboard (stats overview)
```

## MVP Recommendation

### Phase 1: Data Foundation + Core Browsing
Prioritize getting providers into the database and onto category listing pages with cards:
1. **Provider data import** (seed from dataset) -- everything depends on this
2. **Provider logos** rendering with fallback -- visual trust
3. **Category hub pages** with provider cards -- the primary browse surface
4. **Provider detail pages** with full info -- the core content unit

### Phase 2: Discovery + Filtering
Turn the directory into a discovery engine:
5. **Multi-criteria filtering** with URL params -- the Kayak differentiator
6. **Sort options** -- natural extension of filtering
7. **Search** -- users expect to find by name

### Phase 3: Comparison + Decision Support
Enable the decision-making workflow:
8. **Side-by-side comparison** with field matrix -- the highest-value decision tool
9. **Comparison tray** (floating bar) -- the selection mechanism
10. **Shareable comparison URLs** -- viral and utility value

### Phase 4: Content + SEO
Layer on editorial content and SEO optimization:
11. **"Best for X" collections** -- high-intent SEO pages
12. **SEO metadata + JSON-LD** on all pages -- organic traffic driver
13. **Transparent methodology page** -- trust builder

### Phase 5: Admin + Operations
Enable ongoing content management:
14. **Admin CRUD** for providers -- manage data post-launch
15. **Admin dashboard** with stats -- operational visibility
16. **Affiliate click tracking** -- revenue measurement

### Defer to Post-Launch

- **User reviews UI**: Keep schema, defer UI. Use editorial pros/cons initially.
- **Blog authoring**: Keep schema, defer UI. Content via admin/database.
- **Collection curation UI**: Keep schema, populate via admin CRUD.
- **Recommendation quiz**: Consider for v2 after understanding user behavior.

## Data Field Coverage Assessment

The following fields are needed for the feature set above. Mapping against the existing schema and dataset:

| Field | In Schema | In Dataset | Gap |
|-------|-----------|------------|-----|
| name, slug, website | Yes | Yes | None |
| category (primary) | Yes (enum) | Yes | None |
| secondary category/tags | Partial (secondaryCategory enum) | Yes (pipe-delimited) | May need richer secondary tag support |
| model_type | No | Yes | Need schema field |
| prep_style | No | Yes | Need schema field |
| diet_tags | Yes (ProviderDietaryTag) | Sparse | Need better data population |
| household_fit | No | Yes | Need schema field |
| value_tier | No | Yes | Need schema field |
| geography | No | Yes | Need schema field |
| shipping_notes | Partial (deliveryAreaDescription) | Yes | Map to existing field |
| flexibility | No (canSkip/canCancel on Plan) | Yes | Provider-level flexibility field needed |
| pricing_signal | Partial (min/maxPricePerServingCents) | Sparse | Adequate for display |
| affiliate_signal | Partial (affiliateUrl) | Yes | Adequate |
| status (active/inactive) | Yes (active boolean) | Yes (richer enum) | May need enum instead of boolean |
| summary/description | Yes | Yes | None |
| pros/cons | Yes (prosJson/consJson) | No | Need editorial content creation |
| logo | Yes (logoUrl) | Yes (manifest) | Need to map manifest paths |
| intro offers | Yes (introOfferNote on Plan) | No | Need data population |
| FAQs | Yes (ProviderFaq model) | No | Need content creation |

## Confidence Notes

- **Table stakes features**: HIGH confidence. These are universal across NerdWallet, WireCutter, Kayak, and every comparison platform. Omitting any would be a clear gap.
- **Differentiator features**: MEDIUM confidence. The comparison tray and cross-category discovery are genuinely differentiating based on the project's research finding that "there is no obvious single consumer clearing house for the full food-subscription universe." Could not verify current competitor feature sets via live web research.
- **Anti-features**: HIGH confidence. Each anti-feature has clear rationale grounded in the project spec's explicit out-of-scope items and practical engineering constraints.
- **Feature dependencies**: HIGH confidence. Based on schema analysis and standard web application architecture patterns.
- **MVP phasing**: MEDIUM confidence. Phase ordering follows natural data-dependency chains but could not be validated against real user behavior data.

## Sources

- Project research corpus: `temp/plandocs/MASTER-LANDSCAPE.md` (competitive landscape and market gaps)
- Project taxonomy: `temp/plandocs/TAXONOMY-RUBRIC.md` (filter dimensions and ranking criteria)
- Project PRD: `temp/plandocs/PLATFORM-GAP-BRIDGE-PRD.md` (explicit acceptance criteria)
- Project dataset: `temp/plandocs/food-box-companies.json` (95 providers, field coverage)
- Project spec: `.planning/PROJECT.md` (requirements, constraints, out-of-scope decisions)
- Prisma schema: `prisma/schema.prisma` (existing data model)
- Training data knowledge of: Kayak, NerdWallet, WireCutter, The Points Guy, MealFinds, Top10.com comparison platform patterns (MEDIUM confidence -- could not verify against live sites)
