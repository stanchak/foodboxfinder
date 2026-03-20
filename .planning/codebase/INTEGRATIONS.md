# External Integrations

**Analysis Date:** 2026-03-20

## APIs & External Services

**None currently integrated.**

The application is in early development (Phase 10 - Database Foundation). No third-party APIs, SDKs, or external service clients are imported in application code. All data is editorial/curated and stored in the database.

**Planned integrations per roadmap:**
- Affiliate link tracking (Phase 120) - custom redirect-based, no external API
- Full-text search (Phase 80) - PostgreSQL built-in, no external service
- Newsletter signup (Phase 30) - provider TBD

## Data Storage

**Database:**
- Neon PostgreSQL (serverless)
  - Connection: `DATABASE_URL` environment variable
  - Client: Prisma 7.5.0 with `@prisma/adapter-pg` adapter
  - Singleton: `src/lib/db.ts`
  - Schema: `prisma/schema.prisma`
  - Config: `prisma.config.ts`
  - Generated types: `src/generated/prisma/` (gitignored, regenerated on build)

**File Storage:**
- None configured
- Provider logos and hero images stored as external URLs in database fields (`logoUrl`, `heroImageUrl`)
- Blog/collection cover images stored as external URLs (`coverImageUrl`)
- No file upload capability exists or is planned for MVP
- Planned: Vercel Blob for image uploads in post-MVP phase (per AD-5 in `.planning/PROJECT.md`)

**Caching:**
- None configured
- Next.js built-in caching only (default behavior)
- `cacheComponents` not yet enabled in `next.config.ts`
- No Redis or external cache service

## Authentication & Identity

**Auth Provider:**
- Not yet implemented
- Planned: Simple secret-based admin auth via `ADMIN_SECRET` env var
  - Implementation will use `proxy.ts` (Next.js 16 replacement for `middleware.ts`)
  - Export `proxy` function (NOT `middleware`)
  - Runs on Node.js runtime only (NOT Edge)
  - Admin routes under `src/app/admin/` will be protected

**No user authentication system:**
- Public visitors are anonymous
- Review submissions collect name/email but do not create accounts (per AD-4 in `.planning/PROJECT.md`)

## Monitoring & Observability

**Error Tracking:**
- None configured (no Sentry, Datadog, LogRocket, etc.)

**Logs:**
- Default console logging only
- No structured logging library installed

**Analytics:**
- No web analytics configured (no Google Analytics, Plausible, Fathom, etc.)
- Custom affiliate click tracking planned (Phase 120) via `AffiliateClick` database model

## CI/CD & Deployment

**Hosting:**
- Vercel (target platform)
- `.vercel/` directory present with `project.json` (project initialized)
- No `vercel.json` configuration file

**CI Pipeline:**
- None configured
- No `.github/` directory or GitHub Actions workflows
- No pre-commit hooks (no Husky, no lint-staged)

**Build:**
- `npm run build` runs `prisma generate && next build`
- No automated testing in build pipeline

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - Neon PostgreSQL connection string (used in `prisma.config.ts` and `src/lib/db.ts`)

**Planned env vars (not yet used in code):**
- `ADMIN_SECRET` - Admin authentication (Phase 100)

**Secrets location:**
- Local: `.env` file at project root (gitignored via `.gitignore`)
- Production: Vercel environment variables (configured via Vercel dashboard)

**Env loading:**
- `prisma.config.ts` loads `.env` via `import "dotenv/config"`
- Next.js automatically loads `.env` files for the application runtime

**Gap:** No `.env.example` file exists to document required variables for onboarding.

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Third-Party Service Details

**Google Fonts (via `next/font`):**
- Loaded in `src/app/layout.tsx` using `next/font/google`
- Fonts: Geist (`--font-geist-sans`), Geist Mono (`--font-geist-mono`)
- Self-hosted by Next.js at build time -- no runtime Google API calls

**Next.js Image Optimization:**
- `Image` component used in `src/app/page.tsx`
- No `images.remotePatterns` configured in `next.config.ts`
- Will need configuration when loading external provider logo/hero images from various domains

## Integration Notes for Future Development

**When adding provider images (Phase 20+):**
- Add `images.remotePatterns` to `next.config.ts` for each external image domain

**When adding admin auth (Phase 100):**
- Create `proxy.ts` at project root (NOT `middleware.ts`)
- Export `proxy` function (NOT `middleware`)
- Check `ADMIN_SECRET` env var for admin routes
- Runs on Node.js runtime only (NOT Edge)

**When adding affiliate tracking (Phase 120):**
- Create API route to log click to `AffiliateClick` model, then redirect to provider affiliate URL
- Hash IP addresses before storing (schema has `ipHash` field, never store raw IPs)

**When adding search (Phase 80):**
- Use PostgreSQL full-text search via Prisma raw queries or extension
- No external search service (Algolia, Typesense) needed for MVP scale

---

*Integration audit: 2026-03-20*
