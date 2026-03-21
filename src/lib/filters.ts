import "server-only";
import type {
  CategoryType,
  DietaryTag,
  ValueTier,
  ProviderStatus,
} from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { getCategoryBySlug } from "@/lib/categories";

// --- Known Value Groups for String Fields ---

// Groups the 37 distinct prepStyle values into ~8 broad filter categories.
// The `matchPattern` is used in a Prisma `contains` search against the database value.
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

// Groups the 11 distinct modelType values into ~5 broad filter categories.
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

// Direct const array of known household fit values.
// Pipe-delimited database values like "gifting|family" match via `contains`.
export const HOUSEHOLD_FIT_VALUES = [
  "single-serve",
  "couples",
  "family",
  "freezer-stocking",
  "gifting",
] as const;

// Groups the 8 distinct geography values into ~3 broad filter categories.
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

// --- Filter Types ---

export interface ProviderFilters {
  category?: CategoryType;
  dietaryTags: DietaryTag[];
  prepStyle?: string;
  valueTier?: ValueTier;
  householdFit?: string;
  modelType?: string;
  geography?: string;
  status: ProviderStatus[];
  sortBy: SortOption;
  page: number;
  pageSize: number;
}

// --- Helpers ---

/**
 * Converts a URL search param value (string | string[] | undefined) to a string array.
 * Handles multi-value URL params like `?diet=VEGAN&diet=KETO`.
 */
export function asArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

// Valid DietaryTag values for validation
const VALID_DIETARY_TAGS = new Set<string>([
  "VEGAN", "VEGETARIAN", "PESCATARIAN", "KETO", "PALEO",
  "GLUTEN_FREE", "DAIRY_FREE", "NUT_FREE", "LOW_CARB", "LOW_SODIUM",
  "ORGANIC", "HALAL", "KOSHER", "DIABETIC_FRIENDLY", "WHOLE30", "MEDITERRANEAN",
]);

// Valid ProviderStatus values for validation
const VALID_STATUSES = new Set<string>([
  "ACTIVE", "HYBRID", "UNCLEAR", "DISCONTINUED",
]);

// --- Parser ---

/**
 * Parses raw URL search params into a typed, validated ProviderFilters object.
 * Invalid or missing values silently fall back to safe defaults -- never throws.
 */
export function parseProviderFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ProviderFilters {
  // Category: look up via getCategoryBySlug
  const categoryParam = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const categoryMatch = categoryParam ? getCategoryBySlug(categoryParam) : undefined;
  const category = categoryMatch?.key;

  // Dietary tags: validate each value against DietaryTag enum keys
  const dietaryTags = asArray(searchParams.diet)
    .filter((v) => VALID_DIETARY_TAGS.has(v))
    .map((v) => v as DietaryTag);

  // Prep style: validate against PREP_STYLE_GROUPS keys
  const prepParam = typeof searchParams.prep === "string" ? searchParams.prep : undefined;
  const prepGroup = prepParam && prepParam in PREP_STYLE_GROUPS
    ? PREP_STYLE_GROUPS[prepParam as keyof typeof PREP_STYLE_GROUPS]
    : undefined;
  const prepStyle = prepGroup?.matchPattern;

  // Value tier: look up in VALUE_TIER_SLUGS
  const valueTierParam = typeof searchParams.valueTier === "string" ? searchParams.valueTier : undefined;
  const valueTier = valueTierParam ? VALUE_TIER_SLUGS[valueTierParam] : undefined;

  // Household fit: validate against HOUSEHOLD_FIT_VALUES
  const householdParam = typeof searchParams.household === "string" ? searchParams.household : undefined;
  const householdFit = householdParam && (HOUSEHOLD_FIT_VALUES as readonly string[]).includes(householdParam)
    ? householdParam
    : undefined;

  // Model type: validate against MODEL_TYPE_GROUPS keys
  const modelParam = typeof searchParams.model === "string" ? searchParams.model : undefined;
  const modelGroup = modelParam && modelParam in MODEL_TYPE_GROUPS
    ? MODEL_TYPE_GROUPS[modelParam as keyof typeof MODEL_TYPE_GROUPS]
    : undefined;
  const modelType = modelGroup?.matchPattern;

  // Geography: validate against GEOGRAPHY_GROUPS keys
  const geoParam = typeof searchParams.geo === "string" ? searchParams.geo : undefined;
  const geoGroup = geoParam && geoParam in GEOGRAPHY_GROUPS
    ? GEOGRAPHY_GROUPS[geoParam as keyof typeof GEOGRAPHY_GROUPS]
    : undefined;
  const geography = geoGroup?.matchPattern;

  // Status: validate each value, default to ["ACTIVE", "HYBRID"]
  const statusValues = asArray(searchParams.status)
    .filter((v) => VALID_STATUSES.has(v))
    .map((v) => v as ProviderStatus);
  const status: ProviderStatus[] = statusValues.length > 0
    ? statusValues
    : ["ACTIVE", "HYBRID"];

  // Sort: validate against SORT_OPTIONS, default to "featured"
  const sortParam = typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const sortBy: SortOption = sortParam && (SORT_OPTIONS as readonly string[]).includes(sortParam)
    ? (sortParam as SortOption)
    : "featured";

  // Page: parse as integer, clamp to >= 1, default 1
  const pageParam = typeof searchParams.page === "string" ? searchParams.page : undefined;
  const parsedPage = pageParam ? parseInt(pageParam, 10) : NaN;
  const page = !isNaN(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  // Page size: parse as integer, clamp to 1-48, default 12
  const pageSizeParam = typeof searchParams.pageSize === "string" ? searchParams.pageSize : undefined;
  const parsedPageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : NaN;
  const pageSize = !isNaN(parsedPageSize) && parsedPageSize >= 1 && parsedPageSize <= 48
    ? parsedPageSize
    : 12;

  return {
    category,
    dietaryTags,
    prepStyle,
    valueTier,
    householdFit,
    modelType,
    geography,
    status,
    sortBy,
    page,
    pageSize,
  };
}

// --- Null-Aware Filter Helpers ---

/**
 * Creates a Prisma where clause for a nullable string field using `contains` matching.
 * Providers with null or empty values for the field pass through (null-aware).
 * Returns empty object if no value is provided (no filter applied).
 */
export function nullAwareStringFilter(
  field: string,
  value: string | undefined,
): Prisma.ProviderWhereInput | Record<string, never> {
  if (!value) return {};
  return {
    OR: [
      { [field]: { contains: value, mode: "insensitive" as const } },
      { [field]: null },
      { [field]: "" },
    ],
  };
}

/**
 * Creates a Prisma where clause for a nullable enum field using exact matching.
 * Providers with null values for the field pass through (null-aware).
 * Returns empty object if no value is provided (no filter applied).
 */
export function nullAwareEnumFilter(
  field: string,
  value: string | undefined,
): Prisma.ProviderWhereInput | Record<string, never> {
  if (!value) return {};
  return {
    OR: [
      { [field]: value },
      { [field]: null },
    ],
  };
}
