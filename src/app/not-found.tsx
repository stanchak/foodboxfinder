import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SearchInput from "@/components/SearchInput";
import { CATEGORY_MAP } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you are looking for does not exist. Browse food box subscriptions by category or search for what you need.",
};

const categories = Object.values(CATEGORY_MAP);

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      {/* Status */}
      <p className="text-sm font-semibold text-primary-600">404</p>

      {/* Heading */}
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 text-base text-neutral-600">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may
        have been moved or no longer exists.
      </p>

      {/* Search */}
      <div className="mt-8 max-w-md mx-auto">
        <Suspense
          fallback={
            <div className="h-12 w-full rounded-lg bg-neutral-100 animate-pulse" />
          }
        >
          <SearchInput
            autoFocus
            placeholder="Search for food box subscriptions..."
            className="w-full"
          />
        </Suspense>
      </div>

      {/* Category Suggestions */}
      <div className="mt-12">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
          Browse by category
        </h2>
        <nav aria-label="Category navigation" className="mt-4">
          <ul className="flex flex-wrap justify-center gap-3">
            {categories.map(({ slug, label }) => (
              <li key={slug}>
                <Link
                  href={`/${slug}`}
                  className="inline-flex items-center rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Home link */}
      <div className="mt-10">
        <Link
          href="/"
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
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
