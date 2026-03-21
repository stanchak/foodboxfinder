# Phase 9: SEO and Collections - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Cross-site SEO verification pass (metadata, JSON-LD, sitemap, canonical URLs on all public pages) and curated "Best for X" collection pages at /best/[slug].

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All decisions at Claude's discretion. Key areas:
- Collection pages already exist at /best/[slug] -- verify they work with current data
- Sitemap already exists at src/app/sitemap.ts -- verify it covers all routes
- SEO metadata already on most pages -- audit for completeness
- JSON-LD XSS safety has been applied page-by-page in prior phases -- verify comprehensive coverage
- Canonical URL implementation approach
- Which collection topics to seed ("best budget", "best for families", etc.)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/sitemap.ts` -- existing sitemap generation
- `src/app/best/[slug]/page.tsx` -- existing collection pages
- `src/lib/queries/content.ts` -- getPublishedCollections(), getCollectionBySlug()
- Collection and CollectionItem models in Prisma schema
- All public pages already have generateMetadata() from prior phases
- JSON-LD XSS safety already applied on: providers/[slug], [category], compare, search, homepage

### Integration Points
- Collections need Collection + CollectionItem records in database
- Sitemap needs to enumerate all public routes
- Canonical URLs need to be set on every public page

</code_context>

<specifics>
## Specific Ideas

- This phase is primarily a verification + gap-filling pass
- Collection seed data may be needed (no collections exist in DB yet)
- Canonical URLs may already be handled by Next.js defaults

</specifics>

<deferred>
## Deferred Ideas

None

</deferred>
