# FoodBoxFinder UX Strategy

## User Personas

| Persona | % Traffic | Key Need | Decision Factors |
|---------|-----------|----------|-----------------|
| Busy Professional | 40% | Save time on weeknight dinners | Price/serving, prep time, variety, cancel flexibility |
| Health-Conscious Planner | 25% | Match specific dietary need | Dietary certification, ingredient quality, menu variety within restriction |
| Family Feeder | 20% | Affordable kid-friendly meals | Servings/meal, kid-friendly options, cost per family serving |
| SEO Arrival | 15% | Quick answer to comparison/ranking query | Speed of answer, editorial credibility, clear structure |

## Component Architecture

### Critical Components (Build First)
- **ProviderCard** — Logo, name, rating (stars + count), price/serving range, dietary tags, editorial one-liner, compare checkbox, CTA buttons
- **ComparisonTable** — Side-by-side grid with winner highlighting per row. Mobile: swipeable card stack
- **ComparisonTray** — Sticky bottom bar showing selected providers (max 4), persists across navigation
- **FilterSidebar** — Desktop: persistent left sidebar (250px). Mobile: full-screen drawer
- **PricingTable** — Provider's plans with feature matrix
- **RatingStars** — 1-5 with half-star support, aria-label
- **FaqAccordion** — Collapsible with JSON-LD schema
- **BreadcrumbNav** — On all interior pages

### Tier 1 Filters (Always Visible)
- Category: multi-select chips
- Price Per Serving: range slider ($3-$15+)
- Dietary Options: multi-select checkboxes (16 options)
- Servings Per Week: chips (2, 3, 4, 5, 6+)

### Sort Options
- Our Rating (default), Price Low-High, Price High-Low, Most Reviewed, Newest, Best Value

## Layout Strategy

| Page | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| Homepage | Stacked hero, 2-col categories, horizontal scroll featured | 3-col categories, 2-col grid | 5-col categories, 3-4 col grid |
| Category | Filter button + drawer, single-col cards | Collapsible sidebar, 2-col grid | Persistent sidebar, 3-col grid |
| Provider Detail | Stacked, sticky bottom CTA, tabbed sections | 2-col (65% main + 35% sticky sidebar) | Same with more spacing |
| Comparison | Swipeable card stack with pill selector | 2-col table, horizontal scroll for 3-4 | Full side-by-side table |
| Collection | Numbered list, condensed cards | Wider cards with inline detail | Full editorial + comparison summary |

## Breakpoints (Tailwind CSS 4)
- Base (0px): Mobile phones
- sm (640px): Large phones/small tablets
- md (768px): Tablets — sidebar filters begin
- lg (1024px): Laptops — 3-col grid, persistent sidebar
- xl (1280px): Desktop — max-width container
- 2xl (1536px): Large desktop — same layout, more whitespace

## Accessibility Requirements
- Color contrast: 4.5:1 minimum (3:1 large text)
- Touch targets: 44x44px minimum
- All filters have visible labels (not just placeholders)
- Star ratings: aria-label="4.5 out of 5 stars"
- Comparison table: proper <table> with scope attributes
- Skip navigation links on browse pages
- prefers-reduced-motion respected on all animations

## Performance Targets
- LCP < 2.5s, FID < 100ms, CLS < 0.1
- Total initial page weight < 500KB
- Filter interactions feel instant (< 200ms response)

## ProviderCard Spec (Most Important Component)
```
+-----------------------------------------------+
| [Logo]  Provider Name              [Compare ☐] |
|         ★★★★½ 4.5 (128 reviews)               |
|-----------------------------------------------|
| $7.99 - $11.99 / serving                      |
| [Keto] [Gluten-Free] [Organic]                |
| "Great variety with easy 20-min recipes."      |
| [View Details]              [Visit Site →]     |
+-----------------------------------------------+
```
Info hierarchy: Name → Rating → Price → Dietary → Summary → Actions

## Key UX Metrics
- Bounce rate on collection pages: < 40%
- Category → provider detail CTR: > 35%
- Comparison feature usage: > 15% of category visitors
- Filter usage: > 40% of category visitors
- External CTA CTR on provider detail: > 8%
