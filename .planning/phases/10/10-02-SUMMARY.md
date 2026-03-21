---
phase: 10-database-foundation
plan: 02
subsystem: database
tags: [prisma, seed, postgresql, neon, typescript]

# Dependency graph
requires:
  - phase: 10-01
    provides: Prisma schema with Provider, Plan, Review models and integer cents pricing fields
provides:
  - 18 real food box providers seeded across 5 categories
  - Idempotent seed script at prisma/seed.ts
  - Seed data helpers (dollarsToCents, recalculateProviderPricing)
  - 34 plans with integer cents pricing
  - 77 approved reviews with varied ratings
  - 41 dietary tags and 47 FAQs
  - Denormalized min/max price and freeShipping fields populated
affects: [phase-20-design, phase-30-homepage, phase-40-category, phase-50-provider-detail, phase-60-comparison, phase-70-collections, phase-100-admin]

# Tech tracking
tech-stack:
  added: []
  patterns: [standalone PrismaClient for out-of-Next.js scripts, nested create for seed data, deleteAll-then-create idempotency]

key-files:
  created:
    - prisma/seed.ts
    - prisma/seed-data/providers.ts
    - prisma/seed-data/helpers.ts
  modified: []

key-decisions:
  - "Providers typed as Prisma.ProviderCreateInput[] for type safety with nested creates"
  - "Protein/produce boxes use pricePerBoxCents with null pricePerServingCents (not forced per-serving estimate)"
  - "All 77 reviews pre-approved (status: APPROVED) for immediate display on provider pages"
  - "Denormalized pricing recalculated post-seed via separate pass rather than pre-computed in data"

patterns-established:
  - "Seed script creates own PrismaClient with PrismaPg adapter (not src/lib/db.ts singleton)"
  - "Seed data uses Prisma.ProviderCreateInput type for compile-time validation of nested relations"
  - "recalculateProviderPricing helper reusable for admin CRUD operations in Phase 100"

requirements-completed: [DB-02]

# Metrics
duration: 9min
completed: 2026-03-21
---

# Phase 10 Plan 02: Seed Data Summary

**18 real food box providers seeded with 34 plans (integer cents), 77 reviews, 41 dietary tags, 47 FAQs, and denormalized pricing across 5 categories**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-21T03:03:44Z
- **Completed:** 2026-03-21T03:13:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created 18 editorial-quality provider definitions covering all 5 categories (MEAL_KIT: 4, PREPARED_MEAL: 4, PROTEIN_BOX: 3, PRODUCE_BOX: 3, SPECIALTY: 4)
- Each provider has genuine differentiated content: unique descriptions, specific pros/cons, realistic pricing, and varied reviews (not generic marketing copy)
- Denormalized pricing fields (minPricePerServingCents, maxPricePerServingCents, freeShipping) computed and populated for 13 providers with per-serving pricing
- Multi-category providers set: Hungryroot, Sunbasket, Green Chef, Purple Carrot all have secondaryCategory = MEAL_KIT
- Rating distribution: 2 at 3.5, 4 at 3.8-4.0, 7 at 4.1-4.3, 3 at 4.4-4.5 (realistic variance)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create seed helpers and provider data definitions** - `2825d7a` (feat)
2. **Task 2: Create main seed script and run it successfully** - `e7e395f` (feat)

## Files Created/Modified
- `prisma/seed-data/helpers.ts` - dollarsToCents and recalculateProviderPricing utilities
- `prisma/seed-data/providers.ts` - 18 provider definitions with nested plans, reviews, tags, FAQs
- `prisma/seed.ts` - Main seed orchestrator with delete-all-then-create idempotency

## Decisions Made
- Used `Prisma.ProviderCreateInput[]` type instead of custom seed interfaces for compile-time validation of all nested relation shapes
- Protein/produce box providers (ButcherBox, Crowd Cow, Good Chop, Misfits Market, Farmbox Direct) use pricePerBoxCents with null pricePerServingCents rather than forced per-serving estimates
- All 77 reviews seeded as APPROVED status for immediate availability on provider pages
- Denormalized pricing calculated in a separate post-creation pass via recalculateProviderPricing helper, making the helper reusable for future admin CRUD operations

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all data is fully populated with no placeholder values.

## Next Phase Readiness
- Database fully populated with realistic seed data for all downstream phases
- All 18 providers available for homepage (Phase 30), category listing (Phase 40), provider detail (Phase 50), and comparison (Phase 60)
- recalculateProviderPricing helper ready for reuse in admin provider CRUD (Phase 100)
- Seed script is idempotent and can be re-run safely at any time

## Self-Check: PASSED

All 3 created files verified on disk. Both commit hashes (2825d7a, e7e395f) found in git log.

---
*Phase: 10-database-foundation*
*Completed: 2026-03-21*
