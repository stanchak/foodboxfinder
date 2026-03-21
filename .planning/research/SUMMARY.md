# Project Research Summary

**Project:** FoodBoxFinder — Food Subscription Discovery Platform
**Domain:** Comparison/directory site (Kayak-model for food box subscriptions)
**Researched:** 2026-03-21
**Confidence:** HIGH

## Executive Summary

FoodBoxFinder is a brownfield project with a v1.0 already shipped. The codebase contains 60+ source files, 28 components, 20 cached query functions, a working admin, comparison UI, filter system, and affiliate tracking. The next milestone is not a greenfield build — it is a targeted extension: importing 95 providers from a research dataset, extending the schema with 6 new filterable dimensions, rendering local logo assets, and hardening the filtering and comparison experiences. The architecture is sound and the stack is intentionally minimal; no architectural pivots are needed.

The recommended approach mirrors established comparison platform patterns (Kayak, NerdWallet, WireCutter): URL-driven filter state, server-side data fetching, static generation for SEO pages, and editorial curation over algorithmic ranking. The codebase already implements all of these correctly. The primary gaps are data (sparse fields in the dataset), a missing `@tailwindcss/typography` plugin (already depended on but not installed), and the need for a centralized `src/lib/filters.ts` module before adding more filter dimensions.

The biggest risks are not technical — they are data quality risks. The dataset has extreme sparsity (diet_tags: 16%, household_fit: 4%, value_tier: 8%), which will make filters return empty results and make the comparison table mostly N/A cells unless addressed during the seed phase. The SEO duplicate content risk from filter permutations is equally important: filtered category pages must get `noindex` from day one, and comparison page slug ordering must be canonicalized immediately. Both risks have clear, low-cost mitigations that must be built into the relevant phases rather than retrofitted.

## Key Findings

### Recommended Stack

The stack is locked (Next.js 16.2, React 19, Tailwind 4, Prisma 7.5, Neon PostgreSQL, Vercel) and correct for this domain. No changes are warranted. The only immediate gap is `@tailwindcss/typography`, which the blog page already depends on but which is not installed — this is a one-line fix (`npm install @tailwindcss/typography` + one CSS import). Before launch, add `zod` for Server Action validation, `@vercel/analytics`, and `@vercel/speed-insights` (all free, first-party Vercel integrations).

**Core technologies:**
- Next.js 16.2: App Router, ISR, Server Components — already configured and built against
- Prisma 7.5 + Neon: ORM and serverless PostgreSQL — schema defined, client singleton correct
- Tailwind CSS 4: utility-first styling, custom theme — configured, no changes needed
- `@tailwindcss/typography`: prose classes for blog — must install immediately (already in use)
- `zod`: Server Action validation — replace 80 lines of manual validation before launch
- `@vercel/analytics` + `@vercel/speed-insights`: traffic and CWV monitoring — add before launch

**Avoid:** component libraries (12 custom components already built), state management libraries (URL params + sessionStorage is correct), nuqs (existing URL state code works), testing infrastructure (defer to a dedicated post-launch phase).

### Expected Features

The feature set for comparison/directory platforms is well-understood from Kayak, NerdWallet, and WireCutter. The codebase already has routes for every major feature — the gap is data population and filter hardening.

**Must have (table stakes):**
- Category hub pages with provider cards — primary browse surface (routes exist, data needed)
- Provider detail pages with full info (plans, pros/cons, FAQ, dietary tags, affiliate CTA) — routes exist
- Multi-criteria filtering with URL params — routes exist, needs extended filter dimensions
- Side-by-side comparison table — exists, needs hardening for cross-category N/A handling
- Provider logos with fallback — assets exist (95 logos in `public/assets/`), rendering needs centralized `ProviderLogo` component
- Search — exists, works for 95 providers
- Breadcrumb navigation with JSON-LD — needs verification across all pages
- SEO metadata + JSON-LD on every public page — needs XSS-safe `safeJsonLd()` helper

**Should have (differentiators):**
- Comparison tray (floating bar) — already built in `CompareProvider.tsx`, needs hardening for cross-tab state loss
- "Best for X" curated collections — schema exists, needs editorial curation and rendering
- Flexibility transparency (skip/pause/cancel) — data exists, needs prominent display
- Shipping coverage clarity — data exists, needs badge display on cards
- Introductory offer display — `introOfferNote` on Plan model, needs editorial population
- Cross-category discovery — the dataset's breadth (95 providers, 5 categories) is the differentiator

**Defer to post-launch:**
- User reviews UI (keep Review schema, defer UI — use editorial pros/cons as trust signal)
- Blog authoring UI (keep BlogPost schema, author via admin CRUD)
- Collection curation UI (keep schema, populate via admin CRUD)
- Recommendation quiz (consider for v2 after understanding user behavior)
- Testing infrastructure (dedicated phase after MVP launch)

### Architecture Approach

The existing layered architecture (Presentation → Component → Query → Database, with Server Actions for mutations and `proxy.ts` for admin auth) is correct and should not be restructured. The next milestone requires three targeted extensions: (1) schema extension with 6 new enum fields on Provider, (2) a centralized `src/lib/filters.ts` module extracted from the current inline parsing in the category page, and (3) a `ProviderLogo` component that encapsulates local asset rendering with fallback. The `queries.ts` file is already at 336 lines (over the 300-line threshold) — it must be split before adding new query functions.

**Major components:**
1. `prisma/schema.prisma` — extend Provider with ModelType, PrepStyle, ValueTier, HouseholdFit, Geography, FlexibilityLevel enums; run `db push` + `prisma generate`
2. `src/lib/filters.ts` (new) — centralized, type-safe URL search param parsing for all 9+ filter dimensions; single source of truth for both server pages and client filter component
3. `src/lib/enums.ts` (new) — bidirectional slug-to-enum maps for all new enums, following the `categories.ts` pattern
4. `src/components/ProviderLogo.tsx` (new) — `next/image` for raster logos, `<img>` for SVG, letter fallback for null; handles all 5 `.ico` files after one-time format conversion
5. `prisma/seed.ts` — import 95 providers from `food-box-companies.json`, map manifest paths to `logoUrl`, flag sparse fields for admin follow-up

**Key patterns to follow:**
- URL-driven filter state: URL params are the single source of truth for filters; never duplicate into React context or global store
- Enum fields for fixed taxonomies: one value per provider dimension goes directly on the Provider model (not a join table)
- `React.cache()` on all query functions: prevents duplicate Prisma calls within a render pass
- Server Components by default: only add `"use client"` for event handlers, hooks, or browser APIs

### Critical Pitfalls

1. **Sparse data causes empty filter results** — The dataset has 4-16% population on new filter fields. Treat null as "unknown" (passes filter, not excluded). Show result counts per filter option. Disable zero-result options before users click. Enrich top 20-30 providers before enabling sparse filters publicly.

2. **SEO duplicate content from filter permutations** — Add `<meta name="robots" content="noindex,follow">` to ALL filtered pages (any page with search params) from day one. Set canonical on filtered pages to the base category URL. Canonicalize comparison slug ordering alphabetically. Only include curated comparison URLs in sitemap.

3. **Comparison table meaningless for cross-category pairs** — Hide rows where all compared providers show N/A. Show category-specific sections only when relevant providers are compared. Lead with universal fields (price, flexibility, shipping) for cross-category comparisons.

4. **`.ico` logo files render poorly at card sizes** — 5 providers have `.ico` logos in the manifest. Convert them to `.png` in a one-time script before seeding. Use `object-contain` (already in use — preserve it) for all logo images.

5. **Price fields null at launch** — The 95-provider dataset has pricing data for only 17% of providers, and structured Plan records do not exist yet. Parse `pricing_signal` into estimated price display during seed. Disable price sort/filter until top 20 providers have Plan records via admin UI. Never put null-priced providers at the top of price sorts.

6. **JSON-LD XSS vulnerability** — Provider names appear in `<script type="application/ld+json">` blocks without `<` escaping. Create a `safeJsonLd()` helper that applies `.replace(/</g, "\\u003c")` to all `JSON.stringify` output. Apply to all pages before launch.

## Implications for Roadmap

The v1.0 architecture is proven. The next milestone phases should follow data dependencies strictly — nothing works without seeded providers, so schema extension and data import come first. Filter infrastructure comes before filter UI (centralized parser must exist before the UI can be extended). Logo component comes before any card or comparison work. The overall arc: Data Foundation → Utility Infrastructure → Consumer UI Hardening → SEO + Admin Polish.

### Phase 1: Schema Extension and Data Seeding

**Rationale:** Every other phase depends on having 95 providers in the database with the new enum fields. This is the foundational blocker. No filter UI, no comparison, no logos work without this.
**Delivers:** Populated PostgreSQL with all 95 providers, new enum fields, logo paths set, `.ico` files converted, pricing estimates parsed, sparse field flags for admin follow-up.
**Addresses:** Category browsing, provider detail pages, provider logos/branding (data side)
**Avoids:** Pitfall 1 (sparse data), Pitfall 4 (.ico logos), Pitfall 5 (price fields null at launch)
**Research flag:** None — standard Prisma schema extension and seed patterns; well-documented.

### Phase 2: Filter Infrastructure and Utility Layer

**Rationale:** The `queries.ts` file is already over the 300-line threshold and will grow. Before any new filtering UI, extract `src/lib/filters.ts` and `src/lib/enums.ts` so all future work has a single source of truth. This is infrastructure, not UI.
**Delivers:** `src/lib/filters.ts` (type-safe URL param parsing for all filter dimensions), `src/lib/enums.ts` (bidirectional slug-to-enum maps), extended `queries.ts` with new filter params, `queries.ts` split into logical modules.
**Addresses:** Multi-criteria filtering (infrastructure), sort options
**Avoids:** Pitfall 2 (URL state explosion), Anti-pattern 4 (hardcoded filter options in components)
**Research flag:** None — established Next.js patterns, clear implementation in ARCHITECTURE.md.

### Phase 3: Logo Component and Asset Infrastructure

**Rationale:** Provider logos appear in 5+ distinct places (ProviderCard, ComparisonTable headers, provider detail hero, compare page headers, collection items). A centralized `ProviderLogo` component with consistent fallback logic must exist before any of those surfaces are updated to use real logos.
**Delivers:** `src/components/ProviderLogo.tsx` with sm/md/lg size variants, raster vs. SVG handling, letter fallback for null; `.ico` conversion verified; logo rendering tested across all 95 providers.
**Addresses:** Provider logos/branding (UI side)
**Avoids:** Pitfall 4 (logo rendering issues), broken images at launch
**Research flag:** None — standard Next.js Image patterns.

### Phase 4: Extended Filtering UI and Category Pages

**Rationale:** With the filter infrastructure in place (Phase 2) and data seeded (Phase 1), the CategoryFilters component can be safely extended to 9 filter dimensions without state explosion risk. Category pages become the primary browse surface with full multi-criteria filtering.
**Delivers:** Extended `CategoryFilters.tsx` with all filter dimensions, updated category listing pages using `parseFilters()`, filter result counts, mobile-first filter drawer with "Show X Results" footer, `noindex` on all filtered pages.
**Addresses:** Multi-criteria filtering, sort options, mobile-responsive design
**Avoids:** Pitfall 1 (empty filter results), Pitfall 2 (URL state explosion), Pitfall 6 (SEO duplicate content)
**Research flag:** Consider `/gsd:research-phase` if filter UX patterns for sparse data need deeper investigation.

### Phase 5: Comparison Hardening

**Rationale:** The comparison feature exists but has two documented failure modes: cross-category N/A overload and sessionStorage state loss across tabs. Both need to be addressed before launch.
**Delivers:** Dynamic row visibility in ComparisonTable (hide all-N/A rows), category-specific comparison sections, alphabetically-canonicalized comparison slug ordering, `localStorage` with TTL replacing `sessionStorage` in CompareProvider, "Winner per criterion" highlights, comparison URL canonicalization and sitemap curation.
**Addresses:** Side-by-side comparison, comparison tray, shareable comparison URLs
**Avoids:** Pitfall 3 (N/A overload), Pitfall 6 (SEO duplicate content from comparison pairs), Pitfall 7 (tray state loss)
**Research flag:** None — clear implementation path documented in ARCHITECTURE.md and PITFALLS.md.

### Phase 6: SEO Polish and Content

**Rationale:** The site needs to ship with correct JSON-LD, `safeJsonLd()` XSS protection, and curated "Best for X" collection pages before receiving organic traffic. Blog typography also needs the `@tailwindcss/typography` fix.
**Delivers:** `safeJsonLd()` helper applied across all pages, `@tailwindcss/typography` installed and configured, curated collections ("Best for families," "Best budget," "Best keto"), editorial methodology page, sitemap curation (under 500 URLs), `last verified` price dates on all price displays.
**Addresses:** "Best for X" curated collections, transparent editorial methodology, SEO metadata + structured data, breadcrumb navigation
**Avoids:** Pitfall 6 (SEO duplicate content), JSON-LD XSS vulnerability
**Research flag:** None — established SEO patterns for faceted navigation sites.

### Phase 7: Admin Polish and Operations

**Rationale:** Admin CRUD exists but needs updates for the 6 new enum fields and a data completeness dashboard so operators know which providers need enrichment before launch.
**Delivers:** Updated `ProviderForm.tsx` with new enum fields, data completeness view in admin dashboard showing % populated per field per provider, verified `revalidatePath` coverage for all category pages, `@vercel/analytics` + `@vercel/speed-insights` in layout.
**Addresses:** Admin CRUD, affiliate click tracking (rate limit verification), operational visibility
**Avoids:** Pitfall 5 (price fields null — admin dashboard drives enrichment), stale revalidation paths
**Research flag:** None — standard admin CRUD extension.

### Phase Ordering Rationale

- Phase 1 before all others: zero providers in the database means zero functionality to test.
- Phase 2 before Phase 4: filter infrastructure must precede filter UI; centralized parser prevents state explosion.
- Phase 3 before Phase 4 and 5: logos appear in cards and comparison — component must exist first.
- Phase 5 after Phase 1 and 3: comparison hardening requires real cross-category data to test N/A scenarios and real logos in headers.
- Phase 6 parallel-eligible with Phase 7: SEO polish and admin polish have minimal dependencies on each other; could run in parallel or in either order.

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (Filtering UI):** If filter UX for sparse datasets proves complex (result count display, facet disabling, soft-filter ranking), a research-phase spike may be warranted. The architecture is clear but UX decision-making for near-empty facets is nuanced.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Standard Prisma schema extension + seed script. Pattern is established in codebase.
- **Phase 2:** Standard module extraction and type-safe parsing. ARCHITECTURE.md provides full implementation guidance.
- **Phase 3:** Standard Next.js Image with fallback. ARCHITECTURE.md includes the full component implementation.
- **Phase 5:** Comparison improvements are targeted, documented, and have clear implementation paths.
- **Phase 6:** SEO patterns for faceted navigation are well-documented and applied throughout existing code.
- **Phase 7:** Admin CRUD extension follows existing ProviderForm pattern exactly.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Brownfield project — stack is installed and verified working. Gap analysis is precise. Tailwind typography peer dep confirmed via npm registry. |
| Features | MEDIUM | Table stakes have HIGH confidence from comparison platform patterns. Differentiators are MEDIUM — competitor feature sets could not be verified via live web research. |
| Architecture | HIGH | Based on direct codebase analysis of all 28 components, 15+ route segments, schema, and utilities. Architectural recommendations are extensions of proven patterns, not hypotheticals. |
| Pitfalls | HIGH | Dataset sparsity quantified directly from `food-box-companies.json`. Logo format issues confirmed from manifest.json. Price field gaps confirmed from schema analysis. SEO risks are well-documented patterns for faceted navigation. |

**Overall confidence:** HIGH

### Gaps to Address

- **Blog authoring format decision:** STACK.md flags that `react-markdown` is only needed if blog content is markdown rather than HTML. This decision gates whether to install the library. Resolve during Phase 6 planning by checking how blog content is actually authored via admin.
- **Competitor live feature verification:** FEATURES.md notes that competitor feature sets (MealFinds, Top10.com, etc.) could not be verified via live web research. The feature recommendations are grounded in platform archetypes (Kayak, NerdWallet, WireCutter) but current competitor features may differ. Low risk — the table stakes analysis is robust.
- **Data enrichment priority:** Which 20-30 providers to prioritize for manual data enrichment (dietary tags, pricing, pros/cons) should be decided by the product owner before Phase 7 admin work, not by the engineering team. The admin data completeness dashboard (Phase 7) surfaces this gap; the decision itself is editorial.
- **GA4 / affiliate network reporting requirements:** STACK.md notes `@next/third-parties` is only needed if GA4 or Google Tag Manager is required for affiliate network reporting beyond what the `AffiliateClick` table provides. Vercel Analytics covers traffic; this decision needs stakeholder input before launch.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis: all source files in `src/`, `prisma/schema.prisma`, `public/assets/providers/manifest.json`, `package.json`
- `temp/plandocs/food-box-companies.json` — 95 providers, field sparsity quantified directly
- `temp/plandocs/MASTER-LANDSCAPE.md` — competitive landscape, market gap analysis
- `temp/plandocs/TAXONOMY-RUBRIC.md` — filter dimensions and ranking criteria
- `temp/plandocs/PLATFORM-GAP-BRIDGE-PRD.md` — explicit acceptance criteria
- `.planning/PROJECT.md` — requirements, constraints, out-of-scope decisions
- `.planning/codebase/CONCERNS.md` — existing tech debt and documented bugs
- `node_modules/next/dist/docs/` — Next.js 16 official documentation
- npm registry (2026-03-21) — dependency version verification

### Secondary (MEDIUM confidence)
- Training data knowledge of Kayak, NerdWallet, WireCutter, The Points Guy, MealFinds, Top10.com patterns — comparison platform feature analysis
- Prisma documentation (training data) — enum types, filtering, indexes
- SEO best practices for faceted navigation (training data) — noindex strategy, canonical tags, sitemap curation

### Tertiary (LOW confidence)
- Live competitor feature sets (MealFinds, Top10.com) — could not verify via web research; analysis based on platform archetype patterns

---
*Research completed: 2026-03-21*
*Ready for roadmap: yes*
