import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedBlogPosts } from "@/lib/queries";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Blog - Food Box Tips, Guides & News",
  description:
    "Read the latest tips, guides, and news about food box subscriptions. From meal planning advice to in-depth reviews of the best meal kits and prepared meal services.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | FoodBoxFinder",
    description:
      "Tips, guides, and news about food box subscriptions, meal kits, and prepared meal services.",
    type: "website",
    url: "https://foodboxfinder.com/blog",
  },
};

function BlogJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "FoodBoxFinder Blog",
    description:
      "Tips, guides, and news about food box subscriptions and meal delivery services.",
    url: "https://foodboxfinder.com/blog",
    publisher: {
      "@type": "Organization",
      name: "FoodBoxFinder",
      url: "https://foodboxfinder.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function estimateReadingTime(body: string): number {
  const wordCount = body.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 250));
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pageParam = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 12;

  const { posts, total } = await getPublishedBlogPosts(page, pageSize);
  const totalPages = Math.ceil(total / pageSize);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
  ];

  // Separate featured (first) post from the rest on page 1
  const featuredPost = page === 1 && posts.length > 0 ? posts[0] : null;
  const remainingPosts = page === 1 && featuredPost ? posts.slice(1) : posts;

  return (
    <>
      <BlogJsonLd />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Header */}
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            The FoodBoxFinder Blog
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Tips, guides, and the latest news on food box subscriptions
            and meal delivery services.
          </p>
        </div>

        {posts.length > 0 ? (
          <>
            {/* Featured Post Hero (page 1 only) */}
            {featuredPost && (
              <article className="mt-10">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group block overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-100 transition-all hover:shadow-card-hover hover:ring-primary-200"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image */}
                    <div className="relative h-64 lg:h-80 lg:w-1/2 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden shrink-0">
                      {featuredPost.coverImageUrl ? (
                        <Image
                          src={featuredPost.coverImageUrl}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          priority
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary-200"
                            aria-hidden="true"
                          >
                            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                            <path d="M18 14h-8" />
                            <path d="M15 18h-5" />
                            <path d="M10 6h8v4h-8V6Z" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute top-4 left-4 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                        Featured
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-center p-6 lg:p-10">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {featuredPost.publishedAt && (
                          <time dateTime={featuredPost.publishedAt.toISOString()}>
                            {formatDate(featuredPost.publishedAt)}
                          </time>
                        )}
                        {featuredPost.publishedAt && (
                          <span aria-hidden="true">-</span>
                        )}
                        <span>
                          {estimateReadingTime(featuredPost.body)} min read
                        </span>
                      </div>

                      <h2 className="mt-3 text-2xl font-extrabold text-gray-900 group-hover:text-primary-700 transition-colors sm:text-3xl line-clamp-3">
                        {featuredPost.title}
                      </h2>

                      {featuredPost.excerpt && (
                        <p className="mt-3 text-gray-600 leading-relaxed line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-2">
                        {featuredPost.author && (
                          <span className="text-sm font-medium text-gray-700">
                            By {featuredPost.author}
                          </span>
                        )}
                      </div>

                      <div className="mt-6">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 group-hover:text-primary-700 transition-colors">
                          Read article
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
                            className="transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {/* Post Grid */}
            {remainingPosts.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {remainingPosts.map((post) => (
                  <article key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col h-full overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-100 transition-all hover:shadow-card-hover hover:ring-primary-200"
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shrink-0">
                        {post.coverImageUrl ? (
                          <Image
                            src={post.coverImageUrl}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="40"
                              height="40"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-gray-300"
                              aria-hidden="true"
                            >
                              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                              <path d="M18 14h-8" />
                              <path d="M15 18h-5" />
                              <path d="M10 6h8v4h-8V6Z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {post.publishedAt && (
                            <time dateTime={post.publishedAt.toISOString()}>
                              {formatDate(post.publishedAt)}
                            </time>
                          )}
                          {post.publishedAt && (
                            <span aria-hidden="true">-</span>
                          )}
                          <span>
                            {estimateReadingTime(post.body)} min read
                          </span>
                        </div>

                        <h2 className="mt-2 text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-2">
                          {post.title}
                        </h2>

                        {post.excerpt && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-1">
                            {post.excerpt}
                          </p>
                        )}

                        {post.author && (
                          <p className="mt-3 text-xs font-medium text-gray-500">
                            By {post.author}
                          </p>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Blog pagination"
                className="mt-12 flex items-center justify-center gap-2"
              >
                {page > 1 && (
                  <Link
                    href={`/blog${page === 2 ? "" : `?page=${page - 1}`}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
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
                    Previous
                  </Link>
                )}

                <span className="text-sm text-gray-500 px-3">
                  Page {page} of {totalPages}
                </span>

                {page < totalPages && (
                  <Link
                    href={`/blog?page=${page + 1}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Next
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
                )}
              </nav>
            )}
          </>
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
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No blog posts yet
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We are working on great content. Check back soon!
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all hover:bg-primary-700"
            >
              Back to home
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
