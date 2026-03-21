"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { DietaryTag } from "@/generated/prisma/client";

const DIETARY_TAG_OPTIONS: Array<{ value: DietaryTag; label: string }> = [
  { value: "VEGAN", label: "Vegan" },
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "PESCATARIAN", label: "Pescatarian" },
  { value: "KETO", label: "Keto" },
  { value: "PALEO", label: "Paleo" },
  { value: "GLUTEN_FREE", label: "Gluten Free" },
  { value: "DAIRY_FREE", label: "Dairy Free" },
  { value: "NUT_FREE", label: "Nut Free" },
  { value: "LOW_CARB", label: "Low Carb" },
  { value: "LOW_SODIUM", label: "Low Sodium" },
  { value: "ORGANIC", label: "Organic" },
  { value: "HALAL", label: "Halal" },
  { value: "KOSHER", label: "Kosher" },
  { value: "DIABETIC_FRIENDLY", label: "Diabetic Friendly" },
  { value: "WHOLE30", label: "Whole30" },
  { value: "MEDITERRANEAN", label: "Mediterranean" },
];

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "rating", label: "Highest Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "reviews", label: "Most Reviewed" },
  { value: "newest", label: "Newest" },
];

const RATING_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Any Rating" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "2", label: "2+ Stars" },
];

// --- Active Filter Chips ---

const FILTER_LABELS: Record<string, string> = {
  diet: "Diet",
  minPrice: "Min Price",
  maxPrice: "Max Price",
  rating: "Min Rating",
  sort: "Sort",
  prep: "Prep Style",
  valueTier: "Value Tier",
  household: "Household",
  model: "Model",
  geo: "Geography",
  status: "Status",
};

export function ActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Collect active filters (skip page/pageSize)
  const activeFilters: Array<{ key: string; label: string; value: string }> = [];
  searchParams.forEach((value, key) => {
    if (key === "page" || key === "pageSize") return;
    const label = FILTER_LABELS[key] ?? key;
    if (key === "diet") {
      // Split comma-separated diet tags into individual chips
      const tags = value.split(",").filter(Boolean);
      for (const tag of tags) {
        const tagLabel = DIETARY_TAG_OPTIONS.find((o) => o.value === tag)?.label ?? tag;
        activeFilters.push({ key, label: tagLabel, value: tag });
      }
    } else {
      activeFilters.push({ key, label: `${label}: ${value}`, value });
    }
  });

  if (activeFilters.length === 0) return null;

  function removeFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "diet") {
      const current = params.get("diet");
      if (current) {
        const tags = current.split(",").filter((t) => t !== value);
        if (tags.length > 0) {
          params.set("diet", tags.join(","));
        } else {
          params.delete("diet");
        }
      }
    } else {
      params.delete(key);
    }
    params.delete("page");
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => {
      router.push(url, { scroll: false });
    });
  }

  function clearAll() {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {activeFilters.map((filter, i) => (
        <button
          key={`${filter.key}-${filter.value}-${i}`}
          type="button"
          onClick={() => removeFilter(filter.key, filter.value)}
          className="inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-700 px-3 py-1 text-xs font-medium hover:bg-primary-100 transition-colors"
          aria-label={`Remove filter: ${filter.label}`}
        >
          {filter.label}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs text-gray-500 hover:text-gray-700 transition-colors underline"
      >
        Clear all
      </button>
    </div>
  );
}

// --- Category Filters Sidebar ---

export default function CategoryFilters({
  activeFilterCount,
}: Readonly<{
  activeFilterCount: number;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Read current values from URL
  const currentDiet = searchParams.get("diet");
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";
  const currentRating = searchParams.get("rating") ?? "";
  const currentSort = searchParams.get("sort") ?? "rating";

  const activeDietaryTags: Set<string> = new Set(
    currentDiet ? currentDiet.split(",") : [],
  );

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    // Reset to page 1 when filters change
    params.delete("page");

    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;

    startTransition(() => {
      router.push(url, { scroll: false });
    });
  }

  function handleDietaryToggle(tag: string) {
    const newTags = new Set(activeDietaryTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    const dietValue = newTags.size > 0 ? Array.from(newTags).join(",") : null;
    updateParams({ diet: dietValue });
  }

  function handleSortChange(value: string) {
    updateParams({ sort: value === "rating" ? null : value });
  }

  function handleRatingChange(value: string) {
    updateParams({ rating: value || null });
  }

  function handlePriceChange(field: "minPrice" | "maxPrice", value: string) {
    // Convert dollars to cents for URL
    const trimmed = value.trim();
    if (trimmed === "" || isNaN(Number(trimmed))) {
      updateParams({ [field]: null });
    } else {
      const cents = Math.round(Number(trimmed) * 100);
      updateParams({ [field]: String(cents) });
    }
  }

  function handleClearAll() {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  const filterContent = (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <label
          htmlFor="sort-select"
          className="block text-sm font-medium text-gray-700"
        >
          Sort By
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div>
        <label
          htmlFor="rating-select"
          className="block text-sm font-medium text-gray-700"
        >
          Minimum Rating
        </label>
        <select
          id="rating-select"
          value={currentRating}
          onChange={(e) => handleRatingChange(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {RATING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700">
          Price Range (per serving)
        </legend>
        <div className="mt-1 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              $
            </span>
            <input
              type="number"
              id="min-price"
              min="0"
              step="0.50"
              placeholder="Min"
              aria-label="Minimum price per serving in dollars"
              defaultValue={
                currentMinPrice ? (Number(currentMinPrice) / 100).toFixed(2) : ""
              }
              onBlur={(e) => handlePriceChange("minPrice", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePriceChange(
                    "minPrice",
                    (e.target as HTMLInputElement).value,
                  );
                }
              }}
              className="block w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <span className="text-gray-400" aria-hidden="true">
            -
          </span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              $
            </span>
            <input
              type="number"
              id="max-price"
              min="0"
              step="0.50"
              placeholder="Max"
              aria-label="Maximum price per serving in dollars"
              defaultValue={
                currentMaxPrice ? (Number(currentMaxPrice) / 100).toFixed(2) : ""
              }
              onBlur={(e) => handlePriceChange("maxPrice", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePriceChange(
                    "maxPrice",
                    (e.target as HTMLInputElement).value,
                  );
                }
              }}
              className="block w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </fieldset>

      {/* Dietary Tags */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Dietary Preferences
        </legend>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {DIETARY_TAG_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2.5 cursor-pointer group/check"
            >
              <input
                type="checkbox"
                checked={activeDietaryTags.has(option.value)}
                onChange={() => handleDietaryToggle(option.value)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-1"
              />
              <span className="text-sm text-gray-700 group-hover/check:text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Loading indicator */}
      {isPending && (
        <div className="fixed top-16 left-0 right-0 z-50 h-0.5 bg-primary-100">
          <div className="h-full bg-primary-500 animate-pulse w-full" />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block w-64 shrink-0"
        aria-label="Filter providers"
      >
        <div className="sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile filter trigger button */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          aria-label="Open filters"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary-600 text-white text-xs font-medium h-5 w-5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/30 lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Filter providers"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close filters"
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-4">{filterContent}</div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                Show Results
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
