import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategoryBySlug, CATEGORY_MAP } from "@/lib/categories";
import { getProvidersByCategory } from "@/lib/queries";
import ProviderCard from "@/components/ProviderCard";
import Pagination from "@/components/Pagination";
import CategoryFilters from "@/components/CategoryFilters";
import type { DietaryTag } from "@/generated/prisma/client";

// --- Types ---

type SortOption = "rating" | "price-asc" | "price-desc" | "reviews" | "newest";

const VALID_SORT_VALUES = new Set<string>([
  "rating",
  "price-asc",
  "price-desc",
  "reviews",
  "newest",
]);

const VALID_DIETARY_TAGS = new Set<string>([
  "VEGAN",
  "VEGETARIAN",
  "PESCATARIAN",
  "KETO",
  "PALEO",
  "GLUTEN_FREE",
  "DAIRY_FREE",
  "NUT_FREE",
  "LOW_CARB",
  "LOW_SODIUM",
  "ORGANIC",
  "HALAL",
  "KOSHER",
  "DIABETIC_FRIENDLY",
  "WHOLE30",
  "MEDITERRANEAN",
]);

// --- Helpers ---

function parseSearchParams(raw: Record<string, string | string[] | undefined>) {
  // Diet
  const dietRaw = typeof raw.diet === "string" ? raw.diet : undefined;
  const dietaryTags: DietaryTag[] = dietRaw
    ? dietRaw
        .split(",")
        .filter((t) => VALID_DIETARY_TAGS.has(t))
        .map((t) => t as DietaryTag)
    : [];

  // Price
  const minPriceRaw = typeof raw.minPrice === "string" ? raw.minPrice : undefined;
  const maxPriceRaw = typeof raw.maxPrice === "string" ? raw.maxPrice : undefined;
  const minPrice =
    minPriceRaw && !isNaN(Number(minPriceRaw)) ? Number(minPriceRaw) : undefined;
  const maxPrice =
    maxPriceRaw && !isNaN(Number(maxPriceRaw)) ? Number(maxPriceRaw) : undefined;

  // Rating
  const ratingRaw = typeof raw.rating === "string" ? raw.rating : undefined;
  const minRating =
    ratingRaw && !isNaN(Number(ratingRaw))
      ? Math.max(1, Math.min(5, Number(ratingRaw)))
      : undefined;

  // Sort
  const sortRaw = typeof raw.sort === "string" ? raw.sort : undefined;
  const sortBy: SortOption =
    sortRaw && VALID_SORT_VALUES.has(sortRaw)
      ? (sortRaw as SortOption)
      : "rating";

  // Page
  const pageRaw = typeof raw.page === "string" ? raw.page : undefined;
  const page =
    pageRaw && !isNaN(Number(pageRaw)) ? Math.max(1, Math.floor(Number(pageRaw))) : 1;

  return { dietaryTags, minPrice, maxPrice, minRating, sortBy, page };
}

function countActiveFilters(raw: Record<string, string | string[] | undefined>): number {
  let count = 0;
  if (typeof raw.diet === "string" && raw.diet.length > 0) {
    count += raw.diet.split(",").filter((t) => VALID_DIETARY_TAGS.has(t)).length;
  }
  if (typeof raw.minPrice === "string" && raw.minPrice.length > 0) count++;
  if (typeof raw.maxPrice === "string" && raw.maxPrice.length > 0) count++;
  if (typeof raw.rating === "string" && raw.rating.length > 0) count++;
  if (typeof raw.sort === "string" && raw.sort !== "rating" && raw.sort.length > 0) count++;
  return count;
}

function buildSearchParamsRecord(
  raw: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && value.length > 0) {
      result[key] = value;
    }
  }
  // Remove page -- Pagination handles it
  delete result.page;
  return result;
}

// --- Static Generation ---

export function generateStaticParams() {
  return Object.values(CATEGORY_MAP).map(({ slug }) => ({
    category: slug,
  }));
}

// --- Metadata ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const categoryInfo = getCategoryBySlug(slug);

  if (!categoryInfo) {
    return { title: "Category Not Found" };
  }

  const title = `Best ${categoryInfo.label} Subscriptions (2026)`;
  const description = `Compare the best ${categoryInfo.label.toLowerCase()} subscription services. ${categoryInfo.description}. Read reviews, compare prices, and find the perfect fit.`;

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

  // Parse filter/sort/page from URL
  const { dietaryTags, minPrice, maxPrice, minRating, sortBy, page } =
    parseSearchParams(rawSearchParams);

  // Fetch data
  const { providers, total, pageSize } = await getProvidersByCategory({
    category: categoryInfo.key,
    dietaryTags: dietaryTags.length > 0 ? dietaryTags : undefined,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    page,
  });

  const totalPages = Math.ceil(total / pageSize);
  const activeFilterCount = countActiveFilters(rawSearchParams);
  const paginationSearchParams = buildSearchParamsRecord(rawSearchParams);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${categoryInfo.label} Subscriptions`,
    description: categoryInfo.description,
    numberOfItems: total,
    itemListElement: providers.map((provider, index) => ({
      "@type": "ListItem",
      position: (page - 1) * pageSize + index + 1,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {categoryInfo.label}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {categoryInfo.description}
          </p>
        </header>

        {/* Main content area: sidebar + results */}
        <div className="lg:flex lg:gap-8">
          {/* Desktop sidebar filters (hidden on mobile) */}
          <Suspense fallback={null}>
            <CategoryFilters activeFilterCount={activeFilterCount} />
          </Suspense>

          {/* Results column */}
          <div className="flex-1 min-w-0">
            {/* Results header with mobile filter trigger */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-sm text-gray-600">
                {total === 0 ? (
                  "No providers found"
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                      {(page - 1) * pageSize + 1}
                    </span>
                    {" - "}
                    <span className="font-medium text-gray-900">
                      {Math.min(page * pageSize, total)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900">{total}</span>{" "}
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
              <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
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
                  className="mx-auto text-gray-300"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <h3 className="mt-4 text-base font-medium text-gray-900">
                  No providers match your filters
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or clearing them to see all{" "}
                  {categoryInfo.label.toLowerCase()} options.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={page}
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
