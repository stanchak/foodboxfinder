# FoodBoxFinder

## What This Is

A Kayak-like discovery and comparison website for food box subscription services. Consumers can browse 95+ providers across meal kits, prepared meals, protein boxes, produce boxes, and specialty subscriptions — filtering by many criteria (diet, prep style, value tier, household fit, flexibility, geography) and comparing 2-3 providers side-by-side. Built on Next.js 16 with a Prisma/Neon PostgreSQL backend, deployed on Vercel.

## Core Value

Consumers can quickly discover and compare food box subscriptions that match their dietary needs, budget, and preferences — with transparent criteria and visual brand identity.

## Requirements

### Validated

- ✓ Next.js 16 + React 19 + Tailwind CSS 4 + Prisma 7.5 + Neon PostgreSQL stack configured — existing
- ✓ Prisma schema with Provider, Plan, Review, BlogPost, Collection, AffiliateClick models — existing
- ✓ Admin route protection via proxy.ts + ADMIN_SECRET — existing
- ✓ Database singleton with Neon adapter and HMR-safe caching — existing
- ✓ Root layout with Geist fonts and global CSS — existing
- ✓ Provider logo/graphic assets for 95 providers prepared and integrity-checked — existing
- ✓ Normalized dataset of 95 providers with research-backed fields — existing
- ✓ Research corpus covering 5 categories with landscape analysis — existing

### Active

- [ ] Extend Provider schema with dataset fields (model_type, prep_style, diet_tags, household_fit, value_tier, geography, shipping_notes, flexibility, pricing_signal, secondary_tags, status)
- [ ] Seed script to import all 95 providers from food-box-companies.json into database
- [ ] Homepage with hero, featured providers, category cards, and social proof
- [ ] Category listing pages with multi-criteria filtering (category, prep style, diet tags, value tier, household fit, geography, flexibility, model type, status)
- [ ] URL search params drive all filter/sort state (shareable URLs)
- [ ] Provider detail pages with full info, plans, logo, and SEO metadata
- [ ] Side-by-side comparison UI for 2-3 providers with field matrix
- [ ] Comparison page with shareable URL/state
- [ ] Comparison tray (floating bar) for selecting providers to compare
- [ ] Provider logo rendering from manifest across cards, detail pages, and compare headers
- [ ] Fallback image behavior when provider logo is missing
- [ ] SEO metadata (title, description) and JSON-LD structured data on every public page
- [ ] Category hub pages generated from provider data
- [ ] Search functionality across providers
- [ ] Admin CRUD for provider management
- [ ] Admin dashboard with stats
- [ ] Query layer with React.cache() for request-level deduplication
- [ ] Error boundaries (error.tsx), not-found pages (not-found.tsx), and loading states (loading.tsx)
- [ ] Mobile-responsive design across all pages
- [ ] Affiliate click tracking for outbound provider links

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

### Existing Codebase
- Next.js 16.2 app with App Router, Server Components by default
- Prisma schema has Provider, Plan, ProviderDietaryTag, Review, ProviderFaq, BlogPost, Collection, CollectionItem, AffiliateClick
- Current schema needs extension for dataset fields (model_type, prep_style, household_fit, value_tier, geography, flexibility, etc.)
- proxy.ts protects /admin/* routes
- No pages built yet beyond default Next.js template
- Codebase map available at .planning/codebase/

### Import Strategy
- One-time seed from food-box-companies.json
- Extend existing Prisma schema (don't rebuild from scratch)
- Import active + hybrid providers first, then unclear with labeling
- After import, manage providers via admin UI

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
| Extend existing Prisma schema rather than rebuild | Preserve existing models (Review, Blog, Collection) for future use | -- Pending |
| One-time seed import rather than repeatable sync | Simpler implementation; admin UI handles ongoing changes | -- Pending |
| SEO built into pages as we go | Discovery site needs organic traffic; not a blocker but a co-requirement | -- Pending |
| Admin UI retained for v1 | Need way to manage providers after import | -- Pending |
| Keep Review/Blog/Collection schemas but defer UI | Reduces scope while preserving future capability | -- Pending |

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
*Last updated: 2026-03-21 after initialization*
