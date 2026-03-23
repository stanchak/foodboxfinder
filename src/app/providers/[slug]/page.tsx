import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { DietaryTag, ProviderStatus } from "@/generated/prisma/client";
import {
  getProviderBySlug,
  getRelatedProviders,
  getProviderReviewStats,
} from "@/lib/queries";
import { CATEGORY_MAP, getSlugByCategory } from "@/lib/categories";
import { formatPriceRange } from "@/lib/format";
import Breadcrumbs from "@/components/Breadcrumbs";
import Badge from "@/components/Badge";
import RatingStars from "@/components/RatingStars";
import PricingTable from "@/components/PricingTable";
import RatingBreakdown from "@/components/RatingBreakdown";
import ReviewCard from "@/components/ReviewCard";
import FaqAccordion from "@/components/FaqAccordion";
import ProviderCard from "@/components/ProviderCard";
import ReviewForm from "@/components/ReviewForm";
import AffiliateLink from "@/components/AffiliateLink";

// -- Helpers --

function formatDietaryTagLabel(tag: DietaryTag): string {
  return tag
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function parseJsonArray(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string");
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  return [];
}

function formatFieldLabel(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const statusStyleMap: Record<ProviderStatus, string> = {
  ACTIVE: "bg-success-50 text-success-700 ring-success-600/20",
  HYBRID: "bg-accent-50 text-accent-700 ring-accent-600/20",
  UNCLEAR: "bg-warning-50 text-warning-700 ring-warning-600/20",
  DISCONTINUED: "bg-error-50 text-error-700 ring-error-600/20",
};

function getStatusStyle(status: ProviderStatus): string {
  return statusStyleMap[status] ?? statusStyleMap.ACTIVE;
}

// -- Metadata --

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);

  if (!provider) {
    return { title: "Provider Not Found" };
  }

  const title = provider.metaTitle ?? `${provider.name} Review & Pricing`;
  const description =
    provider.metaDescription ??
    provider.shortDescription ??
    `Read our in-depth review of ${provider.name}. Compare plans, pricing, dietary options, and real customer reviews.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/providers/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      ...(provider.heroImageUrl && { images: [{ url: provider.heroImageUrl }] }),
    },
  };
}

// -- Page --

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);

  if (!provider) {
    notFound();
  }

  const [reviewStats, relatedProviders] = await Promise.all([
    getProviderReviewStats(provider.id),
    getRelatedProviders(slug, provider.category, 4),
  ]);

  const categoryInfo = CATEGORY_MAP[provider.category];
  const categorySlug = getSlugByCategory(provider.category);
  const pros = parseJsonArray(provider.prosJson);
  const cons = parseJsonArray(provider.consJson);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: categoryInfo.label, href: `/${categorySlug}` },
    { label: provider.name, href: `/providers/${provider.slug}` },
  ];

  // Build JSON-LD structured data
  const featuredPlan = provider.plans.find((p) => p.featured) ?? provider.plans[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      // Product
      {
        "@type": "Product",
        name: provider.name,
        description: provider.shortDescription ?? provider.description,
        url: `https://foodboxfinder.com/providers/${provider.slug}`,
        ...(provider.logoUrl && { image: provider.logoUrl }),
        brand: {
          "@type": "Brand",
          name: provider.name,
        },
        ...(provider.prepStyle && { category: formatFieldLabel(provider.prepStyle) }),
        ...(provider.geography && {
          areaServed: {
            "@type": "Country",
            name: provider.geography === "national-us" ? "United States" : formatFieldLabel(provider.geography),
          },
        }),
        ...(provider.reviewCount > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: provider.averageRating,
            reviewCount: provider.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }),
        ...(featuredPlan?.pricePerServingCents != null && {
          offers: {
            "@type": "Offer",
            price: (featuredPlan.pricePerServingCents / 100).toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }),
        ...(provider.reviews.length > 0 && {
          review: provider.reviews.slice(0, 5).map((review) => ({
            "@type": "Review",
            author: {
              "@type": "Person",
              name: review.authorName,
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
              bestRating: 5,
              worstRating: 1,
            },
            ...(review.title && { name: review.title }),
            reviewBody: review.body,
            datePublished: review.createdAt.toISOString().split("T")[0],
          })),
        }),
      },
      // FAQ
      ...(provider.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: provider.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  // Navigation anchors
  const hasKeyDetails = !!(provider.prepStyle || provider.valueTier || provider.modelType || provider.householdFit || provider.geography);
  const hasFlexShipping = !!(provider.flexibility || provider.shippingNotes);

  const navSections = [
    { id: "overview", label: "Overview" },
    ...(hasKeyDetails ? [{ id: "key-details", label: "Key Details" }] : []),
    ...(hasFlexShipping ? [{ id: "flex-shipping", label: "Flexibility" }] : []),
    { id: "plans", label: "Plans & Pricing" },
    { id: "reviews", label: "Reviews" },
    ...(provider.faqs.length > 0 ? [{ id: "faq", label: "FAQ" }] : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Hero Image */}
        {(provider.heroImageUrl ?? provider.logoUrl) ? (
          <div className="mt-6 relative w-full h-48 sm:h-64 lg:h-80 rounded-2xl overflow-hidden">
            <Image
              src={(provider.heroImageUrl ?? provider.logoUrl)!}
              alt={provider.name}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <div className="mt-6 relative w-full h-48 sm:h-64 lg:h-80 rounded-2xl overflow-hidden flex items-center justify-center">
            <span className="text-7xl font-extrabold text-neutral-200" aria-hidden="true">
              {provider.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Header Info */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="category">{categoryInfo.label}</Badge>
            {provider.secondaryCategory && (
              <Badge color="default">
                {CATEGORY_MAP[provider.secondaryCategory].label}
              </Badge>
            )}
            {provider.freeShipping && (
              <Badge color="dietary">Free Shipping</Badge>
            )}
            {provider.status !== "ACTIVE" && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusStyle(provider.status)}`}
              >
                {provider.status.charAt(0) + provider.status.slice(1).toLowerCase()}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            {provider.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {provider.reviewCount > 0 ? (
              <a
                href="#reviews"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <RatingStars rating={provider.averageRating} size="md" />
                <span className="text-sm text-neutral-500">
                  ({provider.reviewCount} {provider.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </a>
            ) : (
              <span className="text-sm text-neutral-500">No reviews yet</span>
            )}

            <span className="text-sm font-semibold text-primary-700">
              {formatPriceRange(
                provider.minPricePerServingCents,
                provider.maxPricePerServingCents,
              )}
              {provider.minPricePerServingCents != null ? "/serving" : ""}
            </span>
          </div>

          <p className="mt-4 text-neutral-700 leading-relaxed max-w-3xl">
            {provider.shortDescription ?? provider.description}
          </p>

          {/* Dietary tags */}
          {provider.dietaryTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {provider.dietaryTags.map((dt) => (
                <Badge key={dt.tag} color="dietary">
                  {formatDietaryTagLabel(dt.tag)}
                </Badge>
              ))}
            </div>
          )}

          {/* CTA and website links */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AffiliateLink
              providerId={provider.id}
              providerName={provider.name}
              affiliateUrl={provider.affiliateUrl}
              website={provider.website}
              source={`/providers/${provider.slug}`}
            />
            <a
              href={provider.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 transition-colors"
            >
              Official Website
            </a>
          </div>

          {/* Quick details */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
            {provider.foundedYear && (
              <span>Founded {provider.foundedYear}</span>
            )}
            {provider.headquarters && (
              <span>HQ: {provider.headquarters}</span>
            )}
            {provider.deliveryAreaDescription && (
              <span>Delivers: {provider.deliveryAreaDescription}</span>
            )}
            {provider.lastVerifiedAt && (
              <span>
                Verified{" "}
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  year: "numeric",
                }).format(provider.lastVerifiedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Section Navigation */}
        <nav
          aria-label="Page sections"
          className="mt-8 sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-lg border-b border-neutral-200"
        >
          <ul className="flex gap-6 overflow-x-auto no-scrollbar">
            {navSections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="inline-block py-3 text-sm font-semibold text-neutral-600 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-600 transition-colors whitespace-nowrap"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Overview Section */}
        <section id="overview" className="mt-10 scroll-mt-16">
          <h2 className="text-xl font-extrabold text-neutral-900">Overview</h2>

          {/* Full description */}
          {provider.shortDescription && (
            <div className="mt-4 prose prose-gray max-w-3xl">
              <p className="text-neutral-700 leading-relaxed">{provider.description}</p>
            </div>
          )}

          {/* Editor Note */}
          {provider.editorNote && (
            <div className="mt-6 rounded-xl border border-primary-200 bg-primary-50/50 p-5">
              <h3 className="text-[11px] font-bold text-primary-800 uppercase tracking-widest">
                Editor&apos;s Note
              </h3>
              <p className="mt-2 text-sm text-neutral-700 leading-relaxed">
                {provider.editorNote}
              </p>
            </div>
          )}

          {/* Pros & Cons */}
          {(pros.length > 0 || cons.length > 0) && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {/* Pros */}
              {pros.length > 0 && (
                <div className="rounded-xl bg-success-50/30 p-5">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-success-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Pros
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {pros.map((pro, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-neutral-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 shrink-0 text-success-600"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cons */}
              {cons.length > 0 && (
                <div className="rounded-xl bg-error-50/30 p-5">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-error-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    Cons
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {cons.map((con, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-neutral-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 shrink-0 text-error-500"
                          aria-hidden="true"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Key Details */}
        {hasKeyDetails && (
          <section id="key-details" className="mt-10 scroll-mt-16">
            <h2 className="text-xl font-extrabold text-neutral-900">Key Details</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {provider.prepStyle && (
                <div className="rounded-lg bg-neutral-50 p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Prep Style</dt>
                  <dd className="mt-1 text-sm font-semibold text-neutral-900">{formatFieldLabel(provider.prepStyle)}</dd>
                </div>
              )}
              {provider.valueTier && (
                <div className="rounded-lg bg-neutral-50 p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Value Tier</dt>
                  <dd className="mt-1 text-sm font-semibold text-neutral-900">{formatFieldLabel(provider.valueTier)}</dd>
                </div>
              )}
              {provider.modelType && (
                <div className="rounded-lg bg-neutral-50 p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Model</dt>
                  <dd className="mt-1 text-sm font-semibold text-neutral-900">{formatFieldLabel(provider.modelType)}</dd>
                </div>
              )}
              {provider.householdFit && (
                <div className="rounded-lg bg-neutral-50 p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Best For</dt>
                  <dd className="mt-1 text-sm font-semibold text-neutral-900">{formatFieldLabel(provider.householdFit)}</dd>
                </div>
              )}
              {provider.geography && (
                <div className="rounded-lg bg-neutral-50 p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Delivery Area</dt>
                  <dd className="mt-1 text-sm font-semibold text-neutral-900">{formatFieldLabel(provider.geography)}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Flexibility & Shipping */}
        {hasFlexShipping && (
          <section id="flex-shipping" className="mt-10 scroll-mt-16">
            <h2 className="text-xl font-extrabold text-neutral-900">Flexibility & Shipping</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {provider.flexibility && (
                <div className="rounded-xl border border-primary-200 bg-primary-50/30 p-5">
                  <h3 className="text-[11px] font-bold text-primary-800 uppercase tracking-widest">Flexibility Policy</h3>
                  <p className="mt-2 text-sm text-neutral-700 leading-relaxed">{provider.flexibility}</p>
                </div>
              )}
              {provider.shippingNotes && (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/30 p-5">
                  <h3 className="text-[11px] font-bold text-neutral-800 uppercase tracking-widest">Shipping Details</h3>
                  <p className="mt-2 text-sm text-neutral-700 leading-relaxed">{provider.shippingNotes}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Plans & Pricing Section */}
        <section id="plans" className="mt-14 scroll-mt-16">
          <h2 className="text-xl font-extrabold text-neutral-900">Plans & Pricing</h2>
          <p className="mt-2 text-neutral-600">
            Compare available plans from {provider.name} to find the best fit for your needs.
          </p>
          <div className="mt-6">
            <PricingTable plans={provider.plans} />
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="mt-14 scroll-mt-16">
          <h2 className="text-xl font-extrabold text-neutral-900">
            Customer Reviews
          </h2>

          {/* Rating breakdown (only when reviews exist) */}
          {provider.reviewCount > 0 && (
            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50/50 p-6">
              <RatingBreakdown
                stats={reviewStats}
                totalReviews={provider.reviewCount}
                averageRating={provider.averageRating}
              />
            </div>
          )}

          {/* Individual reviews */}
          {provider.reviews.length > 0 ? (
            <div className="mt-8">
              {provider.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-neutral-500">
              No reviews yet. Be the first to share your experience!
            </p>
          )}

          {/* Review submission form */}
          <div className="mt-10 rounded-xl border border-neutral-200 bg-neutral-50/50 p-6">
            <h3 className="text-lg font-bold text-neutral-900">
              Write a Review
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Share your experience with {provider.name} to help other shoppers.
            </p>
            <div className="mt-5">
              <ReviewForm providerId={provider.id} />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {provider.faqs.length > 0 && (
          <section id="faq" className="mt-14 scroll-mt-16">
            <h2 className="text-xl font-extrabold text-neutral-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-neutral-600">
              Common questions about {provider.name} answered.
            </p>
            <div className="mt-6">
              <FaqAccordion
                items={provider.faqs.map((faq) => ({
                  id: faq.id,
                  question: faq.question,
                  answer: faq.answer,
                }))}
              />
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="mt-14 rounded-2xl bg-gradient-to-br from-primary-50 via-accent-50/30 to-primary-50 p-8 sm:p-10 text-center">
          <h2 className="text-xl font-extrabold text-neutral-900">
            Ready to try {provider.name}?
          </h2>
          <p className="mt-2 text-neutral-600 max-w-xl mx-auto">
            Visit their website to explore current plans, seasonal menus, and
            any introductory offers available.
          </p>
          <div className="mt-5">
            <AffiliateLink
              providerId={provider.id}
              providerName={provider.name}
              affiliateUrl={provider.affiliateUrl}
              website={provider.website}
              source={`/providers/${provider.slug}#bottom-cta`}
            />
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            FoodBoxFinder may earn a commission when you visit via this link.{" "}
            <Link href="/methodology" className="underline hover:text-neutral-700">
              Learn more
            </Link>
          </p>
        </section>

        {/* Related Providers */}
        {relatedProviders.length > 0 && (
          <section className="mt-14 mb-10">
            <h2 className="text-xl font-extrabold text-neutral-900">
              Similar {categoryInfo.label}
            </h2>
            <p className="mt-2 text-neutral-600">
              Other {categoryInfo.label.toLowerCase()} you might want to compare.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProviders.map((related) => (
                <ProviderCard key={related.id} provider={related} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href={`/${categorySlug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                View all {categoryInfo.label.toLowerCase()}
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
          </section>
        )}
      </div>
    </>
  );
}
