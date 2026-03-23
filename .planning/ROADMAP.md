# Roadmap: FoodBoxFinder

## Milestones

- ✅ **v1.0 MVP** -- Phases 1-16 (shipped 2026-03-22)
- ✅ **v2.0 Unified Discovery Interface** -- Phases 17-19 (shipped 2026-03-22)
- ✅ **v2.1 Navigation & About Page** -- Phases 20-21 (shipped 2026-03-23)
- 🔄 **v3.0 Data Completeness & Market Coverage** -- Phases 22-26 (in progress)

## Phases

### v3.0 Data Completeness & Market Coverage (Phases 22-26)

**Goal:** Make the dataset comprehensive (all providers in the market) and accurate (every field populated and validated) — the foundation that makes discovery actually useful.

- [x] **Phase 22: Schema Evolution & Status Cleanup** -- Add parentCompany field, update 28 unclear→active statuses, flag discontinued providers, add ownership/M&A notes, clean data foundation
- [x] **Phase 23: Market Expansion** -- Add ~22 missing Tier 1+2 providers from market gap research (Clean Eatz Kitchen, Tempo, Rastelli's, Cometeer, TokyoTreat, etc.), obtain logos, create basic records
- [ ] **Phase 24: Bulk Content Enrichment** -- AI-assisted enrichment for all ~100+ providers: real descriptions, shortDescriptions, pros/cons, valueTier, dietaryTags, flexibility, foundedYear, headquarters, deliveryArea using xAI Responses API + Firecrawl
- [ ] **Phase 25: Pricing & Plans** -- Create Plan records with real pricing for all providers, handle per-serving vs per-box vs per-item pricing models, update denormalized min/max fields
- [ ] **Phase 26: SEO, FAQs & Validation** -- Generate metaTitle/metaDescription for all providers, create 2-3 FAQs each, populate affiliateUrls, cross-validate all data against live provider websites, set lastVerifiedAt

### Phase 22: Schema Evolution & Status Cleanup

**Goal:** Prepare the data foundation for bulk enrichment by adding a parentCompany field to the Prisma schema, updating all 28 "unclear" provider statuses to "active" (confirmed by research), flagging Freshly as discontinued, and adding ownership/M&A relationship notes to provider records.

**Plans:** 2 plans

Plans:
- [x] 22-01-PLAN.md — Schema change (parentCompany field) + data migration script (status cleanup, parentCompany values, ownership notes)
- [x] 22-02-PLAN.md — Admin UI update (parentCompany in ProviderForm + server actions) + build verification

**Requirements:**
- R22.1: Add `parentCompany` field (optional String) to Provider model in Prisma schema
- R22.2: Update all 28 "unclear" status providers to "ACTIVE" via seed script or migration
- R22.3: Ensure Freshly status is "DISCONTINUED" and hidden from active listings
- R22.4: Add ownership notes to `notes` field for providers with parent company relationships (HelloFresh→Factor/Green Chef/EveryPlate, Wonder→Blue Apron, Intelligent Foods→Gobble/Sunbasket, FreshRealm→Marley Spoon/Dinnerly/BistroMD, Misfits Market→Imperfect Foods, Kroger→Home Chef, Nestle→Blue Bottle Coffee, 1-800-Flowers→Harry & David/Cheryl's)
- R22.5: Set `parentCompany` values for all providers with known parent companies
- R22.6: Update admin UI ProviderForm to include parentCompany field
- R22.7: Verify `next build` passes after all changes

**Success criteria:**
- [ ] Prisma schema has parentCompany field and `npx prisma db push` succeeds
- [ ] Zero providers with "UNCLEAR" status remain in database
- [ ] Freshly shows as DISCONTINUED
- [ ] All parent company relationships are recorded
- [ ] Admin form allows editing parentCompany
- [ ] `next build` passes

### Phase 23: Market Expansion

**Goal:** Add ~22 missing Tier 1 and Tier 2 providers identified in the market gap research to the database, with logos and basic record structure, expanding market coverage from 95 to ~117 providers.

**Plans:** 2 plans

Plans:
- [x] 23-01-PLAN.md — Download logos for 22 new providers, update manifest.json
- [x] 23-02-PLAN.md — Create migration script to insert 22 providers into database + build verification

**Requirements:**
- R23.1: Add 10 Tier 1 must-add providers: Clean Eatz Kitchen, Tempo, Rastelli's, Sea to Table, Cometeer, TokyoTreat, Japan Crate, Munch Addict, Heatonist/Hot Ones, Melissa's Produce
- R23.2: Add 12 Tier 2 should-add providers: Sprinly, ModifyHealth, MealPro, MegaFit Meals, Methodology, Primal Pastures, Alaskan Salmon Company, Wild Tide Seafoods, Frog Hollow Farm, Seoulbox, SnackFever, Fuego Box
- R23.3: Each new provider has: name, slug, website, category, status, modelType, prepStyle
- R23.4: Obtain or generate logos for all new providers (place in public/assets/providers/, update manifest.json)
- R23.5: Create seed script or admin workflow to insert new providers
- R23.6: Verify all new providers appear on /search page and have valid detail pages

**Success criteria:**
- [ ] 22 new providers added to database (total ~117)
- [ ] All new providers have logos in manifest.json
- [ ] All new providers appear on /search page
- [ ] All new provider detail pages render without errors
- [ ] `next build` passes

### Phase 24: Bulk Content Enrichment

**Goal:** Fill all empty content fields for ~100+ providers using AI-assisted research (xAI Responses API + Firecrawl), transforming stub providers into consumer-ready pages with real descriptions, pros/cons, dietary info, and metadata.

**Plans:** 2 plans

Plans:
- [x] 24-01-PLAN.md — Build the xAI-powered batch enrichment script with API integration, validation, and batch processing
- [x] 24-02-PLAN.md — Run full enrichment across all providers, verify data quality, and confirm build passes

**Requirements:**
- R24.1: Generate real `description` (2-3 sentences) for all providers with stub descriptions
- R24.2: Generate `shortDescription` (under 300 chars) for all providers missing it
- R24.3: Generate `prosJson` (3-4 pros) and `consJson` (2-3 cons) for all providers missing them
- R24.4: Set `valueTier` for all providers based on pricing research
- R24.5: Assign `dietaryTags` (ProviderDietaryTag records) for all applicable providers
- R24.6: Fill `flexibility` field with cancellation/skip policy info
- R24.7: Fill `foundedYear`, `headquarters`, `deliveryAreaDescription` where discoverable
- R24.8: Fill `householdFit` and `geography` where applicable
- R24.9: Build a batch enrichment script that uses xAI Responses API to research and populate fields
- R24.10: Verify enrichment quality — no hallucinated data, descriptions match actual provider offerings

**Success criteria:**
- [ ] Zero providers with stub "see research notes" descriptions
- [ ] All providers have shortDescription
- [ ] All providers have prosJson and consJson
- [ ] All providers have valueTier set
- [ ] At least 80% of providers have dietary tags
- [ ] At least 80% of providers have flexibility info
- [ ] Provider detail pages show real content (no empty sections)
- [ ] `next build` passes

### Phase 25: Pricing & Plans

**Goal:** Create Plan records with real pricing data for all providers, properly handling the different pricing models (per-serving for meal kits, per-box for protein/produce/specialty), and update denormalized min/max price fields on providers.

**Requirements:**
- R25.1: Create at least 1 Plan record for every active provider (currently 77+ have zero plans)
- R25.2: For meal kits and prepared meals: populate pricePerServingCents accurately
- R25.3: For protein/produce/specialty boxes: populate pricePerBoxCents as primary metric
- R25.4: Set shippingCostCents and freeShipping accurately for all plans
- R25.5: Include plan names and descriptions that explain the pricing model
- R25.6: Update denormalized Provider fields (minPricePerServingCents, maxPricePerServingCents) via recompute
- R25.7: Build batch pricing script using xAI Responses API to research current prices
- R25.8: Handle complex pricing models (Blue Apron a-la-carte, Hungryroot credits, Misfits grocery) with representative plans

**Success criteria:**
- [ ] Zero providers with "Price not available" on cards or detail pages
- [ ] All meal kit/prepared meal providers have per-serving pricing
- [ ] All protein/produce/specialty providers have per-box pricing
- [ ] Denormalized min/max price fields are accurate
- [ ] Plans section on detail pages shows real pricing data
- [ ] `next build` passes

### Phase 26: SEO, FAQs & Validation

**Goal:** Complete SEO metadata for all providers, generate FAQ content, populate affiliate URLs, and cross-validate all data against live provider websites to ensure accuracy.

**Requirements:**
- R26.1: Generate `metaTitle` and `metaDescription` for all providers missing them
- R26.2: Create 2-3 ProviderFaq records for each provider
- R26.3: Populate `affiliateUrl` for providers with known affiliate programs
- R26.4: Cross-validate key data (status, pricing, dietary info) against live provider websites using xAI + Firecrawl
- R26.5: Set `lastVerifiedAt` timestamp for all validated providers
- R26.6: Fix any data inaccuracies found during validation
- R26.7: Ensure all provider detail pages have FAQ schema (JSON-LD) rendering

**Success criteria:**
- [ ] All providers have metaTitle and metaDescription
- [ ] All providers have at least 2 FAQs
- [ ] Affiliate URLs populated for major providers
- [ ] lastVerifiedAt set for all validated providers
- [ ] No critical data inaccuracies remain
- [ ] FAQ JSON-LD renders on provider detail pages
- [ ] `next build` passes

<details>
<summary>✅ v2.1 Navigation & About Page (Phases 20-21) -- SHIPPED 2026-03-23</summary>

- [x] **Phase 20: Navigation Refinement** (1/1 plans) -- completed 2026-03-23
- [x] **Phase 21: About Page** (1/1 plans) -- completed 2026-03-23

</details>

<details>
<summary>✅ v2.0 Unified Discovery Interface (Phases 17-19) -- SHIPPED 2026-03-22</summary>

- [x] **Phase 17: Unified Discovery Page** -- Build the core /search page with unified provider grid, category quick-filters, left sidebar filters, search bar, and feedback states
- [x] **Phase 18: Accessibility & Design System Updates** -- Increase all font/button/card sizes for elderly accessibility, add category color tokens, update component sizing across the site
- [x] **Phase 19: Navigation & Route Simplification** -- Simplify header nav, update homepage CTA, redirect old category routes to /search, remove redundant pages

</details>

<details>
<summary>✅ v1.0 MVP (Phases 1-16) -- SHIPPED 2026-03-22</summary>

- [x] Phase 1: Data Foundation (2/2 plans) -- completed 2026-03-21
- [x] Phase 2: Query Layer and Filter Infrastructure (2/2 plans) -- completed 2026-03-21
- [x] Phase 3: Provider Logos (1/1 plans) -- completed 2026-03-21
- [x] Phase 4: Provider Detail Pages (1/1 plans) -- completed 2026-03-21
- [x] Phase 5: Category Browsing and Filtering (2/2 plans) -- completed 2026-03-21
- [x] Phase 6: Homepage (1/1 plans) -- completed 2026-03-21
- [x] Phase 7: Side-by-Side Comparison (1/1 plans) -- completed 2026-03-21
- [x] Phase 8: Search (1/1 plans) -- completed 2026-03-21
- [x] Phase 9: SEO and Collections (2/2 plans) -- completed 2026-03-21
- [x] Phase 10: Admin (2/2 plans) -- completed 2026-03-21
- [x] Phase 11: UX Polish (1/1 plans) -- completed 2026-03-21
- [x] Phase 12: Critical Design & Accessibility Fixes (3/3 plans) -- completed 2026-03-22
- [x] Phase 13: Design Polish & UX Improvements (4/4 plans) -- completed 2026-03-22
- [x] Phase 14: Visual Rebrand - Design System Foundation (2/2 plans) -- completed 2026-03-22
- [x] Phase 15: Visual Rebrand - Component Restyling (5/5 plans) -- completed 2026-03-22
- [x] Phase 16: Visual Rebrand - Page Restyling (4/4 plans) -- completed 2026-03-22

</details>

Full details: `.planning/milestones/`

---
*Last updated: 2026-03-23 after Phase 24 planning complete*
