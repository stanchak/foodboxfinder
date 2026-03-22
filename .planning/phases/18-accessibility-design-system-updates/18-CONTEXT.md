# Phase 18: Accessibility & Design System Updates - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Update the entire design system for elderly-friendly accessibility — larger fonts, bigger touch targets, category color coding, and increased component sizing across all existing components and pages. This is a cross-cutting styling phase that touches globals.css, Button, Badge, ProviderCard, and other core components.

</domain>

<decisions>
## Implementation Decisions

### Typography Scale (from brand agent)
- All body text: text-base (16px) minimum, never text-sm for content
- Card headings: text-lg lg:text-xl font-bold (18-20px)
- Card descriptions: text-base (16px)
- Filter labels: text-base font-semibold (16px)
- Badge text: text-xs (12px) minimum, up from 11px
- Price display: text-xl lg:text-2xl font-bold (20-24px)
- Rating numeric: text-base font-medium (16px)
- Navigation links: text-base font-medium (16px)
- Button md: px-5 py-3 text-base (48px min height)
- Button lg: px-7 py-3.5 text-lg (52px min height)

### Component Sizing
- ProviderCard padding: p-6 (up from p-5)
- ProviderCard image height: h-48 lg:h-52 (up from h-44)
- Card grid gap: gap-6 lg:gap-8 (up from gap-6)
- Results grid: lg:grid-cols-3 on desktop (not 4)
- Badge padding: px-2.5 py-1 (up from px-2 py-0.5)
- Checkbox/radio: h-5 w-5 (up from h-4 w-4)
- Filter option rows: min-h-[44px]

### Category Color System (from brand agent)
- Meal Kits: oklch orange (reuses primary palette) — hue 38-55
- Prepared Meals: oklch warm berry — hue 340-350
- Protein Boxes: oklch rich amber/sienna — hue 48-70
- Produce Boxes: oklch garden green — hue 148-150
- Specialty: oklch teal (reuses accent palette) — hue 185-190
- Add category color tokens to globals.css as --color-cat-* custom properties
- Badge component gets per-category color mapping
- ProviderCard gets colored top-border accent (border-t-3)

### Touch Targets
- All interactive elements: 44px minimum (WCAG 2.5.8)
- Filter chips: min-h-[48px]
- Category tabs: min-h-[48px]
- Pagination buttons: min-w-[44px] min-h-[44px]

### Claude's Discretion
- Exact oklch values for category color tokens (use brand agent's spec)
- Whether to add category icons to badges
- Skeleton dimension updates
- Loading bar thickness

</decisions>

<code_context>
## Existing Code Insights

### Files to Modify
- src/app/globals.css — add category color tokens
- src/components/Button.tsx — increase size map values
- src/components/Badge.tsx — increase text/padding, add per-category colors
- src/components/ProviderCard.tsx — increase text sizes, padding, image height, add category border
- src/components/CategoryFilters.tsx — increase filter text/checkbox sizes
- src/components/Pagination.tsx — increase touch targets
- src/components/RatingStars.tsx — increase sizes
- src/components/Header.tsx — increase nav link text
- src/components/Skeleton.tsx — increase dimensions
- src/lib/categories.ts — add category color mapping constant

### Established Patterns
- oklch color space for all design tokens
- Tailwind CSS 4 @theme block for custom properties
- Component variant maps (colorMap in Badge, sizes in Button)

</code_context>

<specifics>
## Specific Ideas

- User: "left filtering and all nav should be bigger and easy for old people to see"
- User: "add buttons when appropriate"
- User: "make sure fonts are big enough to see"
- Brand agent provided full Tailwind class change cheat sheet
- Category colors must be distinguishable in grayscale (WCAG 1.4.1)

</specifics>

<deferred>
## Deferred Ideas

- None — all sizing and color changes are in scope for this phase
</deferred>
