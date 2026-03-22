import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SearchInput from "@/components/SearchInput";
import ProviderCard from "@/components/ProviderCard";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import {
  searchProviders,
  searchBlogPosts,
  searchCollections,
} from "@/lib/queries";
import { CATEGORY_NAV_ITEMS } from "@/lib/categories";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q : "";

  if (query) {
    return {
      title: `Search results for "${query}"`,
      description: `Find food box subscriptions, blog posts, and collections matching "${query}" on FoodBoxFinder.`,
      robots: { index: false },
    };
  }

  return {
    title: "Search",
    description:
      "Search for meal kits, prepared meals, protein boxes, produce boxes, and specialty food subscriptions on FoodBoxFinder.",
  };
}

async function SearchResults({
  query,
}: Readonly<{ query: string }>) {
  const [providers, blogPosts, collections] = await Promise.all([
    searchProviders(query),
    searchBlogPosts(query),
    searchCollections(query),
  ]);

  const totalResults =
    providers.length + blogPosts.length + collections.length;

  if (totalResults === 0) {
    return (
      <section aria-label="No results">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">
            No results found for &ldquo;{query}&rdquo;
          </h2>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Try a different search term or browse by category.
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Browse by category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CATEGORY_NAV_ITEMS.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-colors hover:shadow-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-6" aria-live="polite">
        Found {providers.length} provider{providers.length !== 1 ? "s" : ""}
        {blogPosts.length > 0 &&
          `, ${blogPosts.length} blog post${blogPosts.length !== 1 ? "s" : ""}`}
        {collections.length > 0 &&
          `, ${collections.length} collection${collections.length !== 1 ? "s" : ""}`}
      </p>

      {/* Provider results */}
      {providers.length > 0 && (
        <section aria-labelledby="providers-heading" className="mb-12">
          <h2
            id="providers-heading"
            className="text-lg font-extrabold text-gray-900 mb-4"
          >
            Providers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {providers.map((provider) => (
              <ProviderCard key={provider.slug} provider={provider} />
            ))}
          </div>
        </section>
      )}

      {/* Blog post results */}
      {blogPosts.length > 0 && (
        <section aria-labelledby="blog-heading" className="mb-12">
          <h2
            id="blog-heading"
            className="text-lg font-extrabold text-gray-900 mb-4"
          >
            Blog Posts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogPosts.map((post) => (
              <Card
                key={post.slug}
                href={`/blog/${post.slug}`}
              >
                <article>
                  <Badge color="default" className="mb-2">
                    Blog
                  </Badge>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    {post.author && <span>{post.author}</span>}
                    {post.author && post.publishedAt && (
                      <span aria-hidden="true">&middot;</span>
                    )}
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt.toISOString()}>
                        {post.publishedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    )}
                  </div>
                </article>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Collection results */}
      {collections.length > 0 && (
        <section aria-labelledby="collections-heading" className="mb-12">
          <h2
            id="collections-heading"
            className="text-lg font-extrabold text-gray-900 mb-4"
          >
            Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <Card
                key={collection.slug}
                href={`/collections/${collection.slug}`}
              >
                <article>
                  <Badge color="category" className="mb-2">
                    Collection
                  </Badge>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-gray-400">
                    {collection._count.items} provider
                    {collection._count.items !== 1 ? "s" : ""}
                  </p>
                </article>
              </Card>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="h-40 bg-gray-100" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-20 bg-gray-200 rounded-full" />
              <div className="h-5 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-2/3 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q.trim() : "";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          Search
        </h1>
        <p className="mt-1 text-gray-600">
          Find food box subscriptions, blog posts, and curated collections.
        </p>
      </div>

      {/* Search input */}
      <Suspense>
        <SearchInput autoFocus className="mb-8" />
      </Suspense>

      {/* Results */}
      {query ? (
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <EmptyQueryState />
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            name: query
              ? `Search results for "${query}"`
              : "Search FoodBoxFinder",
            url: `https://foodboxfinder.com/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
          }).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}

function EmptyQueryState() {
  return (
    <section aria-label="Search suggestions">
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-500"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">
          Start typing to search
        </h2>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">
          Search across providers, blog posts, and curated collections.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Or browse by category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORY_NAV_ITEMS.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-colors hover:shadow-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
