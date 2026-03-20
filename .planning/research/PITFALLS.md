# Domain Pitfalls

**Domain:** Food box subscription comparison/discovery site (affiliate model)
**Researched:** 2026-03-20
**Confidence:** HIGH (domain-specific patterns well-documented via Google algorithm updates, FTC enforcement, and community reports; tech stack concerns verified against codebase)

---

## Critical Pitfalls

Mistakes that cause rewrites, Google penalties, or fundamental trust loss.

### Pitfall 1: Google E-E-A-T Penalty for Thin Affiliate Content

**What goes wrong:** Google's December 2025 Core Update hit affiliate sites hardest -- 71% of affiliate sites experienced significant traffic drops. Sites with shallow "reviews" that lack original testing, unique photography, or genuine editorial voice are being demoted. Product review and comparison content is now held to strict E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) standards. A food box comparison site that reads like a scraped data sheet with affiliate links will not rank. Google specifically targets "thin affiliate content lacking original testing or analysis" (63-71% ranking losses reported).

**Why it happens:** Teams build the comparison engine and data model first, treating editorial content as filler to be added later. The seed data contains generic descriptions ("HelloFresh delivers fresh ingredients to your door") instead of opinionated editorial voice. Pros/cons lists read like marketing copy rather than genuine assessments. No methodology page explains how rankings are determined.

**Consequences:** Zero organic traffic. Google will not surface the site for competitive queries like "best meal kits 2026" or "hellofresh vs blue apron." Without organic traffic, the entire affiliate revenue model collapses. Recovery from an E-E-A-T penalty takes 2-6 months for most sites, 6-12 months for YMYL (Your Money Your Life) content, which food/health content falls under.

**Prevention:**
1. Seed data must contain editorial-quality prose from day one -- specific, opinionated, not generic. Every provider description should read like a real review. Example of BAD: "HelloFresh delivers pre-portioned ingredients." Example of GOOD: "HelloFresh's recipe cards are beginner-friendly, but experienced cooks may find the instructions overly prescriptive -- you'll be told to mince garlic rather than trusted to know how."
2. Build the `/methodology` page (E-E-A-T trust signal) in Phase 50 or earlier, not as an afterthought. Explain ranking criteria, how data is collected, what "editor's pick" means.
3. Every provider needs unique pros/cons that reference specific experiences (e.g., "Packaging uses excessive plastic despite sustainability claims" not "Some environmental concerns").
4. Include author attribution on editorial pages to establish expertise.
5. Prioritize "best of" collection pages (Phase 70) as primary SEO landing pages -- Google rewards curated, opinionated lists over raw comparison tables.

**Detection:** Check Google Search Console for zero impressions on target keywords after 30 days of indexing. Read each provider page aloud -- if it could describe any food box service, it's too generic.

**Phase:** Phase 10 (seed data quality), Phase 50 (methodology page), Phase 70 (editorial collections), Phase 110 (SEO audit)

---

### Pitfall 2: Stale Pricing and Provider Data Destroys Trust

**What goes wrong:** Food box subscription pricing changes frequently -- providers run rotating promotions, adjust per-serving costs seasonally, add/remove plan tiers, and some providers go out of business entirely (Freshly shut down in 2023, Imperfect Foods merged into Misfits Market in 2023). A comparison site showing outdated prices or defunct providers immediately loses credibility. Reddit threads about meal kits consistently surface pricing discrepancies between comparison sites and actual provider websites.

**Why it happens:** The project uses static pricing data with no provider API integrations (explicitly out of scope). Pricing is manually curated. Without a systematic update process, data goes stale within weeks. The schema has `updatedAt` timestamps but no mechanism to flag or surface stale records.

**Consequences:** Users click through to a provider and see different prices than advertised -- instant trust loss and they never return. Showing a defunct provider damages credibility site-wide. Google demotes pages with clearly outdated factual claims, especially in YMYL categories. Comparison results become misleading, potentially violating FTC guidelines on accurate advertising.

**Prevention:**
1. Add a `lastVerifiedAt DateTime?` field to the Provider model. Display "Pricing verified [date]" on provider detail pages. This is an honest trust signal.
2. Add a `providerStatus` field beyond just `active Boolean` -- consider states like `ACTIVE`, `PAUSED`, `DISCONTINUED`, `ACQUIRED`. The project already handles Freshly and Imperfect Foods in key decisions, but the schema doesn't model this lifecycle.
3. Build an admin "staleness dashboard" in Phase 100 that highlights providers not verified in 30+ days. Sort by stalest first.
4. Include year in all metadata templates (already planned: "Best Meal Kits of 2026") and update these at year boundaries.
5. Frame prices as "starting from $X.XX/serving" rather than exact amounts when possible. The UX should communicate that prices are editorial snapshots, not live feeds.

**Detection:** Admin dashboard showing providers with `updatedAt` older than 30 days. Declining affiliate click-through rates on a specific provider (users learned the site is unreliable for that provider). User-submitted corrections.

**Phase:** Phase 10 (schema additions), Phase 100 (admin staleness alerts), Phase 120 (data audit process)

---

### Pitfall 3: FTC Non-Compliance on Affiliate Disclosures

**What goes wrong:** The FTC requires clear, prominent disclosure of all material relationships (affiliate commissions) between a review/comparison site and the companies it reviews. In 2026, civil penalties reach up to $51,744 per violation, with each undisclosed affiliate post counting as a separate violation. The FTC issued its first enforcement wave in December 2025, sending warning letters to ten companies. A site with 20 undisclosed provider pages risks fines exceeding $1 million.

**Why it happens:** Developers build the affiliate click tracking system (Phase 120) but bury disclosures in a footer link or omit them entirely. The disclosure is placed far from the affiliate links (e.g., only on a separate "disclosure" page) rather than near each CTA. The design treats disclosures as ugly legal text to minimize rather than as trust-building elements.

**Consequences:** FTC enforcement action with five-figure fines per violation. Google also penalizes sites that fail to disclose affiliate relationships (part of the site reputation abuse policy). Beyond legal risk, savvy users in 2026 recognize undisclosed affiliate sites as untrustworthy -- transparency is a competitive advantage.

**Prevention:**
1. Every page with affiliate links must have a visible disclosure near the top of the content, before the first affiliate link. Use clear language: "We earn a commission if you make a purchase, at no extra cost to you."
2. The `affiliateUrl` field in Provider is the trigger -- any page rendering an affiliate link must also render a disclosure component.
3. Create a reusable `<AffiliateDisclosure />` component in Phase 20 that is included on every page type with affiliate links (provider detail, comparison, collections, blog posts mentioning providers).
4. Create a dedicated `/how-we-make-money` or `/disclosure` page (link from site-wide footer).
5. The methodology page should explicitly state that affiliate relationships do not influence rankings.
6. Affiliate CTAs ("Visit Site") should be visually distinct from editorial content -- never disguise affiliate links as editorial recommendations without disclosure.

**Detection:** Audit every page type that renders affiliate links. Check that disclosure appears before the first affiliate CTA on every page. Automated: grep for `affiliateUrl` usage and verify each render path includes a disclosure component.

**Phase:** Phase 20 (create disclosure component, footer link), Phase 50 (per-page disclosures on provider detail), Phase 60 (comparison page disclosures), Phase 120 (site-wide audit)

---

### Pitfall 4: Float Arithmetic for Price Comparisons Produces Wrong Results

**What goes wrong:** The schema uses `Float` for all pricing fields (`pricePerServing`, `pricePerWeek`, `pricePerBox`, `shippingCost`). IEEE 754 floating-point arithmetic causes `0.1 + 0.2 = 0.30000000000000004`. Sorting providers by "price low to high" produces incorrect ordering when prices differ by fractions of a cent. Price ranges display as "$4.990000000000001 per serving." The comparison table shows Provider A as cheaper than Provider B when they actually cost the same.

**Why it happens:** `Float` is the quick default in Prisma schemas. The bug is invisible during development with round dollar values in seed data and only surfaces with real-world fractional pricing ($7.49, $11.33, $4.99). The CONCERNS.md already flags this issue.

**Consequences:** Financial inaccuracy in a comparison tool is a credibility killer. Users making purchasing decisions based on incorrect price comparisons may feel deceived. Price-based filtering ("under $8/serving") produces incorrect boundary results. If a provider costs exactly $8.00/serving, float arithmetic might represent it as $8.000000000001, excluding it from the filter. This is a data integrity problem, not just a display problem.

**Prevention:**
1. Change all pricing fields to `Decimal` type in Prisma (maps to PostgreSQL `DECIMAL`/`NUMERIC`) before seeding any data. This is the single most important schema change in Phase 10.
2. Alternatively, store prices as integer cents (`pricePerServingCents Int`) and divide by 100 for display -- this is simpler and eliminates the problem entirely.
3. Create a `formatPrice(value: Decimal | number): string` utility function used everywhere prices are displayed. Never display raw numeric values.
4. Seed data should include edge-case prices ($4.99, $11.49, $7.33) not just round numbers to surface formatting issues immediately.
5. Test price sorting with two providers priced at $7.99 and $8.00 -- they must sort correctly.

**Detection:** Display any price on screen. If it shows more than 2 decimal places, the bug exists. Test sorting: create two providers with prices $7.49 and $7.50 and verify correct sort order.

**Phase:** Phase 10 (schema change -- MUST happen before any data is seeded)

---

### Pitfall 5: Single-Category Provider Model Misrepresents Real Services

**What goes wrong:** The schema assigns exactly one `CategoryType` per Provider via a single enum field. In reality, many food box services span multiple categories: Hungryroot is both a meal kit and a grocery/produce service. Sunbasket offers meal kits AND prepared meals. Green Chef is both a meal kit and a specialty diet service. Purple Carrot could be specialty (vegan) or meal kit. Forcing a provider into one category means it either appears in the wrong category or is missing from categories where users would expect to find it.

**Why it happens:** Single-enum is simpler to model and query than a many-to-many relation. The team defers the decision, seeds 18 providers into fixed categories, and then discovers the problem when trying to categorize real services. After seeding, changing to a junction table requires a data migration.

**Consequences:** Users searching for prepared meals don't find Hungryroot (listed under produce). Category page provider counts are inaccurate ("5 Prepared Meal services" when 7 actually offer prepared meals). SEO pages for a category miss relevant providers. Comparison results are skewed when filtering by category.

**Prevention:**
1. Evaluate during Phase 10 seed data creation. If 3+ of the planned 18 providers span categories (they will), convert to a `ProviderCategory` junction table. The `ProviderDietaryTag` pattern already exists in the schema as a model to follow.
2. At minimum, add a `secondaryCategory CategoryType?` field as a lighter-weight solution.
3. The query layer must then support "find providers in category X" including primary and secondary categories.
4. If staying with single category (strongly discouraged), add an editorial note on multi-category provider pages explaining what else they offer.

**Detection:** During seed data creation: any provider where the team debates which single category it belongs to is a signal that the model is insufficient. Count the debates -- if it happens more than twice, the model must change.

**Phase:** Phase 10 (schema decision, before seeding -- this is a now-or-never decision)

---

## Moderate Pitfalls

### Pitfall 6: Promotional vs. Regular Pricing Confusion

**What goes wrong:** Nearly every meal kit service advertises a deeply discounted introductory price ("$4.99/serving for your first box!"). If the database stores this promotional price as the standard `pricePerServing`, the entire comparison becomes meaningless -- every provider looks cheap until the user signs up and sees the real $9.99/serving price after the first month. Users feel deceived. The site loses credibility. Worse, price-based filtering and sorting become misleading.

**Why it happens:** Promotional pricing is the most prominently displayed price on provider websites. Data entry naturally captures the most visible number. The schema has no field to distinguish promotional from regular pricing. Reddit discussions consistently surface confusion about "real" vs. advertised meal kit pricing.

**Consequences:** Price-based sorting produces misleading results. Users make purchasing decisions based on temporary prices. The site's core value proposition (transparent pricing comparison) is undermined. Trust damage cascades -- if prices are wrong, what else is wrong?

**Prevention:**
1. Seed data must always use regular (non-promotional) pricing as the primary `pricePerServing` values. Document this as a data entry rule.
2. Add optional fields to the Plan model: `introPrice Decimal?` and `introNote String?` (e.g., "50% off first 3 boxes") for displaying promotional offers separately.
3. On provider detail pages, display both clearly: "Regular price: $9.99/serving. First box: $4.99/serving" with visual distinction (promo as a badge, regular as the primary number).
4. Filtering and sorting must always use regular prices. Display promo prices as a secondary badge/callout, never as the primary sort value.
5. Document this convention in seed script comments so future data entry follows the same rule.

**Detection:** Compare the `pricePerServing` values in the database against actual regular pricing on each provider's website. If the database price is significantly lower than the provider's regular price, it's likely a promotional rate.

**Phase:** Phase 10 (schema consideration, seed data convention), Phase 50 (display distinction on provider pages)

---

### Pitfall 7: Comparison Tray State Lost on Navigation

**What goes wrong:** The comparison feature (Phase 60) requires persisting selected providers across page navigations. Users select providers on a category page, navigate to a provider detail page to learn more, then return -- and their selections are gone. This is the most common UX complaint about comparison tools on competing sites.

**Why it happens:** Server Components don't maintain client state. If comparison state is stored in React state alone, it resets on every full navigation. Using URL params on every page pollutes every URL. The team either builds a client-side provider (React context) that wraps the entire app (adding unnecessary client JS) or stores state in localStorage (which doesn't work during SSR and causes hydration mismatches).

**Prevention:**
1. Use a lightweight client-side store (zustand is ~1KB, or a simple React context) scoped to the ComparisonTray component, which must be a Client Component rendered in the root layout.
2. Persist to `localStorage` for durability across page reloads. Hydrate on mount with `useEffect`, not during SSR -- this avoids hydration mismatches.
3. Keep the comparison tray in the root layout (`src/app/layout.tsx`) so it survives route transitions without re-mounting.
4. Do NOT try to store comparison state in URL params on non-comparison pages -- it makes every URL ugly and confusing.
5. Only convert state to URL params when the user navigates to `/compare` -- construct the URL at that point.

**Detection:** Test flow: select 2 providers on `/meal-kits`, navigate to `/providers/hellofresh`, press browser back button. Are selections preserved? Test with hard refresh -- are selections preserved via localStorage?

**Phase:** Phase 60 (comparison engine)

---

### Pitfall 8: Neon Serverless Connection Pool Exhaustion Under Traffic

**What goes wrong:** Each Vercel serverless function invocation can create a new database connection. Under moderate traffic (50+ concurrent requests), the Neon free tier's connection pooling limit is exhausted, causing "Timed out fetching a new connection from the connection pool" errors. Multiple Vercel community threads report this exact issue with Prisma + Neon deployments, including reports as recent as December 2025 and May 2025.

**Why it happens:** The Prisma singleton pattern in `src/lib/db.ts` prevents multiple clients within a single process, but each Vercel serverless cold start creates a new process with a new connection. Vercel spawns many concurrent function instances during traffic spikes. If the `DATABASE_URL` uses the direct connection (port 5432) instead of the pooled connection (port 6543), each function holds an exclusive connection.

**Prevention:**
1. Verify `DATABASE_URL` uses Neon's pooled connection URL (port 6543, not port 5432). The `@prisma/adapter-pg` already handles serverless connections, but the URL must be the pooled endpoint.
2. Set `connection_limit` in the connection string: `?connection_limit=5` to prevent any single function from hogging connections.
3. Enable the Next.js 16 `use cache` directive (via `cacheComponents: true` in next.config) for read-heavy pages. Cached pages serve from edge without hitting the database.
4. For listing pages, set `export const revalidate = 3600` (1 hour ISR) -- provider data doesn't change frequently enough to justify on-demand queries.
5. Monitor the Neon dashboard for connection saturation. Set up alerts at 70% utilization.

**Detection:** 500 errors on production pages that work fine locally. Neon dashboard shows connections at or near limit. Error logs contain "Timed out fetching a new connection from the connection pool."

**Phase:** Phase 10 (connection URL verification), Phase 110 (caching strategy), Phase 120 (monitoring)

---

### Pitfall 9: Next.js 16 Breaking Changes in Every Page File

**What goes wrong:** Developers (and AI code assistants) trained on Next.js 14/15 patterns write `params.slug` instead of `(await params).slug`, use `middleware.ts` instead of `proxy.ts`, call `cookies()` synchronously, and use `useFormState` instead of `useActionState`. The code compiles but fails at runtime with cryptic errors. This will happen on literally every dynamic page and layout.

**Why it happens:** Next.js 16 is new. Training data, Stack Overflow answers, tutorials, and community examples overwhelmingly use 14/15 patterns. The breaking changes are syntactically subtle -- adding `await` before `params` is easy to forget, and the compiler doesn't catch it. Community discussion confirms this is the top confusion point.

**Prevention:**
1. The AGENTS.md file already documents these changes. Every coding session must reference it.
2. Create a `src/types/page.ts` utility that exports correctly-typed page prop interfaces (with Promise-wrapped params/searchParams) to enforce the pattern at the type level.
3. Test every page at runtime, not just compilation. `next build` succeeds even when pages will crash on access.
4. For `proxy.ts`: create the file skeleton in Phase 100 with the correct export name (`export function proxy()` not `export function middleware()`), using Node.js runtime only.
5. Create a simple dev checklist or code comment template for new pages: "Remember: await params, await searchParams, await cookies()."

**Detection:** Runtime errors like "params.slug is not a property of Promise" or "Cannot read properties of undefined (reading 'slug')" in server logs. Pages that build successfully but crash when visited.

**Phase:** Phase 20 (type utilities), every subsequent phase (ongoing discipline)

---

### Pitfall 10: URL Filter State That Breaks on Edge Cases

**What goes wrong:** Category pages use URL search params for filter/sort state (e.g., `/meal-kits?dietary=keto,vegan&sort=price-asc&maxPrice=10`). Edge cases cause crashes or incorrect results: empty arrays, duplicate params, malformed values, URL-encoded special characters, extremely long param strings, and search engine bots crawling the page with no params or with garbage params.

**Why it happens:** The team tests the happy path (select a filter, see results update) but doesn't test: clearing all filters, selecting all 16 dietary filters simultaneously, back-button behavior after 3 filter changes, pasting a URL with invalid params, or a bot crawling a URL with `?dietary=NONEXISTENT`.

**Prevention:**
1. Build a `parseSearchParams(searchParams: URLSearchParams)` utility with Zod validation that returns safe defaults for every missing or invalid param. Never access raw params without validation.
2. Define a strict schema: `dietary` is a comma-separated list of valid `DietaryTag` enum values. Unknown values are silently dropped, not crashed on.
3. Test with: empty params, all params set, one invalid param mixed with valid ones, URL-encoded values, and the `searchParams` Promise resolving to an empty object.
4. Encode and decode params symmetrically. If the filter UI URL-encodes, the `parseSearchParams` must URL-decode.
5. Category pages should use `export const dynamic = 'force-dynamic'` since filters make them inherently dynamic -- do not try to statically generate filtered variants.

**Detection:** Visit `/meal-kits?dietary=INVALID_VALUE` -- does it crash or gracefully show all results? Visit `/meal-kits?maxPrice=abc` -- does it crash? Visit `/meal-kits?sort=` (empty value) -- does it crash?

**Phase:** Phase 40 (filtering implementation)

---

### Pitfall 11: Review System Spam Without Rate Limiting

**What goes wrong:** Anonymous review submission (Phase 90) without rate limiting becomes a spam magnet. Bots submit hundreds of fake reviews. Even with moderation (reviews default to PENDING), the admin queue becomes unusable -- moderating 500 spam reviews to find 3 real ones is not sustainable. Fake positive reviews undermine editorial credibility. Fake negative reviews from competitors could create legal liability.

**Why it happens:** Rate limiting is mentioned in Phase 90 acceptance criteria ("basic rate limiting") but no infrastructure exists. No validation library (Zod) is installed. No CAPTCHA integration is planned. The review form is a simple POST endpoint with no bot protection.

**Prevention:**
1. Install Zod in Phase 10 (it's needed for env validation anyway) and define review submission schemas.
2. Implement IP-hash-based rate limiting: hash the reviewer's IP (the `AffiliateClick.ipHash` pattern already exists), limit to 3 reviews per IP per 24 hours.
3. Add a honeypot field (invisible to users via CSS, bots fill it in) to the review form. Reject any submission with the honeypot field populated.
4. Require minimum review body length (50 characters) and maximum (2000 characters). Require a rating between 1-5.
5. Add a simple time-based check: reject submissions that happen less than 5 seconds after page load (bots submit instantly).
6. Sanitize all review text for XSS before storing.

**Detection:** Monitor the PENDING review queue growth rate. If it grows by more than 20 reviews/day on a new site with little traffic, it's bot activity.

**Phase:** Phase 10 (install Zod), Phase 90 (review system with full protections)

---

### Pitfall 12: SEO Comparison URLs Without Canonical Ordering

**What goes wrong:** The SEO comparison URL pattern `/compare/blue-apron-vs-hellofresh` must enforce canonical slug ordering. Without enforcement, `/compare/hellofresh-vs-blue-apron` and `/compare/blue-apron-vs-hellofresh` both resolve and serve the same content. Google treats these as duplicate pages, diluting SEO authority across both URLs.

**Why it happens:** The comparison page handler splits on `-vs-` and looks up both provider slugs. Without explicit ordering logic and redirects, both URL variants work. The SEO-STRATEGY.md specifies alphabetical ordering with 301 redirects, but implementing this correctly requires discipline.

**Prevention:**
1. The comparison page handler must sort slugs alphabetically and `permanentRedirect()` if the URL is not in canonical order.
2. Include `<link rel="canonical">` on comparison pages pointing to the alphabetically-ordered URL.
3. `generateStaticParams` should only generate canonical-ordered pairs.
4. The comparison URL builder function (used in internal links) must always produce canonical ordering.
5. Test: request `/compare/hellofresh-vs-blue-apron` and verify it 301-redirects to `/compare/blue-apron-vs-hellofresh`.

**Detection:** Google Search Console showing "Duplicate without user-selected canonical" for comparison pages. Crawl the site with a tool like Screaming Frog to check for duplicate content.

**Phase:** Phase 60 (comparison engine implementation)

---

## Minor Pitfalls

### Pitfall 13: Missing `remotePatterns` Breaks All Provider Images

**What goes wrong:** Provider logos and hero images are stored as external URLs in the database. The Next.js `Image` component requires `images.remotePatterns` in `next.config.ts` to whitelist external image hosts. Without this, every provider image throws a build-time or runtime error, and the visual design breaks completely.

**Why it happens:** `next.config.ts` is currently empty (default scaffold). The config is planned for Phase 50, but developers start using `<Image>` in Phase 20/30 with placeholder images and don't encounter the error until real external URLs are loaded from seed data. In Next.js 16, `images.domains` is deprecated -- only `remotePatterns` works.

**Prevention:**
1. Configure `images.remotePatterns` in Phase 10 when seed data URLs are known, not Phase 50.
2. Seed data should include real logo URLs from the start so the error surfaces immediately.
3. Create a `ProviderLogo` component that wraps Next.js `Image` with error handling and a fallback placeholder.
4. For development, a permissive pattern like `{ protocol: 'https', hostname: '**' }` works, but tighten for production.

**Detection:** Any page rendering an `<Image>` with an external URL will throw "next/image Un-configured Host" in development.

**Phase:** Phase 10 (early config), Phase 20 (component development)

---

### Pitfall 14: JSON String Fields Without Validation Corrupt Data

**What goes wrong:** `prosJson` and `consJson` are `String @db.Text` containing serialized JSON arrays. Any code path that writes malformed JSON to these fields (a missing bracket, unescaped quote, accidental plain text) causes `JSON.parse()` to throw on every subsequent read of that provider. Since these fields are displayed on listing pages and detail pages, one corrupt record crashes page rendering.

**Why it happens:** No database-level JSON validation (it's a `Text` field, not `Json`). No application-level write validation. Manual data entry through the admin form is especially error-prone. The CONCERNS.md flags this.

**Prevention:**
1. Change to `Json?` type in Prisma (PostgreSQL JSONB) before seeding data -- this gives database-level validation and rejects malformed writes.
2. If keeping `String`, create typed utility functions: `parsePros(json: string | null): string[]` with try/catch that returns `[]` on parse failure rather than throwing.
3. Admin forms for pros/cons should use a list UI (add/remove string items) that serializes to JSON programmatically, never a raw textarea for JSON input.
4. Add Zod validation on all write paths: `z.array(z.string()).min(1).max(10)`.

**Detection:** Wrap `JSON.parse()` calls in try/catch during development. Any catch hit indicates data corruption.

**Phase:** Phase 10 (schema change or utility functions), Phase 100 (admin form validation)

---

### Pitfall 15: No Error Boundaries Cause White Screen of Death

**What goes wrong:** A single failed database query, a malformed JSON parse, or a missing provider slug causes the entire page to crash with a generic Next.js error page (or a white screen in production). Currently no `error.tsx`, `not-found.tsx`, `global-error.tsx`, or `loading.tsx` files exist anywhere in `src/app/`.

**Why it happens:** Error boundaries are boring infrastructure that gets deferred. The team is focused on features and visual design. The default Next.js error page is functional enough during development that nobody notices the gap.

**Prevention:**
1. Create `src/app/error.tsx` (must be Client Component), `src/app/not-found.tsx`, `src/app/global-error.tsx` (must be Client Component), and `src/app/loading.tsx` in Phase 20 as part of the layout shell -- before any feature development.
2. Add route-segment-specific error boundaries for critical pages: `/providers/[slug]/error.tsx`, `/[category]/error.tsx`, `/compare/error.tsx`.
3. Every data-fetching function that looks up by slug (e.g., `getProviderBySlug()`) must handle the null case by calling `notFound()` -- never let a null propagate into rendering.

**Detection:** Visit `/providers/nonexistent-provider` -- does it show a branded 404 or a generic/blank error? Kill the database connection and visit any page -- does it show a branded error or a white screen?

**Phase:** Phase 20 (global error boundaries), Phase 40-50 (route-specific boundaries)

---

### Pitfall 16: AffiliateClick Table Unbounded Growth

**What goes wrong:** Every affiliate link click creates a new row in `AffiliateClick` with no retention policy, archival, or cleanup mechanism. Over months, this table grows unbounded. Analytics queries slow down. Neon storage costs increase.

**Why it happens:** No data lifecycle management is designed. The table is write-only. The focus is on tracking clicks, not managing the data long-term.

**Prevention:**
1. Design aggregation from the start: plan for a daily/weekly rollup of click counts per provider into a summary structure (could be a separate table or an aggregated field on Provider).
2. Implement a cleanup mechanism: admin action or scheduled task to delete raw click rows older than 90 days.
3. The `@@index([createdAt])` on the model already supports efficient time-range deletes.
4. Consider a simple approach: store only the last 90 days of raw data, maintain a `totalClickCount Int` on Provider for historical totals.

**Detection:** Query `SELECT COUNT(*) FROM "AffiliateClick"` periodically. Alert if exceeding 100K rows.

**Phase:** Phase 120 (affiliate tracking), post-launch maintenance

---

## Domain-Specific Anti-Patterns (Not Technical)

### Anti-Pattern: "Ranking by Commission Rate"

**What goes wrong:** Ordering providers by affiliate commission payout rather than editorial quality. Google's December 2025 Core Update specifically targets content that ranks products based on advertiser relationships rather than genuine editorial assessment.

**Prevention:** Rankings must be editorially defensible. Document ranking criteria in `/methodology`. Never reorder a "best of" list because a provider increased their commission rate. If questioned, you should be able to explain every ranking position with editorial reasons.

### Anti-Pattern: "Every Provider Gets 4+ Stars"

**What goes wrong:** Fear of upsetting affiliate partners leads to uniformly positive reviews. Every provider gets 4+ stars, generic praise, and no real criticism. Users see through it immediately -- when everything is "great," nothing is. Google's E-E-A-T signals reward authentic, differentiated assessments.

**Prevention:** Include genuine, specific cons for every provider. Some providers should have 3-star or even 2.5-star ratings. The `editorNote` field should contain honest assessments. Negative reviews from real users should be displayed alongside positive ones. Criticism is a trust signal.

### Anti-Pattern: "Covering Defunct or Irrelevant Providers"

**What goes wrong:** Keeping outdated pages for providers that have shut down, been acquired, or significantly changed their offering. Competitor sites are plagued by this -- "Freshly Review 2026" pages still exist on sites despite Freshly being discontinued in 2023.

**Prevention:** When a provider discontinues, don't delete the page (the URL may have SEO value and inbound links). Instead, update it: show "Discontinued" status, explain what happened, redirect users to alternatives. This is actually a content opportunity -- "Freshly is gone, here are 5 alternatives" pages perform well in search.

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Severity | Mitigation |
|-------|---------------|----------|------------|
| 10 (Database) | Float pricing causes comparison errors (#4) | CRITICAL | Change to `Decimal` before seeding any data |
| 10 (Database) | Single-category model misrepresents providers (#5) | CRITICAL | Evaluate junction table before seeding |
| 10 (Database) | Generic seed data fails E-E-A-T (#1) | CRITICAL | Write editorial-quality descriptions, not marketing copy |
| 10 (Database) | Promotional vs. regular pricing confusion (#6) | MODERATE | Establish pricing convention, seed regular prices only |
| 10 (Database) | JSON string fields without validation (#14) | MINOR | Change prosJson/consJson to Json type, or add utility functions |
| 10 (Database) | No Zod installed for validation (#11) | MODERATE | Install Zod early, use for env validation and review schemas |
| 20 (Design) | No error boundaries (#15) | MODERATE | Create error.tsx, not-found.tsx, loading.tsx immediately |
| 20 (Design) | Missing remotePatterns (#13) | MINOR | Configure next.config.ts when seed data URLs are known |
| 20 (Design) | No affiliate disclosure component (#3) | CRITICAL | Build reusable disclosure component, include in footer |
| 40 (Categories) | URL filter params crash on edge cases (#10) | MODERATE | Zod-validate all searchParams with safe defaults |
| 40 (Categories) | Next.js 16 async params (#9) | MODERATE | Always await params and searchParams |
| 50 (Provider) | No methodology page for E-E-A-T (#1) | HIGH | Build /methodology page with ranking criteria |
| 50 (Provider) | FTC disclosure missing (#3) | CRITICAL | Add disclosure before first affiliate link on every provider page |
| 60 (Comparison) | Comparison state lost on navigation (#7) | MODERATE | Client store in root layout, persist to localStorage |
| 60 (Comparison) | Canonical URL ordering for SEO (#12) | MODERATE | Alphabetical slug sort with 301 redirect |
| 70 (Collections) | Thin editorial content fails E-E-A-T (#1) | CRITICAL | Opinionated, specific editorial voice per collection |
| 80 (Search) | N/A -- standard PostgreSQL patterns | LOW | Follow Prisma full-text search docs |
| 90 (Reviews) | Spam without rate limiting (#11) | MODERATE | IP-hash rate limiting, honeypot, min length, time check |
| 100 (Admin) | No staleness detection for pricing (#2) | HIGH | Build staleness dashboard, add lastVerifiedAt field |
| 110 (SEO) | Stale pricing in structured data (#2) | HIGH | Verify all prices before generating JSON-LD Product schema |
| 110 (SEO) | Connection pool exhaustion under traffic (#8) | MODERATE | Enable caching, ISR, verify pooled connection URL |
| 120 (Affiliate) | FTC disclosure audit (#3) | CRITICAL | Verify every page with affiliate links has disclosure |
| 120 (Affiliate) | AffiliateClick unbounded growth (#16) | MINOR | Design aggregation + cleanup mechanism |
| All phases | Next.js 16 breaking changes (#9) | MODERATE | Always await params/searchParams, use proxy.ts not middleware.ts |

---

## Sources

- Google December 2025 Core Update analysis -- affiliate sites hit hardest at 71%, recovery timeline 2-6 months, YMYL content 6-12 months (ALM Corp) -- https://almcorp.com/blog/google-december-2025-core-update-complete-guide/ [HIGH confidence]
- Google December 2025 Core Update detailed analysis -- thin affiliate content and lack of original analysis penalized (ALM Corp) -- https://almcorp.com/blog/google-december-2025-core-update-complete-analysis-recovery-guide/ [HIGH confidence]
- E-E-A-T requirements applied to product reviews and comparison content in December 2025 update (Analytics Insight) -- https://www.analyticsinsight.net/digital-marketing/what-is-google-e-e-a-t-and-how-does-it-affect-your-website [MEDIUM confidence]
- Google product review site ranking rule changes 2025 (eMarketer) -- https://www.emarketer.com/content/google-rule-change-hits-product-review-sites [HIGH confidence]
- Affiliate site algorithm coping strategies, Enhanced E-E-A-T requirements (CrakRevenue) -- https://www.crakrevenue.com/blog/how-affiliate-sites-cope-with-google-algorithm-update/ [MEDIUM confidence]
- FTC affiliate disclosure penalties up to $51,744/violation in 2026, first enforcement wave December 2025 (Automateed) -- https://www.automateed.com/ftc-disclosure-rules-for-affiliates [HIGH confidence]
- FTC affiliate disclosure rules and 2026 checklist (ReferralCandy) -- https://www.referralcandy.com/blog/ftc-affiliate-disclosure [HIGH confidence]
- FTC disclosure prominence and placement requirements (HeySeva) -- https://www.heyseva.com/blog-posts/ftc-guidelines-for-affiliates-creators-and-brands-2025 [MEDIUM confidence]
- Prisma/Neon connection pool timeout issues on Vercel -- confirmed in multiple threads (Vercel Community) -- https://community.vercel.com/t/vercel-prisma-neon-and-connection-issues/10813 [HIGH confidence]
- Neon connection pooling documentation for Prisma -- https://neon.com/docs/guides/prisma [HIGH confidence]
- Connection pool exhaustion with Prisma and Neon on Vercel, December 2025 report (AnswerOverflow) -- https://www.answeroverflow.com/m/1438102632714473512 [MEDIUM confidence]
- React Server Component performance pitfalls in Next.js (LogRocket) -- https://blog.logrocket.com/react-server-components-performance-mistakes [MEDIUM confidence]
- App Router common pitfalls 2026 (imidef) -- https://imidef.com/en/2026-02-11-app-router-pitfalls [MEDIUM confidence]
- Next.js 16 upgrading guide and breaking changes (official) -- https://nextjs.org/docs/app/guides/upgrading/version-16 [HIGH confidence]
- Meal kit pricing volatility and consumer confusion (SimplyCodes) -- https://simplycodes.com/blog/cheapest-meal-delivery-service [MEDIUM confidence]
- Meal kit service quality reports and user complaints (r/mealkits, CNET, Wirecutter, Bon Appetit) -- multiple sources [MEDIUM confidence]
- Codebase CONCERNS.md -- Float pricing, JSON fields, connection patterns, Next.js 16 breaking changes (internal) [HIGH confidence]
