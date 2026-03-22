# Phase 13: Design Polish & UX Improvements - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning
**Source:** UX Architect, UI Designer, and Accessibility Auditor agent reviews

<domain>
## Phase Boundary

Fix all P1/P2 issues from design review agents. These are significant UX improvements and minor accessibility fixes that improve quality but don't block core task completion.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All decisions at Claude's discretion. Priority items from reviews:

**P1 UX/Accessibility:**
- Single-select filter groups: change type="checkbox" to type="radio" with name attribute (CategoryFilters.tsx)
- ComparisonTable row labels: change <td> to <th scope="row">
- Desktop header nav: add Compare, Best Of, Blog links with divider
- Filter sidebar: make groups collapsible/expandable (41 options is overwhelming)
- CompareBar: add aria-live status region for screen reader announcements
- CompareBar: "Clear" button needs aria-label="Clear all providers from comparison"
- MobileNav SVGs: add aria-hidden="true"
- RatingStars SVGs: add aria-hidden="true"
- ProviderLogo: add role="img", aria-label, aria-hidden on fallback span
- PricingTable: add sr-only status text for canSkip/canCancel boolean features
- Missing focus-visible classes on Clear/Show Results buttons in CategoryFilters

**P1 Visual Design:**
- Price emphasis on ProviderCard: text-sm -> text-base font-semibold text-primary-700
- CTA row in comparison table: bg-accent-50/30 -> bg-accent-50
- "View Details" in comparison: change from button to text link to avoid competing with affiliate CTA
- Add semantic color tokens to globals.css (success/error/warning)
- "Free Shipping" badge: change color="dietary" to color="default"

**P2 Accessibility:**
- Header nav: add aria-label="Main"
- MobileNav nav: add aria-label="Mobile navigation"
- AffiliateLink: add sr-only "(opens in new tab)" text
- FaqAccordion: remove non-functional CSS transition
- Pagination: remove aria-disabled from non-interactive span
- ComparisonTable "View Details" links: add aria-label with provider name

**P2 UX:**
- Add scroll indicator gradient for horizontal card scroll on mobile homepage
- Review count display on ProviderCard: text-xs text-gray-500 -> text-xs text-gray-600 font-medium
- Reduce ProviderCard logo area from h-40 to h-32

</decisions>

<code_context>
## Existing Code Insights

### Files to Modify
- src/components/CategoryFilters.tsx — radio inputs, collapsible groups, focus-visible
- src/components/ComparisonTable.tsx — th scope="row", CTA row, View Details links
- src/components/Header.tsx — nav links, aria-label
- src/components/CompareBar.tsx — aria-live, Clear label
- src/components/MobileNav.tsx — SVG aria-hidden, nav aria-label
- src/components/RatingStars.tsx — SVG aria-hidden
- src/components/ProviderLogo.tsx — role="img", aria-label
- src/components/PricingTable.tsx — sr-only status text
- src/components/ProviderCard.tsx — price emphasis, logo height, review count
- src/components/AffiliateLink.tsx — sr-only new tab warning
- src/components/FaqAccordion.tsx — remove non-functional transition
- src/components/Pagination.tsx — remove aria-disabled from span
- src/app/globals.css — semantic color tokens
- src/components/Badge.tsx — verify "Free Shipping" usage

</code_context>

<specifics>
## Specific Ideas

No specific requirements — implement all P1/P2 items from the three review reports

</specifics>

<deferred>
## Deferred Ideas

- Scroll-spy active state on detail page section nav (requires IntersectionObserver client component)
- Mobile filter drawer entrance animation (requires CSS keyframes or two-step mount)
- Browse-all providers page (/providers route)
- LinkButton component extraction

</deferred>
