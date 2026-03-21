# Codebase Concerns

**Analysis Date:** 2026-03-21

## Tech Debt

**NEXT_REDIRECT detection via string comparison:**
- Issue: `createProvider`, `createBlogPost`, and `createCollection` in `src/app/actions/admin.ts` (lines 258, 665, 843) detect Next.js redirects by checking `error.message === "NEXT_REDIRECT"`. This is an internal implementation detail that may change between Next.js versions.
- Files: `src/app/actions/admin.ts`
- Impact: If Next.js changes its redirect error message format, redirect-after-create flows silently break. The correct approach is `import { isRedirectError } from "next/dist/client/components/redirect-error"`.
- Fix approach: Replace the string check with `isRedirectError(error)` from `next/dist/client/components/redirect-error`.

**Admin pages bypass the query layer and call Prisma directly:**
- Issue: Every admin page (`src/app/admin/page.tsx`, `src/app/admin/providers/page.tsx`, `src/app/admin/providers/[id]/edit/page.tsx`, `src/app/admin/blog/page.tsx`, `src/app/admin/blog/[id]/edit/page.tsx`, `src/app/admin/collections/page.tsx`, `src/app/admin/collections/[id]/edit/page.tsx`, `src/app/admin/collections/new/page.tsx`, `src/app/admin/reviews/page.tsx`) import `prisma` directly and write their own queries instead of using `src/lib/queries.ts`.
- Files: All files under `src/app/admin/`
- Impact: Duplicate query logic, no `React.cache()` deduplication for admin data, schema changes require updates in two places.
- Fix approach: Add admin-specific query functions to `src/lib/queries.ts` (e.g., `getAdminProviders`, `getAdminBlogPosts`) and consume them from admin pages.

**Hardcoded production URL throughout codebase:**
- Issue: The string `https://foodboxfinder.com` appears hardcoded in 25+ locations across `src/app/page.tsx`, `src/app/providers/[slug]/page.tsx`, `src/app/compare/[versus]/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/best/[slug]/page.tsx`, `src/app/methodology/page.tsx`, `src/components/Breadcrumbs.tsx`, and others. Meanwhile `src/app/sitemap.ts` and `src/app/layout.tsx` correctly use `process.env.NEXT_PUBLIC_BASE_URL`.
- Files: All JSON-LD and metadata files listed above.
- Impact: JSON-LD structured data references production URLs when running locally or in staging. Sitemap URL is correct but JSON-LD is not, creating inconsistency.
- Fix approach: Create a `src/lib/config.ts` exporting `const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://foodboxfinder.com"` and replace all hardcoded strings.

**Two different env var names for base URL:**
- Issue: `src/app/[category]/page.tsx` (line 200) uses `process.env.NEXT_PUBLIC_SITE_URL` for building JSON-LD item URLs, while all other files use `process.env.NEXT_PUBLIC_BASE_URL`. Neither is guaranteed to be set.
- Files: `src/app/[category]/page.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/layout.tsx`
- Impact: Item URLs in category listing JSON-LD will be relative (empty string prefix) if neither variable is set.
- Fix approach: Standardize on `NEXT_PUBLIC_BASE_URL` throughout and update the category page to match.

**No `.env.example` file:**
- Issue: The project requires `DATABASE_URL`, `ADMIN_SECRET`, `NEXT_PUBLIC_BASE_URL`, and `NEXT_PUBLIC_SITE_URL` but has no `.env.example` to document them.
- Files: Project root
- Impact: New developers or deployments must infer required variables from the source code.
- Fix approach: Create `.env.example` with all required variables (empty values) and commit it.

**Dietary tag and valid-value lists duplicated:**
- Issue: The 16 valid `DietaryTag` values are listed four times: `prisma/schema.prisma` (enum), `src/app/actions/admin.ts` (VALID_DIETARY_TAGS array), `src/app/[category]/page.tsx` (VALID_DIETARY_TAGS Set), and `src/components/CategoryFilters.tsx` (DIETARY_TAG_OPTIONS array). Sort options are duplicated between the page and the filter component.
- Files: `src/app/actions/admin.ts`, `src/app/[category]/page.tsx`, `src/components/CategoryFilters.tsx`
- Impact: Adding or renaming a dietary tag requires changes in 4+ places. Easy to miss one.
- Fix approach: Export a canonical list from `src/lib/categories.ts` or a new `src/lib/dietary-tags.ts` and import it everywhere.

**Delete operations silently fail:**
- Issue: `deleteProvider`, `deletePlan`, `deleteBlogPost`, and `deleteCollection` in `src/app/actions/admin.ts` catch all errors with `// Silently fail`. If a delete fails (e.g., FK violation, DB error), the admin is redirected as if it succeeded.
- Files: `src/app/actions/admin.ts` (lines 394-402, 508-541, 759-772, 953-965)
- Impact: Data the admin believes was deleted may still exist. No feedback to the user when a delete fails.
- Fix approach: Return `AdminFormState` from delete actions (matching create/update pattern) instead of `void`, surface the error in the UI.

**`revalidatePath` misses category listing pages on provider update:**
- Issue: `updateProvider` in `src/app/actions/admin.ts` (line 372-374) revalidates `/providers/${slug}` and `/` but does not revalidate category listing pages (e.g., `/meal-kits`, `/prepared-meals`). Changing a provider's category, active status, or featured flag will not update the listing pages.
- Files: `src/app/actions/admin.ts`
- Impact: Category listing pages serve stale data after category/active/featured changes until the 1-hour ISR TTL expires.
- Fix approach: After `updateProvider`, also call `revalidatePath("/${getCategorySlug(category)}")` for both old and new category values.

**`approveReview` and `rejectReview` do not revalidate provider detail pages:**
- Issue: `approveReview` and `rejectReview` in `src/app/actions/admin.ts` (lines 545-575, 577-607) update `averageRating`/`reviewCount` on the provider but only revalidate `/admin/reviews`, not `/providers/${slug}`.
- Files: `src/app/actions/admin.ts`
- Impact: Provider detail pages serve stale ratings until the ISR TTL expires.
- Fix approach: Look up the provider's slug after the review update and call `revalidatePath("/providers/${slug}")`.

**No ISR/caching configuration on public pages:**
- Issue: No page exports `export const revalidate` or uses `use cache` directive. Pages depend on on-demand revalidation from admin actions, but admin actions have gaps (see above). Without a fallback TTL, statically generated pages are never automatically refreshed.
- Files: `src/app/[category]/page.tsx`, `src/app/providers/[slug]/page.tsx`, `src/app/best/[slug]/page.tsx`, `src/app/blog/[slug]/page.tsx`
- Impact: If an admin mutation fails to trigger revalidation, data is permanently stale until redeployment.
- Fix approach: Add `export const revalidate = 3600` to public listing and detail pages as the documented fallback strategy.

---

## Known Bugs

**`# h1` headings in blog posts downgraded to `h2`:**
- Symptoms: In `src/app/blog/[slug]/page.tsx` (line 74-84), markdown `# heading` (H1 level) is rendered as an `<h2>` element. The heading detection comment says "h1 -> h1" but the code emits `<h2>`.
- Files: `src/app/blog/[slug]/page.tsx`
- Trigger: Any blog post body with a `# ` markdown heading.
- Workaround: Use `## ` for top-level blog post sections.

**Wrong URL in search results for collections:**
- Symptoms: In `src/app/search/page.tsx` (line 189), collection cards link to `/collections/${collection.slug}` but the correct route is `/best/${collection.slug}`.
- Files: `src/app/search/page.tsx`
- Trigger: Any search query that returns collection results. The link 404s.
- Workaround: Navigate directly to `/best/[slug]`.

**Admin review list links to providers list, not the provider:**
- Symptoms: In `src/app/admin/reviews/page.tsx` (line 117), the provider name in a review links to `/admin/providers` (the list) instead of `/admin/providers/${review.provider.slug}` or the edit page.
- Files: `src/app/admin/reviews/page.tsx`
- Trigger: Clicking a provider name from the reviews list.
- Workaround: Navigate to admin providers list manually.

**`AffiliateLink` receives `affiliateUrl` and `website` props but ignores them:**
- Symptoms: `src/components/AffiliateLink.tsx` accepts `affiliateUrl: string | null` and `website: string` as props but never uses them — it always routes through `/api/affiliate/${providerId}`. The API route handles the redirect. Props are vestigial from an earlier design.
- Files: `src/components/AffiliateLink.tsx`
- Impact: Unused props cause confusion and type noise. Not a functional bug since the API route handles it correctly.
- Workaround: None needed — the API route is correct.

---

## Security Considerations

**Admin cookie stores the raw `ADMIN_SECRET`:**
- Risk: `loginAction` in `src/app/actions/admin.ts` (line 140) sets `admin_token` cookie to the exact value of `ADMIN_SECRET`. `proxy.ts` (line 26) compares it with `adminToken !== adminSecret` — a direct equality check with no hashing. Anyone who can read the cookie jar (e.g., via XSS, browser extension, shared machine) learns the admin secret itself.
- Files: `src/app/actions/admin.ts`, `src/proxy.ts`
- Current mitigation: Cookie is `httpOnly: true`, `secure: true` in production, `sameSite: "lax"`.
- Recommendations: Store a signed or hashed token in the cookie (e.g., HMAC-SHA256 of the secret + a nonce) so the raw secret is never transmitted after login. The cookie can then be verified without exposing the secret.

**Blog body rendered as raw HTML via `dangerouslySetInnerHTML`:**
- Risk: In `src/app/blog/[slug]/page.tsx` (lines 33-39), if `body` contains HTML tags it is rendered directly via `dangerouslySetInnerHTML`. The comment says "admin-created, trusted content" — this is safe only while admin access is truly restricted and the admin is not compromised.
- Files: `src/app/blog/[slug]/page.tsx`
- Current mitigation: Admin access is single-secret protected. Content is stored server-side.
- Recommendations: Consider sanitizing HTML on write (via a library like `dompurify` on the server) rather than trusting raw storage. Add Content Security Policy headers.

**JSON-LD XSS prevention is inconsistently applied:**
- Risk: The CLAUDE.md notes JSON-LD requires `.replace(/</g, "\\u003c")` on `JSON.stringify` output. This is applied in zero places across the codebase — all pages use bare `JSON.stringify(jsonLd)` in `dangerouslySetInnerHTML`.
- Files: `src/app/page.tsx`, `src/app/[category]/page.tsx`, `src/app/providers/[slug]/page.tsx`, `src/app/compare/[versus]/page.tsx`, `src/app/best/[slug]/page.tsx`, `src/app/blog/[slug]/page.tsx`, and all other pages with JSON-LD.
- Current mitigation: Provider names and content are admin-entered. If attacker-controlled content enters the database (e.g., via review body if it ever surfaces in JSON-LD), it could inject `</script>`.
- Recommendations: Create a helper `safeJsonLd(obj: unknown): string` that calls `JSON.stringify(obj).replace(/</g, "\\u003c")` and use it in all JSON-LD script tags.

**No URL validation on `website` or `affiliateUrl` fields:**
- Risk: Admin can enter any string as `website` or `affiliateUrl`. These are rendered as `href` values on provider detail pages. A `javascript:` URL would execute on click.
- Files: `src/app/actions/admin.ts` (`createProvider`, `updateProvider`), `src/components/AffiliateLink.tsx`, `src/app/providers/[slug]/page.tsx`
- Current mitigation: Admin access is restricted. External link uses `rel="noopener noreferrer"`.
- Recommendations: Validate that `website` and `affiliateUrl` start with `https://` in the server action before saving.

**Rate limiting for reviews is ineffective when IP is unavailable:**
- Risk: `submitReview` in `src/app/actions/reviews.ts` (lines 144-157) skips rate limiting entirely if `getClientIpHash()` returns `null`. On Vercel, `x-forwarded-for` is typically always set, but the fallback path allows unlimited submissions if headers are absent.
- Files: `src/app/actions/reviews.ts`
- Current mitigation: Honeypot field present. Reviews require moderation before appearing.
- Recommendations: Block submission (return error) rather than skip rate limiting when IP is unavailable.

---

## Performance Bottlenecks

**`getProviderBySlug` fetches all approved reviews (up to 10) on every page load:**
- Problem: The provider detail query in `src/lib/queries.ts` (line 77-91) always includes 10 reviews. For providers with many reviews, this is unnecessarily heavy. Reviews are also sorted by `helpful DESC, createdAt DESC` requiring a compound sort with no index covering both.
- Files: `src/lib/queries.ts`
- Cause: No separate lazy load; all reviews fetched upfront.
- Improvement path: Stream reviews via a separate `Suspense` boundary with a dedicated query. Add a composite index on `[providerId, status, helpful, createdAt]`.

**Full-text search uses `contains` with `mode: insensitive` (ILIKE):**
- Problem: `searchProviders`, `searchBlogPosts`, and `searchCollections` in `src/lib/queries.ts` use Prisma `contains` with `mode: "insensitive"` which maps to PostgreSQL `ILIKE '%query%'`. This cannot use B-tree indexes and performs a sequential scan.
- Files: `src/lib/queries.ts`
- Cause: No full-text search index (PostgreSQL `tsvector`/`tsquery`) or external search service.
- Improvement path: Add PostgreSQL full-text search using `@@to_tsquery` via Prisma raw queries, or integrate Algolia/Meilisearch when search becomes a priority.

**`getTopAffiliateProviders` executes N+1 pattern (two sequential queries):**
- Problem: `getTopAffiliateProviders` in `src/lib/queries.ts` (lines 229-253) first groups affiliate clicks, then fetches providers in a second query. While not technically N+1, the sequential dependency prevents optimal query planning.
- Files: `src/lib/queries.ts`
- Cause: Prisma `groupBy` cannot include related model data.
- Improvement path: Acceptable for current scale. At high volume, replace with a raw SQL query using `JOIN`.

**Sitemap fetches three full slug lists on every request:**
- Problem: `src/app/sitemap.ts` calls `getAllProviderSlugs()`, `getAllCollectionSlugs()`, and `getAllBlogPostSlugs()` in parallel on every sitemap request. These are not `React.cache()` deduplicated because sitemaps run outside React rendering.
- Files: `src/app/sitemap.ts`
- Cause: Sitemaps are not rendered in the React tree, so `React.cache()` doesn't apply.
- Improvement path: Add ISR via `export const revalidate = 86400` on the sitemap.

---

## Fragile Areas

**`parseVersusSlug` in the comparison page requires exact `-vs-` separator:**
- Files: `src/app/compare/[versus]/page.tsx`
- Why fragile: `versus.split("-vs-")` will break for provider slugs that themselves contain `-vs-` (unlikely but possible). It also only supports exactly 2 providers, giving a 404 for 3-way comparisons.
- Safe modification: Any change to the URL comparison format must update both `parseVersusSlug` and the `CompareBar`/`AddToCompareButton` components that construct these URLs.
- Test coverage: No tests.

**Denormalized price fields (`minPricePerServingCents`, `maxPricePerServingCents`, `freeShipping`) can become stale:**
- Files: `src/app/actions/admin.ts` (`savePlan`, `deletePlan`)
- Why fragile: Price denormalization is manually recalculated only in `savePlan` and `deletePlan`. If a plan is edited directly in the database (seed script, migration), or if `savePlan` throws before the recalculation step, the `Provider` table has incorrect pricing data used for filtering and display.
- Safe modification: Always use `savePlan`/`deletePlan` admin actions to modify plans. Never update `Plan` rows directly.
- Test coverage: No tests.

**Blog body renderer custom markdown parser is limited:**
- Files: `src/app/blog/[slug]/page.tsx` (`BlogBody`, `formatInlineMarkdown`)
- Why fragile: The homegrown markdown parser only supports `**bold**`, `*italic*`, `## headings`, `### headings`, `# headings` (broken — maps to h2), and `-`/`*` unordered lists. No support for numbered lists, blockquotes, code blocks, horizontal rules, tables, or links. Admin-entered content using any unsupported markdown will render as raw text.
- Safe modification: Do not add more markdown features to this parser; replace it with a library (`marked`, `remark`) when the limitations become a problem.
- Test coverage: No tests.

**`CompareProvider` uses `sessionStorage` with no SSR guard at read time:**
- Files: `src/components/CompareProvider.tsx`
- Why fragile: The `getSnapshot` callback (line 78) accesses `sessionStorage` directly. This is inside a `useCallback` with no browser check. While `useSyncExternalStore` with a server snapshot prevents server-side crashes, `sessionStorage` calls inside callbacks could fail in non-browser test environments (e.g., Jest/JSDOM without full browser APIs).
- Safe modification: Safe in production as written; be careful if/when tests are added.
- Test coverage: No tests.

---

## Scaling Limits

**Admin reviews page hard-coded `take: 100`:**
- Current capacity: Shows at most 100 reviews, regardless of filter.
- Files: `src/app/admin/reviews/page.tsx` (line 51)
- Limit: An active site with high review volume will silently hide reviews beyond 100.
- Scaling path: Add server-side pagination to the admin reviews list matching the pattern used in `getPublishedBlogPosts`.

**`queries.ts` at 336 lines, approaching the 300-line split threshold:**
- Current capacity: 336 lines, 22 exported query functions.
- Files: `src/lib/queries.ts`
- Limit: `PROJECT.md` specifies splitting at 300 lines. Threshold is already exceeded.
- Scaling path: Split into domain files: `src/lib/queries/providers.ts`, `src/lib/queries/content.ts`, `src/lib/queries/admin.ts`.

**`admin.ts` Server Actions at 966 lines:**
- Current capacity: Single file handles all CRUD for providers, plans, reviews, blog posts, and collections.
- Files: `src/app/actions/admin.ts`
- Limit: Adding new admin entities increases this file's complexity and merge conflict surface.
- Scaling path: Split into `src/app/actions/providers.ts`, `src/app/actions/content.ts`, `src/app/actions/reviews.ts`.

---

## Dependencies at Risk

**No test runner installed:**
- Risk: Jest, Vitest, and Playwright are all absent from `package.json`. There is no mechanism to catch regressions automatically.
- Impact: Every code change carries manual verification burden. Fragile areas listed above have no automated safety net.
- Migration plan: Add Vitest for unit tests (compatible with TypeScript, ESM, React 19) and Playwright for E2E tests targeting critical paths (category listing, provider detail, comparison, review submission).

**No markdown rendering library:**
- Risk: Blog post rendering relies on a custom parser in `src/app/blog/[slug]/page.tsx` (170+ lines). This is documented as a gap in `CLAUDE.md`.
- Impact: Rich blog content (tables, code blocks, links, nested lists) cannot be rendered correctly.
- Migration plan: Add `remark`/`remark-html` or `marked` for server-side markdown rendering. The `BlogBody` component is the only consumer.

---

## Missing Critical Features

**No rate limiting for affiliate click endpoint:**
- Problem: `GET /api/affiliate/[providerId]` in `src/app/api/affiliate/[providerId]/route.ts` tracks clicks fire-and-forget but has no deduplication or rate limiting. A bot clicking once per second inflates affiliate metrics.
- Blocks: Accurate affiliate revenue attribution.

**No NEXT_PUBLIC_BASE_URL in deployment:**
- Problem: `NEXT_PUBLIC_BASE_URL` is used in `sitemap.ts`, `robots.ts`, and `layout.tsx` but falls back to the hardcoded production URL. `NEXT_PUBLIC_SITE_URL` (a different name) is used in `src/app/[category]/page.tsx`. Neither is documented in an `.env.example`.
- Blocks: Correct sitemap, robots, and JSON-LD URL generation in non-production environments.

**No image `remotePatterns` for provider logo CDNs not yet added:**
- Problem: `next.config.ts` has `remotePatterns` for Unsplash, Cloudinary, AWS S3, jsDelivr, imgix, Clearbit, and logo.dev. Any provider logo hosted on a different CDN (e.g., direct brand CDN, custom domain) will fail Next.js Image optimization with a "hostname not configured" error.
- Blocks: Displaying logos for providers whose logo URLs don't match the configured hostnames.

---

## Test Coverage Gaps

**No tests exist:**
- What's not tested: The entire application — all query functions, all server actions, all page components, all client components, the proxy auth logic.
- Files: Every file under `src/`
- Risk: Any refactor or dependency upgrade can break silently. The fragile areas documented above (denormalization, comparison URL parsing, blog renderer) are especially high-risk without coverage.
- Priority: High

**Specifically high-risk untested paths:**
- Review submission flow (`src/app/actions/reviews.ts`) — rate limiting, honeypot, validation
- Affiliate click redirect (`src/app/api/affiliate/[providerId]/route.ts`) — correct redirect URL selection
- Provider update price denormalization (`src/app/actions/admin.ts` `savePlan`/`deletePlan`) — stale data risk
- `parseVersusSlug` in `src/app/compare/[versus]/page.tsx` — URL format parsing
- `CompareProvider` sessionStorage state (`src/components/CompareProvider.tsx`) — add/remove/clear logic

---

*Concerns audit: 2026-03-21*
