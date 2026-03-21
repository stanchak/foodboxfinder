# Phase 1: Data Foundation - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend the Prisma schema with new enum and string fields to match the research dataset, convert 5 .ico logo files to .png, and create a seed script that imports all 95 providers from food-box-companies.json with logo paths from the manifest.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion -- pure infrastructure phase. Key technical decisions:
- Enum vs string fields for sparse dataset values (model_type, prep_style, value_tier, etc.)
- Field mapping between JSON dataset keys and Prisma schema field names
- .ico to .png conversion approach
- Seed script error handling and idempotency strategy
- How to handle pipe-delimited fields (secondary_tags, diet_tags, household_fit) during import

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/db.ts` -- Prisma singleton with Neon adapter
- `prisma/seed.ts` -- existing seed script (may need replacement or extension)
- `prisma/schema.prisma` -- existing schema with Provider, Plan, ProviderDietaryTag, Review, ProviderFaq, BlogPost, Collection, CollectionItem, AffiliateClick models
- `src/lib/categories.ts` -- CategoryType enum slug mapping

### Established Patterns
- Prisma enums for fixed value sets (CategoryType, DietaryTag, PlanFrequency, ReviewStatus, ContentStatus)
- `cuid()` for primary keys, `@unique` on slugs
- Denormalized fields on Provider (averageRating, reviewCount, minPricePerServingCents, etc.)
- JSON stored as String @db.Text with *Json suffix (prosJson, consJson)
- Section dividers with `// --- Section Name ---` comments in schema

### Integration Points
- `temp/plandocs/food-box-companies.json` -- source dataset (95 providers)
- `public/assets/providers/manifest.json` -- logo asset manifest
- `src/generated/prisma/` -- regenerated after schema changes
- Neon PostgreSQL via DATABASE_URL

</code_context>

<specifics>
## Specific Ideas

- Dataset fields are all strings with pipe-delimited multi-values -- need to decide which become enums vs remain strings
- Many dataset fields are sparsely populated (4-16% for diet_tags, household_fit, etc.) -- nullable fields are essential
- Status should be an enum (ACTIVE, HYBRID, UNCLEAR, DISCONTINUED) replacing the boolean active field
- The 5 .ico files to convert: blue-apron, farm-fresh-to-you, farmbox-delivery, full-circle, crowd-cow

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>
