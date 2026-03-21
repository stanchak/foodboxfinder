import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedCollections } from "@/lib/queries";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Best Food Box Collections",
  description:
    "Browse our curated 'Best of' collections to find top-rated food box subscriptions. Expert picks for meal kits, prepared meals, protein boxes, and more.",
  openGraph: {
    title: "Best Food Box Collections | FoodBoxFinder",
    description:
      "Browse our curated 'Best of' collections to find top-rated food box subscriptions.",
    type: "website",
    url: "https://foodboxfinder.com/best",
  },
};

function CollectionListJsonLd({
  collections,
}: Readonly<{
  collections: Array<{ title: string; slug: string; description: string | null }>;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Best Food Box Collections",
    description:
      "Curated collections of the best food box subscription services.",
    url: "https://foodboxfinder.com/best",
    hasPart: collections.map((c) => ({
      "@type": "ItemList",
      name: c.title,
      url: `https://foodboxfinder.com/best/${c.slug}`,
      ...(c.description && { description: c.description }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

export default async function CollectionsIndexPage() {
  const collections = await getPublishedCollections();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/best" },
  ];

  return (
    <>
      <CollectionListJsonLd collections={collections} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Header */}
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Best Food Box Collections
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Our expert-curated collections to help you find the perfect food
            box subscription for your needs.
          </p>
        </div>

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/best/${collection.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-gray-100 transition-all hover:shadow-card-hover hover:ring-primary-200"
              >
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
                  {collection.coverImageUrl ? (
                    <Image
                      src={collection.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
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
                        className="text-primary-300"
                        aria-hidden="true"
                      >
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                      </svg>
                    </div>
                  )}

                  {/* Item count badge */}
                  <span className="absolute bottom-3 right-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
                    {collection._count.items}{" "}
                    {collection._count.items === 1 ? "provider" : "providers"}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-2">
                    {collection.title}
                  </h2>
                  {collection.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-1">
                      {collection.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700 transition-colors">
                    View collection
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
                      className="ml-1.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
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
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No collections yet
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We are working on curating the best food box collections.
              Check back soon!
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Browse providers
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
