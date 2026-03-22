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
import { CATEGORY_NAV_ITEMS } from "@/lib/categories";

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

const FILTER_PARAM_KEYS = [
  "diet",
  "prep",
  "valueTier",
  "household",
  "model",
  "geo",
  "freeShipping",
] as const;

// --- Chevron Icon ---

function ChevronIcon({ expanded }: Readonly<{ expanded: boolean }>) {
  return (
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
      className={`shrink-0 w-4 h-4 text-neutral-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// --- Active Filter Chips (exported separately for results column) ---

export function UnifiedActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Collect all active filters
  const activeFilters: Array<{ key: string; value: string; label: string }> = [];

  // Category filter chip
  const categoryParam = searchParams.get("category");
  if (categoryParam) {
    const navItem = CATEGORY_NAV_ITEMS.find((item) => item.slug === categoryParam);
    if (navItem) {
      activeFilters.push({
        key: "category",
        value: categoryParam,
        label: navItem.label,
      });
    }
  }

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

  // Free shipping
  const freeShippingParam = searchParams.get("freeShipping");
  if (freeShippingParam === "1") {
    activeFilters.push({
      key: "freeShipping",
      value: "1",
      label: "Free Shipping",
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
    // Keep only q param if present
    const q = searchParams.get("q");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => {
      router.push(url, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {activeFilters.map((filter) => (
        <span
          key={`${filter.key}-${filter.value}`}
          className="inline-flex items-center gap-1 rounded-full bg-primary-600 text-white text-base font-medium px-4 py-2"
        >
          {filter.label}
          <button
            type="button"
            onClick={() => removeFilter(filter.key, filter.value)}
            className="ml-0.5 inline-flex items-center rounded-full p-1 hover:bg-primary-500 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
        className="text-base font-medium text-primary-600 hover:text-primary-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
      >
        Clear all
      </button>
    </div>
  );
}

// --- Main Component ---

export default function UnifiedFilters({
  totalCount,
}: Readonly<{
  totalCount: number;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasSheetOpenRef = useRef(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(["model", "geo"]),
  );

  function toggleGroup(group: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  // Focus trap and Escape handler for mobile bottom sheet
  useEffect(() => {
    if (!sheetOpen) return;

    const sheet = sheetRef.current;
    if (!sheet) return;

    // Focus the close button on open
    const closeBtn = sheet.querySelector<HTMLElement>(
      "button[aria-label='Close filters']",
    );
    closeBtn?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSheetOpen(false);
        return;
      }

      if (e.key === "Tab") {
        const focusableElements = sheet!.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
  }, [sheetOpen]);

  // Return focus to trigger button on close
  useEffect(() => {
    if (wasSheetOpenRef.current && !sheetOpen) {
      triggerRef.current?.focus();
    }
    wasSheetOpenRef.current = sheetOpen;
  }, [sheetOpen]);

  // Body scroll lock
  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

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
  const freeShippingActive = searchParams.get("freeShipping") === "1";

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

  function handleSingleSelect(
    paramKey: string,
    newValue: string,
    currentValue: string,
  ) {
    updateParams({ [paramKey]: newValue === currentValue ? null : newValue });
  }

  function toggleFreeShipping() {
    updateParams({ freeShipping: freeShippingActive ? null : "1" });
  }

  function handleClearAll() {
    // Keep only q param if present
    const q = searchParams.get("q");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => {
      router.push(url, { scroll: false });
    });
  }

  const filterContent = (
    <div className="space-y-6 divide-y divide-neutral-100">
      {/* Sort */}
      <div>
        <label
          htmlFor="sort-select"
          className="block text-base font-medium text-neutral-700"
        >
          Sort By
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-base text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {SORT_LABELS[opt]}
            </option>
          ))}
        </select>
      </div>

      {/* Dietary Preferences (Tier 1 — multi-select chips) */}
      <fieldset className="pt-6">
        <legend className="contents">
          <button
            type="button"
            onClick={() => toggleGroup("diet")}
            className="flex w-full items-center justify-between text-base font-medium text-neutral-700 mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
            aria-expanded={!collapsedGroups.has("diet")}
          >
            Dietary Preferences
            <ChevronIcon expanded={!collapsedGroups.has("diet")} />
          </button>
        </legend>
        {!collapsedGroups.has("diet") && (
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAG_OPTIONS.map((option) => {
              const selected = activeDietaryTags.has(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleDietaryToggle(option.value)}
                  className={`inline-flex items-center min-h-[48px] px-4 py-2.5 rounded-xl border-2 text-base font-medium transition-colors ${
                    selected
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                  }`}
                  aria-pressed={selected}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      {/* Prep Style (Tier 1 — single-select chips) */}
      <fieldset className="pt-6">
        <legend className="contents">
          <button
            type="button"
            onClick={() => toggleGroup("prep")}
            className="flex w-full items-center justify-between text-base font-medium text-neutral-700 mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
            aria-expanded={!collapsedGroups.has("prep")}
          >
            Prep Style
            <ChevronIcon expanded={!collapsedGroups.has("prep")} />
          </button>
        </legend>
        {!collapsedGroups.has("prep") && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(PREP_STYLE_GROUPS).map(([key, group]) => {
              const selected = currentPrep === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    handleSingleSelect("prep", key, currentPrep)
                  }
                  className={`inline-flex items-center min-h-[48px] px-4 py-2.5 rounded-xl border-2 text-base font-medium transition-colors ${
                    selected
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                  }`}
                  aria-pressed={selected}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      {/* Value Tier (Tier 1 — 2x2 grid) */}
      <fieldset className="pt-6">
        <legend className="contents">
          <button
            type="button"
            onClick={() => toggleGroup("valueTier")}
            className="flex w-full items-center justify-between text-base font-medium text-neutral-700 mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
            aria-expanded={!collapsedGroups.has("valueTier")}
          >
            Value Tier
            <ChevronIcon expanded={!collapsedGroups.has("valueTier")} />
          </button>
        </legend>
        {!collapsedGroups.has("valueTier") && (
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(VALUE_TIER_SLUGS).map((key) => {
              const selected = currentValueTier === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    handleSingleSelect("valueTier", key, currentValueTier)
                  }
                  className={`inline-flex items-center justify-center min-h-[48px] px-4 py-2.5 rounded-xl border-2 text-base font-medium transition-colors ${
                    selected
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                  }`}
                  aria-pressed={selected}
                >
                  {VALUE_TIER_LABELS[key]}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      {/* Household Fit (Tier 2 — chips) */}
      <fieldset className="pt-6">
        <legend className="contents">
          <button
            type="button"
            onClick={() => toggleGroup("household")}
            className="flex w-full items-center justify-between text-base font-medium text-neutral-700 mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
            aria-expanded={!collapsedGroups.has("household")}
          >
            Household Fit
            <ChevronIcon expanded={!collapsedGroups.has("household")} />
          </button>
        </legend>
        {!collapsedGroups.has("household") && (
          <div className="flex flex-wrap gap-2">
            {HOUSEHOLD_FIT_VALUES.map((value) => {
              const selected = currentHousehold === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    handleSingleSelect("household", value, currentHousehold)
                  }
                  className={`inline-flex items-center min-h-[48px] px-4 py-2.5 rounded-xl border-2 text-base font-medium transition-colors ${
                    selected
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                  }`}
                  aria-pressed={selected}
                >
                  {formatFilterLabel(value)}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      {/* Free Shipping (Tier 2 — toggle switch) */}
      <div className="pt-6">
        <div className="flex items-center justify-between min-h-[48px]">
          <span className="text-base font-medium text-neutral-700">
            Free Shipping Only
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={freeShippingActive}
            onClick={toggleFreeShipping}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
              freeShippingActive ? "bg-primary-600" : "bg-neutral-200"
            }`}
          >
            <span className="sr-only">Toggle free shipping</span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                freeShippingActive ? "translate-x-5" : "translate-x-0"
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Model Type (Tier 3 — collapsible radio group) */}
      <fieldset className="pt-6">
        <legend className="contents">
          <button
            type="button"
            onClick={() => toggleGroup("model")}
            className="flex w-full items-center justify-between text-base font-medium text-neutral-700 mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
            aria-expanded={!collapsedGroups.has("model")}
          >
            Model Type
            <ChevronIcon expanded={!collapsedGroups.has("model")} />
          </button>
        </legend>
        {!collapsedGroups.has("model") && (
          <div className="space-y-2">
            {Object.entries(MODEL_TYPE_GROUPS).map(([key, group]) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer group/check min-h-[44px] rounded-lg px-2 -mx-2 hover:bg-neutral-50 transition-colors"
              >
                <input
                  type="radio"
                  name="model"
                  checked={currentModel === key}
                  onChange={() =>
                    handleSingleSelect("model", key, currentModel)
                  }
                  className="h-5 w-5 border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-1"
                />
                <span className="text-base text-neutral-700 group-hover/check:text-neutral-900">
                  {group.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {/* Geography (Tier 3 — collapsible radio group) */}
      <fieldset className="pt-6">
        <legend className="contents">
          <button
            type="button"
            onClick={() => toggleGroup("geo")}
            className="flex w-full items-center justify-between text-base font-medium text-neutral-700 mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
            aria-expanded={!collapsedGroups.has("geo")}
          >
            Geography
            <ChevronIcon expanded={!collapsedGroups.has("geo")} />
          </button>
        </legend>
        {!collapsedGroups.has("geo") && (
          <div className="space-y-2">
            {Object.entries(GEOGRAPHY_GROUPS).map(([key, group]) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer group/check min-h-[44px] rounded-lg px-2 -mx-2 hover:bg-neutral-50 transition-colors"
              >
                <input
                  type="radio"
                  name="geo"
                  checked={currentGeo === key}
                  onChange={() => handleSingleSelect("geo", key, currentGeo)}
                  className="h-5 w-5 border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-1"
                />
                <span className="text-base text-neutral-700 group-hover/check:text-neutral-900">
                  {group.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {/* Clear All Filters */}
      {activeFilterCount > 0 && (
        <div className="pt-6">
          <button
            type="button"
            onClick={handleClearAll}
            className="w-full rounded-full border border-neutral-300 px-4 py-2.5 text-base font-medium text-neutral-700 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Clear All Filters
          </button>
        </div>
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
        className="hidden lg:block w-80 shrink-0"
        aria-label="Filter providers"
      >
        <div className="sticky top-20 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">Filters</h2>
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-base font-medium text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    Clear All ({activeFilterCount})
                  </button>
                </div>
              )}
            </div>
            {filterContent}
          </div>
        </div>
      </aside>

      {/* Mobile filter trigger button */}
      <div className="lg:hidden">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setSheetOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-base font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
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

      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/30 lg:hidden"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom sheet panel */}
          <div
            ref={sheetRef}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-xl max-h-[85vh] flex flex-col lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Filter providers"
          >
            {/* Drag handle */}
            <div className="mx-auto mt-3 mb-2 h-1.5 w-10 rounded-full bg-neutral-300" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="p-2 text-neutral-500 hover:text-neutral-700 transition-colors"
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

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {filterContent}
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 border-t border-neutral-200 bg-white p-4 flex gap-3">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleClearAll();
                    setSheetOpen(false);
                  }}
                  className="flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-base font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="flex-1 rounded-full bg-primary-600 px-4 py-2.5 text-base font-medium text-white hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Show {totalCount} Result{totalCount !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
