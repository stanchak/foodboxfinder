"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORY_NAV_ITEMS } from "@/lib/categories";

export default function SearchHero({
  categoryCounts,
  totalCount,
}: Readonly<{
  categoryCounts: Array<{ category: string; _count: number }>;
  totalCount: number;
}>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuery = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  // Controlled input state for search (so it stays in sync during typing)
  const [inputValue, setInputValue] = useState(currentQuery);

  // Sync input value when URL changes externally
  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  function updateUrl(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.push(url, { scroll: false });
  }

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        updateUrl(value);
      }, 400);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, router, pathname],
  );

  function handleSearchSubmit() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    updateUrl(inputValue);
  }

  function handleCategoryClick(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page");
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.push(url, { scroll: false });
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Compute total count for "All" tab from categoryCounts
  const allCount = categoryCounts.reduce((sum, c) => sum + c._count, 0);

  return (
    <div className="bg-gradient-to-b from-primary-50 to-white px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-2xl">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 text-center mb-6">
          Discover Food Box Subscriptions
        </h1>

        {/* Search Bar */}
        <div className="relative">
          <label htmlFor="discover-search" className="sr-only">
            Search providers
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-neutral-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            id="discover-search"
            type="search"
            value={inputValue}
            placeholder="Search by name, cuisine, diet..."
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit();
              }
            }}
            className="block w-full rounded-2xl border border-neutral-200 bg-white py-4 pl-14 pr-32 text-lg text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-lg"
          />
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary-600 px-6 py-3 text-base font-bold text-white hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Category Quick-Filter Tabs */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory">
          {/* All tab */}
          <button
            type="button"
            onClick={() => handleCategoryClick(null)}
            className={`min-h-[48px] text-base font-bold px-5 py-3 rounded-full transition-colors snap-center shrink-0 ${
              currentCategory === ""
                ? "bg-primary-600 text-white shadow-md"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            All ({allCount})
          </button>

          {/* Per-category tabs */}
          {CATEGORY_NAV_ITEMS.map((item) => {
            const countEntry = categoryCounts.find(
              (c) => c.category === item.slug,
            );
            const count = countEntry?._count ?? 0;
            const isActive = currentCategory === item.slug;

            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => handleCategoryClick(item.slug)}
                className={`min-h-[48px] text-base font-bold px-5 py-3 rounded-full transition-colors snap-center shrink-0 ${
                  isActive
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {item.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Result count */}
        <p
          className="text-center text-base text-neutral-600 mt-4"
          aria-live="polite"
        >
          {totalCount} food box subscription{totalCount !== 1 ? "s" : ""} found
        </p>
      </div>
    </div>
  );
}
