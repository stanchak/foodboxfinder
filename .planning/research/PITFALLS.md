# Pitfalls Research

**Domain:** Food subscription discovery/comparison platform (Kayak-like)
**Researched:** 2026-03-21
**Confidence:** HIGH (based on detailed codebase analysis, data asset inspection, and domain expertise for comparison/filtering sites)

## Critical Pitfalls

### Pitfall 1: Sparse Data Makes Filters Return Empty Results

**What goes wrong:**
The dataset has extreme sparsity: `diet_tags` is populated for only 16% of providers, `household_fit` for 4%, `value_tier` for 8%, and `geography` for 9%. When users apply filters using these sparse fields, results collapse to near-zero. A user filtering by "Keto + budget tier" might see zero results not because no providers match, but because those fields were never populated. This makes the site feel incomplete and broken.

**Why it happens:**
The data was gathered conservatively from research -- many fields defaulted to empty when information was uncertain. The schema extension will add these as new Prisma fields, and the seed will import the sparse values as-is. If filtering is added against these fields without accounting for null/empty values, the filter becomes "must match" when it should be "prefer match, include unknown."

**How to avoid:**
1. Treat unpopulated fields as "unknown" rather than "doesn't match." Null values should pass through filters unless the user explicitly requests "only providers with this data."
2. Show filter option counts next to each option (e.g., "Keto (3)") so users see which filters are useful before applying them. Disable or dim options that would return zero results.
3. For fields under 30% populated, consider making them "soft filters" that rank results rather than exclude. Display matched filters prominently on cards that do match.
4. Prioritize enriching the top 20-30 providers (by traffic/relevance) before launch so the most-viewed providers have complete data.

**Warning signs:**
- More than 50% of filter combinations return zero results
- Users frequently hit the "No providers match your filters" empty state
- Filter sidebar shows many options but most return single-digit counts

**Phase to address:**
Schema extension phase (when adding new fields) and filtering phase (when building UI). The seed script should flag providers with low data completeness for admin follow-up.

---

### Pitfall 2: URL Search Param State Explosion With Multi-Criteria Filters

**What goes wrong:**
With 9+ filterable dimensions (category, prep_style, diet_tags, value_tier, household_fit, geography, flexibility, model_type, status, plus sort and page), the URL becomes unreadable and fragile. The current implementation serializes dietary tags as comma-separated strings (`?diet=VEGAN,KETO`), which works for one multi-value field. But adding 4-5 more multi-value fields creates URLs like `?diet=VEGAN,KETO&prep=cook-it-yourself&tier=mid,budget&fit=family&geo=national&flex=skip,pause&sort=price-asc&page=2`. These are hard to parse correctly, prone to encoding bugs, and generate duplicate content SEO problems (the same result set accessible via different URL orderings).

**Why it happens:**
Each new filter dimension is added incrementally to `parseSearchParams` and `updateParams` in the client component. There is no centralized filter schema -- the parsing logic in `[category]/page.tsx` and `CategoryFilters.tsx` must stay in sync manually. The CONCERNS.md already flags that `VALID_DIETARY_TAGS` is duplicated 4 times. Adding 6 more filter fields multiplies this duplication.

**How to avoid:**
1. Create a single `src/lib/filters.ts` module that defines the filter schema as a typed object, with parsing, serialization, and validation in one place. Both the server (page component) and client (filter component) import from this single source.
2. Establish URL param naming conventions upfront: short keys (`d=` for diet, `ps=` for prep_style, `vt=` for value_tier), consistent delimiters (comma for multi-value), and canonical ordering (alphabetize params in the URL).
3. Set canonical URLs on filtered pages (`<link rel="canonical" href="...">`) to the unfiltered category page to avoid SEO crawl budget waste on filter combinations.
4. Add `noindex` to filtered pages (pages with search params) since filtered views are not unique content -- only the base category pages should be indexed.

**Warning signs:**
- Filter values appearing in URLs that don't match valid enum values
- Same result set reachable from different URL param orderings
- Google Search Console showing thousands of "Discovered - currently not indexed" URLs
- Bug reports where clearing one filter unexpectedly changes another

**Phase to address:**
Filtering phase. Build `src/lib/filters.ts` as foundational infrastructure before any filter UI work.

---

### Pitfall 3: Comparison Table is Meaningless When Providers Have Different Data Shapes

**What goes wrong:**
The existing `ComparisonTable` component renders a matrix of rows: Rating, Price/Serving, Free Shipping, Dietary Options, and Featured Plan details. But providers being compared may have fundamentally different data shapes: a protein box has no "servings per meal," a specialty snack box has no "per serving" pricing, and a produce box has no "dietary tags." The table shows "N/A" for every field that doesn't apply, making the comparison unhelpful. A comparison between ButcherBox (protein) and HelloFresh (meal kit) would show meaningful data in different rows, defeating the purpose of side-by-side comparison.

**Why it happens:**
Comparison sites assume compared items are homogeneous (like comparing laptops with the same spec sheet). Food subscription services span wildly different models: subscription-first vs. hybrid, cook-it-yourself vs. heat-and-eat vs. no-cook, per-serving pricing vs. per-box pricing, weekly vs. monthly. The data model tries to normalize all of these into common fields, but they are not truly comparable on the same axes.

**How to avoid:**
1. Show only rows where at least one provider has data. Never display a row where all providers show "N/A."
2. Add category-specific comparison sections: "Meal Kit Details" shows recipe count, prep time, ingredient quality; "Protein Box Details" shows weight per box, cut selection; etc. Only show sections relevant to the providers being compared.
3. For cross-category comparisons, lead with universal fields (price range, flexibility, shipping) and visually separate category-specific sections.
4. Show a "How These Compare" summary blurb above the table that acknowledges when providers serve different needs: "These providers are in different categories. We compare them on universal factors like price, flexibility, and dietary options."
5. Consider a weighted score or "match meter" for the user's stated preferences rather than a raw data dump.

**Warning signs:**
- More than 40% of comparison table cells show "N/A"
- User bounce rate on comparison pages is high
- Comparison pages generate negative feedback ("this isn't helpful")

**Phase to address:**
Comparison phase. Requires the schema extension to be complete first so the comparison can leverage new fields (prep_style, model_type, value_tier) to determine which rows to show.

---

### Pitfall 4: Provider Logos are Mixed Formats Including .ico and .svg, Breaking Image Optimization

**What goes wrong:**
The logo manifest contains 5 `.ico` files (blue-apron, farm-fresh-to-you, farmbox-delivery, full-circle, crowd-cow), 6 `.svg` files, and 1 `.webp`. Next.js `Image` component handles `.png` and `.jpg` well, but `.ico` files are multi-resolution icon containers that render poorly at arbitrary sizes and may not be optimized by Next.js image pipeline. SVGs will be passed through without optimization (which is fine), but the layout must handle variable aspect ratios. The current `ProviderCard` and `ComparisonTable` both use fixed `width`/`height` props on `Image`, which will distort logos with non-square aspect ratios.

**Why it happens:**
The logo acquisition process grabbed the best available brand image from each provider's website. Some sites only expose favicons (.ico) or SVG logos. The manifest was validated for file existence and integrity, not visual quality or format compatibility.

**How to avoid:**
1. Convert all `.ico` files to `.png` during the seed/import phase. Use a one-time script to convert them (5 files is trivial).
2. Use `object-contain` on all logo images (the current code does this -- preserve it). Never use `object-cover` for logos since it crops non-square images.
3. Add a `LogoImage` component that handles SVG vs raster differently: render SVGs inline or via `<img>` (not `next/image`), and render rasters via `next/image`.
4. Serve logos from `public/assets/providers/` (local filesystem) rather than remote URLs. This avoids needing `remotePatterns` configuration for each CDN -- the current manifest already has local paths.
5. Set consistent logo container dimensions (e.g., 160x80 for cards, 64x64 for comparison) with logos centered within, rather than stretching to fill.

**Warning signs:**
- Broken image icons in the UI (especially on `.ico` files)
- Logos looking blurry or distorted
- Next.js build warnings about unoptimized images
- `remotePatterns` errors when deploying to Vercel

**Phase to address:**
Schema extension / seed phase. Convert .ico files before seeding. Build the `LogoImage` component when building the first card component.

---

### Pitfall 5: Denormalized Price Fields Become Permanently Wrong After Schema Extension

**What goes wrong:**
The Provider model already has `minPricePerServingCents`, `maxPricePerServingCents`, and `freeShipping` as denormalized fields computed from Plans. But the dataset being imported has no Plan data -- the 95 providers in `food-box-companies.json` have a `pricing_signal` field (populated for only 17% of providers) that is a text description, not structured pricing. After seeding, all 95 providers will have `null` for price fields. The existing admin `savePlan`/`deletePlan` actions compute denormalization from Plan records, but since no Plans exist initially, the denormalized fields stay null. The category listing filter for price (`minPrice`/`maxPrice` URL params) becomes useless -- filtering by price returns zero results because there is no price data.

**Why it happens:**
The CONCERNS.md already flags that "denormalized price fields can become stale," but the deeper problem is that they start null and have no way to be populated without Plan records. The pricing_signal field ("$8-12/serving range") is a human-readable hint, not a machine-parseable value. Converting it to structured Plan data is a manual editorial task for all 95 providers.

**How to avoid:**
1. During seed, parse `pricing_signal` into a rough `priceEstimateCents` field on Provider (not the denormalized fields). Display this as "estimated price" with a disclaimer.
2. Add a `pricingDataComplete` boolean on Provider. Filter UI should show a "Price data available" indicator and warn when sorting by price that "some providers have no pricing data."
3. Disable price sort/filter for categories where fewer than 50% of providers have pricing data. Show the filter as disabled with a tooltip explaining why.
4. Prioritize adding Plan records for the top 20 providers via admin UI before enabling price filtering publicly.
5. Never let price sort put providers with null prices at the top or bottom of results -- null-priced providers should sort to a separate "pricing unavailable" section.

**Warning signs:**
- Price filter returns zero results across all categories
- Sorting by price shows all providers as "N/A" or clustered incorrectly
- Users report that price comparisons don't work

**Phase to address:**
Seed phase (for initial data handling) and filtering phase (for null-aware sorting). Admin phase should include a "data completeness" dashboard showing which providers need enrichment.

---

### Pitfall 6: SEO Duplicate Content From Filter Permutations and Comparison Pairs

**What goes wrong:**
With 5 categories, 9 filter dimensions, and 95 providers, the site can generate thousands of distinct URLs: every filter combination produces a unique URL, and every provider pair produces a comparison page (`/compare/hellofresh-vs-blue-apron` and `/compare/blue-apron-vs-hellofresh` are the same content). Google crawls all of these, wasting crawl budget, potentially triggering thin content penalties, and diluting page authority across near-duplicate pages.

**Why it happens:**
URL-driven filter state is great for shareability but terrible for SEO unless actively managed. The existing comparison page does not canonicalize A-vs-B to a single ordering. The category pages have no `noindex` directive for filtered variants. The sitemap generation fetches all slugs and includes them, but does not limit comparison URLs to a curated set.

**How to avoid:**
1. **Comparison pages**: Always sort slugs alphabetically in the URL. `parseVersusSlug` should normalize ordering (redirect `hellofresh-vs-blue-apron` to `blue-apron-vs-hellofresh` or vice versa, consistently). Only generate `generateStaticParams` for popular/curated pairs, not all N*(N-1)/2 combinations.
2. **Filtered category pages**: Add `<meta name="robots" content="noindex,follow">` to any page with search params. Only base category URLs should be indexable.
3. **Sitemap**: Exclude comparison pages entirely or include only a curated top-10 list. Never auto-generate sitemap entries for all possible comparison pairs.
4. **Canonical URLs**: Every filtered page should have `<link rel="canonical" href="/meal-kits">` pointing to the unfiltered base. The comparison page should self-canonicalize to the alphabetically-ordered version.
5. **robots.txt**: Disallow crawling of URLs with excessive query params: `Disallow: /*?*diet=` etc.

**Warning signs:**
- Google Search Console shows thousands of "Crawled - currently not indexed" URLs
- Index coverage report shows "Duplicate, submitted URL not selected as canonical"
- Organic traffic concentrated on homepage with no long-tail category traffic
- Sitemap has more than 500 URLs for a 95-provider site

**Phase to address:**
SEO must be addressed in every phase. Comparison page canonical ordering should be built from the start. Category page noindex for filter variants should be added when filters are built. Sitemap curation at the end.

---

### Pitfall 7: Comparison Tray State in sessionStorage is Lost on Navigation

**What goes wrong:**
The `CompareProvider` component uses `sessionStorage` to persist comparison selections. `sessionStorage` is tab-scoped and lost when the user opens a provider detail page in a new tab, navigates via browser back/forward, or uses an external link to return. In a multi-step workflow (browse -> select providers to compare -> navigate to comparison page), the state can silently disappear. The user selects 3 providers, navigates away, comes back, and the tray is empty.

**Why it happens:**
`sessionStorage` was chosen because `localStorage` persists too aggressively (stale selections from weeks ago). But `sessionStorage` has a key limitation: it is NOT shared across tabs. A user who opens a provider page in a new tab to check details before deciding to compare will not see their comparison selections in the new tab.

**How to avoid:**
1. Keep `sessionStorage` as the primary store but also encode selections in the URL when navigating to the comparison page. The comparison page already uses URL slugs (`/compare/a-vs-b`), so the URL is the canonical state for the comparison itself.
2. Add a visual confirmation when items are added to the tray ("Added! 2 of 4 selected") so users know the action worked.
3. Consider `localStorage` with a TTL (auto-clear selections older than 2 hours) as an alternative -- this survives new tabs while avoiding indefinite persistence.
4. Show the comparison tray on all listing and detail pages so the user can always see what they have selected without navigating.

**Warning signs:**
- User complaints about "lost" comparison selections
- Low conversion rate from "Add to Compare" button clicks to actual comparison page views
- Comparison page 404s or empty states after users selected providers from different tabs

**Phase to address:**
Comparison phase. The `CompareProvider` component already exists; this is about hardening it during the comparison feature build.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing new schema fields as nullable strings instead of enums | Avoids schema migration complexity, accepts sparse data | Every query and filter must handle nulls, display logic branches everywhere, no type safety on values | MVP only -- migrate to enums after data enrichment brings population above 70% |
| Single `queries.ts` file for all queries | Simple import, no module boundaries | Already at 336 lines (over 300-line threshold), hard to navigate, merge conflicts likely when multiple features touch it | Never acceptable past 300 lines -- split before adding new query functions |
| Admin pages bypassing the query layer | Faster iteration, admin-specific queries are simple | Duplicate query logic, schema changes break in two places, no React.cache() | MVP only -- consolidate before adding admin features for new schema fields |
| Hardcoded production URL in JSON-LD | Works in production, no env var management | Incorrect JSON-LD in development/staging, inconsistent with sitemap, two different env var names already exist | Never acceptable -- create `src/lib/config.ts` with `BASE_URL` before adding more pages |
| Using `contains` with `mode: insensitive` for search | No infrastructure setup, built-in Prisma API | Sequential scan on every search, degrading performance as data grows | Acceptable at 95 providers; must address before reaching 500+ or when search becomes a primary feature |
| One-time seed script with no idempotency | Simple implementation, runs once | Re-running seed duplicates data, no way to update existing providers from dataset changes, no rollback | Acceptable for initial import only -- must add upsert logic if dataset is ever re-imported |

## Integration Gotchas

Common mistakes when connecting to external services and APIs.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Next.js Image + local provider logos | Passing absolute filesystem paths from manifest.json as `src` to `<Image>` | Use web-relative paths (`/assets/providers/logo.png`) not filesystem paths. The manifest stores absolute paths -- transform during seed. |
| Neon PostgreSQL connection pooling | Opening a new connection per query in serverless functions, exhausting the pool | The existing `src/lib/db.ts` singleton handles this correctly. Do NOT change it. Ensure no admin page creates its own PrismaClient. |
| Vercel ISR with on-demand revalidation | Assuming `revalidatePath` invalidates nested routes | `revalidatePath("/meal-kits")` does NOT invalidate `/meal-kits?diet=VEGAN`. Use `revalidatePath("/meal-kits", "page")` for the page itself. For filtered variants, they re-render on request since they are dynamic. |
| Prisma enum extensions | Adding new enum values and running `db push` while connected sessions cache the old enum | Run `prisma generate` AFTER `db push` to regenerate the client. Restart the dev server to pick up new enum values. |
| sessionStorage in SSR context | Reading `sessionStorage` during server rendering crashes Node.js | The existing `CompareProvider` handles this with `getServerSnapshot`. Preserve this pattern for any new client-side storage. |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Filtering with multiple `where` clauses on non-indexed fields | Category pages load slowly, database CPU spikes | Add composite indexes for the most common filter combinations: `[category, active, modelType]`, `[category, active, valueTier]` | 500+ providers or concurrent users >50 |
| Loading all provider dietary tags via `include: { dietaryTags: true }` on every listing query | N+1 is avoided (Prisma joins), but data transferred grows linearly with tag count per provider | Acceptable at current scale. At 500+ providers, consider denormalizing tags as a JSON array on Provider | 500+ providers |
| Client-side filter state triggers full page re-render via `router.push` | Every filter toggle causes a full server component re-render with database query | Use `useOptimistic` or client-side filtering for instant UI updates, then sync with server in background. At 95 providers, consider fetching all providers once and filtering client-side. | Noticeable at 200ms+ response times, which depends on database latency |
| `React.cache()` deduplication only works within a single request | Calling the same query from `generateMetadata` and page component is deduplicated. But ISR rebuilds and on-demand revalidation each run fresh queries. | Acceptable -- `React.cache()` prevents duplicate queries within a render pass. For cross-request caching, rely on ISR/static generation. | Not a scale problem -- architectural understanding issue |
| Comparison page fetching full provider data including all plans for 2-4 providers | Each plan includes many fields; with 5+ plans per provider, data payload grows | Acceptable at current plan count. If providers have 20+ plans, add pagination or "featured plan only" mode | 20+ plans per provider |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Affiliate click tracking without rate limiting | Bot traffic inflates click metrics, making affiliate revenue data unreliable and potentially violating affiliate program terms | Add IP-based rate limiting (already flagged in CONCERNS.md). Hash IP, limit to 1 click per provider per IP per hour. |
| Rendering pricing data from `pricing_signal` (free text) without sanitization | If pricing_signal contains HTML or script tags (unlikely from current dataset but possible from future admin edits), XSS via server rendering | Always escape free-text fields. Use `textContent` rather than `innerHTML`. The existing `dangerouslySetInnerHTML` pattern in blog posts should not spread to provider data. |
| Comparison URLs allow arbitrary slug injection | `/compare/../../../../etc/passwd-vs-test` could cause unexpected file path behavior if slugs are ever used in filesystem operations | Validate slugs against `[a-z0-9-]+` pattern before querying. The current `parseVersusSlug` splits on `-vs-` but does not validate slug characters. |
| JSON-LD XSS via provider name injection | Admin-entered provider names appear in JSON-LD `<script>` tags without escaping `<` characters | Create `safeJsonLd()` helper as recommended in CONCERNS.md. Apply it to ALL pages before launch. |

## UX Pitfalls

Common user experience mistakes in food subscription comparison domains.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing "0 reviews" and empty star ratings for all 95 providers at launch | Site looks fake, untrustworthy, and abandoned. No social proof. | Hide review ratings entirely until at least 3 reviews exist per provider. Show "Be the first to review" CTA instead of empty stars. Or defer review UI to post-launch as planned. |
| Displaying stale pricing data without "last verified" date | Users visit provider sites and find different prices, losing trust in the comparison | Show "Prices last verified: [date]" on every price display. Use `lastVerifiedAt` field. If older than 90 days, show a "prices may have changed" disclaimer. |
| Filter sidebar taking equal visual weight to results | On mobile, 16 dietary checkboxes + price range + sort + rating take 3+ scroll screens, burying actual results | Current drawer implementation handles this well. Ensure the filter drawer has a sticky "Show X Results" footer (already present). Limit initially visible filters to the 5 most-used; show others under "More Filters." |
| Comparison page showing the same information as detail pages | Users click "Compare" expecting unique insight but see the same data side-by-side | Add a "Winner per criterion" indicator (highlight the better value in green). Add a "Best for..." summary that says "Choose A for budget, B for dietary variety." Make comparison pages add value beyond concatenation. |
| "Add to Compare" button with no visual feedback | Users click the button, nothing visible happens, they click again, still nothing | Show a toast notification, animate the comparison tray, or flash the compare button to confirm the action. The tray should slide up or badge should update immediately. |
| Cross-category browse experience dead-ends | User views "Meal Kits" category, interested in prepared meals too, but no cross-navigation | Add "Related categories" links on category pages. Show providers with `secondaryCategory` in relevant secondary category listings. |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Filtering**: Filters look functional but return empty results for sparse fields -- verify filter result counts show non-zero before deploying
- [ ] **Comparison Table**: Table renders but shows "N/A" for 50%+ of rows when comparing cross-category providers -- verify with real cross-category pairs
- [ ] **Provider Cards**: Cards display but show "No reviews" and no price for every provider at launch -- verify cards are useful without review and price data
- [ ] **SEO Metadata**: Pages have `<title>` and `<meta description>` but JSON-LD has no XSS protection and uses hardcoded URLs -- verify JSON-LD with Google Rich Results Test
- [ ] **Mobile Filters**: Drawer opens/closes but filter changes trigger full page navigation with no loading state -- verify filter UX on slow 3G network
- [ ] **Search**: Search bar exists but uses ILIKE full-text scan -- verify search responds in under 500ms with 95 providers
- [ ] **Admin CRUD**: Admin can create/update providers but `revalidatePath` misses category pages -- verify that editing a provider updates the relevant category page within 5 seconds
- [ ] **Logo Rendering**: Logos display but .ico files render poorly at non-native sizes -- verify all 95 provider logos render cleanly at card size and comparison size
- [ ] **Affiliate Tracking**: Clicks are recorded but not rate-limited -- verify a single IP cannot inflate click counts by spamming the endpoint
- [ ] **Sitemap**: Sitemap generates but has no ISR caching and includes no comparison page curation -- verify sitemap is under 500 URLs and loads in under 2 seconds

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Sparse data causing empty filter results | LOW | Add filter option counts showing "0 results" before user clicks. Disable zero-result options. Prioritize data enrichment for top providers. |
| URL param state explosion / SEO duplicate content | MEDIUM | Add noindex meta tags to all filtered pages retroactively. Submit URL removal requests in Google Search Console. Add canonical tags. Fix in a single PR touching all page files. |
| Comparison table showing all N/A | LOW | Add dynamic row visibility (hide rows where all providers are N/A). This is a single component change to `ComparisonTable`. |
| .ico logo files rendering poorly | LOW | Run a one-time conversion script (5 files). Replace files in `public/assets/providers/`. Update manifest. |
| Price denormalization permanently null | MEDIUM | Write a data migration script that parses `pricing_signal` into estimated price fields. Run as a one-time admin task. |
| Comparison tray state lost cross-tab | LOW | Switch from `sessionStorage` to `localStorage` with TTL. Single component change. |
| JSON-LD XSS vulnerability | LOW | Create `safeJsonLd()` utility and search-replace all `JSON.stringify(jsonLd)` calls. Mechanical change across ~8 files. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Sparse data / empty filters | Schema extension + Seed | Run filter combinations against seeded data; verify >0 results for each single-filter option |
| URL param state explosion | Filtering (build `src/lib/filters.ts` first) | Inspect generated URLs for readability; verify canonical tags on filtered pages |
| Comparison table N/A overload | Comparison feature | Compare 5 real provider pairs across categories; verify <30% N/A cells per comparison |
| .ico logo rendering | Seed / Asset prep | Visual audit all 95 logos at card size; flag any blurry or broken images |
| Price denormalization null at launch | Seed + Admin CRUD | Query `Provider` table after seed; verify `minPricePerServingCents` populated for top 20 providers |
| SEO duplicate content | Every phase (ongoing) | Check Google Search Console after first week; verify <200 total indexed URLs |
| Comparison tray state loss | Comparison feature | Test: add providers, open new tab, verify tray state; test: navigate away and back |
| JSON-LD XSS | First page build | Run all JSON-LD through Google Rich Results Test; search for `dangerouslySetInnerHTML` without `safeJsonLd` |
| Stale revalidation paths | Admin CRUD | After updating a provider, immediately visit the category page and verify updated data appears |
| No loading feedback on filter changes | Filtering | Apply filters on slow 3G throttle; verify loading indicator appears within 100ms |

## Sources

- Detailed codebase analysis of existing FoodBoxFinder implementation (all source files read directly)
- `temp/plandocs/food-box-companies.json` dataset sparsity analysis (quantitative)
- `public/assets/providers/manifest.json` image format analysis
- `.planning/codebase/CONCERNS.md` existing tech debt and bug documentation
- `.planning/PROJECT.md` project requirements and constraints
- Training data knowledge of comparison site UX patterns, SEO best practices for faceted navigation, and Next.js App Router caching behavior (MEDIUM confidence, no web search verification available)

---
*Pitfalls research for: Food subscription discovery/comparison platform*
*Researched: 2026-03-21*
