import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { getProvidersForComparison } from "@/lib/queries";
import { formatPriceRange } from "@/lib/format";
import { CATEGORY_MAP } from "@/lib/categories";
import ComparisonTable from "@/components/ComparisonTable";
import Breadcrumbs from "@/components/Breadcrumbs";

// -- Helpers --

function parseVersusSlug(versus: string): [string, string] | null {
  const parts = versus.split("-vs-");
  if (parts.length !== 2) return null;
  const [a, b] = parts;
  if (!a || !b) return null;
  return [a, b];
}

// -- Metadata --

export async function generateMetadata({
  params,
}: {
  params: Promise<{ versus: string }>;
}): Promise<Metadata> {
  const { versus } = await params;
  const parsed = parseVersusSlug(versus);

  if (!parsed) {
    return { title: "Comparison Not Found" };
  }

  const providers = await getProvidersForComparison(parsed);
  if (providers.length < 2) {
    return { title: "Comparison Not Found" };
  }

  // Preserve order from the URL
  const ordered = parsed
    .map((slug) => providers.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  if (ordered.length < 2) {
    return { title: "Comparison Not Found" };
  }

  const [a, b] = ordered;
  const title = `${a.name} vs ${b.name}: Which Is Better?`;
  const description = `Compare ${a.name} and ${b.name} side by side. See pricing, ratings, dietary options, meal plans, and flexibility to decide which food box subscription is right for you.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://foodboxfinder.com/compare/${versus}`,
    },
  };
}

// -- Page --

export default async function VersusPage({
  params,
}: {
  params: Promise<{ versus: string }>;
}) {
  const { versus } = await params;
  const parsed = parseVersusSlug(versus);

  if (!parsed) {
    notFound();
  }

  // Enforce canonical alphabetical slug order
  const [slugA, slugB] = parsed;
  if (slugA.localeCompare(slugB) > 0) {
    permanentRedirect(`/compare/${slugB}-vs-${slugA}`);
  }

  const providers = await getProvidersForComparison(parsed);

  // Preserve order from URL
  const orderedProviders = parsed
    .map((slug) => providers.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  if (orderedProviders.length < 2) {
    notFound();
  }

  const [providerA, providerB] = orderedProviders;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Compare", href: "/compare" },
    {
      label: `${providerA.name} vs ${providerB.name}`,
      href: `/compare/${versus}`,
    },
  ];

  // JSON-LD structured data for both products
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildProductJsonLd(providerA),
      buildProductJsonLd(providerB),
      {
        "@type": "WebPage",
        name: `${providerA.name} vs ${providerB.name}: Which Is Better?`,
        description: `Side-by-side comparison of ${providerA.name} and ${providerB.name}.`,
        url: `https://foodboxfinder.com/compare/${versus}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Header */}
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {providerA.name} vs {providerB.name}
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-3xl">
            Detailed side-by-side comparison to help you choose between{" "}
            {providerA.name} and {providerB.name}. We break down pricing,
            ratings, dietary options, and plan flexibility so you can make an
            informed decision.
          </p>
        </div>

        {/* Quick Summary Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <QuickSummaryCard provider={providerA} />
          <QuickSummaryCard provider={providerB} />
        </div>

        {/* Comparison Table */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Full Comparison
          </h2>
          <p className="mt-2 text-gray-600">
            Every detail at a glance.
          </p>
          <div className="mt-6">
            <ComparisonTable providers={orderedProviders} />
          </div>
        </div>

        {/* Editorial summary */}
        <section className="mt-12" aria-labelledby="verdict-heading">
          <h2
            id="verdict-heading"
            className="text-2xl font-bold text-gray-900"
          >
            The Bottom Line
          </h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-6 space-y-4">
            <VerdictParagraph providerA={providerA} providerB={providerB} />
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href={`/providers/${providerA.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            View {providerA.name}
          </Link>
          <Link
            href={`/providers/${providerB.slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-600 px-6 py-3 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
          >
            View {providerB.name}
          </Link>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Compare more providers
          </Link>
        </div>
      </div>
    </>
  );
}

// -- Quick Summary Card --

interface SummaryProvider {
  name: string;
  slug: string;
  category: import("@/generated/prisma/client").CategoryType;
  averageRating: number;
  reviewCount: number;
  minPricePerServingCents: number | null;
  maxPricePerServingCents: number | null;
  freeShipping: boolean;
  dietaryTags: Array<{ tag: import("@/generated/prisma/client").DietaryTag }>;
}

function QuickSummaryCard({
  provider,
}: Readonly<{ provider: SummaryProvider }>) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          <Link
            href={`/providers/${provider.slug}`}
            className="hover:text-primary-700 transition-colors"
          >
            {provider.name}
          </Link>
        </h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">
          {CATEGORY_MAP[provider.category].label}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Rating
          </dt>
          <dd className="mt-1 text-sm font-semibold text-gray-900">
            {provider.reviewCount > 0
              ? `${provider.averageRating.toFixed(1)} / 5 (${provider.reviewCount})`
              : "No reviews"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Price/Serving
          </dt>
          <dd className="mt-1 text-sm font-semibold text-gray-900">
            {formatPriceRange(
              provider.minPricePerServingCents,
              provider.maxPricePerServingCents,
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Free Shipping
          </dt>
          <dd className="mt-1 text-sm font-semibold text-gray-900">
            {provider.freeShipping ? "Yes" : "No"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Dietary Options
          </dt>
          <dd className="mt-1 text-sm font-semibold text-gray-900">
            {provider.dietaryTags.length > 0
              ? `${provider.dietaryTags.length} options`
              : "None listed"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

// -- Verdict Paragraph --

function VerdictParagraph({
  providerA,
  providerB,
}: Readonly<{
  providerA: SummaryProvider;
  providerB: SummaryProvider;
}>) {
  const aPriceMin = providerA.minPricePerServingCents;
  const bPriceMin = providerB.minPricePerServingCents;

  const priceParagraph =
    aPriceMin != null && bPriceMin != null
      ? aPriceMin < bPriceMin
        ? `When it comes to pricing, ${providerA.name} starts at a lower per-serving cost, making it the more budget-friendly option. However, ${providerB.name} may offer more value depending on the plan you choose.`
        : aPriceMin > bPriceMin
          ? `In terms of pricing, ${providerB.name} starts at a lower per-serving cost. That said, ${providerA.name} may justify its pricing with additional features or dietary options.`
          : `Both ${providerA.name} and ${providerB.name} start at the same per-serving price point, so the decision comes down to dietary options, flexibility, and personal preference.`
      : `Compare the pricing details above to see which service fits your budget.`;

  const ratingParagraph =
    providerA.reviewCount > 0 && providerB.reviewCount > 0
      ? providerA.averageRating > providerB.averageRating
        ? `${providerA.name} has a higher average rating (${providerA.averageRating.toFixed(1)}) compared to ${providerB.name} (${providerB.averageRating.toFixed(1)}), based on customer reviews.`
        : providerA.averageRating < providerB.averageRating
          ? `${providerB.name} edges ahead in customer satisfaction with a ${providerB.averageRating.toFixed(1)} rating vs ${providerA.name}'s ${providerA.averageRating.toFixed(1)}.`
          : `Both services share a similar customer rating, suggesting high satisfaction with either choice.`
      : `Check individual provider pages for the latest customer reviews.`;

  const dietParagraph =
    providerA.dietaryTags.length > providerB.dietaryTags.length
      ? `${providerA.name} supports more dietary preferences (${providerA.dietaryTags.length} options), which may be important if you have specific dietary needs.`
      : providerA.dietaryTags.length < providerB.dietaryTags.length
        ? `${providerB.name} offers more dietary accommodations (${providerB.dietaryTags.length} options), giving it an edge for customers with specific dietary requirements.`
        : `Both providers offer a similar range of dietary accommodations.`;

  return (
    <>
      <p className="text-gray-700 leading-relaxed">{priceParagraph}</p>
      <p className="text-gray-700 leading-relaxed">{ratingParagraph}</p>
      <p className="text-gray-700 leading-relaxed">{dietParagraph}</p>
      <p className="text-sm text-gray-500">
        Ultimately, the best choice depends on your specific needs. We recommend
        visiting each provider&apos;s detail page to explore their full plan
        options and read customer reviews before making a decision.
      </p>
    </>
  );
}

// -- JSON-LD Builder --

function buildProductJsonLd(provider: SummaryProvider) {
  return {
    "@type": "Product",
    name: provider.name,
    url: `https://foodboxfinder.com/providers/${provider.slug}`,
    ...(provider.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: provider.averageRating,
        reviewCount: provider.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(provider.minPricePerServingCents != null && {
      offers: {
        "@type": "Offer",
        price: (provider.minPricePerServingCents / 100).toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    }),
  };
}
