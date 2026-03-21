---
phase: 02-query-layer-and-filter-infrastructure
plan: 01
subsystem: api
tags: [prisma, react-cache, filters, url-params, server-only]

# Dependency graph
requires:
  - phase: 01-data-foundation
    provides: Prisma schema with Provider model, dataset fields, enums (ProviderStatus, ValueTier, CategoryType, DietaryTag)
provides:
  - ProviderFilters type and parseProviderFilters function for typed URL search param parsing
  - Null-aware filter helpers (nullAwareStringFilter, nullAwareEnumFilter) for sparse data queries
  - Known value group constants (PREP_STYLE_GROUPS, MODEL_TYPE_GROUPS, GEOGRAPHY_GROUPS, HOUSEHOLD_FIT_VALUES)
  - Split query layer with domain files (providers, content, admin) and barrel re-export
  - SORT_OPTIONS and SortOption type for listing sort control
  - VALUE_TIER_SLUGS for URL slug to enum mapping
affects: [category-listing-pages, homepage, provider-detail, comparison, search, admin]

# Tech tracking
tech-stack:
  added: []
  patterns: [null-aware-filtering, grouped-string-matching, barrel-re-export, server-only-leaf-files]

key-files:
  created:
    - src/lib/filters.ts
    - src/lib/queries/index.ts
    - src/lib/queries/providers.ts
    - src/lib/queries/content.ts
    - src/lib/queries/admin.ts
  modified: []

key-decisions:
  - "Grouped string matching for prepStyle (37 values -> 8 groups) and modelType (11 values -> 5 groups) using contains matching"
  - "Null-aware filtering includes providers with null/empty values for sparse fields (valueTier 8%, householdFit 4%, geography 9%)"
  - "server-only import on leaf query files only, not on barrel index.ts"

patterns-established:
  - "Null-aware filter pattern: OR(match, null, empty) for sparse string fields"
  - "Group-based filter matching: URL slug maps to matchPattern used in Prisma contains query"
  - "Domain-scoped query split with barrel re-export for backward compatibility"

requirements-completed: [FILTER-01, QUERY-01, QUERY-03]

# Metrics
duration: 3min
completed: 2026-03-21
---

# Phase 02 Plan 01: Filter Parsing Module and Query Layer Split Summary

**9-dimension filter parser with null-aware helpers for sparse data, and domain-scoped query split into providers/content/admin with barrel re-export**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-21T21:40:29Z
- **Completed:** 2026-03-21T21:43:35Z
- **Tasks:** 2
- **Files modified:** 6 (1 created, 4 created, 1 deleted)

## Accomplishments
- Created filter parsing module with ProviderFilters type, parseProviderFilters function, 4 known value group constants, sort options, value tier slug mapping, and null-aware filter helpers
- Split 336-line queries.ts into 3 domain files (providers 130 lines, content 120 lines, admin 60 lines) with barrel re-export preserving all existing import paths
- All 18 query functions preserved with React.cache() wrappers intact

## Task Commits

Each task was committed atomically:

1. **Task 1: Create filter parsing module with types and known value groups** - `f7c78b8` (feat)
2. **Task 2: Split queries.ts into domain files with barrel re-export** - `a21e744` (refactor)

## Files Created/Modified
- `src/lib/filters.ts` - Filter parsing types, known value groups, parseProviderFilters, null-aware helpers (298 lines)
- `src/lib/queries/providers.ts` - 7 provider query functions with server-only and cache() wrappers
- `src/lib/queries/content.ts` - 9 search/blog/collection query functions with server-only and cache() wrappers
- `src/lib/queries/admin.ts` - 3 admin/analytics query functions with server-only and cache() wrappers
- `src/lib/queries/index.ts` - Barrel re-export of all 19 functions for backward compatibility
- `src/lib/queries.ts` - DELETED (replaced by queries/ directory)

## Decisions Made
- Grouped string matching for high-cardinality fields: prepStyle (37 distinct values grouped into 8 filter categories) and modelType (11 values into 5 groups) using Prisma `contains` with `insensitive` mode
- Null-aware filtering essential for sparse fields: OR(match, null, empty) pattern ensures providers with unpopulated fields still appear in filtered results
- `server-only` import placed on each leaf file (providers.ts, content.ts, admin.ts) but NOT on barrel index.ts to prevent redundant guard and follow pitfall 5 guidance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all exports are fully functional implementations.

## Next Phase Readiness
- Filter infrastructure ready for Phase 02 Plan 02 (enhanced getProvidersByCategory/getFilteredProviders)
- Barrel re-export ensures zero disruption to existing page imports
- parseProviderFilters ready to consume in category listing pages (Phase 04/05)

## Self-Check: PASSED

- All 5 created files verified present on disk
- Old src/lib/queries.ts confirmed removed
- Both task commits (f7c78b8, a21e744) found in git log
- TypeScript compilation passes with zero errors

---
*Phase: 02-query-layer-and-filter-infrastructure*
*Completed: 2026-03-21*
