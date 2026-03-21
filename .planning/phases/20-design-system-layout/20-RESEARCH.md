# Phase 20: Design System & Layout - Research

**Researched:** 2026-03-20
**Domain:** Tailwind CSS 4 theming, Next.js 16 layout architecture, responsive component patterns
**Confidence:** HIGH

## Summary

This phase establishes the visual foundation: a branded Tailwind CSS 4 theme, a responsive root layout with header/footer, and a base component library. The entire stack is already installed (Tailwind CSS 4.2.2, Next.js 16.2, React 19) -- no new dependencies are needed. The work is pure CSS theming plus component authoring.

Tailwind CSS 4 uses a CSS-first `@theme` directive (replacing the old JS config) to define design tokens that automatically generate utility classes. The existing `globals.css` already has an `@theme inline` block with font variables. This phase extends it with the full brand color palette (green primary, coral accent), typography scale, shadows, radii, and animation tokens. The header navigation requires a Client Component for the mobile hamburger toggle (uses `useState`), while the footer and all base components are Server Components unless they require interactivity.

**Primary recommendation:** Define all theme tokens in `globals.css` via `@theme`, build the Header as a Server Component wrapper around a Client Component `MobileNav`, keep all base components as pure presentational Server Components with typed props, and use Tailwind utility classes exclusively -- no custom CSS classes needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Fresh, appetizing color direction -- warm green primary (#22c55e range), coral/orange accent for CTAs, neutral grays for text/backgrounds. Food-discovery aesthetic, not corporate.
- **D-02:** Typography uses Geist Sans (already loaded) as primary. Clean, modern, highly readable. Define a type scale: xs through 4xl matching Tailwind defaults.
- **D-03:** Light mode only for MVP (dark mode explicitly out of scope per PROJECT.md). Remove the dark mode media query from globals.css.
- **D-04:** Header contains: logo (left), category nav links for all 5 categories (center/horizontal on desktop, hidden on mobile), search bar placeholder (right), mobile hamburger button (right, mobile only).
- **D-05:** Mobile navigation uses a slide-out drawer (hamburger toggle) with all category links, search link, and compare link.
- **D-06:** Footer has 3-4 columns: Categories (all 5 links), Resources (blog, methodology, about), Legal (privacy, terms), and branding/copyright.
- **D-07:** Sticky header on scroll for easy navigation access.
- **D-08:** Cards use subtle shadow (shadow-sm), rounded corners (rounded-xl), white background, with hover elevation transition. Consistent across provider cards, blog cards, collection cards.
- **D-09:** Button variants: Primary (filled green, white text), Secondary (outlined, green border/text), Ghost (no border, text only with hover background). All with rounded-lg and consistent padding.
- **D-10:** Badge component for dietary tags and category labels -- pill-shaped (rounded-full), small, color-coded by type.
- **D-11:** Rating stars display: 5-star visual (filled/empty SVG stars in amber/yellow) with numeric score beside. Supports half-star rendering.
- **D-12:** Loading skeletons: pulse animation placeholders matching the shape of each component (card skeleton, text skeleton, rating skeleton).
- **D-13:** Max content width 1280px (max-w-7xl), centered with horizontal padding (px-4 mobile, px-6 tablet, px-8 desktop).
- **D-14:** Standard Tailwind 4px spacing scale -- no custom spacing tokens needed.
- **D-15:** Responsive breakpoints: mobile-first using Tailwind defaults (sm:640px, md:768px, lg:1024px, xl:1280px).

### Claude's Discretion
- Exact hex color values within the green/coral palette direction
- Shadow depths and hover transition durations
- Skeleton animation timing
- Footer column arrangement on mobile (stacked vs accordion)
- Input/Select component exact border styles and focus ring colors

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DS-01 | Tailwind CSS 4 theme with brand colors, typography scale, and spacing tokens | @theme directive in globals.css defines --color-primary-*, --color-accent-*, shadows, radii; typography inherits Tailwind defaults with Geist Sans font |
| DS-02 | Responsive root layout with header (logo, nav, mobile hamburger) and footer | Server Component layout.tsx wraps Header (Server + Client MobileNav) and Footer (Server); sticky header via sticky top-0; mobile drawer via useState |
| DS-03 | Base component library: Button, Card, Badge, Input, Select, Rating stars, loading skeletons | Pure presentational components in src/components/ with typed props; all Server Components except mobile nav; Tailwind utilities only |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | 4.2.2 | CSS framework with @theme design tokens | Already installed; CSS-first config via @theme directive |
| next | 16.2.0 | App Router layouts, Server/Client Components | Already installed; root layout is the shell |
| react | 19.2.4 | Component rendering, useState for mobile nav | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/link | (bundled) | Client-side navigation in header/footer | All nav links |
| next/font/google | (bundled) | Geist Sans font loading | Already configured in layout.tsx |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom component library | shadcn/ui, Headless UI | Adds dependencies; project convention is Tailwind-only, no component libraries |
| CSS Modules for components | Tailwind utilities | Project convention explicitly prohibits CSS modules for components |
| Framer Motion for animations | Tailwind animate-* | Unnecessary dependency for simple transitions; Tailwind built-in is sufficient |

**Installation:**
No new packages needed. All dependencies are already in `package.json`.

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/
    globals.css          # @theme tokens + global styles (MODIFY)
    layout.tsx           # Root layout with Header + Footer (MODIFY)
    page.tsx             # Homepage placeholder (MODIFY to remove dark classes)
  components/
    Header.tsx           # Server Component: logo, desktop nav, search placeholder
    MobileNav.tsx        # Client Component: hamburger toggle + slide-out drawer
    Footer.tsx           # Server Component: multi-column footer
    Button.tsx           # Server Component: Primary/Secondary/Ghost variants
    Card.tsx             # Server Component: shadow, rounded, hover elevation
    Badge.tsx            # Server Component: pill-shaped, color-coded
    Input.tsx            # Server Component: text input with label, focus ring
    Select.tsx           # Server Component: dropdown with label, focus ring
    RatingStars.tsx      # Server Component: SVG star display with half-star
    Skeleton.tsx         # Server Component: pulse animation placeholder variants
  lib/
    categories.ts        # NEW: CategoryType enum to slug/label mapping utility
```

### Pattern 1: Server Component Layout with Client Island
**What:** Root layout is a Server Component that imports Header (Server) which in turn imports MobileNav (Client). Only the mobile nav toggle ships JS to the browser.
**When to use:** When the layout is mostly static but needs one interactive piece.
**Example:**
```typescript
// src/app/layout.tsx (Server Component)
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

```typescript
// src/components/Header.tsx (Server Component)
import Link from "next/link";
import MobileNav from "@/components/MobileNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Logo, desktop nav links, search placeholder */}
        <MobileNav /> {/* Client Component island */}
      </nav>
    </header>
  );
}
```

```typescript
// src/components/MobileNav.tsx (Client Component)
"use client";

import { useState } from "react";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  // hamburger button + slide-out drawer
}
```

### Pattern 2: Variant Props with Type Unions
**What:** Components accept a `variant` prop typed as a string union, and use a lookup object to map variants to Tailwind classes.
**When to use:** Button, Badge, Card -- any component with multiple visual styles.
**Example:**
```typescript
// src/components/Button.tsx (Server Component)
const variants = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
  secondary: "border border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500",
  ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500",
} as const;

type ButtonVariant = keyof typeof variants;

export default function Button({
  variant = "primary",
  children,
  className,
  ...props
}: Readonly<{
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}> & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Pattern 3: SVG Star Rating with Half-Star Support
**What:** Rating component renders 5 SVG stars. Each star can be full, half, or empty based on the numeric rating.
**When to use:** Provider cards, detail pages, review displays.
**Example:**
```typescript
// src/components/RatingStars.tsx (Server Component)
export default function RatingStars({
  rating,
  showNumeric = true,
}: Readonly<{
  rating: number;
  showNumeric?: boolean;
}>) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fill = rating - i;
    if (fill >= 1) return "full";
    if (fill >= 0.5) return "half";
    return "empty";
  });

  return (
    <div className="flex items-center gap-1">
      {stars.map((type, i) => (
        <StarIcon key={i} type={type} />
      ))}
      {showNumeric && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
```

Half-star rendering uses SVG `clipPath` or `linearGradient` to fill exactly half the star shape. This is a pure SVG technique with no JS interactivity required.

### Pattern 4: Category Mapping Utility
**What:** A mapping between CategoryType enum values and their URL slugs / display labels, used by header nav and all category-related pages.
**When to use:** Header navigation links, footer category links, category pages (Phase 40), breadcrumbs.
**Example:**
```typescript
// src/lib/categories.ts
import type { CategoryType } from "@/generated/prisma/client";

export const CATEGORY_MAP: Record<CategoryType, { slug: string; label: string }> = {
  MEAL_KIT: { slug: "meal-kits", label: "Meal Kits" },
  PREPARED_MEAL: { slug: "prepared-meals", label: "Prepared Meals" },
  PROTEIN_BOX: { slug: "protein-boxes", label: "Protein Boxes" },
  PRODUCE_BOX: { slug: "produce-boxes", label: "Produce Boxes" },
  SPECIALTY: { slug: "specialty", label: "Specialty" },
};

export function getCategoryBySlug(slug: string) {
  return Object.entries(CATEGORY_MAP).find(([, v]) => v.slug === slug);
}
```

### Anti-Patterns to Avoid
- **Putting `"use client"` on the entire Header:** Only the mobile nav toggle needs client JS. Keep the header as a Server Component and isolate the interactive MobileNav as a separate Client Component.
- **Creating a ThemeProvider context for colors:** Tailwind CSS 4 themes are pure CSS -- no React context needed. Colors are CSS variables resolved at paint time.
- **Using arbitrary values `[#22c55e]` instead of theme tokens:** Define colors in `@theme` and use semantic names like `bg-primary-500`. Arbitrary values bypass the design system.
- **Importing Prisma in layout.tsx for nav data:** The header nav uses static category links (5 hardcoded categories), not database queries. No Prisma import needed in the layout for this phase.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color palette generation | Manual hex calculation for 50-950 scale | Tailwind default green + custom @theme overrides | Perceptually uniform scaling via OKLCH is complex |
| Focus ring management | Custom outline CSS | Tailwind `focus-visible:ring-2 focus-visible:ring-offset-2` | Handles browser inconsistencies, accessibility |
| Responsive breakpoints | Custom media queries | Tailwind responsive prefixes (sm:, md:, lg:, xl:) | Already mobile-first, consistent with defaults |
| Skeleton pulse animation | Custom @keyframes | Tailwind `animate-pulse` built-in | Already includes the right opacity animation |
| Backdrop blur for sticky header | Custom CSS filter | Tailwind `backdrop-blur-sm` utility | Cross-browser, GPU-accelerated |
| Font loading optimization | Manual font-display / preload | next/font/google (Geist already configured) | Automatic subset, swap, preload |

**Key insight:** Tailwind CSS 4 provides all the primitives needed for this design system. The @theme directive generates CSS custom properties that map directly to utility classes. No CSS-in-JS, no theme providers, no runtime style calculations needed.

## Common Pitfalls

### Pitfall 1: Dark Mode CSS Variables Still Active
**What goes wrong:** The existing `globals.css` has a `@media (prefers-color-scheme: dark)` block that overrides `--background` and `--foreground`. On dark-mode OS settings, the site renders with dark colors despite being "light mode only."
**Why it happens:** The default create-next-app template includes dark mode support.
**How to avoid:** Remove the entire `@media (prefers-color-scheme: dark)` block from `globals.css` as Decision D-03 requires. Also remove any `dark:` variant classes from existing code (page.tsx has several).
**Warning signs:** Site appears with dark background on macOS in dark appearance mode.

### Pitfall 2: @theme vs @theme inline Confusion
**What goes wrong:** Defining color tokens with `@theme inline` when they should use `@theme`, or vice versa. Using `inline` incorrectly prevents utility class generation.
**Why it happens:** The existing code uses `@theme inline` for font variable references (correct usage). New color definitions should NOT use `inline` since they are direct values, not variable references.
**How to avoid:** Use `@theme inline` ONLY when the value references another CSS variable (e.g., `var(--font-geist-sans)`). Use plain `@theme` for direct color/shadow/radius values.
**Warning signs:** Utility classes like `bg-primary-500` don't work; CSS variables are defined but Tailwind doesn't recognize them.

### Pitfall 3: Sticky Header Z-Index Conflicts
**What goes wrong:** The sticky header overlaps modal/drawer content or gets covered by later elements.
**Why it happens:** No established z-index scale. The mobile drawer and the sticky header compete.
**How to avoid:** Establish a z-index scale in the theme: header at z-40, mobile drawer overlay at z-50, mobile drawer panel at z-50. Use Tailwind's built-in z-index utilities.
**Warning signs:** Mobile nav drawer appears behind the header, or header appears above modals from later phases.

### Pitfall 4: Server Component Trying to Use useState
**What goes wrong:** Build fails because a component without `"use client"` tries to use React hooks.
**Why it happens:** The header needs interactive mobile nav, tempting developers to add `"use client"` to the whole Header component.
**How to avoid:** Separate the interactive MobileNav into its own file with `"use client"` directive. Import it into the Server Component Header.
**Warning signs:** Next.js build error: "useState only works in Client Components."

### Pitfall 5: Missing Category Slug Mapping
**What goes wrong:** Header and footer nav links use incorrect category URLs or the mapping is duplicated across files.
**Why it happens:** The CategoryType enum (MEAL_KIT, PREPARED_MEAL, etc.) doesn't directly map to URL slugs (meal-kits, prepared-meals, etc.).
**How to avoid:** Create `src/lib/categories.ts` with a single canonical CATEGORY_MAP. Import it in Header, Footer, and all future category-related components.
**Warning signs:** Broken links in nav, inconsistent slug formatting across pages.

### Pitfall 6: body font-family Overriding Tailwind
**What goes wrong:** The existing `globals.css` sets `body { font-family: Arial, Helvetica, sans-serif; }` which overrides the Geist Sans font loaded via next/font.
**Why it happens:** Default create-next-app CSS includes a body font-family rule.
**How to avoid:** Remove the explicit `font-family` from the body rule in globals.css. The `font-sans` Tailwind utility (mapped to `--font-geist-sans` via `@theme inline`) handles this when applied via the layout's className.
**Warning signs:** Geist Sans font loads but doesn't display; Arial shows instead.

## Code Examples

### Complete @theme Block for globals.css
```css
/* Source: Tailwind CSS 4 @theme docs + project decisions D-01 through D-15 */
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #111827;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@theme {
  /* Primary: Green (food-fresh, appetizing) */
  --color-primary-50: oklch(0.982 0.018 155.826);
  --color-primary-100: oklch(0.962 0.044 156.743);
  --color-primary-200: oklch(0.925 0.084 155.995);
  --color-primary-300: oklch(0.871 0.15 154.449);
  --color-primary-400: oklch(0.792 0.209 151.711);
  --color-primary-500: oklch(0.723 0.219 149.579);
  --color-primary-600: oklch(0.627 0.194 149.214);
  --color-primary-700: oklch(0.527 0.154 150.069);
  --color-primary-800: oklch(0.448 0.119 151.328);
  --color-primary-900: oklch(0.393 0.095 152.535);
  --color-primary-950: oklch(0.266 0.065 152.934);

  /* Accent: Coral/Orange (CTAs, attention) */
  --color-accent-50: oklch(0.98 0.016 73.684);
  --color-accent-100: oklch(0.954 0.038 75.164);
  --color-accent-200: oklch(0.901 0.076 70.697);
  --color-accent-300: oklch(0.837 0.128 66.29);
  --color-accent-400: oklch(0.75 0.183 55.934);
  --color-accent-500: oklch(0.705 0.213 47.604);
  --color-accent-600: oklch(0.646 0.222 41.116);
  --color-accent-700: oklch(0.553 0.195 38.402);
  --color-accent-800: oklch(0.47 0.157 37.304);
  --color-accent-900: oklch(0.408 0.123 38.172);
  --color-accent-950: oklch(0.266 0.079 36.259);

  /* Amber for rating stars */
  --color-star: oklch(0.769 0.188 70.08);
  --color-star-empty: oklch(0.872 0.01 258.338);

  /* Shadows */
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-card-hover: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-header: 0 1px 3px 0 rgb(0 0 0 / 0.05);

  /* Border radius */
  --radius-card: 0.75rem;
  --radius-button: 0.5rem;
  --radius-badge: 9999px;
  --radius-input: 0.5rem;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

### Skeleton Component with Variants
```typescript
// Source: Tailwind CSS animate-pulse docs + project decision D-12
// src/components/Skeleton.tsx (Server Component)

const skeletonVariants = {
  text: "h-4 w-3/4 rounded",
  title: "h-6 w-1/2 rounded",
  avatar: "h-10 w-10 rounded-full",
  card: "h-64 w-full rounded-xl",
  rating: "h-4 w-24 rounded",
  badge: "h-6 w-16 rounded-full",
  image: "h-48 w-full rounded-xl",
} as const;

type SkeletonVariant = keyof typeof skeletonVariants;

export default function Skeleton({
  variant = "text",
  className,
}: Readonly<{
  variant?: SkeletonVariant;
  className?: string;
}>) {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${skeletonVariants[variant]} ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}
```

### Badge Component with Color Coding
```typescript
// src/components/Badge.tsx (Server Component)

const colorMap = {
  dietary: "bg-primary-50 text-primary-700 ring-primary-600/20",
  category: "bg-accent-50 text-accent-700 ring-accent-600/20",
  default: "bg-gray-50 text-gray-700 ring-gray-600/20",
} as const;

type BadgeColor = keyof typeof colorMap;

export default function Badge({
  children,
  color = "default",
  className,
}: Readonly<{
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}>) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colorMap[color]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js (JS config) | @theme directive in CSS | Tailwind CSS 4 (Jan 2025) | All theme customization is CSS-native; no JS config file needed |
| @tailwind base/components/utilities | @import "tailwindcss" | Tailwind CSS 4 (Jan 2025) | Single import replaces three directives |
| `dark:` class-based toggle | `prefers-color-scheme` media query (or removed) | Tailwind CSS 4 | Dark mode is media-based by default; project removes it entirely |
| middleware.ts for route protection | proxy.ts | Next.js 16 (Oct 2025) | File renamed; export changed from `middleware` to `proxy` |
| useFormState for form actions | useActionState | React 19 (2024) | Renamed hook; old name deprecated |

**Deprecated/outdated:**
- `tailwind.config.js` / `tailwind.config.ts`: Replaced by `@theme` in CSS for Tailwind 4. Do not create this file.
- `@tailwind base; @tailwind components; @tailwind utilities;`: Replaced by `@import "tailwindcss"` in v4.
- `middleware.ts`: Renamed to `proxy.ts` in Next.js 16. The `middleware` export is now `proxy`.

## Open Questions

1. **Exact coral/orange shade selection**
   - What we know: User wants "#22c55e range" for green (matches Tailwind green-500). Coral/orange for CTAs.
   - What's unclear: Whether to use Tailwind's default orange scale or a custom coral. Orange-500 (`oklch(0.705 0.213 47.604)`) is a strong, warm orange. A true coral sits between orange and red (hue ~25-35).
   - Recommendation: Use Tailwind's default orange scale as `--color-accent-*`. It reads as warm coral-orange and pairs well with green. This is Claude's discretion per CONTEXT.md. The research examples above use the orange scale values.

2. **Footer mobile layout: stacked columns vs accordion**
   - What we know: 3-4 columns on desktop. Mobile needs to be compact.
   - What's unclear: Whether to use simple stacked columns (always visible) or an accordion (collapsible sections).
   - Recommendation: Stacked columns. Simpler, no JS needed, footer content is short enough to not overwhelm. Accordion would require a Client Component for toggle state. This is Claude's discretion per CONTEXT.md.

3. **Search bar placeholder behavior**
   - What we know: Header has a search bar placeholder (right side). Actual search is Phase 80.
   - What's unclear: Whether the placeholder should be a non-functional input or a link to /search.
   - Recommendation: Render a visually styled search icon + "Search..." text that links to `/search`. When Phase 80 arrives, it replaces this with the real search component. Avoids non-functional UI that confuses users.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed (no test runner in project) |
| Config file | none -- see Wave 0 |
| Quick run command | `npx next build` (type check + build verification) |
| Full suite command | `npx next build` (no test suite exists) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DS-01 | Theme tokens generate valid Tailwind utilities | build-check | `npx next build` | N/A (CSS compilation) |
| DS-02 | Layout renders header + footer, responsive 375-1440px | manual | Visual inspection at breakpoints | N/A |
| DS-03 | Components render correctly, are importable | build-check + manual | `npx next build` + visual inspection | N/A |

### Sampling Rate
- **Per task commit:** `npx next build` (verifies TypeScript + CSS compilation)
- **Per wave merge:** `npx next build` + manual responsive check at 375px, 768px, 1280px
- **Phase gate:** Build succeeds + visual inspection at all breakpoints

### Wave 0 Gaps
- No test framework installed. For this phase, `next build` serves as the verification gate (catches TypeScript errors, import failures, CSS compilation issues).
- Visual/responsive testing is manual-only for this phase (no Playwright/Cypress configured).

## Sources

### Primary (HIGH confidence)
- Tailwind CSS 4 official docs: `tailwindcss.com/docs/theme` -- @theme directive syntax, namespaces, inline vs regular
- Tailwind CSS 4 official docs: `tailwindcss.com/docs/adding-custom-styles` -- Custom color palette definitions
- Tailwind CSS 4 official docs: `tailwindcss.com/docs/customizing-colors` -- Color scale syntax, OKLCH values, override patterns
- Next.js 16 bundled docs: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` -- Layout patterns, children prop
- Next.js 16 bundled docs: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` -- Server/Client boundary patterns, "use client" isolation
- Next.js 16 bundled docs: `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` -- Tailwind CSS 4 integration with Next.js

### Secondary (MEDIUM confidence)
- Tailwind CSS 4 animation docs (via search): `animate-pulse` built-in for skeleton loaders
- Tailwind CSS v4 color reference: OKLCH values for green/orange/amber scales

### Tertiary (LOW confidence)
- None. All findings verified against official documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and verified in package.json
- Architecture: HIGH - Patterns verified against Next.js 16 bundled docs and Tailwind CSS 4 official docs
- Pitfalls: HIGH - Each pitfall identified from actual existing code (globals.css dark mode block, body font-family override, page.tsx dark: classes)

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable -- Tailwind 4 and Next.js 16 are established releases)
