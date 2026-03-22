import type { Metadata } from "next";
import { Suspense } from "react";
import { getFilteredProviders, getCategoryCounts } from "@/lib/queries";
import { parseProviderFilters } from "@/lib/filters";
import SearchHero from "@/components/SearchHero";
import UnifiedFilters, { UnifiedActiveFilterChips } from "@/components/UnifiedFilters";
import ProviderCard from "@/components/ProviderCard";
import Pagination from "@/components/Pagination";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q : "";
  const hasFilters = Object.keys(sp).some(
    (key) => key !== "page" && sp[key] !== undefined && sp[key] !== "",
  );

  return {
    title: query
      ? `"${query}" - Food Box Search`
      : "Discover Food Box Subscriptions",
    description: query
      ? `Find food box subscriptions matching "${query}" on FoodBoxFinder.`
      : "Browse and compare 95+ food box subscription services. Filter by category, diet, prep style, price, and more.",
    ...(hasFilters && { robots: { index: false, follow: true } }),
    alternates: { canonical: "/search" },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;
  const filters = parseProviderFilters(rawSearchParams);

  // Fetch data in parallel
  const [{ providers, total, pageSize }, categoryCounts] = await Promise.all([
    getFilteredProviders(filters),
    getCategoryCounts(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Build pagination search params (keep all string params except "page")
  const paginationSearchParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (typeof value === "string" && value.length > 0 && key !== "page") {
      paginationSearchParams[key] = value;
    }
  }

  // JSON-LD structured data
  const query = typeof rawSearchParams.q === "string" ? rawSearchParams.q : "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: query ? `Search results for "${query}"` : "Discover Food Box Subscriptions",
    description: "Browse and compare food box subscription services on FoodBoxFinder.",
    url: "https://foodboxfinder.com/search",
    numberOfItems: total,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Search hero with search bar + category tabs */}
      <Suspense fallback={null}>
        <SearchHero categoryCounts={categoryCounts} totalCount={total} />
      </Suspense>

      {/* Main content: sidebar + results */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="lg:flex lg:gap-8">
          {/* Filter sidebar (desktop) + mobile trigger */}
          <Suspense fallback={null}>
            <UnifiedFilters totalCount={total} />
          </Suspense>

          {/* Results column */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            <Suspense fallback={null}>
              <UnifiedActiveFilterChips />
            </Suspense>

            {/* Results header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-base text-neutral-600" aria-live="polite">
                {total === 0 ? (
                  "No providers found"
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-medium text-neutral-900">
                      {(filters.page - 1) * pageSize + 1}
                    </span>
                    {" - "}
                    <span className="font-medium text-neutral-900">
                      {Math.min(filters.page * pageSize, total)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-neutral-900">{total}</span>{" "}
                    providers
                  </>
                )}
              </p>
            </div>

            {/* Provider grid or zero results */}
            {providers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {providers.map((provider) => (
                  <ProviderCard key={provider.slug} provider={provider} />
                ))}
              </div>
            ) : (
              <ZeroResultsState />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  basePath="/search"
                  searchParams={paginationSearchParams}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ZeroResultsState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-16 px-8 text-center">
      {/* Search icon illustration */}
      <div className="mx-auto w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <h3 className="text-xl font-extrabold text-neutral-900">
        No providers match your filters
      </h3>
      <p className="mt-2 text-base text-neutral-600 max-w-md mx-auto">
        Try adjusting your filters or clearing them to see all available food box subscriptions.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {/* These are plain links -- the actual clearing is done by navigating to /search */}
        <a
          href="/search"
          className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-base font-bold text-white hover:bg-primary-700 transition-colors"
        >
          Clear All Filters
        </a>
        <a
          href="/search"
          className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-base font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Browse All
        </a>
      </div>
    </div>
  );
}
