# Phase 5: Category Browsing and Filtering - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Build category hub pages with editorial intro, provider card grid, multi-criteria filtering sidebar (9 dimensions), sort options, mobile filter drawer, active filter chips, noindex on filtered pages, and SEO metadata with JSON-LD.

</domain>

<decisions>
## Implementation Decisions

### Filter UX
- No filter counts per option -- simpler, avoids extra queries
- Filters apply on change (Kayak-style instant URL update)
- Active filter chips shown above results with remove buttons
- "Reset all" button to clear all filters at once

### Category Page Layout
- Left sidebar for filters on desktop, drawer on mobile
- Short 2-3 sentence editorial intro per category for SEO
- Grid layout: 3 columns desktop, 2 tablet, 1 mobile
- "Showing X of Y providers" count above results

### Claude's Discretion
All remaining implementation details at Claude's discretion:
- Filter section grouping and ordering in sidebar
- Mobile drawer trigger button placement and style
- Editorial intro content per category
- Sort option UI (dropdown vs tabs)
- Active filter chip design
- noindex implementation approach
- How to handle the "all providers" view vs category-specific view
- Card density and spacing

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/[category]/page.tsx` -- existing category page with provider grid, inline filter parsing, pagination
- `src/components/CategoryFilters.tsx` -- existing client component with filter sidebar + mobile drawer
- `src/components/ProviderCard.tsx` -- existing provider card component (already uses ProviderLogo)
- `src/lib/filters.ts` -- Phase 2 filter parsing module with parseProviderFilters and all 9 dimensions
- `src/lib/queries/providers.ts` -- Phase 2 getFilteredProviders with null-aware 9-dimension filtering
- `src/lib/categories.ts` -- slug/enum bidirectional mapping
- `src/components/Badge.tsx` -- existing badge component
- `src/components/Pagination.tsx` -- existing pagination component

### Established Patterns
- URL search params drive filter/sort state
- Category pages use generateStaticParams for all 5 slugs
- Server Component pages with Client Component filter sidebar
- generateMetadata() for SEO + ItemList JSON-LD

### Integration Points
- parseProviderFilters(searchParams) from filters.ts feeds into getFilteredProviders()
- CategoryFilters component reads/writes URL search params via useRouter/useSearchParams
- ProviderCard already displays all needed info (logo, name, badges, summary, CTA)

</code_context>

<specifics>
## Specific Ideas

- Existing CategoryFilters component already has filter sidebar structure with mobile drawer -- needs updating for new filter dimensions
- Existing category page already has provider grid -- needs to use new getFilteredProviders query
- 5 categories: meal-kits, prepared-meals, protein-boxes, produce-boxes, specialty
- Sort options: featured (default), rating, name A-Z, value tier

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>
