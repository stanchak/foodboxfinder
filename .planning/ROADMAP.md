# FoodBoxFinder — Milestone 1: MVP Launch

## Overview
Build a complete, ready-to-launch food box discovery and comparison website with consumer UX, SEO optimization, and admin interface.

**Success criteria:** Site is deployable to Vercel with seeded data, all consumer pages functional, admin can manage content, and SEO fundamentals in place.

---

## Phase 10: Database Schema & Foundation
**Goal:** Prisma schema deployed to Neon, database client configured, seed script with realistic provider data.
**Agent:** backend-architect
**Deliverables:**
- Prisma schema with all models (Provider, Plan, Review, BlogPost, Collection, etc.)
- Database migration applied to Neon
- Seed script with 15-20 real food box providers across all 5 categories
- Realistic plans, pricing, FAQs, and sample reviews per provider
- Database utility functions (queries for listings, detail, search)

**Acceptance:**
- `prisma db push` succeeds
- `prisma db seed` populates all tables with realistic data
- TypeScript types generated and importable

---

## Phase 20: Design System & Layout Shell
**Goal:** Reusable component library, global layout with header/footer/nav, responsive design tokens.
**Agent:** agency-frontend-developer, agency-ui-designer
**Deliverables:**
- Tailwind CSS 4 theme configuration (colors, typography, spacing)
- Root layout with responsive header (logo, nav, mobile hamburger menu)
- Footer with links, categories, newsletter signup placeholder
- Category navigation component
- Base components: Button, Card, Badge, Input, Select, Rating stars
- Loading skeletons for all card types
- Dark mode support (optional, deprioritize)

**Acceptance:**
- Layout renders on mobile (375px) through desktop (1440px)
- All base components visually consistent
- Lighthouse accessibility score >= 90

---

## Phase 30: Homepage
**Goal:** Beautiful, conversion-focused homepage that showcases the value proposition.
**Agent:** agency-frontend-developer
**Deliverables:**
- Hero section with headline, subheadline, search bar, and category quick links
- Featured providers section (horizontal scroll on mobile, grid on desktop)
- Category cards section (5 categories with icons, descriptions, provider count)
- "How it works" section (3-step process)
- Testimonial/social proof section
- Newsletter signup CTA
- SEO metadata and JSON-LD (WebSite, Organization schemas)

**Acceptance:**
- Page loads with real data from database
- Mobile-first responsive layout
- Core Web Vitals: LCP < 2.5s, CLS < 0.1

---

## Phase 40: Category Pages & Filtering
**Goal:** Browsable, filterable category listings with URL-driven state.
**Agent:** agency-frontend-developer, agency-backend-architect
**Deliverables:**
- Dynamic route: `/[category]` (meal-kits, prepared-meals, etc.)
- Provider card component (logo, name, rating, price range, dietary tags, CTA)
- Filter sidebar/drawer: dietary tags, price range, rating, servings
- Sort options: rating, price low-to-high, most reviewed, newest
- URL search params for all filter/sort state (shareable URLs)
- Pagination or infinite scroll
- Empty state for no results
- Category-specific metadata and JSON-LD (ItemList schema)

**Acceptance:**
- Filters update URL and results in real time
- Back/forward browser navigation preserves filter state
- Category pages render with accurate provider counts

---

## Phase 50: Provider Detail Pages
**Goal:** Comprehensive provider profiles that convert visitors and support SEO.
**Agent:** agency-frontend-developer
**Deliverables:**
- Dynamic route: `/providers/[slug]`
- Provider header: logo, name, rating, category badge, affiliate CTA button
- Tabbed or sectioned layout: Overview, Plans & Pricing, Reviews, FAQ
- Plans/pricing table with comparison of provider's own plans
- Pros & cons list
- User review list with rating breakdown chart
- FAQ accordion (with FAQ JSON-LD schema)
- Related providers sidebar/section
- Breadcrumb navigation
- JSON-LD: Product, Review, FAQ, BreadcrumbList schemas
- generateMetadata with dynamic title/description
- generateStaticParams for all active providers

**Acceptance:**
- All provider data renders correctly
- Structured data validates in Google Rich Results Test
- Page is fully functional with seeded data

---

## Phase 60: Comparison Engine
**Goal:** Side-by-side provider comparison tool.
**Agent:** agency-frontend-developer
**Deliverables:**
- Comparison page: `/compare?providers=slug1,slug2,slug3`
- "Add to compare" button on provider cards and detail pages
- Comparison state management (client-side, up to 4 providers)
- Comparison table: name, rating, price range, dietary tags, shipping, key features
- Sticky comparison bar (floating at bottom when providers selected)
- Remove/swap providers in comparison
- Empty state and minimum 2 providers validation

**Acceptance:**
- Can compare 2-4 providers side by side
- Comparison state persists across page navigations
- Comparison URL is shareable

---

## Phase 70: "Best Of" Collection Pages & Blog
**Goal:** SEO content pages for programmatic and editorial traffic.
**Agent:** agency-frontend-developer, agency-backend-architect
**Deliverables:**
- Collection page: `/best/[slug]` — ranked list of providers with editorial notes
- Blog index: `/blog` — paginated list of posts with featured post hero
- Blog post: `/blog/[slug]` — full post with table of contents, related posts
- Markdown/rich text rendering for blog body content
- Blog post metadata and JSON-LD (Article schema)
- Collection metadata and JSON-LD (ItemList schema)
- Seed data: 5-8 collection pages, 3-5 blog posts

**Acceptance:**
- Collection pages display ranked provider lists with editorial content
- Blog posts render markdown correctly
- All pages have proper SEO metadata

---

## Phase 80: Search
**Goal:** Full-text search across providers, categories, and content.
**Agent:** agency-backend-architect, agency-frontend-developer
**Deliverables:**
- Search API route with PostgreSQL full-text search
- Search results page: `/search?q=...`
- Search bar in header (expandable on mobile)
- Results grouped by type: Providers, Blog Posts, Collections
- Autocomplete/suggestions (stretch goal)
- No results state with category suggestions

**Acceptance:**
- Search returns relevant results for provider names, categories, dietary tags
- Results page renders quickly with proper pagination
- Search is accessible via header on all pages

---

## Phase 90: Review Submission System
**Goal:** Allow visitors to submit reviews for providers.
**Agent:** agency-frontend-developer, agency-backend-architect
**Deliverables:**
- Review submission form on provider detail page
- Star rating input, title, body, name, email fields
- Server Action for review submission with validation
- Success/error feedback states
- Reviews default to PENDING status (require admin approval)
- Recalculate provider averageRating on review approval

**Acceptance:**
- Reviews submit successfully and appear as PENDING in database
- Form validates required fields and rating range
- No duplicate review spam (basic rate limiting)

---

## Phase 100: Admin Dashboard
**Goal:** Internal admin interface for content management.
**Agent:** agency-frontend-developer, agency-backend-architect
**Deliverables:**
- Admin layout with sidebar navigation (under `/admin`)
- Middleware-based access control (ADMIN_SECRET env var)
- Dashboard: stats overview (provider count, review count, pending reviews, clicks)
- Provider list with search, filter, and edit/create/delete
- Provider form: all fields including plans, FAQs, dietary tags
- Review moderation: list pending reviews, approve/reject actions
- Blog post CRUD with markdown editor
- Collection CRUD with provider picker and sorting
- Affiliate click analytics (daily clicks per provider)

**Acceptance:**
- Admin can create a new provider with plans, FAQs, and tags
- Admin can approve/reject pending reviews
- Admin can create and publish blog posts and collections
- Dashboard shows accurate counts

---

## Phase 110: SEO & Performance Optimization
**Goal:** Production-ready SEO and performance.
**Agent:** agency-frontend-developer, agency-backend-architect
**Deliverables:**
- Dynamic sitemap.xml (all providers, categories, collections, blog posts)
- robots.txt
- Canonical URLs on all pages
- Open Graph images (static or dynamic with ImageResponse)
- Internal linking: related providers, breadcrumbs, category cross-links
- Image optimization: Next.js Image with proper sizes/priority
- Core Web Vitals audit and fixes
- Meta title templates: "Provider Name - Food Box Reviews | FoodBoxFinder"
- 404 page with search and category suggestions

**Acceptance:**
- Lighthouse Performance >= 90, SEO >= 95, Accessibility >= 90
- Sitemap includes all public URLs
- No broken internal links
- Structured data validates for all page types

---

## Phase 120: Affiliate Tracking & Polish
**Goal:** Affiliate click tracking, final polish, and launch readiness.
**Agent:** agency-frontend-developer, agency-backend-architect
**Deliverables:**
- Affiliate click tracking API route (logs click, redirects to affiliate URL)
- "Visit Provider" buttons use tracking route
- Click analytics in admin dashboard
- Error boundaries on all route segments
- Loading states for all data-dependent pages
- 404 and 500 error pages
- Final responsive QA pass across breakpoints
- Favicon and app icons

**Acceptance:**
- Affiliate clicks are logged with source page and timestamp
- Admin can see click counts per provider
- No console errors in production build
- `next build` succeeds without warnings
- Site is ready for Vercel deployment

---

## Phase Summary

| Phase | Name | Key Output |
|-------|------|-----------|
| 10 | Database & Foundation | Schema, migrations, seed data |
| 20 | Design System & Layout | Components, layout shell, theme |
| 30 | Homepage | Hero, featured, categories, CTA |
| 40 | Category Pages | Filterable listings, URL state |
| 50 | Provider Detail | Full profiles, pricing, reviews, FAQ |
| 60 | Comparison Engine | Side-by-side comparison tool |
| 70 | Collections & Blog | "Best of" pages, blog engine |
| 80 | Search | Full-text search across all content |
| 90 | Review System | User review submission and moderation |
| 100 | Admin Dashboard | Full CRUD admin interface |
| 110 | SEO & Performance | Sitemap, structured data, Core Web Vitals |
| 120 | Affiliate & Polish | Click tracking, error handling, launch prep |
