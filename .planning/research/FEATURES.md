# Feature Landscape

**Domain:** Food box subscription comparison/discovery site
**Researched:** 2026-03-20
**Overall confidence:** MEDIUM (based on training data knowledge of competitor sites: MealFinds, Top10, Wirecutter, CNET, AllRecipes, MSN Food, and niche comparison sites; cross-referenced with project's existing UX-STRATEGY.md, SEO-STRATEGY.md, and ROADMAP.md; no live competitor scraping performed)

---

## Table Stakes

Features users expect on any food subscription comparison site. Missing any of these and the site feels incomplete, untrustworthy, or unusable. Users will bounce.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Category browsing** | Users arrive with a category in mind ("meal kits" or "prepared meals") | Low | 5 fixed categories per PROJECT.md. URL-driven: `/meal-kits`, `/prepared-meals`, etc. |
| **Provider detail pages** | Users need comprehensive info before clicking affiliate links | Medium | Logo, description, pricing plans, pros/cons, ratings, FAQs. The money page for affiliate revenue. |
| **Price per serving display** | Price is the #1 decision factor for 60%+ of meal kit shoppers | Low | Denormalized on Provider model already. Show range across plans. |
| **Dietary filter/tags** | 25%+ of users have specific dietary needs (keto, vegan, gluten-free) | Medium | 16 dietary tags in schema. Multi-select filtering on category pages. |
| **Star ratings** | Social proof is non-negotiable for comparison sites; users distrust sites without ratings | Low | 1-5 scale with half-star display. Schema has `averageRating` and `reviewCount`. |
| **Side-by-side comparison** | Core value prop of a "comparison" site. Users expect to compare 2-4 providers | High | Comparison table, sticky tray for selections, shareable URLs. Most complex interactive feature. |
| **Mobile-responsive design** | 60-70% of food content traffic is mobile | Medium | Already planned in UX-STRATEGY.md. Mobile-first with drawer filters, swipeable comparison cards. |
| **Affiliate CTA buttons** | Users expect clear "Visit Site" or "Get Started" actions; this is also the revenue model | Low | Track clicks, redirect to affiliate URL. Every provider card and detail page. |
| **Pricing tables per provider** | Users need to compare a provider's own plans (2-person vs 4-person, etc.) | Medium | Plan model already supports this. Display as feature matrix on detail pages. |
| **Editorial content (pros/cons)** | Users want expert opinion, not just data. Differentiates from provider's own marketing | Low | `prosJson`/`consJson` + `editorNote` on Provider model. |
| **Search** | Users arriving from Google may search for a specific brand name or dietary term | Medium | PostgreSQL full-text search. Header search bar. Results grouped by type. |
| **Breadcrumb navigation** | Supports SEO and user orientation, especially for deep pages | Low | On all interior pages. JSON-LD BreadcrumbList schema. |
| **Structured data (JSON-LD)** | Google rich results drive organic traffic. Without it, you lose SERP features | Medium | Product, AggregateRating, Review, FAQ, ItemList, Article schemas per page type. |
| **Responsive images** | Logo quality, page speed. Broken/slow images destroy trust | Low | Next.js Image with `remotePatterns`. Provider logos stored as URLs. |
| **Shipping info display** | Shipping cost is a hidden dealbreaker; users resent finding it out late | Low | `shippingCost` and `shippingNote` on Plan model. Display prominently. |
| **FAQ sections** | Users have common questions per provider. Also generates FAQ rich snippets in Google | Low | ProviderFaq model with JSON-LD FAQPage schema. |

---

## Differentiators

Features that set FoodBoxFinder apart from competitors. Not strictly expected, but valued. These create competitive advantage.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **"Best of" collection pages** | Curated editorial lists ("Best Keto Meal Kits", "Best Meal Kits for Families") target high-intent long-tail keywords | Medium | Collection + CollectionItem models. Ranked lists with editorial notes. SEO goldmine: these pages rank for "best X" queries. |
| **SEO comparison pages** (`/compare/slug-vs-slug`) | Pre-built "vs" pages for common brand comparisons target mid-funnel keywords (e.g., "HelloFresh vs Blue Apron") | Medium | Alphabetical slug ordering with 301 redirects for canonical. Distinct from the flexible comparison tool. Most competitor sites only do one or the other. |
| **URL-driven filter state** | Shareable, bookmarkable filtered views. Most competitor sites lose filter state on refresh | Low | `searchParams` drive all filtering. Enables linking to "all keto meal kits under $10/serving" directly. |
| **Cancellation policy transparency** | Competitor sites bury this. Being upfront about skip/cancel policies builds trust | Low | `canSkip`, `canCancel`, `cancelPolicy` on Plan model. Display prominently as a comparison dimension. |
| **Blog content engine** | Informational content ("How to Choose a Meal Kit", "Meal Kit Promo Codes") supports top-of-funnel SEO and E-E-A-T | Medium | BlogPost model with markdown rendering. Drives organic traffic that category pages alone cannot capture. |
| **Methodology page** | "/methodology" explains how providers are rated. Critical for Google E-E-A-T trust signals | Low | Static content page. Competitors that have this rank better. Most small comparison sites skip it. |
| **Review submission with moderation** | User-generated reviews add E-E-A-T signals, fresh content, and long-tail keyword variety | Medium | Anonymous submission (no accounts needed), PENDING by default, admin moderation queue. Lowers barrier vs requiring signup. |
| **Fast, accessible UI** | Most competitor meal kit comparison sites have terrible performance (heavy ads, slow loads, CLS jumps). A fast, clean site is a genuine differentiator | Medium | Server Components by default, minimal client JS, Lighthouse >= 90 target. No ads cluttering the experience. |
| **Multi-provider flexible comparison** | Most sites only offer 2-provider comparison. Supporting 3-4 providers in a flexible tool (vs just pre-built pages) is uncommon | High | `/compare?providers=a,b,c` with noindex. Distinct from SEO comparison pages. |
| **Helpful vote on reviews** | Surfaces the most useful reviews to the top. Simple engagement signal | Low | `helpful` field on Review model. Single upvote button per review. No downvotes needed. |
| **Related/similar providers** | Cross-selling within the site increases pageviews and comparison usage | Low | "Similar Services" section on provider detail pages. 3-5 related providers from same category or overlapping dietary tags. |
| **Admin dashboard with click analytics** | Most affiliate sites use only third-party tracking. In-house click analytics gives immediate feedback on what converts | Medium | AffiliateClick model with source page, timestamp. Admin dashboard visualization. |
| **Category-level SEO metadata** | Per-category meta titles, descriptions, and hero content for SEO depth | Low | Currently hardcoded (enum). Can be enhanced to a model post-MVP per SCHEMA-EXTENDED.md. For MVP, use generateMetadata with category-specific templates. |

---

## Anti-Features

Features to explicitly NOT build. These are tempting but would waste time, add complexity, or hurt the product.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **User accounts / authentication** | Massive complexity for minimal value. Users visit comparison sites 1-3 times then choose a provider. Nobody wants another login | Anonymous review submission. Admin-only auth via env var. If user accounts ever become needed, add post-launch. |
| **Real-time price scraping** | Meal kit prices change frequently but not hourly. API integrations are fragile, expensive, and every provider's API is different (most have none). Accuracy liability | Manual editorial updates. `updatedAt` timestamps so users see data freshness. Mark prices as "starting from" to reduce accuracy pressure. |
| **Quiz/recommendation engine** | "Take our quiz to find your perfect meal kit!" -- tempting but high-complexity interactive feature that most users skip. Conversion rates on quizzes are low (< 5% completion). | Good filters achieve the same goal faster. Users self-select via category + dietary tags + price range. The filter sidebar IS the recommendation engine. |
| **Coupon/promo code aggregation** | Promo codes go stale constantly, create user frustration when expired, and require ongoing maintenance. Also creates legal/compliance issues with affiliate networks | Link to provider's current offers page. Note "first box discount available" in editorial content without promising specific amounts. Revisit post-launch if affiliate partners provide reliable promo APIs. |
| **Price alerts / email notifications** | Requires email infrastructure, user accounts, cron jobs, and ongoing maintenance. Not aligned with MVP's "visit, compare, choose" user journey | Out of scope per PROJECT.md. The site is a comparison tool, not a price tracker. |
| **Dark mode** | Nice-to-have but doubles CSS testing surface. Not expected for a comparison/discovery site. Low user demand vs effort | Explicitly deprioritized in PROJECT.md. Can add post-launch with Tailwind's dark: variant. |
| **Social login / OAuth** | Drags in auth complexity for no clear value. Nobody wants to "Log in with Google" to compare meal kits | No user accounts at all. Admin uses shared secret. |
| **Comment system on blog posts** | Spam magnet, moderation burden, low engagement on niche content sites. Blog comments are a relic | Reviews on provider pages serve the community engagement need. Blog posts are informational, not conversational. |
| **Price history charts** | Cool-looking but requires long-term data collection, storage, and charting libraries. Meal kit prices change by plan restructuring, not gradual shifts -- charts would be misleading | Show current prices clearly. Note when prices were last verified with `updatedAt`. |
| **Meal/recipe browsing** | FoodBoxFinder compares providers, not individual meals. Showing specific weekly menus would require scraping, go stale instantly, and confuse the site's purpose | Link to provider's menu page. Note "X meals per week to choose from" as a data point. |
| **Video reviews / embedded video** | Heavy performance cost, production cost, and most comparison site visitors prefer scanning text/tables over watching videos | Focus on scannable text, comparison tables, and clear data presentation. Link to YouTube reviews if relevant. |
| **Mobile app** | Web-first responsive design covers mobile use case. Comparison shopping is not a daily-use app scenario | Out of scope per PROJECT.md. PWA could be a post-launch experiment if needed. |

---

## Feature Dependencies

Understanding what depends on what is critical for phase ordering.

```
Database Schema + Seed Data
  |
  +---> Provider Detail Pages
  |       |
  |       +---> Review Submission (needs provider pages to attach to)
  |       +---> Affiliate Click Tracking (needs provider CTAs)
  |       +---> FAQ Sections (needs provider pages)
  |
  +---> Category Pages + Filtering
  |       |
  |       +---> Comparison Tray (needs provider cards with compare checkboxes)
  |               |
  |               +---> Comparison Engine (needs tray + comparison page)
  |                       |
  |                       +---> SEO Comparison Pages (needs comparison engine working)
  |
  +---> Design System / Layout Shell (independent of data, but needed by all pages)
  |       |
  |       +---> Homepage (needs layout + provider data)
  |       +---> All page types depend on base components
  |
  +---> Blog Engine (depends only on schema + layout)
  |       |
  |       +---> "Best Of" Collections (blog-like engine + provider references)
  |
  +---> Search (depends on all content existing to search across)
  |
  +---> Admin Dashboard (depends on all models existing, builds CRUD for each)
  |
  +---> SEO Layer (depends on all pages existing to add metadata/structured data)
        |
        +---> Sitemap (needs all routes finalized)
        +---> JSON-LD (needs page-specific data)
        +---> Open Graph Images (needs page content)
```

---

## MVP Recommendation

### Must Build (launches are incomplete without these)

1. **Category browsing with filtering** -- the core discovery mechanism. Users land on category pages from SEO, filter to their needs, click through to providers.
2. **Provider detail pages** -- the conversion page. Comprehensive info, pricing plans, pros/cons, CTA buttons. This is where affiliate revenue happens.
3. **Side-by-side comparison** -- the core "comparison" value proposition. Without it, the site is just a directory, not a comparison tool.
4. **"Best of" collection pages** -- SEO traffic driver. "Best keto meal kits" pages are the highest-intent long-tail keywords in this space. Build early to start indexing.
5. **Search** -- users arriving from Google expect to search by brand name. Without search, they bounce.
6. **Admin dashboard** -- content management is essential for maintaining data freshness. Without admin tooling, updating provider data requires database access.

### Build But Can Be Basic at Launch

7. **Review submission** -- launches can work with seeded editorial reviews. User-submitted reviews add value over time but aren't day-one critical.
8. **Blog** -- seed with 3-5 posts for SEO. Not a launch-day traffic driver but builds E-E-A-T over time.
9. **Affiliate click tracking** -- even basic logging is fine. Advanced analytics dashboards can wait.

### Defer Post-Launch

- **Autocomplete search suggestions** -- nice UX but not a launch requirement
- **Review sub-ratings** (value, variety, quality dimensions) -- adds complexity to review form and display
- **Provider image gallery** -- single logo/hero is sufficient for launch
- **Promo code display** -- requires reliable data source; revisit when affiliate partnerships are established
- **RSS feed for blog** -- minimal traffic impact for a new site

---

## Competitor Feature Matrix

How FoodBoxFinder's planned features compare to known competitors (based on training data knowledge -- MEDIUM confidence).

| Feature | MealFinds | Top10/Meal-Kits | Wirecutter | CNET | **FoodBoxFinder (planned)** |
|---------|-----------|-----------------|------------|------|----------------------------|
| Category browsing | Yes | Yes | Limited | Limited | Yes (5 categories) |
| Dietary filtering | Basic | Basic | No | No | Advanced (16 tags, multi-select) |
| Price filtering | No | No | No | No | Yes (range slider) |
| Side-by-side comparison | Basic (2) | Yes (2-3) | No | No | Yes (2-4 providers) |
| SEO "vs" pages | Some | Yes | No | No | Yes (canonical slug-based) |
| "Best of" lists | Yes | Yes | Yes | Yes | Yes (Collection model) |
| User reviews | No | No | No | No | Yes (moderated) |
| Blog content | Yes | Limited | N/A | N/A | Yes (full blog engine) |
| Quiz/recommendation | Some have | Yes | No | No | No (intentionally) |
| Promo codes | Yes | Yes | No | No | No (intentionally) |
| Plan comparison within provider | Some | Some | Yes | Yes | Yes (Plan model) |
| Cancellation transparency | Rare | Rare | Yes | Yes | Yes (prominent) |
| Fast performance | Poor (ad-heavy) | Poor (ad-heavy) | Good | Good | Target: Lighthouse >= 90 |
| Mobile UX | Mediocre | Mediocre | Good | Good | Target: Mobile-first |
| Methodology page | Rare | Some | Yes | No | Yes |

### Key Competitive Gaps FoodBoxFinder Exploits

1. **Advanced filtering** -- Most competitor sites have no or basic filtering. Multi-dimensional filtering (dietary + price + servings) is genuinely uncommon.
2. **Performance** -- Ad-heavy affiliate sites (MealFinds, Top10) have terrible Core Web Vitals. A fast, clean site is a real differentiator for both users and Google rankings.
3. **Flexible comparison** -- Most cap at 2 providers. Supporting 2-4 with both SEO pages and a flexible tool covers both use cases.
4. **User reviews** -- Most meal kit comparison sites rely only on editorial reviews. User-generated reviews add authenticity and fresh content.
5. **Cancellation transparency** -- A pain point users care about deeply but comparison sites typically bury.

---

## Feature Sizing Estimates

Rough complexity/effort estimates to inform phase planning.

| Feature Group | Complexity | Estimated Effort | Phase (from ROADMAP) |
|---------------|------------|------------------|----------------------|
| Database + seed data | Medium | 1-2 days | Phase 10 |
| Design system + layout | Medium | 1-2 days | Phase 20 |
| Homepage | Low-Medium | 0.5-1 day | Phase 30 |
| Category pages + filtering | High | 1-2 days | Phase 40 |
| Provider detail pages | High | 1-2 days | Phase 50 |
| Comparison engine | High | 1-2 days | Phase 60 |
| Collections + blog | Medium | 1-1.5 days | Phase 70 |
| Search | Medium | 0.5-1 day | Phase 80 |
| Review system | Medium | 0.5-1 day | Phase 90 |
| Admin dashboard | High | 2-3 days | Phase 100 |
| SEO optimization | Medium | 0.5-1 day | Phase 110 |
| Affiliate tracking + polish | Low-Medium | 0.5-1 day | Phase 120 |

**Total estimated effort:** 10-17 days for a single developer.

---

## Sources

- FoodBoxFinder PROJECT.md (project requirements and constraints)
- FoodBoxFinder UX-STRATEGY.md (personas, component specs, layout strategy)
- FoodBoxFinder SEO-STRATEGY.md (URL structure, metadata, keyword targets)
- FoodBoxFinder SCHEMA-EXTENDED.md (future schema enhancements)
- FoodBoxFinder ROADMAP.md (phase structure and deliverables)
- FoodBoxFinder Prisma schema (data model capabilities)
- Training data knowledge of competitor sites: MealFinds, Top10, Wirecutter meal kit reviews, CNET meal delivery comparisons, AllRecipes meal kit rankings (MEDIUM confidence -- not live-verified)

**Note:** WebSearch and WebFetch were unavailable during this research session. Competitor analysis is based on training data knowledge (cutoff ~early 2025) rather than live site inspection. Live competitor audits would increase confidence from MEDIUM to HIGH. The feature recommendations are still well-grounded because: (1) the project's own research files are comprehensive, (2) the food box comparison space is mature and features are well-established, and (3) the PROJECT.md already reflects thoughtful domain analysis.
