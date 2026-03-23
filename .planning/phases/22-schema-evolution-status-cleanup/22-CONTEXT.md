# Phase 22: Schema Evolution & Status Cleanup - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Add parentCompany field to Prisma schema, update all 28 "unclear" provider statuses to "active", flag Freshly as discontinued, record parent company/ownership relationships for all affected providers, and update the admin form.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase.

Key data inputs from research:
- All 28 "unclear" providers confirmed ACTIVE (see .planning/research/v3-provider-validation.md)
- Parent company mapping (see v3-provider-validation.md "Parent Company Relationships" section)
- Freshly confirmed DISCONTINUED

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `prisma/schema.prisma` — Provider model to extend
- `prisma/seed.ts` — Existing seed script pattern for bulk updates
- `src/app/actions/admin.ts` — Server actions for provider CRUD
- `src/components/admin/ProviderForm.tsx` — Admin form to extend

### Established Patterns
- Schema changes: edit schema.prisma → `npx prisma db push` → `npx prisma generate`
- Bulk data ops: TypeScript scripts run via `npx tsx`
- Admin form: controlled inputs with server action submission

### Integration Points
- Provider model used throughout queries.ts, all listing pages, detail pages
- Status field used in query filtering (active providers shown by default)
- Admin form at /admin/providers/[id]/edit

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
