# FoodBoxFinder SEO Strategy

## URL Structure

### Dual Comparison URL Pattern
- `/compare/hellofresh-vs-blue-apron` — SEO-optimized 2-provider "vs" pages (slug-based, indexable)
- `/compare?providers=a,b,c` — Flexible 3-4 provider comparison tool (query-based, noindex)
- Canonical ordering: alphabetical by slug. `/compare/blue-apron-vs-hellofresh` 301-redirects to `/compare/blue-apron-vs-hellofresh` (already alphabetical).

### Additional Pages for E-E-A-T
- `/methodology` — How we rank and review providers (important for Google E-E-A-T)

## Metadata Templates

| Page Type | Title Template |
|---|---|
| Homepage | `FoodBoxFinder — Compare Meal Kits & Food Delivery Boxes` |
| Category | `Best {Category} of 2026 — Compare & Save \| FoodBoxFinder` |
| Provider | `{Provider} Review 2026: Pricing, Plans & Honest Verdict \| FoodBoxFinder` |
| Best Of | `{N} Best {Topic} in 2026 (Tested & Ranked) \| FoodBoxFinder` |
| Comparison | `{Provider A} vs {Provider B}: Which Is Better in 2026? \| FoodBoxFinder` |
| Blog | `{Post Title} \| FoodBoxFinder` |

## JSON-LD Schemas Per Page Type

- **Provider detail**: Product + AggregateRating + Review + AggregateOffer + BreadcrumbList
- **Category/Best Of**: ItemList + BreadcrumbList + FAQPage (if FAQ section present)
- **Comparison**: Product (x2) + BreadcrumbList
- **Blog posts**: Article + BreadcrumbList
- **All pages**: BreadcrumbList

## robots.txt
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Sitemap: https://foodboxfinder.com/sitemap.xml
```

## Sitemap Priority
- Category/best-of pages: weekly, priority 0.9
- Provider pages: weekly, priority 0.8
- Comparison pages: monthly, priority 0.7
- Blog posts: monthly, priority 0.6

## Target Keywords (Priority Order for New Site)

### Phase 1 — Long-tail (Months 1-3)
- best meal kits for families, cheapest meal kits, best keto meal delivery
- best vegan meal kits, meal kits for one person, best gluten free meal delivery
- Brand reviews: hellofresh review, factor meals review, blue apron review

### Phase 2 — Mid-funnel (Months 4-8)
- Brand vs brand: hellofresh vs blue apron, factor vs freshly
- Expand best-of pages to 30-50
- How-to and promo code blog posts

### Phase 3 — Head terms (Months 9-18)
- meal kits, meal delivery service, best meal kits, prepared meal delivery

## Internal Linking Strategy (Hub & Spoke)
- Category pages (hubs) → all relevant provider pages (spokes)
- Provider pages → their category + comparison pages involving them
- Best-of pages → each listed provider's detail page
- Provider pages → "Similar Services" section (3-5 related providers)
- Blog posts → relevant provider, best-of, and comparison pages
