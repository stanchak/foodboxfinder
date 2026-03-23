# Phase 25: Pricing & Plans - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Create Plan records with real pricing data for all ~117 providers. Handle different pricing models: per-serving (meal kits, prepared meals), per-box (protein, produce, specialty). Update denormalized min/max price fields on providers. Eliminate "Price not available" from all provider cards and detail pages.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — data/scripting phase.

Key approach from pricing research (.planning/research/v3-pricing-data.md):
- Use xAI Responses API (grok-4-1-fast-reasoning + web_search) to research current pricing per provider
- Create at least 1 Plan record per active provider
- For meal kits/prepared meals: pricePerServingCents is the primary metric
- For protein/produce/specialty: pricePerBoxCents is the primary metric, pricePerServingCents may be null
- After creating Plans, recompute denormalized Provider fields (minPricePerServingCents, maxPricePerServingCents)
- Handle complex pricing (Blue Apron a-la-carte, Hungryroot credits, Misfits grocery) with representative plans
- Skip 18 hand-crafted providers that already have Plans

### Pricing Research Quick Reference
- Meal kits: $5.99-$16.99/serving
- Prepared meals: $5.99-$33+/meal
- Protein boxes: $99-$359/box
- Produce boxes: $15-$60+/box
- Specialty: $15-$50/month

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `prisma/scripts/24-enrich-providers.ts` — xAI API integration pattern (can reuse for pricing research)
- `prisma/schema.prisma` — Plan model with pricePerServingCents, pricePerBoxCents, pricePerWeekCents, shippingCostCents fields
- `src/app/actions/admin.ts` — savePlan action that handles denormalized field updates

### Established Patterns
- Plan model: name, description, pricePerServingCents, pricePerBoxCents, pricePerWeekCents, shippingCostCents, servingsPerWeek, mealsPerWeek, peopleCount, frequency, introOfferNote
- Denormalized: Provider.minPricePerServingCents, maxPricePerServingCents, freeShipping
- After plan creation, denormalized fields must be recomputed from all plans for that provider

### Integration Points
- Provider cards show price from minPricePerServingCents
- Detail page "Plans & Pricing" section shows all Plan records
- Comparison table uses per-serving pricing
- Filters can filter by price range

</code_context>

<specifics>
## Specific Ideas

- Reuse the xAI enrichment script pattern from Phase 24 — similar structure but focused on pricing
- For the 18 hand-crafted providers with existing Plans, skip entirely
- For providers with complex pricing, create a single representative Plan with description explaining the model

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
