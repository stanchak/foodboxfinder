# Phase 12: Critical Design & Accessibility Fixes - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning
**Source:** UX Architect, UI Designer, and Accessibility Auditor agent reviews

<domain>
## Phase Boundary

Fix all P0/critical issues identified by the three design review agents. These are barriers that block users from completing core tasks or fail WCAG 2.1 Level A requirements.

</domain>

<decisions>
## Implementation Decisions

### P0 Fixes (All Required)

**UX Architecture:**
1. Add AddToCompareButton to ProviderCard — comparison flow is completely broken without it. Use stretched-link pattern so card remains clickable while compare button is interactive
2. Fix provider detail section nav: change `sticky top-0` to `sticky top-16` and `z-10` to `z-20` to stack below header
3. Make mobile search visible — add search to MobileNav or make HeaderSearchForm visible on mobile
4. Add bottom padding to page content to prevent CompareBar from overlapping footer

**Accessibility (WCAG Level A):**
5. Add skip navigation link as first element in body (layout.tsx)
6. MobileNav: add focus trap, Escape key handler, aria-controls, aria-hidden on SVGs
7. CategoryFilters drawer: add focus trap, Escape key handler, focus return on close
8. ProviderCard: decompose card link using stretched-link pattern (heading link with after:absolute after:inset-0) so AddToCompareButton can be nested without violating HTML spec

**Visual Consistency:**
9. Add baseline :focus-visible styles to globals.css as safety net
10. Standardize Check/X icons: use text-primary-600/text-gray-300 consistently across ComparisonTable and PricingTable
11. Fix ProviderLogo fallback contrast: text-gray-300 -> text-gray-400

### Claude's Discretion
- Implementation details for focus traps (manual vs library)
- Exact mobile search placement
- CompareBar bottom padding amount
- Any other adjustments needed to make the fixes work together

</decisions>

<code_context>
## Existing Code Insights

### Files to Modify
- `src/app/layout.tsx` — skip link
- `src/app/globals.css` — :focus-visible baseline
- `src/components/ProviderCard.tsx` — stretched link + AddToCompareButton
- `src/components/MobileNav.tsx` — focus trap, Escape, aria-controls, aria-hidden
- `src/components/CategoryFilters.tsx` — drawer focus trap, Escape, focus return
- `src/components/ComparisonTable.tsx` — standardize check/X icons
- `src/components/PricingTable.tsx` — standardize check/X icons
- `src/components/ProviderLogo.tsx` — fallback contrast fix
- `src/components/Header.tsx` — mobile search visibility
- `src/app/providers/[slug]/page.tsx` — section nav z-index/top fix
- `src/components/CompareBar.tsx` — aria-live region, Clear button aria-label

</code_context>

<specifics>
## Specific Ideas

- Stretched link pattern: `<Link className="after:absolute after:inset-0">` on the heading, AddToCompareButton with `relative z-10` to sit above the stretched link
- Focus trap: useEffect with keydown listener for Escape, ref.focus() on open, triggerRef.focus() on close
- Skip link: sr-only by default, visible on focus with absolute positioning

</specifics>

<deferred>
## Deferred Ideas

P1/P2 items deferred to Phase 13:
- Single-select filters: checkbox -> radio
- ComparisonTable th scope="row"
- Nav aria-labels
- AffiliateLink new-tab warning
- CompareBar aria-live announcements
- Desktop nav missing Compare/Blog/Best links
- Filter sidebar collapsible groups
- Price emphasis on ProviderCard
- CTA row visibility in comparison table
- Semantic color tokens
- Badge semantic mapping fix

</deferred>
