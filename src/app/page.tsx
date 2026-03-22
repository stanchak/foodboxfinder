import Link from "next/link";
import type { Metadata } from "next";
import type { CategoryType } from "@/generated/prisma/client";
import { getFeaturedProviders, getCategoryCounts } from "@/lib/queries";
import { CATEGORY_MAP } from "@/lib/categories";
import ProviderCard from "@/components/ProviderCard";

export const metadata: Metadata = {
  title: "FoodBoxFinder - Discover & Compare Food Box Subscriptions",
  description:
    "Find and compare the best meal kits, prepared meals, protein boxes, and produce boxes. Honest reviews, transparent pricing, and side-by-side comparisons to help you choose the perfect food subscription.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FoodBoxFinder - Discover & Compare Food Box Subscriptions",
    description:
      "Find and compare the best meal kits, prepared meals, protein boxes, and produce boxes. Honest reviews, transparent pricing, and side-by-side comparisons.",
    type: "website",
    url: "https://foodboxfinder.com",
  },
};

// --- Category Icon SVGs ---

function MealKitIcon({ className }: Readonly<{ className?: string }>) {
  return (
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
      className={className}
      aria-hidden="true"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function PreparedMealIcon({ className }: Readonly<{ className?: string }>) {
  return (
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
      className={className}
      aria-hidden="true"
    >
      <path d="M2 12h20" />
      <path d="M20 12c0-4.4-3.6-8-8-8s-8 3.6-8 8" />
      <path d="M4 12v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
      <path d="M12 16v4" />
      <path d="M8 20h8" />
    </svg>
  );
}

function ProteinBoxIcon({ className }: Readonly<{ className?: string }>) {
  return (
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
      className={className}
      aria-hidden="true"
    >
      <path d="M15.5 2H8.6c-.4 0-.8.2-.9.5L4.2 8.3c-.2.4 0 .7.4.7h14.8c.4 0 .5-.3.4-.7L16.3 2.5c-.1-.3-.5-.5-.8-.5Z" />
      <path d="M4 9v10c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V9" />
      <path d="M9 14h6" />
    </svg>
  );
}

function ProduceBoxIcon({ className }: Readonly<{ className?: string }>) {
  return (
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
      className={className}
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 4 13V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1h6V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a7 7 0 0 1-7 7Z" />
      <path d="M12 2v3" />
      <path d="M9 3c1.5 1 3.5 1 5 0" />
    </svg>
  );
}

function SpecialtyIcon({ className }: Readonly<{ className?: string }>) {
  return (
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
      className={className}
      aria-hidden="true"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

const categoryIcons: Record<CategoryType, React.ComponentType<{ className?: string }>> = {
  MEAL_KIT: MealKitIcon,
  PREPARED_MEAL: PreparedMealIcon,
  PROTEIN_BOX: ProteinBoxIcon,
  PRODUCE_BOX: ProduceBoxIcon,
  SPECIALTY: SpecialtyIcon,
};

// --- "How It Works" step icons ---

function BrowseIcon() {
  return (
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CompareIcon() {
  return (
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
  );
}

function SubscribeIcon() {
  return (
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// --- JSON-LD Structured Data ---

function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FoodBoxFinder",
    url: "https://foodboxfinder.com",
    description:
      "Find and compare the best food box subscriptions including meal kits, prepared meals, protein boxes, and produce boxes.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://foodboxfinder.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FoodBoxFinder",
    url: "https://foodboxfinder.com",
    description:
      "A discovery and comparison platform for food box subscription services.",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

// --- Main Page Component ---

export default async function HomePage() {
  const [featuredProviders, categoryCounts] = await Promise.all([
    getFeaturedProviders(),
    getCategoryCounts(),
  ]);

  const countMap = new Map(
    categoryCounts.map((c) => [c.category, c._count])
  );

  const totalProviders = categoryCounts.reduce((sum, c) => sum + c._count, 0);
  const totalReviews = featuredProviders.reduce(
    (sum, p) => sum + p.reviewCount,
    0
  );
  const categoryCount = Object.keys(CATEGORY_MAP).length;

  return (
    <>
      <WebsiteJsonLd />
      <OrganizationJsonLd />

      {/* --- Hero Section --- */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
              Find Your Perfect{" "}
              <span className="text-primary-600">Food Box</span>{" "}
              Subscription
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600 sm:text-xl">
              Compare meal kits, prepared meals, protein boxes, and more.
              Honest reviews, transparent pricing, and side-by-side comparisons
              to help you choose the right subscription for your lifestyle.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search All Providers
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 rounded-full border border-primary-600 px-6 py-3.5 text-base font-semibold text-primary-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all"
              >
                Compare Side by Side
              </Link>
            </div>
          </div>

          {/* Category quick-links */}
          <nav
            aria-label="Browse by category"
            className="mt-14 sm:mt-16"
          >
            <div className="flex flex-wrap justify-center gap-3">
              {(Object.entries(CATEGORY_MAP) as Array<[CategoryType, typeof CATEGORY_MAP[CategoryType]]>).map(
                ([key, cat]) => {
                  const IconComponent = categoryIcons[key];
                  return (
                    <Link
                      key={key}
                      href={`/${cat.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-700 shadow-sm ring-1 ring-neutral-200 hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-200 transition-all"
                    >
                      <IconComponent className="text-primary-500 w-5 h-5" />
                      {cat.label}
                    </Link>
                  );
                }
              )}
            </div>
          </nav>
        </div>
      </section>

      {/* --- Featured Providers Section --- */}
      {featuredProviders.length > 0 && (
        <section className="py-20 sm:py-24" aria-labelledby="featured-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2
                id="featured-heading"
                className="text-2xl font-extrabold tracking-tight text-neutral-900"
              >
                Featured Providers
              </h2>
              <p className="mt-3 text-lg text-neutral-600">
                Top-rated food box subscriptions handpicked by our team
              </p>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="mt-10 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="relative">
                <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible sm:pb-0">
                  {featuredProviders.map((provider) => (
                    <article
                      key={provider.id}
                      className="min-w-[280px] max-w-[320px] snap-start sm:min-w-0 sm:max-w-none"
                    >
                      <ProviderCard provider={provider} />
                    </article>
                  ))}
                </div>
                {/* Scroll indicator gradient - mobile only */}
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--background)] to-transparent sm:hidden"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                View all providers
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
        </section>
      )}

      {/* --- Browse by Category Section --- */}
      <section
        className="bg-neutral-100 py-20 sm:py-24"
        aria-labelledby="categories-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              id="categories-heading"
              className="text-2xl font-extrabold tracking-tight text-neutral-900"
            >
              Browse by Category
            </h2>
            <p className="mt-3 text-lg text-neutral-600">
              Find the type of food subscription that fits your needs
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.entries(CATEGORY_MAP) as Array<[CategoryType, typeof CATEGORY_MAP[CategoryType]]>).map(
              ([key, cat]) => {
                const IconComponent = categoryIcons[key];
                const count = countMap.get(key) ?? 0;
                return (
                  <Link
                    key={key}
                    href={`/${cat.slug}`}
                    className="group relative flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-card ring-1 ring-neutral-100 transition-all hover:shadow-card-hover hover:ring-primary-200 hover:-translate-y-1"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-transform group-hover:scale-110">
                      <IconComponent />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">
                        {cat.label}
                      </h3>
                      <p className="mt-1.5 text-sm text-neutral-600">
                        {cat.description}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary-600">
                        {count} {count === 1 ? "provider" : "providers"}
                      </p>
                    </div>
                    <span
                      className="absolute right-4 top-4 text-neutral-300 transition-colors group-hover:text-primary-400"
                      aria-hidden="true"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* --- How It Works Section --- */}
      <section
        id="how-it-works"
        className="py-20 sm:py-24"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              id="how-it-works-heading"
              className="text-2xl font-extrabold tracking-tight text-neutral-900"
            >
              How It Works
            </h2>
            <p className="mt-3 text-lg text-neutral-600">
              Finding your ideal food box subscription is easy
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: 1,
                icon: <BrowseIcon />,
                title: "Browse",
                description:
                  "Explore our curated directory of food box subscriptions. Filter by category, dietary needs, and budget to narrow down your options.",
              },
              {
                step: 2,
                icon: <CompareIcon />,
                title: "Compare",
                description:
                  "Use our side-by-side comparison tool to evaluate pricing, meal options, dietary accommodations, and flexibility across providers.",
              },
              {
                step: 3,
                icon: <SubscribeIcon />,
                title: "Subscribe",
                description:
                  "Choose the subscription that fits your lifestyle and sign up directly with the provider. Many offer special introductory discounts.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50">
                  {item.icon}
                </div>
                <div className="mt-2 flex items-center justify-center">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-neutral-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600 max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Social Proof / Trust Section --- */}
      <section
        className="bg-gradient-to-br from-primary-900 to-primary-950 py-16 sm:py-20"
        aria-labelledby="trust-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="trust-heading" className="sr-only">
            FoodBoxFinder by the numbers
          </h2>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              {
                value: `${totalProviders}+`,
                label: "Providers",
                description: "Curated food box services",
              },
              {
                value: `${totalReviews}`,
                label: "Reviews",
                description: "From real customers",
              },
              {
                value: `${categoryCount}`,
                label: "Categories",
                description: "Types of subscriptions",
              },
              {
                value: "100%",
                label: "Free",
                description: "No cost to use, ever",
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-extrabold text-white sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Final CTA Section --- */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900">
              Ready to find your perfect food box?
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Whether you want chef-designed meal kits or farm-fresh produce
              delivered to your door, we help you compare the best options.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all"
              >
                Start Exploring
              </Link>
              <Link
                href="/best"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3.5 text-base font-semibold text-neutral-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 transition-all"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
