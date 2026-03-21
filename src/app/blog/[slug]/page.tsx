import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBlogPostBySlug, getAllBlogPostSlugs } from "@/lib/queries";
import Breadcrumbs from "@/components/Breadcrumbs";

// -- Helpers --

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

/**
 * Render blog body content. Supports:
 * - HTML content (rendered via dangerouslySetInnerHTML since it is admin-created)
 * - Plain text (split by double newlines into paragraphs, with basic markdown)
 */
function BlogBody({ body }: Readonly<{ body: string }>) {
  // If body contains HTML tags, render as HTML (admin-created, trusted content)
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(body);

  if (hasHtmlTags) {
    return (
      <div
        className="prose prose-gray prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-strong:text-gray-900"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }

  // Plain text rendering with basic markdown support
  const paragraphs = body.split(/\n\n+/);

  return (
    <div className="max-w-none space-y-6">
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        // Heading detection (### -> h3, ## -> h2, # -> h1)
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="text-xl font-bold text-gray-900 mt-8"
              id={slugify(trimmed.slice(4))}
            >
              {formatInlineMarkdown(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="text-2xl font-bold text-gray-900 mt-10"
              id={slugify(trimmed.slice(3))}
            >
              {formatInlineMarkdown(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2
              key={index}
              className="text-2xl font-bold text-gray-900 mt-10"
              id={slugify(trimmed.slice(2))}
            >
              {formatInlineMarkdown(trimmed.slice(2))}
            </h2>
          );
        }

        // Unordered list detection
        const lines = trimmed.split("\n");
        if (lines.every((line) => line.startsWith("- ") || line.startsWith("* "))) {
          return (
            <ul key={index} className="list-disc list-inside space-y-1.5 text-gray-700">
              {lines.map((line, li) => (
                <li key={li} className="leading-relaxed">
                  {formatInlineMarkdown(line.slice(2))}
                </li>
              ))}
            </ul>
          );
        }

        // Regular paragraph
        return (
          <p key={index} className="text-gray-700 leading-relaxed text-lg">
            {formatInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Simple inline markdown: **bold**, *italic*
 * Returns an array of React nodes.
 */
function formatInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Match **bold** and *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-semibold text-gray-900">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={match.index} className="italic">
          {match[3]}
        </em>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : parts;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Extract headings from body text for table of contents.
 */
function extractHeadings(
  body: string,
): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = [];

  // Check for HTML headings
  const htmlHeadingRegex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
  let htmlMatch: RegExpExecArray | null;
  while ((htmlMatch = htmlHeadingRegex.exec(body)) !== null) {
    const text = htmlMatch[2].replace(/<[^>]+>/g, ""); // strip inner HTML
    headings.push({
      level: parseInt(htmlMatch[1], 10),
      text,
      id: slugify(text),
    });
  }

  if (headings.length > 0) return headings;

  // Check for markdown headings
  const lines = body.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4).replace(/\*+/g, "");
      headings.push({ level: 3, text, id: slugify(text) });
    } else if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3).replace(/\*+/g, "");
      headings.push({ level: 2, text, id: slugify(text) });
    } else if (trimmed.startsWith("# ")) {
      const text = trimmed.slice(2).replace(/\*+/g, "");
      headings.push({ level: 2, text, id: slugify(text) });
    }
  }

  return headings;
}

// -- Static Generation --

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

// -- Metadata --

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const title = post.metaTitle ?? post.title;
  const description =
    post.metaDescription ??
    post.excerpt ??
    `${post.title} - Read this article on FoodBoxFinder.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://foodboxfinder.com/blog/${post.slug}`,
      ...(post.publishedAt && { publishedTime: post.publishedAt.toISOString() }),
      ...(post.author && { authors: [post.author] }),
      ...(post.coverImageUrl && { images: [{ url: post.coverImageUrl }] }),
    },
  };
}

// -- JSON-LD --

function ArticleJsonLd({
  post,
}: Readonly<{
  post: {
    title: string;
    slug: string;
    excerpt: string | null;
    body: string;
    author: string | null;
    publishedAt: Date | null;
    coverImageUrl: string | null;
  };
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    ...(post.excerpt && { description: post.excerpt }),
    url: `https://foodboxfinder.com/blog/${post.slug}`,
    ...(post.coverImageUrl && { image: post.coverImageUrl }),
    ...(post.publishedAt && {
      datePublished: post.publishedAt.toISOString(),
    }),
    wordCount: post.body.split(/\s+/).length,
    ...(post.author && {
      author: {
        "@type": "Person",
        name: post.author,
      },
    }),
    publisher: {
      "@type": "Organization",
      name: "FoodBoxFinder",
      url: "https://foodboxfinder.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// -- Page --

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const readingTime = estimateReadingTime(post.body);
  const headings = extractHeadings(post.body);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <>
      <ArticleJsonLd post={post} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} />

        <article className="mt-6">
          {/* Header */}
          <header className="mx-auto max-w-3xl">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {post.publishedAt && (
                <time dateTime={post.publishedAt.toISOString()}>
                  {formatDate(post.publishedAt)}
                </time>
              )}
              {post.publishedAt && <span aria-hidden="true">-</span>}
              <span>{readingTime} min read</span>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Author */}
            {post.author && (
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <span className="text-sm font-bold">
                    {post.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {post.author}
                  </p>
                  <p className="text-xs text-gray-500">Author</p>
                </div>
              </div>
            )}
          </header>

          {/* Cover Image */}
          {post.coverImageUrl && (
            <div className="relative mt-8 mx-auto max-w-4xl h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden">
              <Image
                src={post.coverImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
              />
            </div>
          )}

          {/* Content area with optional ToC sidebar */}
          <div className="mt-10 mx-auto max-w-3xl lg:max-w-none lg:flex lg:gap-10">
            {/* Table of Contents (desktop sidebar) */}
            {headings.length >= 3 && (
              <aside className="hidden lg:block lg:w-56 lg:shrink-0 lg:self-start lg:sticky lg:top-20">
                <nav aria-label="Table of contents">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    On this page
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className={`block text-sm text-gray-600 hover:text-primary-600 transition-colors ${heading.level === 3 ? "pl-3" : ""}`}
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            {/* Main content */}
            <div className="mx-auto max-w-3xl flex-1 min-w-0">
              {/* Mobile ToC */}
              {headings.length >= 3 && (
                <details className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 lg:hidden">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    Table of Contents
                  </summary>
                  <nav aria-label="Table of contents" className="mt-3">
                    <ul className="space-y-2">
                      {headings.map((heading) => (
                        <li key={heading.id}>
                          <a
                            href={`#${heading.id}`}
                            className={`block text-sm text-gray-600 hover:text-primary-600 transition-colors ${heading.level === 3 ? "pl-3" : ""}`}
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </details>
              )}

              {/* Body */}
              <BlogBody body={post.body} />
            </div>

            {/* Spacer for symmetry when ToC is present */}
            {headings.length >= 3 && (
              <div className="hidden lg:block lg:w-56 lg:shrink-0" aria-hidden="true" />
            )}
          </div>

          {/* Footer */}
          <footer className="mt-14 mx-auto max-w-3xl border-t border-gray-200 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Link
                href="/blog"
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
                Back to blog
              </Link>

              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Browse providers
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </>
  );
}
