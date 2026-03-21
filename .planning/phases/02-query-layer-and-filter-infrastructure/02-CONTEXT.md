# Phase 2: Query Layer and Filter Infrastructure - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Build centralized query functions with React.cache() wrapping and a type-safe filter parsing module that handles all 9 filter dimensions from URL search params.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion -- pure infrastructure phase. Key areas:
- How to split queries.ts if it exceeds 300 lines (by domain vs by page vs by operation type)
- Filter parser return type structure for the typed ProviderFilters object
- How to handle the new enum fields (ProviderStatus, ValueTier) in filter parsing alongside existing CategoryType and DietaryTag
- Safe defaults for each filter dimension when values are invalid or missing
- Whether to use Prisma's type-safe where clause building or manual query construction

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/queries.ts` -- existing query layer with 18+ React.cache() functions (336 lines, already at split threshold)
- `src/lib/categories.ts` -- existing bidirectional slug/enum mapping pattern to replicate for new enums
- `src/lib/db.ts` -- Prisma singleton
- `src/lib/format.ts` -- price formatting utilities
- `src/generated/prisma/client` -- generated types including new ProviderStatus and ValueTier enums

### Established Patterns
- All query functions wrapped in `cache()` from React
- `import "server-only"` at top of queries.ts
- Prisma type-safe API for all queries (no raw SQL)
- URL search params parsed inline in page components currently (needs extraction)

### Integration Points
- Category pages (`src/app/[category]/page.tsx`) currently parse searchParams inline -- will consume the new filter module
- New enum fields on Provider model from Phase 1 (modelType, prepStyle, valueTier, etc.)
- Filter UI components will consume typed filter objects (Phase 5)

</code_context>

<specifics>
## Specific Ideas

- Filter dimensions: category, dietaryTags, prepStyle, valueTier, householdFit, modelType, geography, flexibility, status
- Null-aware filtering: providers with empty values for a filter field should pass through (not be excluded)
- Filter parser must validate and sanitize all URL params, falling back to safe defaults for invalid values
- Sort options: featured/editorial, rating, name A-Z, value tier

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>
