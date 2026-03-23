# Phase 23: Market Expansion - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Add ~22 missing Tier 1 and Tier 2 providers identified in the v3 market gap research to the database. Create provider records with basic fields (name, slug, website, category, status, modelType, prepStyle), obtain or generate logos, and verify all new providers render correctly on the site.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — infrastructure/data phase.

Key data inputs from research:
- Tier 1 (10 must-adds): Clean Eatz Kitchen, Tempo, Rastelli's, Sea to Table, Cometeer, TokyoTreat, Japan Crate, Munch Addict, Heatonist/Hot Ones, Melissa's Produce
- Tier 2 (12 should-adds): Sprinly, ModifyHealth, MealPro, MegaFit Meals, Methodology, Primal Pastures, Alaskan Salmon Company, Wild Tide Seafoods, Frog Hollow Farm, Seoulbox, SnackFever, Fuego Box
- Full provider details in .planning/research/v3-market-gaps.md
- Logo strategy: use logo.clearbit.com or img.logo.dev (already in remotePatterns) for initial logos, with fallback to generated SVG placeholders
- New providers should use the same seed script pattern as prisma/seed.ts

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `prisma/seed.ts` — Existing seed script for bulk provider creation
- `prisma/scripts/22-status-cleanup.ts` — Recent migration script pattern
- `public/assets/providers/manifest.json` — Logo manifest to update
- `src/lib/categories.ts` — Category enum mappings

### Established Patterns
- Provider creation: Prisma upsert by slug
- Logo storage: public/assets/providers/{slug}.{ext} with manifest.json
- Category assignment: CategoryType enum (MEAL_KIT, PREPARED_MEAL, PROTEIN_BOX, PRODUCE_BOX, SPECIALTY)
- Status: ProviderStatus enum (ACTIVE, HYBRID, UNCLEAR, DISCONTINUED)

### Integration Points
- New providers auto-appear on /search when status is ACTIVE
- Provider detail pages at /providers/[slug] auto-generated
- Sitemap at /sitemap.ts picks up new slugs

</code_context>

<specifics>
## Specific Ideas

No specific requirements — data expansion phase. Use xAI Responses API for any real-time research needed.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
