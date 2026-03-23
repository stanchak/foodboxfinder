# Phase 20: Navigation Refinement - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Modify Header, MobileNav, and Footer navigation to demote Compare (remove from top-level nav), elevate Best Of + Blog (bigger, more prominent), and add About link. Compare tray and /compare page remain fully functional — they're just not top-level nav items anymore.

</domain>

<decisions>
## Implementation Decisions

### Navigation Hierarchy
- Remove Compare link entirely from Header desktop nav and MobileNav
- Keep Discover as the primary nav item (current styling)
- Elevate Best Of and Blog with larger text (text-lg font-semibold) and accent color on hover
- Add About as a standard nav link after Blog

### About Link Placement
- Desktop Header: Discover | Best Of | Blog | About
- MobileNav: Discover All Providers | Best Of | Blog | About
- Footer: Already has About in Resources column — no change needed

### Claude's Discretion
- Exact hover colors and transition effects for elevated nav items
- Whether to add any visual separator between Discover and the elevated items
- Mobile nav styling details for the elevated items

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Header.tsx` — Server Component with frosted glass header, 4 nav links, logo, search form
- `MobileNav.tsx` — Client Component with drawer, focus trap, scroll lock, 4 nav links
- `Footer.tsx` — 4-column grid, already has About link in Resources section

### Established Patterns
- Nav links use: `text-base font-medium text-neutral-600 hover:text-primary-600 transition-colors`
- Mobile nav links use: `block px-3 py-2.5 text-base font-medium text-neutral-700`
- Focus visible: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`

### Integration Points
- `CompareBar.tsx` and `AddToCompareButton.tsx` drive compare functionality independent of navigation
- Compare tray uses sessionStorage — no nav dependency
- `/compare` route exists and will continue to work

</code_context>

<specifics>
## Specific Ideas

- User wants Best Of and Blog to be "bigger" in the header — interpret as larger text size and bolder weight
- Compare is demoted because it's a tool (accessed via provider cards), not a destination users navigate to directly

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
