# FoodBoxFinder

## What This Is

A Kayak-like discovery and comparison website for food box subscription services. Consumers can browse 95+ providers across meal kits, prepared meals, protein boxes, produce boxes, and specialty subscriptions — filtering by many criteria (diet, prep style, value tier, household fit, flexibility, geography) and comparing 2-3 providers side-by-side. Built on Next.js 16 with a Prisma/Neon PostgreSQL backend, deployed on Vercel.

## Core Value

Consumers can quickly discover and compare food box subscriptions that match their dietary needs, budget, and preferences — with transparent criteria and visual brand identity.

## Requirements

### Validated

- ✓ Next.js 16 + React 19 + Tailwind CSS 4 + Prisma 7.5 + Neon PostgreSQL stack — v1.0
- ✓ Extended Provider schema with 13 dataset fields + ProviderStatus/ValueTier enums — v1.0
- ✓ 95 providers seeded from research dataset with logo paths from manifest — v1.0
- ✓ Homepage with hero, featured providers, category cards, social proof — v1.0
- ✓ Category listing pages with 9-dimension multi-criteria filtering — v1.0
- ✓ URL search params drive all filter/sort state (shareable URLs) — v1.0
- ✓ Provider detail pages with full info, plans, logo, and SEO metadata — v1.0
- ✓ Side-by-side comparison UI for 2-3 providers with field matrix — v1.0
- ✓ Comparison page with shareable canonical URLs — v1.0
- ✓ Comparison tray (floating bar) for selecting providers to compare — v1.0
- ✓ Provider logo rendering with full-bleed hero images and fallbacks — v1.0
- ✓ SEO metadata + JSON-LD + canonical URLs + sitemap on all public pages — v1.0
- ✓ Category hub pages with editorial intros and breadcrumbs — v1.0
- ✓ Server-side search across providers with expandable header bar — v1.0
- ✓ Admin CRUD with all schema fields + revalidation — v1.0
- ✓ Admin dashboard with stats and category breakdown — v1.0
- ✓ Query layer with React.cache() split into domain files — v1.0
- ✓ Error boundaries, 404 pages, loading skeletons on all routes — v1.0
- ✓ Mobile-responsive design with filter drawer — v1.0
- ✓ Affiliate click tracking for outbound provider links — v1.0
- ✓ WCAG 2.1 AA accessibility (skip nav, focus traps, ARIA, keyboard nav) — v1.0
- ✓ Visual rebrand: deep teal + warm amber palette, Inter font, modern design system — v1.0
- ✓ 6 curated "Best for X" collection pages — v1.0

- ✓ Unified Kayak-style /search page replacing separate category pages — v2.0
- ✓ Category quick-filter buttons with per-category color coding (5 palettes) — v2.0
- ✓ Elderly-accessible font sizes (16px min body, 44px+ touch targets) — v2.0
- ✓ Simplified navigation (Discover/Compare/Best Of/Blog) — v2.0
- ✓ Large left sidebar filters with chip-style button interactions — v2.0
- ✓ Zero-results and filter-applied feedback states — v2.0
- ✓ 301 redirects for old category URLs preserving SEO — v2.0
- ✓ Mobile bottom sheet filter drawer — v2.0
- ✓ Citrus Pop theme (orange primary, teal accent, Nunito fonts) — v2.0
- ✓ AI-generated cover images for collections and blog posts — v2.0
- ✓ FoodBoxFinder mascot logo with transparent background — v2.0

- ✓ Compare demoted from top-level nav; Best Of + Blog visually elevated — v2.1
- ✓ About page with mission, methodology, and affiliate disclosure — v2.1
- ✓ About link in Header, MobileNav, and Footer — v2.1
- ✓ AboutPage JSON-LD structured data and sitemap entry — v2.1

- ✓ Audit existing 95 providers for data completeness across all schema fields — v3.0
- ✓ Research the full food box subscription market to identify missing providers — v3.0
- ✓ Populate real pricing data (per serving, per box) for all providers — v3.0
- ✓ Fill missing fields: dietary tags, prep style, household fit, geography, flexibility, descriptions — v3.0
- ✓ Obtain proper logos/graphics for all providers (eliminate fallbacks) — v3.0
- ✓ Validate accuracy of existing provider data against current provider websites — v3.0
- ✓ Build import/update tooling for bulk data operations — v3.0

### Active

(None — planning next milestone)



### Out of Scope

- Automated live pricing sync from provider websites — too complex, manual updates via admin
- Personalized recommendation engine — v2 feature, not needed for discovery MVP
- Affiliate payout optimization pipeline — revenue optimization is post-launch
- User accounts / authentication — no user login needed, admin uses ADMIN_SECRET
- Dark mode — deprioritized for launch
- Real-time chat or support features — not relevant to discovery product
- Review submission by users — keep schema but defer UI to post-launch
- Blog post authoring/publishing UI — keep schema but defer to post-launch
- Collection curation UI — keep schema but defer to post-launch

## Context

### Data Assets
- **Provider dataset**: `temp/plandocs/food-box-companies.json` — 95 providers, normalized from research. Fields: slug, name, website, primary_category, secondary_tags, model_type, prep_style, diet_tags, household_fit, value_tier, geography, shipping_notes, flexibility, pricing_signal, status, summary, source_urls, source_files, notes.
- **Provider logos**: `public/assets/providers/` with `manifest.json` — 95 valid asset paths. Two providers use fallback SVG placeholders (munchpak, sips-by).
- **Research corpus**: `temp/plandocs/` — MASTER-LANDSCAPE.md, category deep-dives (meal-kits, prepared-meals, protein-boxes, produce-boxes, specialty-boxes), taxonomy rubric, content matrix.
- **Status breakdown**: 66 active/hybrid providers (priority), remaining are unclear/discontinued.

### Current State (v3.0 shipped)
- 117 providers (106 active, 10 hybrid, 1 discontinued) with complete data across all fields
- 170 pricing Plans, 341 FAQs, 326 dietary tags, 27 affiliate URLs
- Full SEO: metaTitle + metaDescription + FAQ JSON-LD on all 116 active provider pages
- Unified /search discovery, 9-dimension filtering, side-by-side comparison
- Citrus Pop theme (orange primary, teal accent, Nunito fonts) with elderly-accessible sizing
- Streamlined nav: Discover | Best Of | Blog | About
- WCAG 2.1 AA accessible
- Parent company tracking (18 providers linked to 8 corporate groups)
- 8 data tooling scripts for bulk enrichment, pricing research, and validation

### Data Tooling
- `prisma/scripts/24-enrich-providers.ts` — xAI-powered content enrichment
- `prisma/scripts/25-create-plans.ts` — xAI-powered pricing research
- `prisma/scripts/26-generate-meta-faqs.ts` — SEO meta + FAQ generation
- `prisma/scripts/26-affiliate-validate.ts` — Affiliate URL + data validation

## Constraints

- **Tech Stack**: Next.js 16.2, React 19, Tailwind CSS 4, Prisma 7.5, Neon PostgreSQL — already configured, no changes
- **Hosting**: Vercel free tier — serverless, ISR support
- **Next.js 16 Breaking Changes**: params/searchParams are Promises (must await), proxy.ts replaces middleware.ts, async cookies()/headers()/draftMode()
- **No Auth**: Admin protected by proxy.ts + ADMIN_SECRET env var only. No user accounts.
- **Images**: Provider logos in public/assets/providers/ with manifest.json. Next.js Image with remotePatterns for any external images.
- **Budget**: Minimal — no paid APIs, no premium services beyond Neon and Vercel free tiers
- **Data source**: food-box-companies.json is the source of truth for initial provider data. Many fields are sparsely populated (conservative defaults from research).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Extend existing Prisma schema rather than rebuild | Preserve existing models (Review, Blog, Collection) for future use | ✓ Good — added parentCompany field in v3.0 |
| One-time seed import rather than repeatable sync | Simpler implementation; admin UI handles ongoing changes | ✓ Good — scripts are idempotent, admin handles updates |
| SEO built into pages as we go | Discovery site needs organic traffic; not a blocker but a co-requirement | ✓ Good — 100% meta + FAQ JSON-LD coverage |
| Admin UI retained for v1 | Need way to manage providers after import | ✓ Good — parentCompany field added in v3.0 |
| Keep Review/Blog/Collection schemas but defer UI | Reduces scope while preserving future capability | ✓ Good |
| xAI Responses API for bulk data research | Live web search for provider data, pricing, validation | ✓ Good — powered Phases 24-26 enrichment |
| Template-based fallback for API rate limits | Ensures 100% coverage when API credits exhausted | ✓ Good — prevented blocking on API availability |
| Research-sourced pricing fallback | Review site data as alternative to live web scraping | ✓ Good — 100% pricing coverage despite API limits |
| Demote Compare from nav, elevate Best Of + Blog | Compare is a tool accessed via provider cards, not a destination | ✓ Good |
| Two-tier nav link styling (elevated vs standard) | Best Of + Blog get accent colors as primary content links | ✓ Good |
| Static About page (no dynamic content) | Simple content page, no database queries needed | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-23 after v3.0 milestone complete*
