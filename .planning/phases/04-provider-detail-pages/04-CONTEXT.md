# Phase 4: Provider Detail Pages - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Update the existing provider detail page to display all new schema fields (prepStyle, valueTier, householdFit, modelType, geography, flexibility, shippingNotes), ensure affiliate click tracking works with the new status field, and verify SEO metadata and JSON-LD structured data are complete.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
The provider detail page already exists at src/app/providers/[slug]/page.tsx with hero section, pricing table, dietary badges, pros/cons, reviews, FAQ accordion, related providers, review form, and affiliate link. Implementation decisions:
- How to visually present the new fields (badges, table rows, info cards, etc.)
- Where in the page layout to place new field sections
- Whether to show empty/null fields or hide them
- How to display the new ProviderStatus (badge vs text)
- Whether affiliate click tracking needs updates for the new status field
- JSON-LD Product schema field mapping for new attributes

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/providers/[slug]/page.tsx` -- existing full provider detail page (hero, pricing, dietary, pros/cons, reviews, FAQ, affiliate, JSON-LD)
- `src/components/ProviderLogo.tsx` -- Phase 3 logo component (already integrated)
- `src/components/PricingTable.tsx` -- existing pricing display
- `src/components/FaqAccordion.tsx` -- existing FAQ display
- `src/components/Badge.tsx` -- existing badge component with variants
- `src/components/AffiliateLink.tsx` -- existing affiliate link component
- `src/components/Breadcrumbs.tsx` -- existing breadcrumb component
- `src/app/api/affiliate/[providerId]/route.ts` -- existing affiliate click tracking API

### Established Patterns
- Provider data fetched via getProviderBySlug() from queries
- generateMetadata() for SEO metadata
- Product JSON-LD structured data inline
- notFound() for missing slugs
- Breadcrumbs with BreadcrumbList JSON-LD

### Integration Points
- New Provider fields from Phase 1: prepStyle, valueTier, householdFit, modelType, geography, flexibility, shippingNotes, pricingSignal, status
- getProviderBySlug() query already returns all fields
- AffiliateClick model already tracks providerId, source, referrer, hashedIp

</code_context>

<specifics>
## Specific Ideas

- Many new fields are nullable/sparse -- hide sections when data is absent
- Status badge should visually differentiate ACTIVE (green), HYBRID (blue), UNCLEAR (yellow), DISCONTINUED (red)
- Flexibility info (skip/pause/cancel policies) is a key buying criterion per research -- display prominently
- Geography/shipping info helps users avoid dead ends -- show clearly

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>
