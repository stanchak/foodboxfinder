# Phase 16: Visual Rebrand - Page Restyling - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning
**Source:** UI Designer redesign spec + Brand Guardian brief

<domain>
## Phase Boundary

Restyle all page-level layouts to the new design language: homepage sections (hero, featured, categories, how-it-works, social proof, CTA), category listing page, provider detail page, comparison pages, search page, collection pages, blog pages.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation at Claude's discretion. Apply the redesign spec from the UI Designer agent. Key changes per page:

**Homepage (page.tsx):**
- Hero: bg-gradient-to-br from-primary-50 via-white to-accent-50/30, h1 font-extrabold text-gray-950, CTAs rounded-xl with lift effect, category pills uppercase tracking-wide
- Featured: py-20 sm:py-24, text-2xl font-extrabold headings
- Categories: bg-surface-100, rounded-2xl cards with hover:-translate-y-1, rounded-xl icons with hover:scale-110, uppercase tracking-wide counts
- How It Works: bg-gray-900 step numbers, rounded-2xl icon containers, max-w-xs descriptions
- Social Proof: bg-gray-900 (not green), text-4xl/5xl font-extrabold stats, uppercase tracking-wider labels
- Final CTA: py-20 sm:py-28, rounded-xl buttons

**Category Page ([category]/page.tsx):**
- bg-surface-50 page background
- Apply new section spacing

**Provider Detail (providers/[slug]/page.tsx):**
- font-extrabold tracking-tight provider name
- Frosted section nav bg-white/90 backdrop-blur-lg
- Section headings text-xl font-extrabold
- Editor note: text-[11px] font-bold tracking-widest label
- Pros/cons: /30 opacity backgrounds, uppercase tracking-wide headers
- Key details: bg-surface-50 filled cards (no borders), uppercase labels
- Bottom CTA: rounded-2xl gradient bg

**Comparison Pages:**
- Apply new ComparisonTable styles (handled in Phase 15 component)
- Page-level spacing adjustments

**Search/Blog/Collection Pages:**
- Apply consistent section spacing and heading styles

</decisions>

<code_context>
## Existing Code Insights

### Files to Modify
- src/app/page.tsx (homepage — largest file, most sections)
- src/app/[category]/page.tsx (category listing)
- src/app/providers/[slug]/page.tsx (provider detail — second largest)
- src/app/compare/page.tsx (flexible comparison)
- src/app/compare/[versus]/page.tsx (canonical comparison)
- src/app/search/page.tsx (search results)
- src/app/best/[slug]/page.tsx (collection detail)
- src/app/best/page.tsx (collection index)
- src/app/blog/page.tsx (blog index)
- src/app/blog/[slug]/page.tsx (blog detail)

</code_context>

<specifics>
## Specific Ideas

- Homepage is the most impactful page — get it right
- Provider detail page has the most sections to update
- Category and comparison pages mainly benefit from component changes in Phase 15
- Group parallel plans by page independence

</specifics>

<deferred>
## Deferred Ideas

None

</deferred>
