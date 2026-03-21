# Phase 7: Side-by-Side Comparison - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Update the existing comparison page and floating comparison tray to display new schema fields, add canonical slug ordering, hide N/A rows, and ensure comparison page SEO metadata is correct.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All decisions at Claude's discretion. The comparison system already exists:
- ComparisonTable.tsx with side-by-side field matrix
- CompareProvider.tsx with sessionStorage-backed context (useSyncExternalStore)
- CompareBar.tsx floating tray at bottom
- AddToCompareButton.tsx on provider cards
- /compare/[versus]/page.tsx for canonical 2-provider comparisons
- /compare/page.tsx for flexible N-provider comparisons via search params
- getProvidersForComparison() query

Key areas for Claude's discretion:
- Which new fields to add to the comparison matrix
- How to implement canonical slug ordering (alphabetical sort)
- N/A row hiding logic
- Whether ComparisonTable needs new field rows or just updating existing ones
- JSON-LD structured data type for comparison pages

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ComparisonTable.tsx` -- existing comparison table component
- `src/components/CompareProvider.tsx` -- client context with useSyncExternalStore + sessionStorage
- `src/components/CompareBar.tsx` -- floating tray (shows selected, navigate to compare)
- `src/components/AddToCompareButton.tsx` -- button for cards
- `src/app/compare/[versus]/page.tsx` -- canonical 2-provider comparison route
- `src/app/compare/page.tsx` -- flexible comparison via search params
- `src/lib/queries/providers.ts` -- getProvidersForComparison()

### Integration Points
- New Provider fields from Phase 1 need display in comparison matrix
- ProviderLogo already integrated in ComparisonTable
- CompareBar already works across all pages via layout-level CompareProvider

</code_context>

<specifics>
## Specific Ideas

- Canonical slug ordering: sort slugs alphabetically in URL to prevent duplicate content
- Hide rows where ALL compared providers have null/empty values
- Add new fields to comparison: prepStyle, valueTier, householdFit, modelType, geography, flexibility, shippingNotes

</specifics>

<deferred>
## Deferred Ideas

None

</deferred>
