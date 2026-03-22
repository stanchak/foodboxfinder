---
phase: 12-critical-design-accessibility-fixes
plan: 03
subsystem: ui
tags: [react, tailwind, accessibility, comparison, stretched-link, aria]

# Dependency graph
requires:
  - phase: 07-comparison
    provides: CompareProvider context, useCompare hook, CompareBar
  - phase: 04-provider-detail
    provides: ProviderCard component, ProviderLogo
provides:
  - AddToCompareButton with z-10, stopPropagation, and aria-pressed for stretched-link compatibility
  - ProviderCard refactored with stretched-link pattern (no nested interactive elements)
  - Compare flow from listing pages via card-level compare button
affects: [13-design-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [stretched-link CSS pattern (after:absolute after:inset-0), z-10 overlay escape for interactive buttons]

key-files:
  created: []
  modified:
    - src/components/AddToCompareButton.tsx
    - src/components/ProviderCard.tsx

key-decisions:
  - "Used stretched-link CSS pattern (after:absolute after:inset-0 on heading Link) instead of wrapping entire card in Link -- enables valid HTML with interactive AddToCompareButton overlay"
  - "Added e.stopPropagation() to compare button click handler to prevent stretched-link navigation when toggling comparison"

patterns-established:
  - "Stretched-link pattern: Link inside heading with after:absolute after:inset-0, interactive elements use relative z-10 to sit above overlay"
  - "aria-pressed for toggle buttons: boolean aria-pressed communicates add/remove state to screen readers"

requirements-completed: [P0-COMPARE-BUTTON, P0-STRETCHED-LINK]

# Metrics
duration: 2min
completed: 2026-03-22
---

# Phase 12 Plan 03: Compare Button & Stretched-Link Pattern Summary

**AddToCompareButton with z-10/stopPropagation/aria-pressed, ProviderCard refactored to stretched-link pattern for valid HTML with interactive compare overlay**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-22T03:05:24Z
- **Completed:** 2026-03-22T03:07:20Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- AddToCompareButton updated with `relative z-10` to sit above stretched-link overlay, `e.stopPropagation()` to prevent card navigation, and `aria-pressed` for toggle semantics
- ProviderCard refactored from full-card Link wrapper to stretched-link CSS pattern on the heading Link, enabling valid HTML with no nested interactive elements
- Compare button placed in card logo area (bottom-right) for discovery from listing pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AddToCompareButton client component** - `b06c42c` (feat)
2. **Task 2: Refactor ProviderCard with stretched-link pattern and AddToCompareButton** - `d52c76b` (feat)

## Files Created/Modified
- `src/components/AddToCompareButton.tsx` - Added relative z-10, stopPropagation, and aria-pressed for stretched-link compatibility
- `src/components/ProviderCard.tsx` - Refactored from outer Link wrapper to stretched-link on h3, added AddToCompareButton in logo area

## Decisions Made
- Used stretched-link CSS pattern (after:absolute after:inset-0 on heading Link) instead of wrapping entire card in Link -- valid HTML with no nested interactive elements
- Added e.stopPropagation() to compare button click handler to prevent stretched-link navigation when toggling comparison
- Kept AddToCompareButton as small "sm" size in card context to avoid overwhelming the logo area

## Deviations from Plan

None - plan executed exactly as written. The AddToCompareButton file already existed from a prior phase but needed the z-10, stopPropagation, and aria-pressed enhancements specified in the plan.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all components are fully wired to the CompareProvider context.

## Next Phase Readiness
- Compare flow works end-to-end from listing pages through cards
- ProviderCard uses valid HTML with stretched-link pattern
- Ready for Phase 13 design polish improvements

## Self-Check: PASSED

All files and commits verified:
- src/components/AddToCompareButton.tsx: FOUND
- src/components/ProviderCard.tsx: FOUND
- Commit b06c42c: FOUND
- Commit d52c76b: FOUND
- 12-03-SUMMARY.md: FOUND

---
*Phase: 12-critical-design-accessibility-fixes*
*Completed: 2026-03-22*
