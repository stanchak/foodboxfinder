import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About FoodBoxFinder - Our Mission & Methodology",
  description:
    "Learn how FoodBoxFinder helps you discover and compare 95+ food box subscriptions. Transparent methodology, honest reviews, and editorial independence.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About | FoodBoxFinder",
    description:
      "Learn how FoodBoxFinder helps you discover and compare 95+ food box subscriptions. Transparent methodology and editorial independence.",
    type: "website",
    url: "https://foodboxfinder.com/about",
  },
};

const FILTER_DIMENSIONS = [
  { name: "Dietary Needs", description: "Keto, vegan, gluten-free, paleo, and more" },
  { name: "Prep Style", description: "Cook-from-scratch to heat-and-eat" },
  { name: "Value Tier", description: "Budget-friendly to premium" },
  { name: "Household Size", description: "Solo to family-sized portions" },
  { name: "Flexibility", description: "Skip, pause, or cancel anytime" },
  { name: "Geography", description: "National, regional, or local delivery" },
  { name: "Protein Source", description: "Beef, poultry, seafood, plant-based" },
  { name: "Cuisine Type", description: "Global flavors and specialty cuisines" },
  { name: "Special Features", description: "Organic, sustainable, allergen-free" },
];

function AboutPageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About FoodBoxFinder",
    "description": "Learn how FoodBoxFinder helps you discover and compare food box subscriptions.",
    "url": "https://foodboxfinder.com/about",
    "publisher": {
      "@type": "Organization",
      "name": "FoodBoxFinder",
      "url": "https://foodboxfinder.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

export default function AboutPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      <AboutPageJsonLd />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Hero Section */}
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl font-heading">
            About FoodBoxFinder
          </h1>
          <p className="mt-3 text-lg text-neutral-600 max-w-2xl mx-auto">
            Your guide to discovering the perfect food box subscription.
          </p>
        </div>

        {/* Content Sections */}
        <div className="mt-12 max-w-3xl mx-auto space-y-12">

          {/* Mission Section */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 font-heading">
              Our Mission
            </h2>
            <div className="mt-4 text-base text-neutral-700 leading-relaxed space-y-4">
              <p>
                FoodBoxFinder is a free discovery platform that helps consumers
                find the right food box subscription for their needs. With 95+
                providers across five categories -- meal kits, prepared meals,
                protein boxes, produce boxes, and specialty subscriptions -- the
                market is packed with options.
              </p>
              <p>
                The problem is simple: too many choices, too little transparency.
                Pricing structures vary wildly, dietary coverage is hard to
                compare, and most review sites only cover a handful of big names.
                FoodBoxFinder solves this with structured, side-by-side
                comparison so you can make an informed decision without visiting
                dozens of websites.
              </p>
              <p>
                We believe everyone deserves access to clear, unbiased
                information about the food subscription services available to
                them -- whether you are feeding a family of four on a budget or
                looking for premium, chef-prepared meals delivered to your door.
              </p>
            </div>
          </section>

          {/* Methodology Section */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 font-heading">
              How We Compare
            </h2>
            <div className="mt-4 text-base text-neutral-700 leading-relaxed space-y-4">
              <p>
                Every provider on FoodBoxFinder is evaluated across nine
                dimensions, giving you a consistent framework to compare
                services that might otherwise seem impossible to evaluate
                side-by-side.
              </p>
            </div>

            {/* Filter Dimensions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              {FILTER_DIMENSIONS.map((dimension) => (
                <div
                  key={dimension.name}
                  className="rounded-xl bg-primary-50 px-4 py-3 text-center"
                >
                  <span className="block text-sm font-semibold text-primary-800">
                    {dimension.name}
                  </span>
                  <span className="block mt-1 text-xs text-primary-600">
                    {dimension.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 text-base text-neutral-700 leading-relaxed space-y-4">
              <p>
                Beyond filtering, you can compare up to four providers
                side-by-side in our comparison tool, seeing pricing, dietary
                tags, delivery areas, and flexibility options laid out in a clear
                matrix. Every provider page includes transparent pricing data and
                real user reviews to help you make the right choice.
              </p>
            </div>
          </section>

          {/* Affiliate Disclosure Section */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 font-heading">
              How We Earn Revenue
            </h2>
            <div className="mt-4 text-base text-neutral-700 leading-relaxed space-y-4">
              <p>
                FoodBoxFinder is free for consumers. We earn revenue through
                affiliate partnerships with some of the providers listed on our
                site. When you click through to a provider and make a purchase,
                we may earn a commission at no extra cost to you. This is how we
                keep the lights on and the comparison tools running.
              </p>
            </div>

            {/* Editorial Independence Card */}
            <div className="mt-6 rounded-2xl bg-accent-50 border border-accent-200 p-6">
              <h3 className="text-lg font-bold text-accent-900 font-heading">
                Editorial Independence
              </h3>
              <p className="mt-3 text-sm text-accent-800 leading-relaxed">
                Our rankings, reviews, and recommendations are never influenced
                by affiliate partnerships. Every provider is evaluated using the
                same criteria, and our editorial team maintains full independence
                over all content. Providers cannot pay for higher rankings or
                preferential placement. If a provider has an affiliate
                relationship with us, that fact does not affect how we present
                their data.
              </p>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
