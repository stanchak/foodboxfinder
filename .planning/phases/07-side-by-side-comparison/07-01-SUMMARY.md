---
phase: 07-side-by-side-comparison
plan: 01
subsystem: ui
tags: [comparison, server-components, json-ld, xss, redirect, prisma]

# Dependency graph
requires:
  - phase: 06-homepage
    provides: Comparison pages and ComparisonTable component
  - phase: 01-data-foundation
    provides: Provider schema with dataset fields (prepStyle, valueTier, etc.)
provides:
  - ComparisonTable with full provider field coverage (9 new fields)
  - HideableComparisonRow N/A row hiding pattern
  - Canonical alphabetical slug ordering via permanentRedirect
  - XSS-safe JSON-LD on all comparison pages
affects: [comparison, seo, provider-detail]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - HideableComparisonRow pattern for hiding empty comparison rows
    - isFieldEmpty utility for null/undefined/empty string/empty array detection
    - parseJsonStringArray for safe JSON field parsing
    - VALUE_TIER_LABELS map for enum-to-display formatting

key-files:
  created: []
  modified:
    - src/lib/queries/providers.ts
    - src/components/ComparisonTable.tsx
    - src/app/compare/[versus]/page.tsx
    - src/app/compare/page.tsx

key-decisions:
  - "Used select clause instead of include-all in getProvidersForComparison for explicit field control"
  - "permanentRedirect (308) for canonical slug order to preserve SEO link equity"
  - "Value tier enum displayed as title case via lookup map (BUDGET -> Budget, MID -> Mid-Range)"

patterns-established:
  - "HideableComparisonRow: wraps ComparisonRow, checks if all values are empty via isFieldEmpty, returns null if all N/A"
  - "SectionHeader: extracted reusable table section header component"

requirements-completed: [COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, TRAY-01, TRAY-02, TRAY-03, TRAY-04]

# Metrics
duration: 4min
completed: 2026-03-21
---

# Phase 7 Plan 1: Side-by-Side Comparison Summary

**ComparisonTable expanded with 9 new provider fields, N/A row auto-hiding, canonical slug ordering redirect, and XSS-safe JSON-LD across all comparison pages**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-21T23:19:58Z
- **Completed:** 2026-03-21T23:24:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- ComparisonTable now displays prepStyle, valueTier, modelType, householdFit, geography, shippingNotes, flexibility, pros, and cons in organized sections (Provider Details, Pros & Cons)
- Rows where ALL compared providers have null/empty values are automatically hidden via HideableComparisonRow
- /compare/[versus] enforces alphabetical canonical slug order via permanentRedirect (308)
- All JSON-LD script tags on both comparison pages use XSS-safe .replace(/</g, '\u003c')

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand query and ComparisonTable with new fields and N/A row hiding** - `ff2eac9` (feat)
2. **Task 2: Add canonical slug ordering redirect and fix JSON-LD XSS safety** - `5e7f683` (feat)

## Files Created/Modified
- `src/lib/queries/providers.ts` - Added explicit select clause with 9 new dataset fields to getProvidersForComparison
- `src/components/ComparisonTable.tsx` - Added 9 new fields to interface, Provider Details section, Pros & Cons section, Shipping Notes/Flexibility Info rows, HideableComparisonRow, SectionHeader, isFieldEmpty, parseJsonStringArray, formatValueTier
- `src/app/compare/[versus]/page.tsx` - Added permanentRedirect for non-alphabetical slug order, XSS-safe JSON-LD
- `src/app/compare/page.tsx` - Fixed XSS-safe JSON-LD on both script tags

## Decisions Made
- Used `select` clause instead of `include`-all in getProvidersForComparison to explicitly control returned fields, avoiding accidentally leaking internal fields
- Used permanentRedirect (HTTP 308) for canonical slug ordering instead of regular redirect (307) to preserve SEO link equity
- Value tier enum displayed as title case via lookup map (BUDGET -> "Budget", MID -> "Mid-Range", PREMIUM -> "Premium", LUXURY -> "Luxury") for better readability
- Renamed "Flexibility" section to "Plan Flexibility" to distinguish from provider-level flexibility field

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all data flows are wired through the query layer and database.

## Next Phase Readiness
- Comparison feature is complete with full field coverage from the Phase 1 schema extension
- All comparison pages have consistent XSS-safe JSON-LD
- Canonical URL ordering prevents duplicate content issues

## Self-Check: PASSED

All created/modified files verified. All commit hashes found in git log.

---
*Phase: 07-side-by-side-comparison*
*Completed: 2026-03-21*
