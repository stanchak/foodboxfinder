# External Integrations

**Analysis Date:** 2026-03-21

## APIs & External Services

**Image CDN / Logo Sources (configured in `next.config.ts` `remotePatterns`):**
- Unsplash — `images.unsplash.com` — Stock photography for hero/cover images
- Cloudinary — `**.cloudinary.com` — Image CDN for provider assets
- AWS S3/CloudFront — `**.amazonaws.com` — Asset hosting
- jsDelivr CDN — `cdn.jsdelivr.net` — Static asset delivery
- Imgix — `*.imgix.net` — Image transformation CDN
- Clearbit Logo API — `logo.clearbit.com` — Provider logo lookup by domain
- Logo.dev — `img.logo.dev` — Provider logo lookup by domain (alternative)

These are not SDK integrations — they are URL-based. Provider `logoUrl` and `heroImageUrl` fields in the `Provider` model store URLs pointing to any of these hosts. No API keys required to fetch them; Next.js `<Image>` handles optimization.

**Google Fonts (via `next/font/google` in `src/app/layout.tsx`):**
- Geist Sans and Geist Mono font families loaded at build/render time
- No API key required; handled entirely by Next.js font optimization pipeline

## Data Storage

**Databases:**
- Neon PostgreSQL (serverless)
  - Connection string: `DATABASE_URL` environment variable
  - Client: Prisma 7.5.0 with `@prisma/adapter-pg` (PrismaPg adapter) — see `src/lib/db.ts`
  - Driver: `pg` 8.20.0 (node-postgres)
  - Singleton pattern: `globalThis.prisma` caching prevents multiple connections during HMR
  - Schema: `prisma/schema.prisma` — 9 models, 5 enums
  - Import everywhere: `import { prisma } from "@/lib/db"`

**File Storage:**
- No dedicated file storage service. Images are stored as URLs in database fields (`logoUrl`, `heroImageUrl`, `coverImageUrl`), pointing to external CDN hosts listed above.

**Caching:**
- Next.js ISR (Incremental Static Regeneration) with `revalidate` exports and on-demand `revalidatePath()` calls from admin Server Actions
- `React.cache()` for request-level Prisma query deduplication in `src/lib/queries.ts`
- No Redis, Memcached, or external cache layer

## Authentication & Identity

**Admin Authentication:**
- Custom cookie-based auth — no third-party auth provider
- Implementation: `src/proxy.ts` (Next.js 16 request interceptor)
- Mechanism: checks `admin_token` cookie against `ADMIN_SECRET` env var
- Protected routes: all `/admin/*` paths except `/admin/login`
- Login action: `src/app/actions/admin.ts` (sets `admin_token` cookie on success)
- No JWT, no session store — stateless cookie comparison only

**User Authentication:**
- None. No user accounts. The site is fully public for consumers.

## Monitoring & Observability

**Error Tracking:**
- None configured. No Sentry, Datadog, LogRocket, or similar service.

**Logs:**
- `console.log` / `console.error` only (no structured logging library)
- Vercel provides basic function log capture in its dashboard

**Analytics:**
- Internal affiliate click tracking via `AffiliateClick` model in PostgreSQL
- Click tracking endpoint: `src/app/api/affiliate/[providerId]/route.ts`
- Data captured: `source` (page URL), `referrer`, `userAgent`, `ipHash` (SHA-256 of client IP — raw IP never stored)
- Fire-and-forget pattern: click log never blocks the redirect to the affiliate URL

**No third-party analytics** (no Google Analytics, Plausible, Fathom, etc.).

## CI/CD & Deployment

**Hosting:**
- Vercel (project ID: `prj_tAWplCf2zTDLxTi1hiUNzsV1wNJL`, configured in `.vercel/project.json`)
- Framework preset: `nextjs`
- Node.js runtime: 24.x
- No custom `vercel.json` configuration file detected

**CI Pipeline:**
- None configured. No GitHub Actions, CircleCI, or similar.
- No pre-commit hooks (no Husky, no lint-staged)
- Deployments are manual (push to Vercel via CLI or Git integration)

## Environment Configuration

**Required env vars:**

| Variable | Used In | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `src/lib/db.ts`, `prisma.config.ts` | Neon PostgreSQL connection string |
| `ADMIN_SECRET` | `src/proxy.ts`, `src/app/actions/admin.ts` | Admin cookie token for route protection |
| `NEXT_PUBLIC_BASE_URL` | `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts` | Production base URL (defaults to `https://foodboxfinder.com`) |
| `NEXT_PUBLIC_SITE_URL` | `src/app/[category]/page.tsx` | Used in JSON-LD structured data URLs (should match `NEXT_PUBLIC_BASE_URL`) |

**Secrets location:**
- `.env` file (present, git-ignored via `.gitignore`)
- No `.env.example` file exists to document required variables for new developers

## Webhooks & Callbacks

**Incoming:**
- None. No payment webhooks, no third-party event receivers.

**Outgoing:**
- None. No webhooks sent to external services.

## Affiliate Link Tracking

**Pattern:**
- All affiliate outbound links route through: `/api/affiliate/[providerId]?source=[page]`
- Handler: `src/app/api/affiliate/[providerId]/route.ts`
- Redirects to `Provider.affiliateUrl` if set, else `Provider.website`
- Logs click to `AffiliateClick` table asynchronously (fire-and-forget)
- No third-party affiliate network SDK — tracking is fully internal

---

*Integration audit: 2026-03-21*
