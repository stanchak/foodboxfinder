import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCollectionBySlug, getAllCollectionSlugs } from "@/lib/queries";
import { formatPriceLabel } from "@/lib/format";
import { CATEGORY_MAP } from "@/lib/categories";
import type { DietaryTag } from "@/generated/prisma/client";
import Breadcrumbs from "@/components/Breadcrumbs";
import Badge from "@/components/Badge";
import RatingStars from "@/components/RatingStars";

// -- Helpers --

function formatDietaryTagLabel(tag: DietaryTag): string {
  return tag
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

// -- Static Generation --

export async function generateStaticParams() {
  const slugs = await getAllCollectionSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

// -- Metadata --

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  const title = collection.metaTitle ?? collection.title;
  const description =
    collection.metaDescription ??
    collection.description ??
    `Browse our curated list: ${collection.title}. Compare the best food box subscriptions handpicked by our experts.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://foodboxfinder.com/best/${collection.slug}`,
      ...(collection.coverImageUrl && {
        images: [{ url: collection.coverImageUrl }],
      }),
    },
  };
}

// -- JSON-LD --

function ItemListJsonLd({
  collection,
}: Readonly<{
  collection: {
    title: string;
    slug: string;
    description: string | null;
    items: Array<{
      sortOrder: number;
      provider: { name: string; slug: string; averageRating: number; reviewCount: number };
    }>;
  };
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collection.title,
    ...(collection.description && { description: collection.description }),
    url: `https://foodboxfinder.com/best/${collection.slug}`,
    numberOfItems: collection.items.length,
    itemListElement: collection.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://foodboxfinder.com/providers/${item.provider.slug}`,
      name: item.provider.name,
      item: {
        "@type": "Product",
        name: item.provider.name,
        url: `https://foodboxfinder.com/providers/${item.provider.slug}`,
        ...(item.provider.reviewCount > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: item.provider.averageRating,
            reviewCount: item.provider.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// -- Page --

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/best" },
    { label: collection.title, href: `/best/${collection.slug}` },
  ];

  return (
    <>
      <ItemListJsonLd collection={collection} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="mt-6">
          {collection.coverImageUrl && (
            <div className="relative h-48 sm:h-64 lg:h-80 rounded-xl overflow-hidden mb-8">
              <Image
                src={collection.coverImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                  {collection.title}
                </h1>
                {collection.description && (
                  <p className="mt-2 text-sm text-white/90 sm:text-base max-w-2xl">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {!collection.coverImageUrl && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {collection.title}
              </h1>
              {collection.description && (
                <p className="mt-3 text-lg text-gray-600 max-w-3xl">
                  {collection.description}
                </p>
              )}
            </div>
          )}

          {/* Editorial body above list */}
          {collection.body && (
            <div className="mb-10 max-w-3xl">
              {collection.body.split("\n\n").map((paragraph, index) => (
                <p
                  key={index}
                  className="text-gray-700 leading-relaxed [&:not(:first-child)]:mt-4"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Provider count */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium text-gray-500">
            {collection.items.length}{" "}
            {collection.items.length === 1 ? "provider" : "providers"} in this
            collection
          </span>
        </div>

        {/* Ranked Provider List */}
        {collection.items.length > 0 ? (
          <ol className="space-y-6" aria-label="Ranked providers">
            {collection.items.map((item, index) => {
              const provider = item.provider;
              const categoryInfo = CATEGORY_MAP[provider.category];
              const visibleTags = provider.dietaryTags.slice(0, 4);
              const remainingTagCount =
                provider.dietaryTags.length - visibleTags.length;

              return (
                <li key={item.id}>
                  <article className="relative bg-white rounded-xl shadow-card ring-1 ring-gray-100 overflow-hidden transition-shadow hover:shadow-card-hover">
                    <div className="flex flex-col sm:flex-row">
                      {/* Rank badge */}
                      <div className="absolute top-4 left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white shadow-sm sm:relative sm:top-auto sm:left-auto sm:h-auto sm:w-16 sm:shrink-0 sm:rounded-none sm:rounded-l-xl sm:bg-primary-50 sm:text-primary-700 sm:shadow-none sm:flex sm:items-center sm:justify-center">
                        <span className="sm:text-2xl sm:font-bold">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Logo */}
                      <div className="flex items-center justify-center w-full sm:w-32 h-36 sm:h-auto bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-100 overflow-hidden shrink-0">
                        {provider.logoUrl ? (
                          <Image
                            src={provider.logoUrl}
                            alt={`${provider.name} logo`}
                            width={120}
                            height={60}
                            className="object-contain p-3"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-gray-300">
                            {provider.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge color="category">
                                {categoryInfo.label}
                              </Badge>
                              {provider.freeShipping && (
                                <Badge color="dietary">Free Shipping</Badge>
                              )}
                            </div>

                            <h3 className="mt-2 text-xl font-semibold text-gray-900">
                              <Link
                                href={`/providers/${provider.slug}`}
                                className="hover:text-primary-700 transition-colors"
                              >
                                {provider.name}
                              </Link>
                            </h3>

                            {provider.shortDescription && (
                              <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">
                                {provider.shortDescription}
                              </p>
                            )}

                            {/* Rating and price */}
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                              {provider.reviewCount > 0 ? (
                                <div className="flex items-center gap-1.5">
                                  <RatingStars
                                    rating={provider.averageRating}
                                    size="sm"
                                  />
                                  <span className="text-xs text-gray-500">
                                    ({provider.reviewCount})
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  No reviews yet
                                </span>
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {formatPriceLabel(
                                  provider.minPricePerServingCents,
                                )}
                              </span>
                            </div>

                            {/* Dietary tags */}
                            {provider.dietaryTags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {visibleTags.map(({ tag }) => (
                                  <Badge key={tag} color="dietary">
                                    {formatDietaryTagLabel(tag)}
                                  </Badge>
                                ))}
                                {remainingTagCount > 0 && (
                                  <Badge color="default">
                                    +{remainingTagCount}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* CTA */}
                          <div className="shrink-0">
                            <Link
                              href={`/providers/${provider.slug}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
                            >
                              View details
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>

                        {/* Editorial note */}
                        {item.note && (
                          <div className="mt-4 rounded-lg border border-primary-200 bg-primary-50/50 p-4">
                            <p className="text-xs font-semibold text-primary-800 uppercase tracking-wide">
                              Why we picked it
                            </p>
                            <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                              {item.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              This collection does not have any providers yet.
            </p>
          </div>
        )}

        {/* Back to collections */}
        <div className="mt-10 text-center">
          <Link
            href="/best"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back to all collections
          </Link>
        </div>
      </div>
    </>
  );
}
