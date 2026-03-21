# Phase 20: Design System & Layout - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-20
**Phase:** 20-design-system-layout
**Areas discussed:** Brand & Color Palette, Navigation Structure, Component Visual Style, Layout & Spacing
**Mode:** Auto (--auto flag, all recommended defaults selected)

---

## Brand & Color Palette

| Option | Description | Selected |
|--------|-------------|----------|
| Fresh & appetizing | Warm greens, coral/orange accents — food discovery aesthetic | ✓ |
| Corporate clean | Blues and grays — professional but generic | |
| Bold & playful | Bright multi-color — fun but harder to maintain consistency | |

**User's choice:** [auto] Fresh & appetizing (recommended default)
**Notes:** Food subscription discovery sites conventionally use warm, appetizing colors. Green conveys freshness/health, coral/orange drives action on CTAs.

### Typography

| Option | Description | Selected |
|--------|-------------|----------|
| Clean modern sans-serif (Geist) | Already loaded, professional, highly readable | ✓ |
| Serif + sans pairing | More editorial feel, additional font load | |

**User's choice:** [auto] Geist Sans (recommended — already loaded, zero additional font cost)

---

## Navigation Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Category links + search + compare | All 5 categories visible in desktop nav | ✓ |
| Minimal (logo + search only) | Categories in dropdown or homepage only | |

**User's choice:** [auto] Category links + search + compare (recommended — SEO benefit from persistent category links)

### Mobile Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger with slide-out drawer | Standard mobile pattern, room for all links | ✓ |
| Bottom tab bar | iOS-style, limited slots | |

**User's choice:** [auto] Hamburger drawer (recommended default for content-heavy sites)

---

## Component Visual Style

### Cards

| Option | Description | Selected |
|--------|-------------|----------|
| Elevated with subtle shadow | Modern, clean, clear content separation | ✓ |
| Flat with border | Simpler, less visual depth | |
| Gradient accent | Eye-catching but harder to maintain | |

**User's choice:** [auto] Elevated cards (recommended — modern standard for comparison/directory sites)

### Buttons

| Option | Description | Selected |
|--------|-------------|----------|
| Primary/Secondary/Ghost | Three variants covering all use cases | ✓ |
| Primary/Secondary only | Simpler but may need ghost later | |

**User's choice:** [auto] Three variants (recommended — covers CTAs, secondary actions, and subtle interactions)

### Rating Display

| Option | Description | Selected |
|--------|-------------|----------|
| Filled stars + numeric score | Visual + precise, most informative | ✓ |
| Numeric only | Simple but less visual impact | |
| Stars only | Visual but imprecise | |

**User's choice:** [auto] Stars + numeric (recommended — standard for review/comparison sites)

---

## Layout & Spacing

| Option | Description | Selected |
|--------|-------------|----------|
| 1280px max-width | Standard for content-heavy sites, comfortable reading | ✓ |
| 1024px max-width | Narrower, more focused | |
| Full-width | Edge-to-edge, needs careful content management | |

**User's choice:** [auto] 1280px (recommended — balances content density with readability)

### Spacing System

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind defaults (4px base) | No custom config needed, well-established | ✓ |
| Custom 8px grid | More intentional but requires custom config | |

**User's choice:** [auto] Tailwind defaults (recommended — no additional complexity)

---

## Claude's Discretion

- Exact hex color values within green/coral direction
- Shadow depths and hover transitions
- Skeleton animation timing
- Footer mobile arrangement
- Input/Select border and focus styles

## Deferred Ideas

None — all discussion stayed within phase scope.
