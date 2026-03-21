# Phase 3: Provider Logos - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a reusable ProviderLogo component that renders provider logos from the manifest with Next.js Image optimization, fallback SVG placeholders, and consistent sizing across all surfaces (cards, detail pages, comparison headers).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion -- component infrastructure phase. Key areas:
- Size variants (sm/md/lg) and their pixel dimensions
- Fallback SVG design (initials-based, generic icon, or branded placeholder)
- Whether to read logoUrl from Provider model or resolve from manifest at render time
- Image optimization strategy (local images in public/ use unoptimized or static import)
- Component API (props interface, className passthrough, etc.)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/assets/providers/manifest.json` -- 95 entries with web-relative paths
- Provider model has `logoUrl` field populated from manifest during seed
- `src/components/` -- flat structure with existing components (ProviderCard, Badge, Button, etc.)
- Next.js Image component already imported in multiple components

### Established Patterns
- Components use PascalCase function declarations with Readonly<{}> prop types
- Tailwind CSS 4 utility classes for styling
- Variant/size maps as const objects (see Button.tsx, Badge.tsx patterns)

### Integration Points
- ProviderCard.tsx -- needs logo in card header
- Provider detail page -- needs large logo
- ComparisonTable.tsx -- needs logos in column headers
- CompareBar.tsx -- needs small logos for selected providers

</code_context>

<specifics>
## Specific Ideas

- All 95 providers have logoUrl populated (100% coverage from Phase 1)
- Logo formats: .png, .jpg, .svg, .webp (5 .ico already converted)
- Two providers use fallback SVG placeholders: munchpak.svg, sips-by.svg
- next.config.ts already has images.remotePatterns for external sources

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>
