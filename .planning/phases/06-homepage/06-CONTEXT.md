# Phase 6: Homepage - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Update the existing homepage with hero section, featured providers, category cards with counts, social proof, and site-level SEO (WebSite + Organization JSON-LD).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All decisions at Claude's discretion. The homepage already exists at src/app/page.tsx with hero, featured providers grid, category cards with counts, "How It Works", and social proof. Main work is verifying it displays correctly with the 95 seeded providers and any updates needed for the new schema fields. Key areas:
- Whether the existing homepage needs significant changes or just verification
- Hero section messaging and CTA
- Featured provider selection criteria
- Social proof content and stats
- JSON-LD structured data completeness

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/page.tsx` -- existing homepage with hero, featured grid, category cards, how-it-works, social proof, WebSite + Organization JSON-LD
- `src/lib/queries/providers.ts` -- getFeaturedProviders(), getCategoryCounts()
- `src/components/ProviderCard.tsx` -- already updated with ProviderLogo and value tier badge
- `src/lib/categories.ts` -- CATEGORY_NAV_ITEMS for category cards

### Integration Points
- getFeaturedProviders() returns providers where featured=true
- getCategoryCounts() returns counts per category
- Homepage already has generateMetadata() and JSON-LD

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond what exists -- verify and polish

</specifics>

<deferred>
## Deferred Ideas

None

</deferred>
