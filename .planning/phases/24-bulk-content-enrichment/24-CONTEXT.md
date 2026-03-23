# Phase 24: Bulk Content Enrichment - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Fill all empty content fields for ~100+ providers using AI-assisted research (xAI Responses API with web_search). Transform stub providers into consumer-ready pages with real descriptions, pros/cons, dietary info, value tier, flexibility, and business details.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — data enrichment/scripting phase.

Key approach:
- Build a TypeScript enrichment script that calls xAI Responses API (grok-4-1-fast-reasoning + web_search) for each provider
- Process providers in batches (5-10 at a time) to manage API rate limits
- For each provider, research: description, shortDescription, prosJson, consJson, valueTier, dietaryTags, flexibility, foundedYear, headquarters, deliveryAreaDescription, householdFit, geography
- Use Prisma client to update provider records directly
- xAI API key is in .env.local as XAI_API_KEY
- API call pattern: curl to https://api.x.ai/v1/responses with model grok-4-1-fast-reasoning and tools [{"type":"web_search"}]
- IMPORTANT: urllib gets Cloudflare blocked — must use curl or node's fetch

### Data Quality Rules
- Descriptions should be 2-3 sentences, factual, not marketing copy
- ShortDescriptions under 300 characters
- ProsJson: 3-4 genuine pros per provider
- ConsJson: 2-3 honest cons per provider (builds trust)
- ValueTier: BUDGET, MID, PREMIUM, LUXURY based on per-serving/per-box pricing
- DietaryTags: Only assign tags the provider genuinely supports
- No hallucinated data — if information can't be verified, leave field null

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `prisma/scripts/22-status-cleanup.ts` — Migration script pattern with Prisma client
- `prisma/scripts/23-add-providers.ts` — Provider upsert pattern
- `src/lib/db.ts` — Prisma client singleton
- `src/generated/prisma/client` — Enum types (DietaryTag, ValueTier, etc.)

### Established Patterns
- Migration scripts: TypeScript files run via `npx tsx`
- Prisma updates: prisma.provider.update({ where: { slug }, data: {...} })
- DietaryTags: Created via prisma.providerDietaryTag.create({ data: { providerId, tag } })
- ValueTier enum: BUDGET, MID, PREMIUM, LUXURY
- DietaryTag enum: VEGAN, VEGETARIAN, GLUTEN_FREE, DAIRY_FREE, KETO, PALEO, LOW_CARB, HIGH_PROTEIN, NUT_FREE, SOY_FREE, ORGANIC, LOW_SODIUM, HALAL, KOSHER

### Integration Points
- Provider cards show shortDescription, valueTier badge, dietary tag badges
- Provider detail pages show full description, pros/cons sections
- Category filters use dietary tags for filtering
- Search indexes description and shortDescription

</code_context>

<specifics>
## Specific Ideas

- Process by category for consistency (all meal kits together, all prepared meals together, etc.)
- The xAI API returns JSON — parse and validate before writing to DB
- Some providers may have existing hand-crafted data (18 providers) — skip these or only fill missing fields

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
