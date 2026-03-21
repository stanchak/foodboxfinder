# FoodBoxFinder

## What This Is

A live discovery, comparison, and directory website for food box subscription services. Consumers can find and compare meal kits, prepared meals, protein boxes, produce boxes, and specialty food subscriptions through mobile-first UX, comprehensive filtering, side-by-side comparisons, and SEO-optimized content. Includes an internal admin interface for content management and affiliate click tracking for revenue.

## Core Value

Consumers can quickly discover and compare food box subscriptions that match their dietary needs, budget, and preferences — with trustworthy reviews and transparent pricing.

## Requirements

### Validated

- ✓ Next.js 16.2 App Router project scaffolded with TypeScript strict mode — existing
- ✓ Prisma 7.5 schema with 10 models and 5 enums defined — existing
- ✓ Neon PostgreSQL database provisioned with connection configured — existing
- ✓ Prisma client singleton with PrismaPg adapter at `src/lib/db.ts` — existing
- ✓ Tailwind CSS 4 configured with PostCSS — existing
- ✓ Database seeded with 18 real food box providers across 5 categories — v1.0
- ✓ Branded Tailwind CSS 4 theme with green/coral OKLCH palette, typography, shadows — v1.0
- ✓ Responsive root layout with sticky header, mobile drawer, 4-column footer — v1.0
- ✓ Base component library (Button, Card, Badge, Input, Select, RatingStars, Skeleton) — v1.0
- ✓ Beautiful, responsive homepage with hero, featured providers, category cards — v1.0
- ✓ Filterable category listing pages with URL-driven state (5 categories) — v1.0
- ✓ Comprehensive provider detail pages with plans, pricing, reviews, FAQs — v1.0
- ✓ Side-by-side comparison tool for 2-4 providers — v1.0
- ✓ "Best of" collection pages and blog content engine — v1.0
- ✓ Full-text search across providers, categories, and content — v1.0
- ✓ Review submission system with moderation workflow — v1.0
- ✓ Admin dashboard for provider CRUD, review moderation, content management — v1.0
- ✓ JSON-LD structured data, sitemap, canonical URLs on all pages — v1.0
- ✓ Affiliate click tracking with analytics — v1.0
- ✓ Production-ready error boundaries and loading states — v1.0

### Active

(None — v1.0 shipped. Define new requirements with `/gsd:new-milestone`.)

### Out of Scope

- User accounts / authentication — admin-only auth via env var, reviews are anonymous
- Email notification system — no transactional email for MVP
- Real-time price tracking — static pricing data, manually updated
- Provider API integrations — all data is editorial/curated
- Payment processing — affiliate model only, no direct transactions
- Mobile app — web-first, responsive design covers mobile
- Dark mode — deprioritized for launch, removed entirely in Phase 20
- Quiz / recommendation engine — high complexity, low MVP value
- Promo code aggregation — legal risk, maintenance burden
- Price history charts — requires ongoing data collection infrastructure

## Context

**Domain:** Food box subscription comparison/discovery. Competitive space with sites like meal-kit-comparison.com, mealfinds.com. Differentiation through UX quality, comprehensive filtering, and SEO depth.

**Categories:**
| Category | Slug | Example Providers |
|----------|------|-------------------|
| Meal Kits | meal-kits | HelloFresh, Blue Apron, Home Chef, EveryPlate |
| Prepared Meals | prepared-meals | Factor, CookUnity, Mosaic Foods, Snap Kitchen |
| Protein/Meat | protein-boxes | ButcherBox, Crowd Cow, Good Chop |
| Produce/Grocery | produce-boxes | Misfits Market, Hungryroot, Farmbox Direct |
| Specialty | specialty | Purple Carrot, Green Chef, Sunbasket, Trifecta |

**SEO URL Structure:**
```
/                              → Homepage
/meal-kits                     → Category: Meal Kits
/prepared-meals                → Category: Prepared Meals
/protein-boxes                 → Category: Protein/Meat Boxes
/produce-boxes                 → Category: Produce/Grocery Boxes
/specialty                     → Category: Specialty Diet Boxes
/providers/[slug]              → Provider detail page
/compare/[slug-vs-slug]        → SEO comparison (2 providers, indexed)
/compare?providers=a,b,c       → Flexible comparison (3-4 providers, noindex)
/best/[slug]                   → "Best of" collection pages
/blog                          → Blog index
/blog/[slug]                   → Blog post
/search?q=...                  → Search results
/admin                         → Admin dashboard (protected)
/admin/providers               → Manage providers
/admin/content                 → Manage blog/collections
```

**Current codebase state:** v1.0 MVP shipped. 31,468 LOC TypeScript/CSS across 131 files. Next.js 16.2 + React 19 + Prisma 7.5 + Neon PostgreSQL + Tailwind CSS 4. All 12 consumer-facing pages, admin dashboard, SEO infrastructure, and affiliate tracking built and functional. 18 real providers seeded across 5 categories with plans, reviews, FAQs, and dietary tags.

**Research files:** `.planning/research/` contains SEO-STRATEGY.md, SCHEMA-EXTENDED.md, UX-STRATEGY.md from prior analysis.

## Constraints

- **Tech Stack**: Next.js 16.2, React 19, Tailwind CSS 4, Prisma 7.5, Neon PostgreSQL — already configured, no changes
- **Hosting**: Vercel — serverless, ISR support, no deploy yet
- **Next.js 16 Breaking Changes**: `params`/`searchParams` are Promises (must await), `proxy.ts` replaces `middleware.ts`, async `cookies()`/`headers()`/`draftMode()`
- **No Auth**: Admin protected by `proxy.ts` + `ADMIN_SECRET` env var only. No user accounts.
- **Images**: Provider logos stored as URLs in database. Next.js Image with `remotePatterns`.
- **Budget**: Minimal — no paid APIs, no premium services beyond Neon and Vercel free tiers

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Server Components by default | Maximizes performance and SEO, reduces client JS | ✓ Good |
| URL search params for filter state | Shareable/bookmarkable filtered views, SEO-friendly | ✓ Good |
| Denormalized price fields on Provider | Avoid Plan subqueries in listing queries | ✓ Good |
| proxy.ts for admin auth (not middleware.ts) | Next.js 16 renamed middleware.ts to proxy.ts | ✓ Good |
| Single queries.ts file for MVP | Split when file exceeds 300 lines | ✓ Good |
| deleteAll + create for seed idempotency | Simpler than upsert, clean state each run | ✓ Good |
| Integer cents for all pricing | Avoids IEEE 754 floating-point precision bugs | ✓ Good |
| OKLCH color space for palette | Perceptually uniform, wide gamut support | ✓ Good |
| JSONB for pros/cons fields | Database-level validation vs plain text | ✓ Good |
| React.cache() for query dedup | Zero-config request deduplication in Server Components | ✓ Good |
| Variant lookup objects with `as const` | Type-safe Tailwind class mapping in components | ✓ Good |
| Light mode only for MVP | Simplifies CSS, revisit post-launch | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-21 after v1.0 milestone*
