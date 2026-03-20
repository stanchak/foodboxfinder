# FoodBoxFinder — Project Document

## Vision

FoodBoxFinder is a ready-to-launch discovery, comparison, and directory website for food box subscription services. It helps consumers find and compare meal kits, prepared meals, protein boxes, produce boxes, and specialty food subscriptions through beautiful UX, comprehensive filtering, side-by-side comparisons, and SEO-optimized content.

**Target launch state:** Fully functional public site with provider directory, category browsing, comparison tools, review system, blog/content engine, and an internal admin interface for content management.

## Goals

1. **Consumer UX** — Beautiful, fast, mobile-first experience for discovering and comparing food box providers
2. **SEO-first** — Every page optimized for search: structured data, programmatic SEO pages, blog content, clean URL structure
3. **Comparison engine** — Side-by-side provider comparison with pricing, features, dietary options, and ratings
4. **Content platform** — Blog, "best of" collection pages, and FAQ content to drive organic traffic
5. **Admin interface** — Internal dashboard for managing providers, plans, reviews, content, and affiliate links
6. **Affiliate revenue** — Track clicks on affiliate/referral links to providers

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16.2.0 (App Router) | Server Components, file-based routing |
| UI | React 19.2.4 + Tailwind CSS 4 | Utility-first CSS, no component library initially |
| Database | PostgreSQL (Neon) | Serverless Postgres with connection pooling |
| ORM | Prisma 7.5 + @prisma/adapter-pg | Type-safe queries, Neon adapter |
| Hosting | Vercel | Edge-optimized, ISR support |
| Language | TypeScript 5 | Strict mode |

## Architecture Decisions

### AD-1: Server Components by Default
All pages use React Server Components for data fetching. Client Components only for interactive elements (filters, comparison selector, mobile nav). This maximizes performance and SEO.

### AD-2: SEO URL Structure
```
/                              → Homepage
/meal-kits                     → Category: Meal Kits
/prepared-meals                → Category: Prepared Meals
/protein-boxes                 → Category: Protein/Meat Boxes
/produce-boxes                 → Category: Produce/Grocery Boxes
/specialty                     → Category: Specialty Diet Boxes
/providers/[slug]              → Provider detail page
/compare?providers=a,b,c       → Comparison page (query params)
/best/[slug]                   → "Best of" collection pages
/blog                          → Blog index
/blog/[slug]                   → Blog post
/admin                         → Admin dashboard (protected)
/admin/providers               → Manage providers
/admin/content                 → Manage blog/collections
```

### AD-3: Data Fetching Strategy
- Provider listings: Server Components with Prisma queries, ISR revalidation
- Provider detail: Server Components with generateStaticParams for popular providers
- Comparison: Client-side state management for provider selection, server-fetched data
- Filters: URL search params for shareable/bookmarkable filtered views
- Admin: Server Actions for mutations

### AD-4: No Authentication (Phase 1)
Admin is protected by a simple middleware check (environment variable secret or basic auth). User accounts are not needed for MVP — reviews use name + email without login.

### AD-5: Image Strategy
Provider logos and hero images stored as URLs in the database (hosted on provider CDNs or uploaded to Vercel Blob in a later phase). Next.js Image component with remotePatterns for optimization.

## Food Box Categories

| Category | Slug | Examples |
|----------|------|----------|
| Meal Kits | meal-kits | HelloFresh, Blue Apron, Home Chef, EveryPlate, Dinnerly |
| Prepared Meals | prepared-meals | Factor, CookUnity, Freshly, Mosaic Foods, Snap Kitchen |
| Protein/Meat | protein-boxes | ButcherBox, Crowd Cow, Porter Road, Rastelli's, Good Chop |
| Produce/Grocery | produce-boxes | Misfits Market, Imperfect Foods, Hungry Harvest, Farmbox Direct |
| Specialty | specialty | Purple Carrot (vegan), Green Chef (organic), Sunbasket, Trifecta (keto) |

## Key Features (MVP)

### Consumer-Facing
- **Homepage**: Hero section, featured providers, category cards, how-it-works, newsletter signup
- **Category pages**: Filterable provider listings with sort options
- **Provider detail**: Full profile with plans, pricing, pros/cons, reviews, FAQs, affiliate CTA
- **Comparison page**: Select up to 4 providers for side-by-side comparison table
- **"Best of" pages**: Curated collections (best for families, best budget, best keto, etc.)
- **Blog**: Articles for SEO content (reviews, guides, comparisons)
- **Search**: Full-text search across providers, categories, and content
- **Filters**: Price range, dietary restrictions, servings, delivery area, rating

### Admin Interface
- **Provider CRUD**: Add/edit/delete providers with all details
- **Plan management**: Manage pricing plans per provider
- **Review moderation**: Approve/reject user-submitted reviews
- **Content editor**: Blog posts and collection pages
- **Affiliate link management**: Track and manage referral URLs
- **Analytics dashboard**: Click tracking, popular providers, search terms

### SEO
- JSON-LD structured data (Product, Review, FAQ, BreadcrumbList, ItemList)
- Dynamic sitemap.xml generation
- robots.txt
- Open Graph and Twitter card metadata
- Canonical URLs
- Internal linking strategy

## Non-Goals (Post-MVP)
- User accounts / authentication
- Email notification system
- Real-time price tracking
- Provider API integrations
- Payment processing
- Mobile app
