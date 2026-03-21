# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-21
**Phases:** 12 | **Plans:** 6 (formal) | **Sessions:** ~4

### What Was Built
- Complete food box subscription discovery site with 18 real providers across 5 categories
- Prisma schema with integer cents pricing, JSONB editorial fields, denormalized price fields
- Centralized query layer with 10 React.cache()-wrapped functions
- Branded Tailwind CSS 4 theme with OKLCH green/coral palettes
- Responsive layout with sticky header, mobile drawer, 4-column footer
- 7 typed Server Components (Button, Card, Badge, Input, Select, RatingStars, Skeleton)
- All consumer pages: homepage, 5 category listings, provider detail, comparison, collections, blog, search
- Review submission system with moderation workflow
- Admin dashboard with provider CRUD, review moderation, content management
- SEO infrastructure: sitemap, JSON-LD, canonical URLs, OG metadata
- Affiliate click tracking with analytics

### What Worked
- GSD formal planning (phases 10-20) produced high-quality, well-documented foundation work
- Integer cents pricing decision avoided floating-point bugs across the entire app
- React.cache() deduplication in query layer simplified data fetching in Server Components
- OKLCH color space gave perceptually consistent palette across light/dark variations
- Server Components by default kept client JS minimal

### What Was Inefficient
- Phases 30-120 were implemented in bulk outside the GSD workflow, skipping planning/verification artifacts
- Requirements checkboxes were not updated as phases 30-120 were completed
- STATE.md fell out of sync after bulk implementation
- No formal verification (UAT) was run on any phase

### Patterns Established
- Variant lookup objects with `as const` for type-safe Tailwind class mapping
- SVG linearGradient technique for half-star ratings using CSS custom properties
- Category mapping utility as a pure function (no server imports) for shared Server/Client use
- Footer uses stacked columns on mobile without JS (no accordion pattern)
- Z-index hierarchy: Header z-40, mobile drawer z-50

### Key Lessons
1. Bulk implementation saves time but creates documentation debt — requirements, STATE.md, and summaries all fell out of sync
2. The GSD formal workflow is most valuable for foundational/infrastructure work (schema, components) where decisions compound
3. Consumer pages with clear specs can be built rapidly without per-phase planning overhead
4. Integer cents for pricing should be a default for any financial data

### Cost Observations
- Model mix: ~60% opus, ~40% sonnet (quality profile)
- Sessions: ~4
- Notable: Phases 10-20 used full agent workflow (researchers, plan checkers). Phases 30-120 were direct implementation — significantly faster but less documented.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~4 | 12 | First milestone. GSD formal for foundation, bulk for pages. |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 0 | 0% | N/A |

### Top Lessons (Verified Across Milestones)

1. (Needs verification across multiple milestones)
