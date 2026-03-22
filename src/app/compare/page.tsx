import type { Metadata } from "next";
import Link from "next/link";
import { getProvidersForComparison, getFeaturedProviders } from "@/lib/queries";
import ComparisonTable from "@/components/ComparisonTable";
import ProviderCard from "@/components/ProviderCard";
import Breadcrumbs from "@/components/Breadcrumbs";

// -- Metadata --

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const providersParam =
    typeof params.providers === "string" ? params.providers : "";
  const slugs = providersParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (slugs.length >= 2) {
    const providers = await getProvidersForComparison(slugs);
    if (providers.length >= 2) {
      const names = providers.map((p) => p.name);
      const title = `Compare ${names.join(" vs ")}`;
      const description = `Side-by-side comparison of ${names.join(", ")} — pricing, ratings, dietary options, and plan details.`;

      return {
        title,
        description,
        robots: { index: false, follow: true },
      };
    }
  }

  return {
    title: "Compare Food Box Subscriptions Side by Side",
    description:
      "Select 2-4 food box providers and compare pricing, ratings, dietary options, and plan details side by side.",
  };
}

// -- Page --

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const providersParam =
    typeof params.providers === "string" ? params.providers : "";
  const slugs = providersParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Compare", href: "/compare" },
  ];

  // No slugs provided: show empty state
  if (slugs.length === 0) {
    return <CompareEmptyState breadcrumbItems={breadcrumbItems} />;
  }

  // Fetch providers
  const providers = await getProvidersForComparison(slugs);

  // Preserve the order from the URL
  const orderedProviders = slugs
    .map((slug) => providers.find((p) => p.slug === slug))
    .filter(
      (p): p is NonNullable<typeof p> => p !== undefined,
    );

  // Not enough valid providers
  if (orderedProviders.length < 2) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent-500"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-neutral-900">
            Not Enough Providers to Compare
          </h1>
          <p className="mt-2 text-neutral-600 max-w-md mx-auto">
            {orderedProviders.length === 1
              ? `We found "${orderedProviders[0].name}" but need at least 2 providers for a comparison.`
              : "We couldn't find valid providers for the slugs you provided. Please try different ones."}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Browse Providers to Compare
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Search All Providers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Compare ${orderedProviders.map((p) => p.name).join(" vs ")}`,
    description: `Side-by-side comparison of ${orderedProviders.map((p) => p.name).join(", ")}.`,
    url: `https://foodboxfinder.com/compare?providers=${orderedProviders.map((p) => p.slug).join(",")}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            {orderedProviders.map((p) => p.name).join(" vs ")}
          </h1>
          <p className="mt-2 text-neutral-600">
            Side-by-side comparison of pricing, ratings, dietary options, and
            plan details.
          </p>
        </div>

        <div className="mt-8">
          <ComparisonTable providers={orderedProviders} />
        </div>

        {/* Back to browse */}
        <div className="mt-10 text-center">
          <Link
            href="/search"
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
            Browse all providers
          </Link>
        </div>
      </div>
    </>
  );
}

// -- Empty State Component --

async function CompareEmptyState({
  breadcrumbItems,
}: Readonly<{
  breadcrumbItems: Array<{ label: string; href: string }>;
}>) {
  const featuredProviders = await getFeaturedProviders();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Compare Food Box Subscriptions",
    description:
      "Select 2-4 food box providers and compare pricing, ratings, dietary options, and plan details side by side.",
    url: "https://foodboxfinder.com/compare",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Hero */}
        <div className="mt-10 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-600"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="18" rx="1" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            Compare Food Boxes Side by Side
          </h1>
          <p className="mt-3 text-lg text-neutral-600 max-w-2xl mx-auto">
            Select 2 to 4 providers from the list below, or use the &ldquo;Add
            to Compare&rdquo; button on any provider page. We will show you a
            detailed breakdown of pricing, ratings, dietary options, and more.
          </p>
        </div>

        {/* How it works steps */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
          {[
            {
              step: 1,
              title: "Select Providers",
              description:
                'Browse providers and click "Add to Compare" on 2-4 that interest you.',
            },
            {
              step: 2,
              title: "View Comparison",
              description:
                'Click "Compare" in the floating bar to see them side by side.',
            },
            {
              step: 3,
              title: "Make Your Choice",
              description:
                "Review pricing, ratings, and flexibility to find the best match.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white text-sm font-bold">
                {item.step}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-neutral-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-600">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Featured providers grid */}
        {featuredProviders.length > 0 && (
          <section className="mt-14" aria-labelledby="compare-pick-heading">
            <h2
              id="compare-pick-heading"
              className="text-2xl font-extrabold text-neutral-900 text-center"
            >
              Popular Providers to Compare
            </h2>
            <p className="mt-2 text-neutral-600 text-center">
              Start by selecting a few providers below
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
