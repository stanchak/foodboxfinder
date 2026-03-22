"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  PREP_STYLE_GROUPS,
  MODEL_TYPE_GROUPS,
  HOUSEHOLD_FIT_VALUES,
  GEOGRAPHY_GROUPS,
  VALUE_TIER_SLUGS,
  SORT_OPTIONS,
  DIETARY_TAG_OPTIONS,
  VALUE_TIER_LABELS,
} from "@/lib/filter-constants";

// --- Label Formatting ---

function formatFilterLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// --- Sort Option Labels ---

const SORT_LABELS: Record<string, string> = {
  featured: "Featured",
  rating: "Highest Rated",
  "name-asc": "Name (A-Z)",
  "value-tier": "Value Tier",
};

// --- Filter Param Keys ---

const FILTER_PARAM_KEYS = ["diet", "prep", "valueTier", "household", "model", "geo"] as const;

// --- Active Filter Chips ---

export function ActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Collect all active filters
  const activeFilters: Array<{ key: string; value: string; label: string }> = [];

  // Diet tags (multi-select)
  const dietParam = searchParams.get("diet");
  if (dietParam) {
    const tags = dietParam.split(",").filter(Boolean);
    for (const tag of tags) {
      const option = DIETARY_TAG_OPTIONS.find((o) => o.value === tag);
      activeFilters.push({
        key: "diet",
        value: tag,
        label: option?.label ?? formatFilterLabel(tag),
      });
    }
  }

  // Prep style (single-select)
  const prepParam = searchParams.get("prep");
  if (prepParam && prepParam in PREP_STYLE_GROUPS) {
    const group = PREP_STYLE_GROUPS[prepParam as keyof typeof PREP_STYLE_GROUPS];
    activeFilters.push({ key: "prep", value: prepParam, label: group.label });
  }

  // Value tier (single-select)
  const valueTierParam = searchParams.get("valueTier");
  if (valueTierParam && valueTierParam in VALUE_TIER_SLUGS) {
    activeFilters.push({
      key: "valueTier",
      value: valueTierParam,
      label: VALUE_TIER_LABELS[valueTierParam] ?? formatFilterLabel(valueTierParam),
    });
  }

  // Household fit (single-select)
  const householdParam = searchParams.get("household");
  if (householdParam && (HOUSEHOLD_FIT_VALUES as readonly string[]).includes(householdParam)) {
    activeFilters.push({
      key: "household",
      value: householdParam,
      label: formatFilterLabel(householdParam),
    });
  }

  // Model type (single-select)
  const modelParam = searchParams.get("model");
  if (modelParam && modelParam in MODEL_TYPE_GROUPS) {
    const group = MODEL_TYPE_GROUPS[modelParam as keyof typeof MODEL_TYPE_GROUPS];
    activeFilters.push({ key: "model", value: modelParam, label: group.label });
  }

  // Geography (single-select)
  const geoParam = searchParams.get("geo");
  if (geoParam && geoParam in GEOGRAPHY_GROUPS) {
    const group = GEOGRAPHY_GROUPS[geoParam as keyof typeof GEOGRAPHY_GROUPS];
    activeFilters.push({ key: "geo", value: geoParam, label: group.label });
  }

  if (activeFilters.length === 0) return null;

  function removeFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "diet") {
      // Remove specific tag from comma-separated list
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

  function handleClearAll() {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {activeFilters.map((filter) => (
        <span
          key={`${filter.key}-${filter.value}`}
          className="inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 ring-1 ring-inset ring-primary-600/20"
        >
          {filter.label}
          <button
            type="button"
            onClick={() => removeFilter(filter.key, filter.value)}
            className="ml-0.5 inline-flex items-center rounded-full p-0.5 hover:bg-primary-100 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={handleClearAll}
        className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

// --- Main Component ---

export default function CategoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasDrawerOpenRef = useRef(false);

  // Focus trap and Escape handler for mobile drawer
  useEffect(() => {
    if (!drawerOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    // Focus the close button on open
    const closeBtn = drawer.querySelector<HTMLElement>("button[aria-label='Close filters']");
    closeBtn?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        return;
      }

      if (e.key === "Tab") {
        const focusableElements = drawer!.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  // Return focus to trigger button on close
  useEffect(() => {
    if (wasDrawerOpenRef.current && !drawerOpen) {
      triggerRef.current?.focus();
    }
    wasDrawerOpenRef.current = drawerOpen;
  }, [drawerOpen]);

  // Compute active filter count from URL
  const activeFilterCount = (() => {
    let count = 0;
    const dietParam = searchParams.get("diet");
    if (dietParam) {
      count += dietParam.split(",").filter(Boolean).length;
    }
    for (const key of FILTER_PARAM_KEYS) {
      if (key === "diet") continue;
      if (searchParams.get(key)) count++;
    }
    return count;
  })();

  // Read current values from URL
  const currentDiet = searchParams.get("diet");
  const currentSort = searchParams.get("sort") ?? "featured";
  const currentPrep = searchParams.get("prep") ?? "";
  const currentValueTier = searchParams.get("valueTier") ?? "";
  const currentHousehold = searchParams.get("household") ?? "";
  const currentModel = searchParams.get("model") ?? "";
  const currentGeo = searchParams.get("geo") ?? "";

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
    updateParams({ sort: value === "featured" ? null : value });
  }

  function handleSingleSelect(paramKey: string, newValue: string, currentValue: string) {
    updateParams({ [paramKey]: newValue === currentValue ? null : newValue });
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
            <option key={opt} value={opt}>
              {SORT_LABELS[opt]}
            </option>
          ))}
        </select>
      </div>

      {/* Dietary Preferences */}
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

      {/* Prep Style */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Prep Style
        </legend>
        <div className="space-y-2">
          {Object.entries(PREP_STYLE_GROUPS).map(([key, group]) => (
            <label
              key={key}
              className="flex items-center gap-2.5 cursor-pointer group/check"
            >
              <input
                type="checkbox"
                checked={currentPrep === key}
                onChange={() => handleSingleSelect("prep", key, currentPrep)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-1"
              />
              <span className="text-sm text-gray-700 group-hover/check:text-gray-900">
                {group.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Value Tier */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Value Tier
        </legend>
        <div className="space-y-2">
          {Object.keys(VALUE_TIER_SLUGS).map((key) => (
            <label
              key={key}
              className="flex items-center gap-2.5 cursor-pointer group/check"
            >
              <input
                type="checkbox"
                checked={currentValueTier === key}
                onChange={() => handleSingleSelect("valueTier", key, currentValueTier)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-1"
              />
              <span className="text-sm text-gray-700 group-hover/check:text-gray-900">
                {VALUE_TIER_LABELS[key]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Household Fit */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Household Fit
        </legend>
        <div className="space-y-2">
          {HOUSEHOLD_FIT_VALUES.map((value) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer group/check"
            >
              <input
                type="checkbox"
                checked={currentHousehold === value}
                onChange={() => handleSingleSelect("household", value, currentHousehold)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-1"
              />
              <span className="text-sm text-gray-700 group-hover/check:text-gray-900">
                {formatFilterLabel(value)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Model Type */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Model Type
        </legend>
        <div className="space-y-2">
          {Object.entries(MODEL_TYPE_GROUPS).map(([key, group]) => (
            <label
              key={key}
              className="flex items-center gap-2.5 cursor-pointer group/check"
            >
              <input
                type="checkbox"
                checked={currentModel === key}
                onChange={() => handleSingleSelect("model", key, currentModel)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-1"
              />
              <span className="text-sm text-gray-700 group-hover/check:text-gray-900">
                {group.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Geography */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Geography
        </legend>
        <div className="space-y-2">
          {Object.entries(GEOGRAPHY_GROUPS).map(([key, group]) => (
            <label
              key={key}
              className="flex items-center gap-2.5 cursor-pointer group/check"
            >
              <input
                type="checkbox"
                checked={currentGeo === key}
                onChange={() => handleSingleSelect("geo", key, currentGeo)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-1"
              />
              <span className="text-sm text-gray-700 group-hover/check:text-gray-900">
                {group.label}
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
          ref={triggerRef}
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
            ref={drawerRef}
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
