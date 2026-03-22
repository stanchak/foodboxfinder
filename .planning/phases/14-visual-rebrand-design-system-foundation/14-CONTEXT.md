# Phase 14: Visual Rebrand - Design System Foundation - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning
**Source:** Brand Guardian brief (.planning/BRAND_BRIEF.md) + UI Designer redesign spec

<domain>
## Phase Boundary

Replace the entire design token system in globals.css, swap fonts from Geist to Inter + Source Serif 4, and update the foundation components (Badge, Button) to the new design language. This phase creates the design system that phases 15-16 build on.

</domain>

<decisions>
## Implementation Decisions

### Color System (from Brand Brief)
Replace green primary with deep teal, coral accent with warm amber:
- Primary: deep teal hue ~190 (oklch values in .planning/BRAND_BRIEF.md section 3)
- Accent: warm amber hue ~48-80 (oklch values in .planning/BRAND_BRIEF.md section 3)
- Signal green: demoted to semantic success-only
- Neutrals: warm grays with brown/amber undertones
- Page background: warm off-white oklch(0.985 0.004 80) instead of pure white
- Add surface tokens: surface-50, surface-100, surface-200 for warm backgrounds

### Typography (from Brand Brief)
- Replace Geist Sans with Inter (better tabular figures, optical sizing)
- Add Source Serif 4 for editorial content (blog, collection descriptions)
- Keep Geist Mono for price displays
- Load via next/font/google in layout.tsx

### Shadow System (from UI Designer)
Replace 3-level shadow system with 5-level:
- shadow-xs, shadow-sm, shadow-md, shadow-lg, shadow-xl
- Remove old shadow-card, shadow-card-hover, shadow-header tokens

### Radius System (from UI Designer)
- rounded-md for badges
- rounded-lg for buttons/inputs
- rounded-xl for secondary cards
- rounded-2xl for primary cards and hero elements
- rounded-full for pills and avatars

### Button Component (from UI Designer)
- font-medium -> font-semibold
- transition-colors -> transition-all duration-200
- Add active:scale-[0.98] press feedback
- Add shadow-sm on primary, shadow on hover
- Secondary: border -> border-2
- Ghost: text-gray-600 hover:text-gray-900
- Bigger sizes: add gap-* for icon spacing

### Badge Component (from UI Designer)
- rounded-full -> rounded-md (squared-off labels)
- text-xs -> text-[11px] font-semibold uppercase tracking-wider
- Stronger ring colors: ring-primary-200 instead of ring-primary-600/20
- Remove ring-inset from base, variants carry own ring

### Claude's Discretion
- Exact oklch values for warm neutral palette
- Transition timing tokens
- Any adjustments needed to make brand colors work with existing component structure

</decisions>

<code_context>
## Existing Code Insights

### Files to Modify
- `src/app/globals.css` — complete token replacement
- `src/app/layout.tsx` — font swap (Geist -> Inter + Source Serif 4)
- `src/components/Badge.tsx` — new badge design
- `src/components/Button.tsx` — new button design

### Key References
- `.planning/BRAND_BRIEF.md` — full color palette with oklch values
- UI Designer redesign spec — exact Tailwind class changes

</code_context>

<specifics>
## Specific Ideas

- The brand brief has complete oklch values for all 11 primary shades and 11 accent shades
- Font swap: `import { Inter, Source_Serif_4, Geist_Mono } from "next/font/google"`
- Body text color: text-gray-800 instead of text-gray-900 (less harsh)
- Add -webkit-font-smoothing: antialiased to body

</specifics>

<deferred>
## Deferred Ideas

None — all design system work is in this phase

</deferred>
