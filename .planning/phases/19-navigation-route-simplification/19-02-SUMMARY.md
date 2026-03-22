---
phase: 19-navigation-route-simplification
plan: 02
subsystem: ui, seo, routing
tags: [next.js, proxy, sitemap, redirect, 301, seo]

# Dependency graph
requires:
  - phase: 17-unified-discovery-page
    provides: /search page with category filter param support
  - phase: 19-navigation-route-simplification
    plan: 01
    provides: Simplified header/footer/mobile nav links
provides:
  - Homepage category cards linking to /search?category={slug}
  - 301 permanent redirects for 5 old category URLs via proxy.ts
  - Updated sitemap with /search (priority 0.9) and /search?category={slug} variants (priority 0.8)
affects: [seo, crawlers, external-links]

# Tech tracking
tech-stack:
  added: []
  patterns: [proxy.ts category redirect pattern with Set-based slug lookup]

key-files:
  modified:
    - src/app/page.tsx
    - src/proxy.ts
    - src/app/sitemap.ts

key-decisions:
  - "301 permanent redirect preserves SEO link equity for old category URLs"
  - "/search priority raised from 0.5 to 0.9 as primary discovery page"
  - "Search category pages use priority 0.8 (down from 0.9) since they are filtered views"

patterns-established:
  - "proxy.ts category redirect: Set-based O(1) slug lookup before admin auth check"

requirements-completed: [NAV-02, NAV-03, NAV-04]

# Metrics
duration: 2min
completed: 2026-03-22
---

# Phase 19 Plan 02: Homepage Links, Category Redirects, and Sitemap Update Summary

**Homepage category cards link to /search?category={slug}, old /{category} URLs permanently redirect via proxy.ts, sitemap updated for new URL structure**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-22T21:41:18Z
- **Completed:** 2026-03-22T21:43:26Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Homepage hero quick-links and Browse by Category cards now link to /search?category={slug} instead of /{slug}
- proxy.ts redirects 5 old category URLs (meal-kits, prepared-meals, protein-boxes, produce-boxes, specialty) with 301 permanent status to /search?category={slug}
- Sitemap updated: /search promoted to priority 0.9, old /{category} entries replaced with /search?category={slug} at priority 0.8

## Task Commits

Each task was committed atomically:

1. **Task 1: Update homepage category links and add proxy.ts redirects** - `5d01287` (feat)
2. **Task 2: Update sitemap to remove old category pages and add /search variants** - `981a994` (feat)

## Files Created/Modified
- `src/app/page.tsx` - Updated 2 category link sections (hero quick-links + Browse by Category) to use /search?category={slug}
- `src/proxy.ts` - Added category slug redirect logic with Set-based O(1) lookup before admin auth, expanded matcher config
- `src/app/sitemap.ts` - Replaced categoryPages with searchCategoryPages, raised /search priority to 0.9

## Decisions Made
- Used 301 (permanent) redirect instead of 302 (temporary) to preserve SEO link equity from any inbound links to old category URLs
- Raised /search sitemap priority from 0.5 to 0.9 since it is now the primary discovery entry point
- Search category variant pages get priority 0.8 (down from 0.9) since they are filtered views of /search, not standalone pages
- Category slug Set built at module level (not per-request) for O(1) lookup performance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 19 complete - all navigation and route simplification done
- Old category URLs safely redirect with 301 for SEO preservation
- Sitemap correctly reflects the new unified discovery URL structure

## Self-Check: PASSED

All files exist and all commits verified.

---
*Phase: 19-navigation-route-simplification*
*Completed: 2026-03-22*
