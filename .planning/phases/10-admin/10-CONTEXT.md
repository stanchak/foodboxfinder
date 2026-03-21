# Phase 10: Admin - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Update admin dashboard, provider CRUD forms, and provider list to support the new schema fields from Phase 1. Ensure on-demand revalidation works from admin mutations.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All decisions at Claude's discretion. Admin already exists:
- Admin dashboard at /admin with stats (provider count, category breakdown, review stats, affiliate clicks)
- Provider CRUD at /admin/providers with ProviderForm component
- Provider list at /admin/providers with search and status filtering
- Admin actions in src/app/actions/admin.ts (createProvider, updateProvider, deleteProvider)
- revalidatePath() already called after mutations

Main work: add new schema fields to ProviderForm and admin list. Verify dashboard and revalidation work correctly.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/admin/page.tsx` -- dashboard with stats
- `src/app/admin/providers/page.tsx` -- provider list with search/filter
- `src/app/admin/providers/new/page.tsx` -- create provider
- `src/app/admin/providers/[id]/edit/page.tsx` -- edit provider
- `src/components/admin/ProviderForm.tsx` -- form component
- `src/app/actions/admin.ts` -- server actions with revalidatePath

### Integration Points
- ProviderForm needs new fields: modelType, prepStyle, valueTier, householdFit, geography, flexibility, shippingNotes, pricingSignal, status (enum)
- Provider list needs status column (replacing active boolean)
- Dashboard stats may need updates for new status enum

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- update existing admin for new schema fields

</specifics>

<deferred>
## Deferred Ideas

None

</deferred>
