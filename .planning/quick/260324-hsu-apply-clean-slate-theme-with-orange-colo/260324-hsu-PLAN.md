---
phase: quick
plan: 260324-hsu
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/globals.css
  - src/app/layout.tsx
  - src/components/Header.tsx
  - public/foodboxfinder-logo.jpg
  - .planning/logo-concepts.md
autonomous: true
must_haves:
  truths:
    - "Site uses orange #ea580c as the primary brand color"
    - "Site uses system font stack (no Google font loading for body/heading)"
    - "Header displays the multicolor box logo (v17-08)"
    - "Cards have 0.75rem radius, buttons and badges have pill shape (9999px)"
    - "Shadows are neutral (no warm orange tint)"
    - "Star rating color matches primary orange #ea580c"
    - "Background is pure white, neutrals are true slate (not warm)"
  artifacts:
    - path: "src/app/globals.css"
      provides: "Complete Clean Slate + Orange design tokens"
    - path: "src/app/layout.tsx"
      provides: "System font stack (no Nunito imports)"
    - path: "src/components/Header.tsx"
      provides: "Logo pointing to multicolor box image"
    - path: "public/foodboxfinder-logo.jpg"
      provides: "Copy of v17-08 multicolor logo at root public path"
  key_links:
    - from: "src/app/layout.tsx"
      to: "src/app/globals.css"
      via: "--font-sans and --font-heading CSS variables"
    - from: "src/components/Header.tsx"
      to: "public/foodboxfinder-logo.jpg"
      via: "img src attribute"
---

<objective>
Apply the "Clean Slate" theme with orange color palette and multicolor box logo as the site-wide design system.

Purpose: The user selected this theme+color+logo combination from the design studio. This replaces the current warm-tinted oklch palette, Nunito font stack, and isometric logo with a cleaner, more neutral design anchored by orange #ea580c.

Output: Updated globals.css (all design tokens), layout.tsx (system fonts), Header.tsx (new logo), and copied logo file.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/app/globals.css
@src/app/layout.tsx
@src/components/Header.tsx
@.planning/logo-concepts.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace design tokens in globals.css with Clean Slate + Orange palette</name>
  <files>src/app/globals.css</files>
  <action>
Rewrite ALL color tokens, shadows, and radii in globals.css to implement the Clean Slate theme with orange primary.

**Root variables:**
- `--background`: `#ffffff` (pure white, not warm cream)
- `--foreground`: `#0f172a` (slate-900)

**Font variables in @theme inline block:**
- `--font-sans`: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- `--font-heading`: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- `--font-mono`: keep `var(--font-geist-mono)` (still loaded for code)

**Primary palette (Orange #ea580c = Tailwind orange-600):**
Use the Tailwind orange scale mapped to oklch. These values derive from Tailwind's orange palette:
- `--color-primary-50`: `#fff7ed` (oklch(0.98 0.016 73.684))
- `--color-primary-100`: `#ffedd5` (oklch(0.954 0.038 75.164))
- `--color-primary-200`: `#fed7aa` (oklch(0.901 0.076 70.697))
- `--color-primary-300`: `#fdba74` (oklch(0.837 0.128 66.29))
- `--color-primary-400`: `#fb923c` (oklch(0.75 0.183 55.934))
- `--color-primary-500`: `#f97316` (oklch(0.705 0.213 47.604))
- `--color-primary-600`: `#ea580c` (oklch(0.646 0.222 41.116))
- `--color-primary-700`: `#c2410c` (oklch(0.553 0.195 38.402))
- `--color-primary-800`: `#9a3412` (oklch(0.47 0.157 37.304))
- `--color-primary-900`: `#7c2d12` (oklch(0.408 0.123 38.172))
- `--color-primary-950`: `#431407` (oklch(0.266 0.079 36.259))

**Accent palette (keep Teal Green as-is):** No changes to accent-50 through accent-950. The teal complements orange well.

**Star colors:**
- `--color-star`: `oklch(0.646 0.222 41.116)` (matches primary-600 = #ea580c)
- `--color-star-empty`: `oklch(0.928 0.006 264.532)` (slate-200, neutral gray)

**Neutral palette (true Slate, no warm tinting):**
Replace warm-hued neutrals with Tailwind's slate scale:
- `--color-neutral-50`: `oklch(0.984 0.003 247.858)` (slate-50)
- `--color-neutral-100`: `oklch(0.968 0.007 264.532)` (slate-100)
- `--color-neutral-200`: `oklch(0.928 0.006 264.532)` (slate-200)
- `--color-neutral-300`: `oklch(0.869 0.022 252.894)` (slate-300)
- `--color-neutral-400`: `oklch(0.704 0.04 256.788)` (slate-400)
- `--color-neutral-500`: `oklch(0.554 0.046 257.417)` (slate-500)
- `--color-neutral-600`: `oklch(0.446 0.043 257.281)` (slate-600)
- `--color-neutral-700`: `oklch(0.372 0.044 257.287)` (slate-700)
- `--color-neutral-800`: `oklch(0.279 0.041 260.031)` (slate-800)
- `--color-neutral-900`: `oklch(0.208 0.042 265.755)` (slate-900)
- `--color-neutral-950`: `oklch(0.129 0.042 264.695)` (slate-950)

**Semantic colors (success, error, warning):** Keep as-is. They are already well-defined and independent of the brand palette.

**Category colors:** Keep as-is. They provide good differentiation between categories and work with the orange primary.

**Shadows (neutral, no warm tint):**
- `--shadow-card`: `0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.05)`
- `--shadow-card-hover`: `0 8px 20px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06)`
- `--shadow-elevated`: `0 12px 32px -6px rgb(0 0 0 / 0.12), 0 6px 12px -4px rgb(0 0 0 / 0.06)`
- `--shadow-header`: `0 1px 0 0 rgb(0 0 0 / 0.06)`

**Border Radius (Clean Slate theme values):**
- `--radius-sm`: `0.5rem` (keep)
- `--radius-button`: `9999px` (keep - pill)
- `--radius-input`: `0.75rem` (keep)
- `--radius-card`: `0.75rem` (CHANGE from 1rem to 0.75rem per Clean Slate)
- `--radius-badge`: `9999px` (keep - pill)

**Focus-visible rule:**
Update the `:focus-visible` selector's outline color to use the new primary-600:
```css
:focus-visible {
  outline: 2px solid oklch(0.646 0.222 41.116);
  outline-offset: 2px;
}
```

Keep all other CSS rules unchanged (body, h1-h6 heading font, @import).
  </action>
  <verify>
    <automated>cd /Users/chrisstanchak/Code/foodboxfinder && grep -c "0.75rem" src/app/globals.css && grep "#ffffff\|0\.984 0\.003\|0\.646 0\.222" src/app/globals.css | head -5 && grep "rgb(0 0 0" src/app/globals.css | head -3</automated>
  </verify>
  <done>globals.css contains: orange primary scale with #ea580c at 600, true slate neutrals (no warm hue), neutral rgb shadows, 0.75rem card radius, pill buttons/badges, system font stack references, and focus outline matching primary-600.</done>
</task>

<task type="auto">
  <name>Task 2: Switch to system fonts in layout.tsx and update logo in Header.tsx</name>
  <files>src/app/layout.tsx, src/components/Header.tsx, public/foodboxfinder-logo.jpg, .planning/logo-concepts.md</files>
  <action>
**layout.tsx changes:**
1. Remove the `Nunito` and `Nunito_Sans` imports from `next/font/google`. Keep `Geist_Mono` for the mono font.
2. Remove the `nunito` and `nunitoSans` const declarations.
3. Update the `<html>` className: remove `${nunito.variable} ${nunitoSans.variable}`, keep `${geistMono.variable} h-full antialiased`.
4. The system font stack is already set in globals.css Task 1 via `--font-sans` and `--font-heading` hardcoded to the system stack — so no CSS variable from layout is needed for those. The body uses `font-sans` Tailwind class which reads `--font-sans`.

Final layout.tsx imports:
```typescript
import { Geist_Mono } from "next/font/google";
```

Final html tag:
```tsx
<html lang="en" className={`${geistMono.variable} h-full antialiased`}>
```

**Header.tsx changes:**
Update the logo `<img>` src from `/foodboxfinder-logo-21.jpg?v=${Date.now()}` to `/foodboxfinder-logo.jpg` (no cache-busting query needed for a fresh file).

**Logo file copy:**
Copy `public/assets/logos/box-concepts/v17-08-multi-larger-box.jpg` to `public/foodboxfinder-logo.jpg` (overwriting the old logo file).

**logo-concepts.md update:**
Replace the "Current Logo" section to reflect the new choice:

```markdown
## Current Logo: v17-08 — Multicolor Larger Box

**File:** `public/foodboxfinder-logo.jpg`
**Source:** `public/assets/logos/box-concepts/v17-08-multi-larger-box.jpg`

**Selected via:** Design Studio at `/admin/design` (2026-03-24)
**Theme pairing:** Clean Slate + Orange (#ea580c)

---

### Previous Logo: #21 — Isometric 3D Flat

**File:** `public/foodboxfinder-logo-21.jpg` (retained for reference)
**Source:** `public/assets/logos/concepts/21-isometric-3d-flat.jpg`
```

Keep the Logo Gallery section at the bottom unchanged.
  </action>
  <verify>
    <automated>cd /Users/chrisstanchak/Code/foodboxfinder && test -f public/foodboxfinder-logo.jpg && grep -c "Nunito" src/app/layout.tsx && grep "foodboxfinder-logo.jpg" src/components/Header.tsx && npx next build 2>&1 | tail -5</automated>
  </verify>
  <done>layout.tsx has no Nunito imports (grep returns 0), only Geist_Mono loaded. Header.tsx references /foodboxfinder-logo.jpg. The multicolor logo is copied to public/foodboxfinder-logo.jpg. logo-concepts.md documents the new active logo. `next build` completes without errors.</done>
</task>

</tasks>

<verification>
1. `npx next build` completes without errors — confirms no broken font variable references or missing imports.
2. Visual check: site should show orange primary color, system fonts (no Nunito), multicolor box logo in header, softer card corners (0.75rem), pill-shaped buttons/badges, neutral (non-warm) shadows.
3. `grep "oklch(0.55 0.04 38" src/app/globals.css` returns 0 matches — all warm-tinted shadows removed.
4. `grep "Nunito" src/app/layout.tsx` returns 0 matches — Google fonts removed.
5. `grep "foodboxfinder-logo-21" src/components/Header.tsx` returns 0 matches — old logo reference gone.
</verification>

<success_criteria>
- Clean Slate theme fully applied: system fonts, pill buttons/badges, 0.75rem card radius, neutral shadows
- Orange palette active with #ea580c as primary-600 and star color
- Multicolor box logo displayed in header
- Build passes cleanly
- No references to Nunito font imports in layout.tsx
- No warm-tinted oklch shadows remaining in globals.css
</success_criteria>

<output>
After completion, create `.planning/quick/260324-hsu-apply-clean-slate-theme-with-orange-colo/260324-hsu-SUMMARY.md`
</output>
