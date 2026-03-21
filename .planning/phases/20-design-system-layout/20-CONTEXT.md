# Phase 20: Design System & Layout - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the visual foundation for FoodBoxFinder: branded Tailwind CSS 4 theme tokens (colors, typography, spacing), a responsive root layout with header and footer (375px–1440px), and a base component library (Button, Card, Badge, Input, Select, Rating stars, loading skeletons). Every subsequent phase builds on these components and layout.

</domain>

<decisions>
## Implementation Decisions

### Brand & Color Palette
- **D-01:** Fresh, appetizing color direction — warm green primary (#22c55e range), coral/orange accent for CTAs, neutral grays for text/backgrounds. Food-discovery aesthetic, not corporate.
- **D-02:** Typography uses Geist Sans (already loaded) as primary. Clean, modern, highly readable. Define a type scale: xs through 4xl matching Tailwind defaults.
- **D-03:** Light mode only for MVP (dark mode explicitly out of scope per PROJECT.md). Remove the dark mode media query from globals.css.

### Navigation Structure
- **D-04:** Header contains: logo (left), category nav links for all 5 categories (center/horizontal on desktop, hidden on mobile), search bar placeholder (right), mobile hamburger button (right, mobile only).
- **D-05:** Mobile navigation uses a slide-out drawer (hamburger toggle) with all category links, search link, and compare link.
- **D-06:** Footer has 3–4 columns: Categories (all 5 links), Resources (blog, methodology, about), Legal (privacy, terms), and branding/copyright.
- **D-07:** Sticky header on scroll for easy navigation access.

### Component Visual Style
- **D-08:** Cards use subtle shadow (`shadow-sm`), rounded corners (`rounded-xl`), white background, with hover elevation transition. Consistent across provider cards, blog cards, collection cards.
- **D-09:** Button variants: Primary (filled green, white text), Secondary (outlined, green border/text), Ghost (no border, text only with hover background). All with rounded-lg and consistent padding.
- **D-10:** Badge component for dietary tags and category labels — pill-shaped (`rounded-full`), small, color-coded by type.
- **D-11:** Rating stars display: 5-star visual (filled/empty SVG stars in amber/yellow) with numeric score beside. Supports half-star rendering.
- **D-12:** Loading skeletons: pulse animation placeholders matching the shape of each component (card skeleton, text skeleton, rating skeleton).

### Layout & Spacing
- **D-13:** Max content width 1280px (`max-w-7xl`), centered with horizontal padding (px-4 mobile, px-6 tablet, px-8 desktop).
- **D-14:** Standard Tailwind 4px spacing scale — no custom spacing tokens needed.
- **D-15:** Responsive breakpoints: mobile-first using Tailwind defaults (sm:640px, md:768px, lg:1024px, xl:1280px).

### Claude's Discretion
- Exact hex color values within the green/coral palette direction
- Shadow depths and hover transition durations
- Skeleton animation timing
- Footer column arrangement on mobile (stacked vs accordion)
- Input/Select component exact border styles and focus ring colors

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specifications
- `.planning/PROJECT.md` — Core value, constraints, SEO URL structure, category definitions
- `.planning/REQUIREMENTS.md` — DS-01, DS-02, DS-03 requirement details
- `.planning/ROADMAP.md` — Phase 20 success criteria and dependencies

### Existing code
- `src/app/layout.tsx` — Current root layout (Geist fonts loaded, minimal structure)
- `src/app/globals.css` — Current CSS with Tailwind v4 import and basic CSS vars
- `src/lib/format.ts` — Price formatting utilities (components will use these)
- `src/lib/queries.ts` — Query layer (layout may need provider counts for nav)

### Next.js 16 docs
- `node_modules/next/dist/docs/01-app/` — App Router conventions, especially layout patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/format.ts`: formatPrice, formatPriceRange, formatPriceLabel — components displaying prices should use these
- `src/lib/queries.ts`: Query functions for provider data — layout header could use `getProvidersByCategory` for counts
- Geist Sans and Geist Mono fonts already loaded in layout.tsx via next/font/google

### Established Patterns
- Tailwind CSS 4 with `@import "tailwindcss"` and `@theme inline` block in globals.css
- CSS custom properties for theming (`--background`, `--foreground`)
- Server Components by default — layout.tsx is already a Server Component

### Integration Points
- `src/app/layout.tsx` — Will be refactored to include Header and Footer components
- `src/app/globals.css` — Theme tokens (colors, typography) defined here via `@theme inline`
- `src/components/` — New directory for all base components (does not exist yet)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — auto-selected recommended defaults for a food subscription discovery site. Standard patterns: appetizing color palette, clean modern typography, elevated cards, mobile-first responsive layout.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 20-design-system-layout*
*Context gathered: 2026-03-20*
