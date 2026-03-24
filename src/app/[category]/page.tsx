import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategoryBySlug, CATEGORY_MAP } from "@/lib/categories";
import { getFilteredProviders } from "@/lib/queries";
import { parseProviderFilters } from "@/lib/filters";
import ProviderCard from "@/components/ProviderCard";
import Pagination from "@/components/Pagination";
import CategoryFilters, { ActiveFilterChips } from "@/components/CategoryFilters";
import Breadcrumbs from "@/components/Breadcrumbs";

// --- Editorial Intro Content ---

const CATEGORY_INTROS: Record<string, string> = {
  "meal-kits": "Meal kit subscriptions deliver pre-portioned ingredients and step-by-step recipes to your door, making home cooking accessible and exciting. Compare top meal kit services to find the perfect fit for your cooking style, dietary needs, and budget.",
  "prepared-meals": "Skip the cooking entirely with prepared meal delivery services that bring chef-crafted, ready-to-eat meals straight to your table. Whether you need quick weeknight dinners or specialized nutrition plans, find the service that matches your lifestyle.",
  "protein-boxes": "From grass-fed beef to wild-caught seafood, protein box subscriptions deliver premium meats and protein sources direct from farms and fisheries. Compare quality, sourcing, and value across the top protein delivery services.",
  "produce-boxes": "Farm-fresh fruits and vegetables delivered to your doorstep -- produce box subscriptions connect you directly with local and organic farms. Discover seasonal variety, CSA-style boxes, and curated produce selections.",
  "specialty": "Explore unique food subscription experiences from artisanal snack boxes to international cuisine kits. Specialty food boxes make perfect gifts and offer a curated journey through flavors you won't find at your local grocery store.",
};

// --- Static Generation ---

export function generateStaticParams() {
  return Object.values(CATEGORY_MAP).map(({ slug }) => ({
    category: slug,
  }));
}

// --- Metadata ---

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const rawSearchParams = await searchParams;
  const categoryInfo = getCategoryBySlug(slug);

  if (!categoryInfo) {
    return { title: "Category Not Found" };
  }

  const title = `Best ${categoryInfo.label} Subscriptions (2026)`;
  const description = `Compare the best ${categoryInfo.label.toLowerCase()} subscription services. ${categoryInfo.description}. Read reviews, compare prices, and find the perfect fit.`;

  // Detect active filters beyond just "page"
  const hasFilters = Object.keys(rawSearchParams).some(
    (key) => key !== "page" && rawSearchParams[key] !== undefined && rawSearchParams[key] !== ""
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `/${slug}`,
    },
    ...(hasFilters && { robots: { index: false, follow: true } }),
  };
}

// --- Page Component ---

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category: slug } = await params;
  const rawSearchParams = await searchParams;

  // Resolve category
  const categoryInfo = getCategoryBySlug(slug);
  if (!categoryInfo) {
    notFound();
  }

  // Parse filters using Phase 2 infrastructure (pass category slug as search param)
  const filters = parseProviderFilters({ ...rawSearchParams, category: slug });

  // Fetch data using multi-dimension filtered query
  const { providers, total, pageSize } = await getFilteredProviders(filters);

  const totalPages = Math.ceil(total / pageSize);

  // Build pagination search params (remove page, keep all other string params)
  const paginationSearchParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (typeof value === "string" && value.length > 0 && key !== "page") {
      paginationSearchParams[key] = value;
    }
  }

  // Editorial intro for this category
  const editorialIntro = CATEGORY_INTROS[slug] ?? "";

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${categoryInfo.label} Subscriptions`,
    description: categoryInfo.description,
    numberOfItems: total,
    itemListElement: providers.map((provider, index) => ({
      "@type": "ListItem",
      position: (filters.page - 1) * pageSize + index + 1,
      item: {
        "@type": "Product",
        name: provider.name,
        description: provider.shortDescription ?? undefined,
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/providers/${provider.slug}`,
        ...(provider.averageRating > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: provider.averageRating,
            reviewCount: provider.reviewCount,
          },
        }),
        ...(provider.minPricePerServingCents != null && {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: (provider.minPricePerServingCents / 100).toFixed(2),
            ...(provider.maxPricePerServingCents != null && {
              highPrice: (provider.maxPricePerServingCents / 100).toFixed(2),
            }),
          },
        }),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: categoryInfo.label, href: `/${slug}` },
        ]} />

        {/* Page header */}
        <header className="mb-8 mt-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            {categoryInfo.label}
          </h1>
          <p className="mt-2 text-lg text-neutral-600">
            {categoryInfo.description}
          </p>
          {editorialIntro && (
            <p className="mt-3 text-base text-neutral-500 max-w-3xl">
              {editorialIntro}
            </p>
          )}
        </header>

        {/* Main content area: sidebar + results */}
        <div className="lg:flex lg:gap-8">
          {/* Desktop sidebar filters (hidden on mobile) */}
          <Suspense fallback={null}>
            <CategoryFilters />
          </Suspense>

          {/* Results column */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            <Suspense fallback={null}>
              <ActiveFilterChips />
            </Suspense>

            {/* Results header with mobile filter trigger */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-sm text-neutral-600">
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

            {/* Provider grid */}
            {providers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <ProviderCard key={provider.slug} provider={provider} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-neutral-200 py-16 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-neutral-300"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <h3 className="mt-4 text-base font-bold text-neutral-900">
                  No providers match your filters
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Try adjusting your filters or clearing them to see all{" "}
                  {categoryInfo.label.toLowerCase()} options.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  basePath={`/${slug}`}
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
