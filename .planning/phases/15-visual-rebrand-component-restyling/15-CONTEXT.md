# Phase 15: Visual Rebrand - Component Restyling - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning
**Source:** UI Designer redesign spec + Brand Guardian brief

<domain>
## Phase Boundary

Restyle all shared components to the new design language: ProviderCard, Header, Footer, CompareBar, CategoryFilters, ComparisonTable, PricingTable, ProviderLogo, AffiliateLink, FaqAccordion, ReviewCard, RatingBreakdown, Breadcrumbs, HeaderSearchForm, MobileNav.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation at Claude's discretion. Apply the redesign spec from the UI Designer agent. Key changes per component:

**ProviderCard:** rounded-2xl, ring-1 ring-gray-100, hover:-translate-y-1 hover:shadow-lg, h-36 logo gradient, p-5, price text-lg font-bold, border-t on dietary tags, font-bold text-base name

**Header:** bg-white/80 backdrop-blur-xl, logo font-extrabold tracking-tight text-gray-900, utility links text-gray-600

**Footer:** bg-gray-900 text-gray-300, uppercase tracking-widest headings, text-gray-400 hover:text-white links

**CompareBar:** bg-white/90 backdrop-blur-xl, dark chips bg-gray-900 text-white, accent compare button bg-accent-500

**CategoryFilters:** sidebar gets bg-white rounded-xl p-5 shadow-sm ring-1, divide-y between groups, uppercase title, active chips bg-primary-600 text-white

**ComparisonTable:** rounded-2xl shadow-sm, p-6 provider headers, bg-gray-100 section headers, bg-surface-50 alternating rows

**PricingTable:** rounded-2xl, featured scale-[1.02] border-2 shadow-md, centered badge, text-4xl font-extrabold prices

**ProviderLogo:** rounded-2xl bg-white shadow-xs, font-extrabold text-gray-300 fallback

**AffiliateLink:** primary gets rounded-xl, hover:-translate-y-0.5 hover:shadow-md lift effect

**FaqAccordion:** rounded-xl border container, px-5 py-5 hover:bg-gray-50 questions

**ReviewCard:** lighter borders, rounded-xl neutral avatar, larger py-8 spacing

**RatingBreakdown:** h-2 bars, font-extrabold tracking-tight numbers

**Breadcrumbs:** text-xs text-gray-400, font-semibold text-gray-700 current

**HeaderSearchForm:** rounded-full pill, focus:w-64 expand animation

**MobileNav:** w-80, bg-black/40 backdrop-blur-sm backdrop, hover:bg-gray-50 neutral links

Full class-level changes are documented in the UI Designer's redesign spec.

</decisions>

<code_context>
## Existing Code Insights

### Files to Modify (15 components)
- src/components/ProviderCard.tsx
- src/components/Header.tsx
- src/components/Footer.tsx
- src/components/CompareBar.tsx
- src/components/CategoryFilters.tsx
- src/components/ComparisonTable.tsx
- src/components/PricingTable.tsx
- src/components/ProviderLogo.tsx
- src/components/AffiliateLink.tsx
- src/components/FaqAccordion.tsx
- src/components/ReviewCard.tsx
- src/components/RatingBreakdown.tsx
- src/components/Breadcrumbs.tsx
- src/components/HeaderSearchForm.tsx
- src/components/MobileNav.tsx

</code_context>

<specifics>
## Specific Ideas

- Group into parallel plans by file independence
- Header+Footer+MobileNav can be one plan (global chrome)
- ProviderCard+ProviderLogo+Breadcrumbs can be one plan (listing surfaces)
- ComparisonTable+PricingTable+CompareBar can be one plan (comparison surfaces)
- CategoryFilters+HeaderSearchForm can be one plan (interactive inputs)
- FaqAccordion+ReviewCard+RatingBreakdown+AffiliateLink can be one plan (detail page sub-components)

</specifics>

<deferred>
## Deferred Ideas

None

</deferred>
