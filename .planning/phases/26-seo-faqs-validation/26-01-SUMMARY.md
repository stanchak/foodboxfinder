---
phase: 26-seo-faqs-validation
plan: 01
subsystem: database
tags: [seo, meta-tags, faq, prisma, template-generation, xai]

# Dependency graph
requires:
  - phase: 24-bulk-content-enrichment
    provides: provider descriptions and shortDescriptions for meta template
  - phase: 25-pricing-plans
    provides: Plan records with pricing data for FAQ generation
provides:
  - SEO meta + FAQ generation script (prisma/scripts/26-generate-meta-faqs.ts)
  - Template-based metaTitle generation (max 70 chars)
  - Template-based metaDescription generation (max 160 chars)
  - Template-based FAQ generation (pricing, dietary, flexibility)
  - Optional xAI API enhancement with graceful fallback
affects: [26-02, 26-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [template-fallback-generation, idempotent-data-scripts]

key-files:
  created:
    - prisma/scripts/26-generate-meta-faqs.ts
  modified: []

key-decisions:
  - "Template-only approach validated as primary strategy since xAI credits exhausted"
  - "metaDescription uses shortDescription or first 120 chars of description plus standard suffix"
  - "FAQ generation creates exactly 3 questions: pricing, dietary, flexibility"

patterns-established:
  - "Template-based SEO content generation from existing provider data fields"
  - "Idempotent script: skip providers with existing metaTitle and 2+ FAQs"

requirements-completed: [R26.1, R26.2]

# Metrics
duration: 3min
completed: 2026-03-23
---

# Phase 26 Plan 01: SEO Meta & FAQ Generation Script Summary

**Template-based script generating metaTitle (under 70 chars), metaDescription (under 160 chars), and 3 FAQ records per provider from existing data, with optional xAI API enhancement and graceful fallback**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-23T06:17:44Z
- **Completed:** 2026-03-23T06:21:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Built 565-line script with template-based meta and FAQ generation from existing provider data
- Template metaTitles follow pattern: "{Name} Review {Year} - {Category} | FoodBoxFinder" with cascading truncation for long names
- Template metaDescriptions combine shortDescription/description prefix with standard call-to-action suffix
- Template FAQs pull real pricing from Plans, dietary tags from ProviderDietaryTag, and flexibility text
- Idempotency: never overwrites existing meta, skips providers with 2+ FAQs
- Successfully tested on dinnerly: metaTitle 47 chars, metaDescription 160 chars, 3 ProviderFaq records created
- Re-run confirmed idempotency (SKIP messages for already-populated provider)

## Task Commits

Each task was committed atomically:

1. **Task 1: Build SEO meta + FAQ generation script with template fallback** - `699fcab` (feat)
2. **Task 2: Test script against single live provider** - no code changes (testing only, validated existing script against live database)

## Files Created/Modified
- `prisma/scripts/26-generate-meta-faqs.ts` - SEO meta and FAQ generation script with template fallback and xAI API integration

## Decisions Made
- Template-only approach is the primary strategy since xAI credits remain exhausted (429 errors from Phase 24/25)
- metaDescription formula: first 120 chars of shortDescription or description + " Compare plans, pricing & dietary options on FoodBoxFinder." suffix
- FAQ questions are fixed to 3 topics (pricing, dietary options, cancellation/skip flexibility) since these are the most common search queries
- Script uses Prisma transaction for FAQ batch creation per provider for atomicity

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all generated content uses real provider data from the database.

## Next Phase Readiness
- Script ready for batch execution in Plan 26-02 (run against all ~97 remaining providers)
- 18 hand-crafted providers will be automatically skipped
- dinnerly already processed as test case (1 provider done, ~97 remaining)
- Template fallback ensures 100% coverage regardless of xAI API availability

---
*Phase: 26-seo-faqs-validation*
*Completed: 2026-03-23*
