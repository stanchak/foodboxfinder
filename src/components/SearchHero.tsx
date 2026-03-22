"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORY_NAV_ITEMS } from "@/lib/categories";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "meal-kits": (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  ),
  "prepared-meals": (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12h20" /><path d="M20 12c0-4.4-3.6-8-8-8s-8 3.6-8 8" /><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
    </svg>
  ),
  "protein-boxes": (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  ),
  "produce-boxes": (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 21h10" /><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" /><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.13 1.33l-12.4 6.84Z" />
    </svg>
  ),
  "specialty": (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  ),
};

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
            className={`inline-flex items-center gap-2 min-h-[48px] text-base font-bold px-5 py-3 rounded-full transition-colors snap-center shrink-0 ${
              currentCategory === ""
                ? "bg-primary-600 text-white shadow-md"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
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
                className={`inline-flex items-center gap-2 min-h-[48px] text-base font-bold px-5 py-3 rounded-full transition-colors snap-center shrink-0 ${
                  isActive
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {CATEGORY_ICONS[item.slug]}
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
