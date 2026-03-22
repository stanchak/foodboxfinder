# FoodBoxFinder Brand Identity Brief

**Prepared by:** Brand Guardian
**Date:** 2026-03-21
**Purpose:** Complete brand identity system for UI designer implementation
**Status:** Ready for implementation

---

## 1. Current State Diagnosis

### What exists today
The current design uses a generic green primary (`oklch(0.627 0.194 149.214)` / approximately `#16a34a`) with a coral accent, Geist Sans/Mono typography, and standard Tailwind gray utilities. The visual language is competent but indistinguishable from any template-driven SaaS landing page. It reads as "developer built this" rather than "editorial team curated this."

### Specific problems
- **Green primary is generic.** It looks like every other health/food/eco startup. It signals "organic grocery app," not "trusted comparison authority."
- **No visual hierarchy between editorial authority and transactional UI.** The homepage hero, provider cards, and comparison tables all feel like the same flat surface.
- **Badges are undifferentiated.** Dietary tags, category labels, and value tiers use similar pill shapes with only color variation -- they blur together at scan speed.
- **No distinct visual signature.** Nothing about the design is memorable or ownable. Remove the wordmark and there is no brand recognition.
- **The card design is safe but forgettable.** White card, light shadow, rounded corners -- it is the default pattern for every comparison site built since 2020.

---

## 2. Brand Personality

### Core personality traits (in order of priority)

1. **Discerning** -- Not everything makes the cut. We evaluate with rigor and present with confidence. The visual language should convey editorial judgment, not a neutral database dump.

2. **Clear** -- Data-heavy content (pricing tables, comparison grids, dietary filters) must be immediately scannable. Clarity is the design's primary job. No decoration that competes with information.

3. **Warm** -- This is about food, home, and personal choices. The brand should feel human and approachable, never clinical or corporate. People are choosing what to feed their families.

4. **Modern** -- Contemporary design craft that signals the site is actively maintained and trustworthy. Not trendy or experimental -- just confidently current.

### Voice summary for design decisions
"A knowledgeable friend who has done all the research so you don't have to." Not a salesperson. Not a professor. A sharp, warm, reliable guide.

---

## 3. Color System

### Design rationale
The new palette moves away from green (which signals health food / eco / organic and conflates the brand with the products it reviews) and toward a **deep teal-indigo** that signals authority, trust, and editorial sophistication -- while a **warm amber-orange** accent creates appetite appeal and action energy. The combination is distinctive in the comparison site space: it is neither NerdWallet blue, Wirecutter black/red, nor generic affiliate green.

### Primary -- Deep Teal (Authority + Trust)
A sophisticated blue-green that reads as modern and editorial without being cold or corporate. Darker than typical teals, with enough green undertone to keep it connected to the food/nature space.

| Token                  | OKLCH                           | Hex (approx.) | Usage                                    |
|------------------------|---------------------------------|---------------|------------------------------------------|
| `--color-primary-50`   | `oklch(0.975 0.014 200)`       | `#f0f9fa`     | Subtle backgrounds, hover states         |
| `--color-primary-100`  | `oklch(0.940 0.035 200)`       | `#d5f0f2`     | Light surface fills, selected states     |
| `--color-primary-200`  | `oklch(0.880 0.065 198)`       | `#a3dde3`     | Borders on active elements               |
| `--color-primary-300`  | `oklch(0.790 0.100 196)`       | `#5fc2cd`     | Secondary text on dark, icon tints       |
| `--color-primary-400`  | `oklch(0.700 0.120 194)`       | `#2ba5b4`     | Link text, interactive elements          |
| `--color-primary-500`  | `oklch(0.600 0.130 192)`       | `#1a8a9a`     | Primary buttons, key headings            |
| `--color-primary-600`  | `oklch(0.520 0.120 190)`       | `#0e7285`     | Primary brand color -- CTAs, nav active  |
| `--color-primary-700`  | `oklch(0.450 0.100 190)`       | `#0a5e6e`     | Hover states on primary, headings        |
| `--color-primary-800`  | `oklch(0.380 0.080 190)`       | `#074c59`     | Dark UI elements, footer background      |
| `--color-primary-900`  | `oklch(0.310 0.060 190)`       | `#053b45`     | Deep backgrounds, contrast text          |
| `--color-primary-950`  | `oklch(0.220 0.045 190)`       | `#032730`     | Darkest shade, near-black brand tint     |

### Accent -- Warm Amber (Action + Appetite)
A rich amber-orange that evokes warmth, appetite, and decisive action. Used sparingly for CTAs, ratings, and moments that need to pop. More sophisticated than pure orange -- it has depth.

| Token                  | OKLCH                           | Hex (approx.) | Usage                                    |
|------------------------|---------------------------------|---------------|------------------------------------------|
| `--color-accent-50`    | `oklch(0.985 0.020 80)`        | `#fdf8ef`     | Highlight backgrounds                    |
| `--color-accent-100`   | `oklch(0.955 0.050 78)`        | `#faecd3`     | Badge backgrounds, subtle emphasis       |
| `--color-accent-200`   | `oklch(0.900 0.095 72)`        | `#f3d5a0`     | Rating star backgrounds                  |
| `--color-accent-300`   | `oklch(0.840 0.140 65)`        | `#e8b460`     | Secondary buttons, active indicators     |
| `--color-accent-400`   | `oklch(0.780 0.170 55)`        | `#e0943a`     | Rating stars filled, price highlights    |
| `--color-accent-500`   | `oklch(0.720 0.180 48)`        | `#d47a20`     | Primary accent -- CTAs that need warmth  |
| `--color-accent-600`   | `oklch(0.640 0.175 42)`        | `#b8610f`     | Accent hover states                      |
| `--color-accent-700`   | `oklch(0.550 0.155 40)`        | `#944c0a`     | Dark accent text                         |
| `--color-accent-800`   | `oklch(0.470 0.125 40)`        | `#763d0a`     | Accent on dark surfaces                  |
| `--color-accent-900`   | `oklch(0.400 0.095 40)`        | `#5e3209`     | Deep accent                              |
| `--color-accent-950`   | `oklch(0.300 0.070 40)`        | `#3d2005`     | Darkest accent                           |

### Signal -- Fresh Green (Positive/Success only)
Green is not banished -- it is demoted to a semantic role. Used exclusively for success states, "verified" badges, positive comparison indicators, and "free shipping" callouts.

| Token                  | OKLCH                           | Hex (approx.) | Usage                                    |
|------------------------|---------------------------------|---------------|------------------------------------------|
| `--color-success-50`   | `oklch(0.975 0.020 155)`       | `#f0faf3`     | Success background                       |
| `--color-success-500`  | `oklch(0.650 0.180 150)`       | `#22a854`     | Success text, checkmarks                 |
| `--color-success-600`  | `oklch(0.560 0.160 150)`       | `#178a42`     | Success darker                           |
| `--color-success-700`  | `oklch(0.480 0.130 150)`       | `#0f6e34`     | Success darkest                          |

### Error / Warning
Keep the existing error (red) and warning (amber) values. They are functional and do not need brand expression.

### Neutral Palette -- Warm Grays
The current design uses Tailwind's default cool grays. Shift to warm grays (slight brown/amber undertone) to create a more inviting reading experience and better harmony with the amber accent.

| Token                  | OKLCH                           | Hex (approx.) | Usage                                    |
|------------------------|---------------------------------|---------------|------------------------------------------|
| `--color-neutral-50`   | `oklch(0.985 0.004 80)`        | `#fafaf8`     | Page background (replaces pure white)    |
| `--color-neutral-100`  | `oklch(0.960 0.006 80)`        | `#f5f5f0`     | Card backgrounds, section alternation    |
| `--color-neutral-200`  | `oklch(0.920 0.008 75)`        | `#e8e8e2`     | Borders, dividers                        |
| `--color-neutral-300`  | `oklch(0.860 0.010 70)`        | `#d2d2ca`     | Disabled states, subtle borders          |
| `--color-neutral-400`  | `oklch(0.720 0.010 65)`        | `#a3a39a`     | Placeholder text                         |
| `--color-neutral-500`  | `oklch(0.600 0.010 60)`        | `#7a7a72`     | Secondary text, captions                 |
| `--color-neutral-600`  | `oklch(0.500 0.008 55)`        | `#5e5e57`     | Body text secondary                      |
| `--color-neutral-700`  | `oklch(0.400 0.008 50)`        | `#454540`     | Body text primary                        |
| `--color-neutral-800`  | `oklch(0.310 0.008 45)`        | `#303028`     | Headings                                 |
| `--color-neutral-900`  | `oklch(0.230 0.008 40)`        | `#1f1f1a`     | Near-black text, high contrast           |
| `--color-neutral-950`  | `oklch(0.150 0.005 40)`        | `#12120f`     | True dark                                |

### Rating Stars
| Token                  | OKLCH                           | Hex (approx.) | Usage                                    |
|------------------------|---------------------------------|---------------|------------------------------------------|
| `--color-star`         | `oklch(0.780 0.170 55)`        | `#e0943a`     | Filled star (same as accent-400)         |
| `--color-star-empty`   | `oklch(0.920 0.008 75)`        | `#e8e8e2`     | Empty star (same as neutral-200)         |

### Key color relationships
- **Primary (teal) + accent (amber)** is a complementary-adjacent pair. High contrast, visually harmonious.
- **Warm neutrals** bridge the two -- they do not fight either palette.
- **WCAG AA compliance**: primary-600 on white = 5.2:1 ratio (passes). Accent-600 on white = 4.7:1 (passes AA for large text, use accent-700 for small text). Neutral-700 on neutral-50 = 7.8:1 (passes AAA).

---

## 4. Typography Direction

### Primary recommendation: Inter + Source Serif 4

**Inter** (headings, UI, labels, navigation, data tables)
- Available via `next/font/google`
- Superior legibility at small sizes -- critical for comparison tables and filter panels
- Excellent tabular figures for price columns (enable `font-feature-settings: "tnum"`)
- Variable font with optical sizing for crisp rendering at every weight
- More personality than Geist Sans while remaining highly functional
- Weight range to use: 400 (body), 500 (labels/nav), 600 (subheadings), 700 (headings), 800 (hero display)

**Source Serif 4** (editorial content: blog posts, collection descriptions, provider detail "about" sections)
- Available via `next/font/google`
- Contemporary serif that signals editorial authority without feeling stuffy
- Excellent readability at body text sizes
- Pairs naturally with Inter -- both share similar x-heights and proportions
- Used only for long-form reading content, never in UI chrome
- Weight range: 400 (body), 600 (pull quotes), 700 (article titles)

### Implementation in layout.tsx
```typescript
import { Inter, Source_Serif_4 } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});
```

### Type scale
Use a modular scale with a 1.2 ratio (minor third), anchored at 16px base:

| Level      | Size    | Weight | Font          | Line Height | Usage                          |
|------------|---------|--------|---------------|-------------|--------------------------------|
| Display    | 3rem    | 800    | Inter         | 1.1         | Homepage hero                  |
| H1         | 2.25rem | 700    | Inter         | 1.2         | Page titles                    |
| H2         | 1.75rem | 700    | Inter         | 1.25        | Section headings               |
| H3         | 1.25rem | 600    | Inter         | 1.3         | Card titles, subsections       |
| H4         | 1.1rem  | 600    | Inter         | 1.35        | Table headers, label groups    |
| Body       | 1rem    | 400    | Inter         | 1.6         | General content                |
| Body Serif | 1.05rem | 400    | Source Serif 4| 1.7         | Editorial content              |
| Small      | 0.875rem| 400    | Inter         | 1.5         | Captions, badges, metadata     |
| Tiny       | 0.75rem | 500    | Inter         | 1.4         | Labels in tight spaces         |

### Monospace (data display)
Keep **Geist Mono** for price displays and any numeric data that benefits from tabular alignment. It is already configured and works well for this purpose.

---

## 5. Visual Tone

### The "feel" in five decisions

**Warm, not cool.** The warm neutral palette, amber accent, and Source Serif editorial text create a sense of human curation. This is a kitchen table recommendation, not a spreadsheet.

**Structured, not minimal.** This is a data-rich product. Embrace visual structure -- clear card boundaries, defined sections, purposeful whitespace. Do not strip away structure in pursuit of minimalism; the content needs scaffolding to be scannable.

**Confident, not loud.** The design should feel assured and settled, not attention-seeking. Restrained use of the accent color (amber only for CTAs, ratings, and critical highlights). The teal primary carries authority without shouting.

**Slightly rounded, not sharp.** Use 8px-12px border radius on cards and containers (not the current 12px, which reads slightly bubbly). Use 6px on buttons and inputs. Use fully rounded pills only for small badges and tags. The softness signals approachability; the restraint signals professionalism.

**Editorial weight, not billboard weight.** Content density should feel like a well-designed magazine, not a billboard. Tighter spacing in data areas, more breathing room in editorial areas. The homepage hero can be expansive; the comparison table should be tight and efficient.

### Updated border radius tokens
```
--radius-card:    0.625rem;  /* 10px -- cards, modals, panels */
--radius-button:  0.375rem;  /* 6px  -- buttons, inputs, selects */
--radius-badge:   9999px;    /* Full pill -- badges, tags only */
--radius-input:   0.375rem;  /* 6px  -- form controls */
--radius-sm:      0.25rem;   /* 4px  -- small UI elements, tooltips */
```

### Updated shadows
Move from generic Tailwind shadows to more intentional, layered shadows with a warm tint:

```
--shadow-card:       0 1px 3px 0 oklch(0.30 0.01 50 / 0.06),
                     0 1px 2px -1px oklch(0.30 0.01 50 / 0.06);
--shadow-card-hover: 0 4px 12px -2px oklch(0.30 0.01 50 / 0.10),
                     0 2px 4px -2px oklch(0.30 0.01 50 / 0.06);
--shadow-elevated:   0 8px 24px -4px oklch(0.30 0.01 50 / 0.12),
                     0 4px 8px -4px oklch(0.30 0.01 50 / 0.06);
--shadow-header:     0 1px 0 0 oklch(0.30 0.01 50 / 0.06);
```

---

## 6. Key Visual Elements

### 6.1 The Score Badge (signature element)

FoodBoxFinder's most ownable visual element: a **composite score badge** displayed on every provider card and detail page. This is the visual signature that makes the brand instantly recognizable.

**Design:**
- Circular badge, 48px diameter on cards, 64px on detail pages
- Filled background using a color scale tied to score:
  - 9.0-10.0: `primary-600` (teal) -- "Excellent"
  - 7.5-8.9: `primary-400` -- "Very Good"
  - 6.0-7.4: `accent-500` (amber) -- "Good"
  - Below 6.0: `neutral-400` -- "Average"
- White bold numeric score centered inside (e.g., "8.7")
- Subtle concentric ring border (2px, slightly lighter than fill)
- Small label below: "FBF Score" in tiny caps

**Why this matters:** Generic affiliate sites show star ratings. NerdWallet shows a score but buries it in text. The FBF Score Badge is a persistent, scannable, color-coded quality signal that becomes synonymous with the brand. When someone sees a teal circle with a number, they think FoodBoxFinder.

### 6.2 Card treatment

**Provider cards** should feel like review index cards -- structured, scannable, with a clear information hierarchy.

- **Background:** `neutral-100` (very slight warmth, not pure white) with `neutral-200` border
- **Hover:** Lift with `shadow-card-hover` + border transitions to `primary-200`
- **Score badge:** Positioned at top-right, overlapping the card edge by 25% (half inside, half outside the logo area). This creates visual interest and breaks the grid monotony.
- **Content hierarchy from top to bottom:**
  1. Logo area (smaller, 80px height, `neutral-50` background)
  2. Score badge (overlapping logo area / content area boundary)
  3. Provider name (Inter 600, `neutral-900`)
  4. One-line description (Inter 400, `neutral-600`, single line truncation)
  5. Price range (Geist Mono, `primary-600`, right-aligned)
  6. Dietary tag pills (limit 3, overflow as "+N more")
  7. Category label as a subtle bottom stripe or footer, not a competing badge

**Key difference from current:** The score badge, the warm card background, and the price treatment (monospace, primary color, right-aligned) create a distinct visual signature.

### 6.3 Badge system (differentiated by function)

Current problem: all badges look the same (pill shape, varying colors). The new system uses shape and color to create instant recognition by badge type.

| Badge Type     | Shape                    | Colors                              | Example              |
|----------------|--------------------------|--------------------------------------|----------------------|
| Category       | Rounded rectangle (6px)  | `primary-50` bg, `primary-700` text  | "Meal Kits"          |
| Dietary tag    | Full pill (9999px)       | `neutral-100` bg, `neutral-700` text, `neutral-200` ring | "Gluten Free" |
| Value tier     | Rounded rectangle (6px)  | `accent-50` bg, `accent-700` text    | "Premium"            |
| Free shipping  | Full pill + left icon    | `success-50` bg, `success-700` text  | Truck icon + "Free Shipping" |
| Score label    | No background, text only | `neutral-500` text                   | "Excellent" / "Good" |
| Collection     | Rounded rectangle (6px)  | `primary-100` bg, `primary-600` text | "Editor's Pick"      |

### 6.4 Icon style

- **Line icons, 1.5px stroke weight**, consistent with the current approach
- **Rounded line caps and joins** (not square)
- Size: 20px for inline, 24px for standalone, 32px for feature blocks
- Color: inherit from parent (`currentColor`), never baked into the SVG
- Consider migrating to Lucide icons for consistency (the current custom SVGs already match Lucide's style)
- For category icons: keep the current custom set but ensure stroke weight and corner radius match the system

### 6.5 Comparison table design

The comparison table is the product's core differentiator. It must feel like a premium data tool.

- **Sticky header row** with provider names and score badges
- **Alternating row backgrounds:** pure white and `neutral-50`
- **Cell content alignment:** text left, numbers right, checkmarks/x-marks centered
- **Winning value highlight:** The best value in each row gets a subtle `primary-50` background with a left border in `primary-400`
- **Column hover:** Entire column gets a very subtle `primary-50` overlay so users can track which provider they are scanning
- **Price cells:** Geist Mono, `primary-600` for the value, `neutral-500` for the unit label ("/serving")

### 6.6 Illustration direction (future)

If and when illustrations are added:

- **Style:** Flat, geometric, limited palette (primary-300, accent-300, neutral-200, white)
- **Subject matter:** Abstract food shapes, not realistic food photography. Think simplified ingredient silhouettes, not stock photos.
- **Where to use:** Empty states, category headers, blog post hero images, 404 page
- **What to avoid:** Clip art style, overly detailed, photorealistic, or cartoon illustration

---

## 7. Competitive Visual Positioning

### How FoodBoxFinder differentiates from each competitor archetype

#### vs. Generic affiliate "best meal kits" blogs
**They look like:** Ad-heavy WordPress templates. Banner ads between paragraphs. Star ratings with no methodology. Stock food photos. Green/orange color schemes. Trust badges that feel desperate ("As Seen On...").

**FBF differentiates by:** Clean, ad-free layouts. The FBF Score Badge signals methodology. No stock photos in the UI -- provider logos only (honest representation). The teal + amber palette immediately signals "not another green affiliate blog." Structured data presentation (comparison tables, filter panels) signals tool, not blog.

#### vs. NerdWallet
**They look like:** Corporate blue (#0052FF) with systematic, dense layouts. Financial authority. Cool, rational, numbers-focused. Very good at data but emotionally cold.

**FBF differentiates by:** Warmth. The amber accent, warm grays, and Source Serif editorial text create appetite appeal -- this is about food and home, not money. The teal primary has enough green in it to connect to freshness and nature without being "finance blue." Card-based browsing (visual, scannable) vs. NerdWallet's list-heavy approach.

#### vs. Wirecutter
**They look like:** NYT-adjacent editorial design. Heavy on serif type (Cheltenham). Black, white, and red. Text-heavy, long-form reviews. Single "best pick" recommendation model. Minimal interactivity.

**FBF differentiates by:** Interactivity. FoodBoxFinder is a tool, not a magazine. Side-by-side comparison, multi-criteria filtering, and the comparison tray create an experience Wirecutter does not offer. The visual design leans into structured data (tables, grids, filters) rather than editorial prose. The color palette is more vibrant and warm -- Wirecutter's black/white/red feels austere by comparison. FBF serves discovery (95 providers, browsing, filtering) while Wirecutter serves singular recommendations.

### The positioning statement for visual design
"FoodBoxFinder should look like a tool built by people who love food and respect your time -- not a blog selling ads, a bank, or a newspaper."

---

## 8. Implementation Specifications

### CSS custom properties (complete replacement for globals.css @theme block)

```css
@theme {
  /* Primary: Deep Teal */
  --color-primary-50:  oklch(0.975 0.014 200);
  --color-primary-100: oklch(0.940 0.035 200);
  --color-primary-200: oklch(0.880 0.065 198);
  --color-primary-300: oklch(0.790 0.100 196);
  --color-primary-400: oklch(0.700 0.120 194);
  --color-primary-500: oklch(0.600 0.130 192);
  --color-primary-600: oklch(0.520 0.120 190);
  --color-primary-700: oklch(0.450 0.100 190);
  --color-primary-800: oklch(0.380 0.080 190);
  --color-primary-900: oklch(0.310 0.060 190);
  --color-primary-950: oklch(0.220 0.045 190);

  /* Accent: Warm Amber */
  --color-accent-50:  oklch(0.985 0.020 80);
  --color-accent-100: oklch(0.955 0.050 78);
  --color-accent-200: oklch(0.900 0.095 72);
  --color-accent-300: oklch(0.840 0.140 65);
  --color-accent-400: oklch(0.780 0.170 55);
  --color-accent-500: oklch(0.720 0.180 48);
  --color-accent-600: oklch(0.640 0.175 42);
  --color-accent-700: oklch(0.550 0.155 40);
  --color-accent-800: oklch(0.470 0.125 40);
  --color-accent-900: oklch(0.400 0.095 40);
  --color-accent-950: oklch(0.300 0.070 40);

  /* Rating Stars */
  --color-star:       oklch(0.780 0.170 55);
  --color-star-empty: oklch(0.920 0.008 75);

  /* Semantic: Success */
  --color-success-50:  oklch(0.975 0.020 155);
  --color-success-500: oklch(0.650 0.180 150);
  --color-success-600: oklch(0.560 0.160 150);
  --color-success-700: oklch(0.480 0.130 150);

  /* Semantic: Error (unchanged) */
  --color-error-50:  oklch(0.971 0.013 17.38);
  --color-error-500: oklch(0.637 0.237 25.331);
  --color-error-600: oklch(0.577 0.245 27.325);
  --color-error-700: oklch(0.505 0.213 27.518);

  /* Semantic: Warning (unchanged) */
  --color-warning-50:  oklch(0.987 0.026 102.212);
  --color-warning-500: oklch(0.769 0.188 70.08);
  --color-warning-600: oklch(0.666 0.179 58.318);
  --color-warning-700: oklch(0.555 0.163 48.998);

  /* Shadows (warm-tinted) */
  --shadow-card:       0 1px 3px 0 oklch(0.30 0.01 50 / 0.06),
                       0 1px 2px -1px oklch(0.30 0.01 50 / 0.06);
  --shadow-card-hover: 0 4px 12px -2px oklch(0.30 0.01 50 / 0.10),
                       0 2px 4px -2px oklch(0.30 0.01 50 / 0.06);
  --shadow-elevated:   0 8px 24px -4px oklch(0.30 0.01 50 / 0.12),
                       0 4px 8px -4px oklch(0.30 0.01 50 / 0.06);
  --shadow-header:     0 1px 0 0 oklch(0.30 0.01 50 / 0.06);

  /* Border Radius */
  --radius-sm:     0.25rem;
  --radius-button: 0.375rem;
  --radius-input:  0.375rem;
  --radius-card:   0.625rem;
  --radius-badge:  9999px;
}
```

### Font configuration
```typescript
// layout.tsx
import { Inter, Source_Serif_4, Geist_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Apply to <html>:
// className={`${inter.variable} ${sourceSerif.variable} ${geistMono.variable}`}
```

```css
/* In globals.css @theme inline block */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-serif: var(--font-serif);
  --font-mono: var(--font-geist-mono);
}
```

### Root variables
```css
:root {
  --background: oklch(0.985 0.004 80);  /* neutral-50, not pure white */
  --foreground: oklch(0.230 0.008 40);  /* neutral-900 */
}
```

### Focus ring
```css
:focus-visible {
  outline: 2px solid oklch(0.520 0.120 190); /* primary-600 */
  outline-offset: 2px;
}
```

---

## 9. Application Examples

### Header wordmark treatment
- "FoodBox" in Inter 700, `neutral-900`
- "Finder" in Inter 700, `primary-600`
- This two-tone wordmark creates instant brand recognition and is the foundation for a future logomark

### Homepage hero gradient
- Replace `from-primary-50 to-white` with `from-primary-50 via-neutral-50 to-neutral-50`
- The gradient should be barely perceptible -- a hint of teal warmth, not an obvious color band

### Provider card price display
```html
<span class="font-mono text-primary-600 font-semibold tabular-nums">
  $7.49<span class="text-neutral-500 font-sans text-xs font-normal">/serving</span>
</span>
```

### Trust section (social proof bar)
- Replace `bg-primary-700` with `bg-primary-800` (deeper, more authoritative)
- Numbers in Inter 800 (extra bold), white
- Labels in Inter 500, `primary-200`

---

## 10. Brand Protection Notes

### Trademark considerations
- "FoodBoxFinder" as a single compound word is more trademarkable than "Food Box Finder"
- The two-tone wordmark (FoodBox + Finder) is a visual trademark worth registering
- The FBF Score Badge design, if it becomes recognizable, can be trademarked as a trade dress element

### Consistency rules for implementation
1. Never use the accent amber as a background for large areas -- it is always a highlight
2. The primary teal is never used for negative states (errors, warnings, alerts)
3. Price data always uses Geist Mono, never Inter
4. The FBF Score Badge always uses the same color scale thresholds -- never customize per context
5. Badges are always one of the six defined types -- never invent new badge styles ad hoc
6. The serif font (Source Serif 4) is only used for editorial content body text and article titles -- never in navigation, buttons, labels, or data displays

---

## 11. Migration Priority

When implementing this rebrand, apply changes in this order to minimize disruption:

1. **Colors first** -- Swap the CSS custom properties in `globals.css`. This immediately transforms the entire site because all components reference these tokens.
2. **Typography second** -- Swap Geist Sans for Inter in `layout.tsx` and update the `@theme inline` block. Add Source Serif 4 but do not apply it yet (no editorial content pages may exist).
3. **Root background** -- Change from pure white to `neutral-50` warm white.
4. **Shadows and radii** -- Update the shadow and radius tokens.
5. **Component updates** -- Update `Badge.tsx` color map, `ProviderCard.tsx` structure (add score badge, restructure content hierarchy), `Header.tsx` wordmark treatment.
6. **Score Badge component** -- Build new `ScoreBadge.tsx` component.
7. **Comparison table** -- Update `ComparisonTable.tsx` with new visual treatment.

---

**Brand Guardian Assessment:** This identity system gives FoodBoxFinder a distinctive visual position in the comparison site market. The deep teal signals editorial authority without corporate coldness. The warm amber creates appetite appeal and decisive action energy. The score badge becomes an ownable visual element. The typography pairing (Inter + Source Serif 4) balances data clarity with editorial warmth. Together, these elements create a brand that reads as "trustworthy tool built by food enthusiasts" -- exactly the positioning gap between generic affiliate blogs and cold corporate comparison engines.
