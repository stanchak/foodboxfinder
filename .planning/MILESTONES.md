# Milestones

## v1.0 FoodBoxFinder MVP (Shipped: 2026-03-22)

**Phases completed:** 16 phases, 34 plans, 64 tasks

**Key accomplishments:**

- Extended Provider model with ProviderStatus/ValueTier enums and 13 dataset fields; converted 5 .ico logos to .png with web-relative manifest paths
- Merge-based seed importing 95 providers from JSON dataset with hand-crafted editorial overlay, logo URL population from manifest, and Provider.active to Provider.status migration across all codebase references
- 9-dimension filter parser with null-aware helpers for sparse data, and domain-scoped query split into providers/content/admin with barrel re-export
- getFilteredProviders with 9-dimension null-aware filtering via Prisma AND array composition, accepting ProviderFilters type with paginated results
- Reusable ProviderLogo component with sm/md/lg size variants, Next.js Image optimization, and first-initial fallback replacing 3 inline implementations
- Provider detail page now displays all dataset fields (prepStyle, valueTier, modelType, householdFit, geography, flexibility, shippingNotes) with conditional rendering, colored status badges, and XSS-safe JSON-LD output
- Full 9-dimension filter sidebar with dietary, prep style, value tier, household fit, model type, geography filters, active filter chips with remove buttons, and updated 4-option sort
- Category pages rewired to Phase 2 multi-dimension filters with editorial intros, breadcrumbs, value tier badges, noindex on filtered pages, and XSS-safe JSON-LD
- XSS-safe JSON-LD rendering and honest social proof stats on homepage with 95 seeded providers
- ComparisonTable expanded with 9 new provider fields, N/A row auto-hiding, canonical slug ordering redirect, and XSS-safe JSON-LD across all comparison pages
- Broadened searchProviders to match shortDescription and category labels; fixed XSS-safe JSON-LD on search page
- XSS-safe JSON-LD rendering on all 5 remaining pages and canonical URLs on all 9 indexable page types
- Verified collection pages end-to-end: detail page with ItemList JSON-LD, BreadcrumbList JSON-LD, ranked provider list with editorial notes, and index page with CollectionPage JSON-LD and provider counts
- Admin ProviderForm extended with 8 dataset fields (modelType, prepStyle, valueTier, householdFit, geography, flexibility, shippingNotes, pricingSignal) and server actions updated to persist and revalidate
- Category breakdown stats via groupBy on admin dashboard, plus sort dropdown and granular ProviderStatus filter on provider list
- Loading.tsx skeleton coverage for all 10 public route segments with full UX requirements verification (error boundaries, 404, mobile, sticky header)
- Skip navigation, focus-visible baseline, logo contrast, icon consistency, section nav z-index, CompareBar padding, and mobile search visibility -- 7 P0 fixes across 6 files
- Focus traps, Escape handlers, and ARIA attributes added to MobileNav and CategoryFilters mobile drawers for WCAG 2.1 Level A compliance
- AddToCompareButton with z-10/stopPropagation/aria-pressed, ProviderCard refactored to stretched-link pattern for valid HTML with interactive compare overlay
- Radio inputs for single-select filters, collapsible filter groups with aria-expanded, desktop header nav links, and semantic color tokens
- Accessible comparison table with th scope=row, text link View Details with aria-labels, solid CTA background, and sr-only screen reader text for boolean pricing features
- Accessibility and visual fixes across 7 components: aria-live on CompareBar, role=img on ProviderLogo, aria-hidden on RatingStars SVGs, sr-only new tab warnings on AffiliateLink, price emphasis and h-32 logo area on ProviderCard
- Right-edge fade gradient on homepage featured providers mobile scroll indicating more content to the right
- Complete oklch design token system with deep teal primary, warm amber accent, warm neutrals, and Inter + Source Serif 4 font stack
- Badge with 6 shape-differentiated variants (rounded-md vs rounded-full) and 11px uppercase typography; Button with active:scale press feedback, shadow states, and font-semibold
- Frosted glass Header (bg-white/80 backdrop-blur-xl), dark Footer (bg-gray-900 with uppercase headings), and wider MobileNav (w-80) with neutral hover states
- ProviderCard with elevated hover-lift and gradient logo area, ProviderLogo with rounded-2xl shadow-xs, Breadcrumbs with lighter text-xs typography
- ComparisonTable with rounded-2xl warm rows, PricingTable with featured scale-[1.02] effect, CompareBar with frosted glass and dark chips
- CategoryFilters card container with divide-y groups and solid active chips; HeaderSearchForm pill shape with focus expand animation
- Restyled FaqAccordion, ReviewCard, RatingBreakdown, and AffiliateLink with rounded-xl containers, hover lift effects, neutral avatars, and slimmer rating bars
- Restyled all 6 homepage sections with new brand design language: diagonal gradient hero, font-extrabold headings, rounded-2xl hover-lift cards, bg-gray-900 social proof, and rounded-xl CTA buttons with shadow lift
- Provider detail page restyled with font-extrabold headings, frosted glass nav, semantic /30 opacity pros/cons, filled key detail cards, tracking-widest micro-labels, and gradient CTA
- Consistent brand typography (font-extrabold headings), rounded-xl CTAs with lift effects, rounded-2xl content cards, and bg-neutral-50 backgrounds across category, search, and comparison pages
- Font-extrabold headings, rounded-2xl hover-lift cards, bg-gray-900 featured badge, and tracking-widest editorial labels across 4 content pages

---
