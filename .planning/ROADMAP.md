# Roadmap: FoodBoxFinder

## Milestones

- ✅ **v1.0 MVP** — Phases 1-16 (shipped 2026-03-22)
- 🔄 **v2.0 Unified Discovery Interface** — Phases 17-19

## Phases

### v2.0 Unified Discovery Interface

- [ ] **Phase 17: Unified Discovery Page** — Build the core /discover page with unified provider grid, category quick-filters, left sidebar filters, search bar, and feedback states
- [ ] **Phase 18: Accessibility & Design System Updates** — Increase all font/button/card sizes for elderly accessibility, add category color tokens, update component sizing across the site
- [ ] **Phase 19: Navigation & Route Simplification** — Simplify header nav, update homepage CTA, redirect old category routes to /discover, remove redundant pages

## Progress

| Phase | Name | Status | Plans | Started | Completed |
|-------|------|--------|-------|---------|-----------|
| 17 | Unified Discovery Page | Pending | — | — | — |
| 18 | Accessibility & Design System Updates | Pending | — | — | — |
| 19 | Navigation & Route Simplification | Pending | — | — | — |

## Phase Details

### Phase 17: Unified Discovery Page

**Goal:** Create a single /discover page where users can browse, filter, and search all 95+ providers across all categories — the Kayak-style unified interface.

**Requirements:** UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UX-01, UX-02, UX-03

**Success Criteria:**
1. User can visit /discover and see all providers in a responsive card grid
2. Category quick-filter buttons at the top filter providers by type with visual feedback
3. Left sidebar with all 9 filter dimensions, each with clear labels and interactive controls
4. Search bar at top of page filters providers by name/keyword
5. Active filter chips displayed with count and individual remove buttons
6. URL updates on every filter change (shareable)
7. Zero-results state displays friendly message with clear action buttons
8. Loading skeletons display while results load

### Phase 18: Accessibility & Design System Updates

**Goal:** Update the entire design system for elderly-friendly accessibility — larger fonts, bigger touch targets, category color coding, and increased component sizing.

**Requirements:** A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, CAT-01, CAT-02, CAT-03, CAT-04, SIZE-01, SIZE-02, SIZE-03, SIZE-04, SIZE-05

**Success Criteria:**
1. All body text is 16px+ and filter text is 16px+
2. All interactive elements are 44px+ touch targets
3. Category color tokens defined in globals.css (5 category palettes)
4. Provider cards show category-colored top border
5. Category badges use per-category colors
6. Button, Badge, ProviderCard components updated with larger sizing
7. Results grid uses 3-column desktop layout with generous gaps

### Phase 19: Navigation & Route Simplification

**Goal:** Simplify site navigation to center on /discover, redirect old category pages, and update the homepage.

**Requirements:** NAV-01, NAV-02, NAV-03, NAV-04

**Success Criteria:**
1. Header shows: Logo, Discover, Compare, Best Of, Blog (no individual category links)
2. Homepage hero CTA links to /discover
3. Old category URLs (/meal-kits, /protein-boxes, etc.) redirect to /discover?category={slug}
4. Sitemap updated with new URL structure
5. Compare, Blog, Best Of pages unchanged and accessible

<details>
<summary>✅ v1.0 MVP (Phases 1-16) — SHIPPED 2026-03-22</summary>

- [x] Phase 1: Data Foundation (2/2 plans) — completed 2026-03-21
- [x] Phase 2: Query Layer and Filter Infrastructure (2/2 plans) — completed 2026-03-21
- [x] Phase 3: Provider Logos (1/1 plans) — completed 2026-03-21
- [x] Phase 4: Provider Detail Pages (1/1 plans) — completed 2026-03-21
- [x] Phase 5: Category Browsing and Filtering (2/2 plans) — completed 2026-03-21
- [x] Phase 6: Homepage (1/1 plans) — completed 2026-03-21
- [x] Phase 7: Side-by-Side Comparison (1/1 plans) — completed 2026-03-21
- [x] Phase 8: Search (1/1 plans) — completed 2026-03-21
- [x] Phase 9: SEO and Collections (2/2 plans) — completed 2026-03-21
- [x] Phase 10: Admin (2/2 plans) — completed 2026-03-21
- [x] Phase 11: UX Polish (1/1 plans) — completed 2026-03-21
- [x] Phase 12: Critical Design & Accessibility Fixes (3/3 plans) — completed 2026-03-22
- [x] Phase 13: Design Polish & UX Improvements (4/4 plans) — completed 2026-03-22
- [x] Phase 14: Visual Rebrand - Design System Foundation (2/2 plans) — completed 2026-03-22
- [x] Phase 15: Visual Rebrand - Component Restyling (5/5 plans) — completed 2026-03-22
- [x] Phase 16: Visual Rebrand - Page Restyling (4/4 plans) — completed 2026-03-22

</details>

Full details: `.planning/milestones/v1.0-ROADMAP.md`

---
*Roadmap created: 2026-03-22*
*Milestone: v2.0 Unified Discovery Interface*
