# Phase 19: Navigation & Route Simplification - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Simplify site navigation to center on /search as the primary discovery page. Remove individual category links from header, add "Discover" nav item, redirect old category routes, and update homepage hero CTA.

</domain>

<decisions>
## Implementation Decisions

### Header Navigation
- Remove 5 individual category links (Meal Kits, Prepared Meals, Protein Boxes, Produce Boxes, Specialty)
- Replace with single "Discover" link pointing to /search
- Keep Compare, Best Of, Blog as separate nav items
- Final desktop nav: Logo | Discover | Compare | Best Of | Blog | [Search]

### Homepage Updates
- Hero CTA "Browse All Boxes" links to /search instead of scrolling to categories
- Category cards in "Browse by Category" section link to /search?category={slug}

### Route Redirects
- /meal-kits → 301 redirect to /search?category=meal-kits
- /prepared-meals → 301 redirect to /search?category=prepared-meals
- /protein-boxes → 301 redirect to /search?category=protein-boxes
- /produce-boxes → 301 redirect to /search?category=produce-boxes
- /specialty → 301 redirect to /search?category=specialty
- Implement via proxy.ts (NOT middleware.ts — Next.js 16)

### Footer Updates
- "Categories" column links change from /{category} to /search?category={slug}
- Add "Browse All" link to /search at top of that column

### MobileNav Updates
- Replace 5 category links with "Browse All Providers" → /search
- Optional: keep categories as sub-links pointing to /search?category={slug}

### Sitemap Updates
- Remove individual category page entries
- Add /search as indexable page
- Keep /search?category={slug} variants as indexable

### Claude's Discretion
- Whether to keep [category]/page.tsx temporarily or delete it
- Exact redirect implementation details in proxy.ts

</decisions>

<code_context>
## Existing Code Insights

### Files to Modify
- src/components/Header.tsx — simplify nav links
- src/components/Footer.tsx — update category column links
- src/components/MobileNav.tsx — simplify category links
- src/app/page.tsx — update hero CTA and category card links
- src/proxy.ts — add 301 redirects for old category URLs
- src/app/sitemap.ts — update URL entries

### Established Patterns
- proxy.ts handles request interception (NOT middleware.ts)
- CATEGORY_NAV_ITEMS from src/lib/categories.ts drives nav links
- Hero CTA buttons use Button component with Link

</code_context>

<specifics>
## Specific Ideas

- User wants: "get rid of all the sections of the site that aren't needed"
- Keep compare / blog / best of as their own thing
- Old category URLs must redirect for SEO continuity

</specifics>

<deferred>
## Deferred Ideas

- Removing [category]/page.tsx entirely (keep for now, redirects handle traffic)
</deferred>
