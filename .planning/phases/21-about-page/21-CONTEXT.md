# Phase 21: About Page - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Create /about page with mission statement, methodology explanation, and affiliate disclosure. Must have SEO metadata, JSON-LD (AboutPage schema), and match the Citrus Pop brand theme. Static content page — no database queries needed.

</domain>

<decisions>
## Implementation Decisions

### Page Structure
- Hero section with page title and tagline
- Mission section — what FoodBoxFinder is and who it's for (food box subscription discovery for consumers)
- How We Compare section — methodology for evaluating providers (9-dimension filtering, side-by-side comparison, transparent criteria)
- Affiliate Disclosure section — how the site earns revenue through affiliate links, editorial independence statement
- All sections use existing brand components and Citrus Pop styling patterns

### Content Approach
- Warm, approachable tone consistent with the food/discovery domain
- Emphasize transparency and consumer advocacy
- Mention 95+ providers, 5 categories, 9 filter dimensions as concrete proof points
- Keep content scannable with clear headings and short paragraphs

### SEO & Structured Data
- Metadata: title "About FoodBoxFinder", description covering mission and transparency
- JSON-LD: AboutPage schema with publisher Organization
- Canonical URL: /about
- OpenGraph tags

### Claude's Discretion
- Exact copy/content wording for each section
- Section ordering beyond the core three (mission, methodology, disclosure)
- Whether to include decorative icons or illustrations
- Specific spacing and layout decisions within Citrus Pop constraints

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Breadcrumbs.tsx` — used on /best, collection detail, blog pages
- Homepage sections provide styling patterns: font-extrabold headings, rounded-2xl cards, tracking-widest micro-labels
- `globals.css` has all Citrus Pop design tokens (--color-primary-*, --color-accent-*, Nunito fonts)

### Established Patterns
- Static pages export `const metadata: Metadata` with title, description, alternates.canonical, openGraph
- JSON-LD as inline `<script>` with `dangerouslySetInnerHTML` and XSS-safe `.replace(/</g, '\u003c')`
- Pages are Server Components by default (no "use client")
- Breadcrumbs pattern: `<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />`

### Integration Points
- `src/app/about/page.tsx` — new file, App Router convention
- Footer already links to /about in Resources column
- Header and MobileNav now link to /about (from Phase 20)
- Sitemap at `src/app/sitemap.ts` needs /about added

</code_context>

<specifics>
## Specific Ideas

- User wants: mission statement, how providers are evaluated, affiliate disclosure, editorial independence
- Should feel trustworthy and transparent — this is a credibility page
- Match existing page patterns (best, blog) for consistency

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
