# Phase 26: SEO, FAQs & Validation - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete SEO metadata for all providers, generate FAQ content, populate affiliate URLs, and set lastVerifiedAt timestamps. This is the final polish phase — all structural data work is complete, this adds the SEO and engagement layer.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — data enrichment/scripting phase.

Key approach:
- Build a script similar to Phase 24/25 pattern for metaTitle, metaDescription, FAQs
- xAI API may still be rate-limited — prepare fallback with template-based generation
- MetaTitle format: "{Provider Name} Review {Year} - {Category} Delivery | FoodBoxFinder"
- MetaDescription: 150-160 chars summarizing the provider
- FAQs: 2-3 per provider covering pricing, delivery, cancellation
- AffiliateUrls: Many providers have affiliate programs — research and populate where possible
- LastVerifiedAt: Set to current timestamp for all providers we've updated in v3.0
- FAQ JSON-LD is already rendered on provider detail pages when ProviderFaq records exist

### Data Notes
- 18 hand-crafted providers already have metaTitle/metaDescription — skip
- ~99 providers need meta generation
- All ~117 providers need FAQs (even hand-crafted ones only have FAQs for 18)
- AffiliateUrls: only 18 providers have them currently

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `prisma/scripts/24-enrich-providers.ts` — xAI API pattern
- `prisma/scripts/25-create-plans.ts` — Same batch pattern
- `prisma/schema.prisma` — ProviderFaq model (question, answer, sortOrder, providerId)
- Provider detail page already renders FAQs with JSON-LD when records exist

### Established Patterns
- ProviderFaq: prisma.providerFaq.create({ data: { question, answer, sortOrder, providerId } })
- MetaTitle/MetaDescription: fields on Provider model
- AffiliateUrl: field on Provider model
- LastVerifiedAt: DateTime field on Provider model

### Integration Points
- metaTitle/metaDescription used in generateMetadata() for SEO
- ProviderFaq records shown in FaqAccordion component
- FAQ JSON-LD structured data rendered on provider detail pages
- AffiliateUrl used by AffiliateLink component for outbound clicks

</code_context>

<specifics>
## Specific Ideas

No specific requirements — final data polish phase.

</specifics>

<deferred>
## Deferred Ideas

None — final phase of v3.0.

</deferred>
