import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Our Methodology",
  description:
    "Learn how FoodBoxFinder reviews, rates, and compares food box subscription services. Our editorial process, rating methodology, and affiliate disclosure.",
  openGraph: {
    title: "Our Methodology | FoodBoxFinder",
    description:
      "Learn how FoodBoxFinder reviews, rates, and compares food box subscription services.",
    type: "website",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Our Methodology", href: "/methodology" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Our Methodology",
  description:
    "Learn how FoodBoxFinder reviews, rates, and compares food box subscription services.",
  url: "https://foodboxfinder.com/methodology",
  publisher: {
    "@type": "Organization",
    name: "FoodBoxFinder",
    url: "https://foodboxfinder.com",
  },
};

export default function MethodologyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} />

        <article className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Our Methodology
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            At FoodBoxFinder, we believe every consumer deserves transparent,
            honest information when choosing a food box subscription. Here is how
            we research, evaluate, and present the services you see on our site.
          </p>

          {/* How We Review */}
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900">
              How We Review Providers
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Every food box subscription on FoodBoxFinder goes through a
              multi-step review process. Our editorial team researches each
              provider by:
            </p>
            <ul className="mt-4 space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-gray-900">
                    Hands-on testing:
                  </strong>{" "}
                  When possible, we order and try the service ourselves to
                  evaluate meal quality, packaging, freshness, and overall
                  experience.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-gray-900">
                    Pricing verification:
                  </strong>{" "}
                  We verify plan pricing, shipping costs, and promotional offers
                  directly from provider websites. Prices are updated regularly
                  and each listing shows when it was last verified.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-gray-900">
                    Customer feedback analysis:
                  </strong>{" "}
                  We aggregate customer reviews submitted on our platform and
                  research sentiment across trusted third-party review sites.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-gray-900">
                    Plan flexibility assessment:
                  </strong>{" "}
                  We evaluate skip, pause, and cancellation policies to help you
                  understand the commitment before signing up.
                </span>
              </li>
            </ul>
          </section>

          {/* How Ratings Are Calculated */}
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900">
              How Ratings Are Calculated
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Provider ratings on FoodBoxFinder are based on verified customer
              reviews submitted through our platform. The average rating is
              calculated from all approved reviews on a 1 to 5 star scale.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              All reviews go through a moderation process before they appear on
              the site. We check for:
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" aria-hidden="true" />
                Relevance to the specific provider being reviewed
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" aria-hidden="true" />
                Genuine customer experiences (not spam or promotional content)
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" aria-hidden="true" />
                Compliance with our community guidelines
              </li>
            </ul>
            <p className="mt-4 text-gray-700 leading-relaxed">
              We do not alter, edit, or suppress legitimate reviews based on
              their rating. Both positive and negative reviews are published as
              long as they meet our moderation criteria.
            </p>
          </section>

          {/* Editorial Independence */}
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900">
              Editorial Independence
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Our editorial content, including provider reviews, pros and cons
              lists, and comparison rankings, is created independently by our
              team. Providers cannot pay for higher ratings, favorable reviews,
              or preferential placement in our comparison tools.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              The &quot;Featured&quot; tag on certain providers indicates that we
              have identified them as a strong option in their category based on
              our evaluation criteria, not that they have paid for placement.
            </p>
          </section>

          {/* Affiliate Disclosure */}
          <section className="mt-10 rounded-xl border border-amber-200 bg-amber-50/50 p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Affiliate Disclosure
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              FoodBoxFinder earns revenue through affiliate partnerships with
              some of the food box subscription services listed on our site. When
              you click a &quot;Visit&quot; link on a provider page and
              subsequently make a purchase, we may receive a commission at no
              additional cost to you.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              These affiliate relationships{" "}
              <strong className="font-semibold text-gray-900">
                do not influence
              </strong>{" "}
              our editorial content, ratings, or rankings. We recommend services
              based on their merits, not their commission structure. Many
              providers on our site do not have affiliate partnerships with us,
              and we include them because they offer value to consumers.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Affiliate links on our site are marked with{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 text-sm font-mono text-amber-800">
                rel=&quot;sponsored&quot;
              </code>{" "}
              in accordance with Google search guidelines and FTC requirements
              for transparency.
            </p>
          </section>

          {/* How Comparisons Work */}
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900">
              How Comparisons Work
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Our side-by-side comparison tool lets you select up to four
              providers and view their features, pricing, dietary options, and
              flexibility policies in a single table. All data in the comparison
              view comes from the same verified information displayed on
              individual provider pages.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Default sort order in category pages is by average customer rating
              (highest first). You can change the sort order and apply filters
              for dietary preferences, price range, and more to find services
              that match your needs.
            </p>
          </section>

          {/* Contact */}
          <section className="mt-10 mb-12">
            <h2 className="text-2xl font-bold text-gray-900">
              Questions or Corrections?
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              If you believe any information on our site is inaccurate or
              outdated, or if you are a provider who would like your listing
              reviewed, please reach out to us. We are committed to keeping our
              content accurate and up to date.
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
