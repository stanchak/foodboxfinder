# Phase 8: Search - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify and update the existing search functionality: server-side search across providers, search results page, and debounced expandable search bar in header.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All decisions at Claude's discretion. Search already exists:
- searchProviders() query in queries/providers.ts
- HeaderSearchForm.tsx expandable search input
- SearchInput.tsx controlled input component
- /search/page.tsx search results page

Assess what needs updating vs what already works with the new schema.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/queries/providers.ts` -- searchProviders() with ILIKE on name/description/category
- `src/components/HeaderSearchForm.tsx` -- expandable search in header
- `src/components/SearchInput.tsx` -- controlled debounced input
- `src/app/search/page.tsx` -- search results page with provider cards
- `src/components/ProviderCard.tsx` -- already updated with all new fields

### Integration Points
- Header component includes HeaderSearchForm
- Search results use ProviderCard for display

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- verify existing search works and update if needed

</specifics>

<deferred>
## Deferred Ideas

None

</deferred>
