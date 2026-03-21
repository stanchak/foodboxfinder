// Client-safe filter constants extracted from filters.ts.
// This file has NO "server-only" guard so it can be imported by client components.
// Server-side code should continue importing from @/lib/filters (which re-exports these).

import type { ValueTier } from "@/generated/prisma/client";

// --- Known Value Groups for String Fields ---

export const PREP_STYLE_GROUPS = {
  "cook-it-yourself": {
    slug: "cook-it-yourself",
    label: "Cook-It-Yourself",
    matchPattern: "cook-it-yourself",
  },
  "prepared": {
    slug: "prepared",
    label: "Prepared Meals",
    matchPattern: "prepared",
  },
  "raw-protein": {
    slug: "raw-protein",
    label: "Raw Protein",
    matchPattern: "raw-protein",
  },
  "snacks": {
    slug: "snacks",
    label: "Snacks",
    matchPattern: "snack",
  },
  "produce-box": {
    slug: "produce-box",
    label: "Produce Box",
    matchPattern: "produce",
  },
  "coffee": {
    slug: "coffee",
    label: "Coffee",
    matchPattern: "coffee",
  },
  "tea": {
    slug: "tea",
    label: "Tea",
    matchPattern: "tea",
  },
  "specialty": {
    slug: "specialty",
    label: "Specialty",
    matchPattern: "specialty",
  },
} as const;

export const MODEL_TYPE_GROUPS = {
  "subscription": {
    slug: "subscription",
    label: "Subscription",
    matchPattern: "subscription-first",
  },
  "store": {
    slug: "store",
    label: "Store-First",
    matchPattern: "store-first",
  },
  "hybrid": {
    slug: "hybrid",
    label: "Hybrid",
    matchPattern: "hybrid",
  },
  "marketplace": {
    slug: "marketplace",
    label: "Marketplace",
    matchPattern: "marketplace",
  },
  "gift-club": {
    slug: "gift-club",
    label: "Gift Club / Other",
    matchPattern: "gift-club",
  },
} as const;

export const HOUSEHOLD_FIT_VALUES = [
  "single-serve",
  "couples",
  "family",
  "freezer-stocking",
  "gifting",
] as const;

export const GEOGRAPHY_GROUPS = {
  "national": {
    slug: "national",
    label: "National (US)",
    matchPattern: "national-us",
  },
  "regional": {
    slug: "regional",
    label: "Regional",
    matchPattern: "regional",
  },
  "multi-market": {
    slug: "multi-market",
    label: "Multi-Market",
    matchPattern: "multi-market",
  },
} as const;

// --- Value Tier Slug Map ---

export const VALUE_TIER_SLUGS: Record<string, ValueTier> = {
  "budget": "BUDGET",
  "mid": "MID",
  "premium": "PREMIUM",
  "luxury": "LUXURY",
};

// --- Sort Options ---

export const SORT_OPTIONS = ["featured", "rating", "name-asc", "value-tier"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

// --- Dietary Tag Options ---

export const DIETARY_TAG_OPTIONS: Array<{ value: string; label: string }> = [
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

// --- Value Tier Labels ---

export const VALUE_TIER_LABELS: Record<string, string> = {
  "budget": "Budget",
  "mid": "Mid-Range",
  "premium": "Premium",
  "luxury": "Luxury",
};
