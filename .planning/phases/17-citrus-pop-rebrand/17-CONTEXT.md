# Phase 17: Unified Discovery Page - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a single /search page that replaces the current category-specific listing pages. All 95+ providers are browsable, filterable, and searchable from one unified interface — like Kayak combines flights/hotels/cars. The page has a prominent search bar, category quick-filter tabs, a large left sidebar with all 9 filter dimensions, and a responsive provider card grid. URL search params drive all state.

</domain>

<decisions>
## Implementation Decisions

### Route & Data Layer
- Route is `/search` (replaces existing search page, not a new route)
- `getFilteredProviders()` already supports cross-category queries (category is optional in ProviderFilters)
- Add `textQuery` and `freeShipping` to ProviderFilters interface
- Text search combines with filters via AND logic (Prisma contains on name/shortDescription/description)
- Page size increases to 18 (fills 3x6 grid)
- URL params: `?q=`, `?category=meal-kits`, `?diet=VEGAN,KETO`, `?prep=`, `?valueTier=`, `?household=`, `?model=`, `?geo=`, `?freeShipping=1`, `?sort=`, `?page=`

### Page Layout
- Full-width page with max-w-[1440px] container (wider than current max-w-7xl)
- Hero search bar area at top with gradient background (from-primary-50 to-white)
- Horizontal category quick-filter tabs below search (Kayak-style pill buttons)
- Two-column layout on desktop: 320px left sidebar + flexible results grid
- Single column on mobile with bottom-sheet filter drawer
- Results grid: 1 col mobile, 2 col tablet, 3 col desktop with gap-6 lg:gap-8

### Search Bar
- Prominent full-width input in hero area: text-lg (18px), py-4, rounded-2xl, shadow-lg
- Search icon 24px, embedded "Search" button inside input
- 400ms debounce on text input, updates URL ?q= param
- Result count displayed below: "95 food box subscriptions found" with aria-live="polite"
- No autocomplete in this phase (deferred to future)

### Category Quick-Filter Tabs
- Horizontal row of pill buttons: "All", "Meal Kits (24)", "Prepared Meals (18)", etc.
- Each tab shows category count from getCategoryCounts()
- Active tab: bg-primary-600 text-white shadow-md
- Inactive: bg-neutral-100 text-neutral-700 hover:bg-neutral-200
- Horizontal scroll with snap on mobile, flex-wrap on desktop
- Min height 48px per tab, text-base font-bold, px-5 py-3

### Filter Sidebar (Left)
- Width: w-80 (320px) — wider than current w-64
- Sticky below header, scrollable with max-h-[calc(100vh-8rem)]
- Filter heading: "Filters" text-xl font-bold
- "Clear All (N)" link when filters active
- Tier 1 (always visible, button-chip style): Dietary Preferences (multi-select chips), Prep Style (single-select chips), Value Tier (2x2 grid with $ icons)
- Tier 2 (always visible, toggles): Household Fit (chips), Free Shipping (toggle switch), Flexibility (toggle)
- Tier 3 (collapsible): Model Type (radio group), Geography (radio group)
- Sort By dropdown at top of sidebar
- All filter text: text-base (16px minimum)
- All filter chips: min-h-[48px] px-4 py-2.5 rounded-xl border-2
- Selected chips: border-primary-600 bg-primary-50 text-primary-700
- Checkboxes/radios: h-5 w-5 (20px)

### Mobile Filters
- Bottom sheet pattern (slides up from bottom, not side drawer)
- Max height 85vh, rounded-t-3xl
- Drag handle at top, sticky footer with "Clear All" + "Show N Results" buttons
- Focus trap and body scroll lock when open
- Sticky filter bar on scroll: result count + "Filters (N)" button

### Results Area
- Active filter chips above grid with individual remove buttons
- Result count with aria-live: "Showing 1-18 of 95 providers"
- Provider cards use existing ProviderCard component (sizing updates in Phase 18)
- Pagination at bottom (existing component, basePath="/search")

### Zero Results State
- Centered layout with illustration area, text-xl heading, text-base body
- "No providers match your filters" message
- Prominent "Clear All Filters" primary button + "Browse All" secondary button

### Claude's Discretion
- Exact animation timing for filter transitions
- Whether to add "New" badge for recently added providers
- Loading skeleton layout details
- Exact JSON-LD schema choice (SearchResultsPage vs CollectionPage)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getFilteredProviders()` — already supports cross-category (category is optional)
- `parseProviderFilters()` — all URL param parsing (add textQuery + freeShipping)
- `CategoryFilters.tsx` — client-side filter state management pattern (rewrite for unified UI but same pattern)
- `ActiveFilterChips` — removable chip component (reuse pattern)
- `Pagination` — generic, works with any basePath
- `ProviderCard` — fully reusable
- `getCategoryCounts()` — for category tab counts
- Filter constants (PREP_STYLE_GROUPS, DIETARY_TAG_OPTIONS, etc.) — all client-safe

### Established Patterns
- URL search params as sole state source via useRouter/useSearchParams/usePathname
- Server Component fetches data, passes to Client Component for interactivity
- 400ms debounce on text input (HeaderSearchForm pattern)
- Prisma AND array composition for multi-filter queries
- Null-aware filtering for sparse fields (nullAwareStringFilter helper)

### Integration Points
- New /search/page.tsx replaces current search page
- CategoryFilters pattern rewritten as UnifiedFilters client component
- getFilteredProviders needs textQuery and freeShipping params added
- parseProviderFilters needs category URL param support (currently from route segment)
- getCategoryCounts called for tab counts
- Existing ProviderCard rendered in grid

</code_context>

<specifics>
## Specific Ideas

- User wants it to work "like Kayak" — single interface, category tabs at top
- Filters should be "bigger and easy for old people to see"
- "Add buttons when appropriate" — chip-style filter buttons, not tiny checkboxes
- UX architect spec: bottom sheet mobile filters, 320px sidebar, search in hero area
- Brand agent spec: 48px min touch targets, 16px min text, warm orange-tinted UI
- Keep compare, blog, best of as separate pages

</specifics>

<deferred>
## Deferred Ideas

- Search autocomplete dropdown (future phase)
- Grid/List view toggle (can add later)
- Category-specific colors on tabs and cards (Phase 18)
- Font size increases across all components (Phase 18)
- Navigation simplification and route redirects (Phase 19)

</deferred>
