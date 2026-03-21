---
phase: 09-seo-and-collections
plan: 01
subsystem: seo
tags: [json-ld, xss, canonical-url, metadata, seo]

# Dependency graph
requires:
  - phase: 04-provider-detail
    provides: XSS-safe JSON-LD pattern established on provider detail page
  - phase: 07-blog-collections
    provides: Blog and collection pages with JSON-LD structured data
provides:
  - XSS-safe JSON-LD rendering on all public pages
  - Canonical URLs on all 9 indexable public page types
affects: [10-admin-polish, 11-launch-readiness]

# Tech tracking
tech-stack:
  added: []
  patterns: [XSS-safe JSON-LD via .replace(/</g, '\\u003c') on all pages, alternates.canonical on all indexable metadata]

key-files:
  created: []
  modified:
    - src/app/blog/[slug]/page.tsx
    - src/app/blog/page.tsx
    - src/app/methodology/page.tsx
    - src/app/best/page.tsx
    - src/app/best/[slug]/page.tsx
    - src/app/page.tsx
    - src/app/providers/[slug]/page.tsx
    - src/app/compare/[versus]/page.tsx

key-decisions:
  - "Used relative canonical paths (not full URLs) since Next.js resolves against metadataBase"

patterns-established:
  - "Every public page JSON-LD script uses .replace(/</g, '\\u003c') after JSON.stringify"
  - "Every indexable page includes alternates.canonical in metadata export"

requirements-completed: [SEO-01, SEO-02, SEO-03, SEO-04, SEO-05]

# Metrics
duration: 2min
completed: 2026-03-21
---

# Phase 9 Plan 1: SEO Hardening Summary

**XSS-safe JSON-LD rendering on all 5 remaining pages and canonical URLs on all 9 indexable page types**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-21T23:42:13Z
- **Completed:** 2026-03-21T23:44:02Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Applied XSS-safe `.replace(/</g, "\\u003c")` to JSON.stringify(jsonLd) on all 5 pages that were missing it (blog index, blog detail, methodology, collections index, collection detail)
- Added `alternates.canonical` to metadata on all 9 indexable public page types (homepage, category, provider detail, methodology, collections index, collection detail, blog index, blog detail, versus compare)
- Verified zero unescaped JSON.stringify(jsonLd) calls remain across all public pages
- Build passes without errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix XSS-safe JSON-LD on 5 pages** - `329003d` (fix)
2. **Task 2: Add canonical URLs to all indexable pages** - `4d7da7d` (feat)

## Files Created/Modified
- `src/app/blog/[slug]/page.tsx` - Added XSS-safe JSON-LD escape and canonical URL
- `src/app/blog/page.tsx` - Added XSS-safe JSON-LD escape and canonical URL
- `src/app/methodology/page.tsx` - Added XSS-safe JSON-LD escape and canonical URL
- `src/app/best/page.tsx` - Added XSS-safe JSON-LD escape and canonical URL
- `src/app/best/[slug]/page.tsx` - Added XSS-safe JSON-LD escape and canonical URL
- `src/app/page.tsx` - Added canonical URL
- `src/app/providers/[slug]/page.tsx` - Added canonical URL
- `src/app/compare/[versus]/page.tsx` - Added canonical URL

## Decisions Made
- Used relative canonical paths (e.g., `/blog` not `https://foodboxfinder.com/blog`) because Next.js resolves them against the metadataBase which defaults to the deployment URL

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All SEO hardening complete across the site
- Ready for plan 2 (collections/sitemap verification) or subsequent phases

## Self-Check: PASSED

- All 8 modified files verified present on disk
- Both commit hashes (329003d, 4d7da7d) verified in git log

---
*Phase: 09-seo-and-collections*
*Completed: 2026-03-21*
