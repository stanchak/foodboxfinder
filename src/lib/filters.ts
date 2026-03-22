import "server-only";
import type {
  CategoryType,
  DietaryTag,
  ValueTier,
  ProviderStatus,
} from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { getCategoryBySlug } from "@/lib/categories";

// Re-export client-safe constants from filter-constants.ts.
// Server-side code can continue importing these from @/lib/filters.
// Client components should import directly from @/lib/filter-constants.
export {
  PREP_STYLE_GROUPS,
  MODEL_TYPE_GROUPS,
  HOUSEHOLD_FIT_VALUES,
  GEOGRAPHY_GROUPS,
  VALUE_TIER_SLUGS,
  SORT_OPTIONS,
  DIETARY_TAG_OPTIONS,
  VALUE_TIER_LABELS,
} from "@/lib/filter-constants";
export type { SortOption } from "@/lib/filter-constants";

// Local imports needed for parseProviderFilters
import {
  PREP_STYLE_GROUPS,
  MODEL_TYPE_GROUPS,
  HOUSEHOLD_FIT_VALUES,
  GEOGRAPHY_GROUPS,
  VALUE_TIER_SLUGS,
  SORT_OPTIONS,
} from "@/lib/filter-constants";
import type { SortOption } from "@/lib/filter-constants";

// --- Filter Types ---

export interface ProviderFilters {
  category?: CategoryType;
  dietaryTags: DietaryTag[];
  prepStyle?: string;
  valueTier?: ValueTier;
  householdFit?: string;
  modelType?: string;
  geography?: string;
  textQuery?: string;
  freeShipping?: boolean;
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

  // Page size: parse as integer, clamp to 1-48, default 18
  const pageSizeParam = typeof searchParams.pageSize === "string" ? searchParams.pageSize : undefined;
  const parsedPageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : NaN;
  const pageSize = !isNaN(parsedPageSize) && parsedPageSize >= 1 && parsedPageSize <= 48
    ? parsedPageSize
    : 18;

  // Text query: trim whitespace, treat empty as undefined
  const textQueryParam = typeof searchParams.q === "string" ? searchParams.q.trim() : undefined;
  const textQuery = textQueryParam && textQueryParam.length > 0 ? textQueryParam : undefined;

  // Free shipping: treat "1" as true, anything else as undefined
  const freeShippingParam = typeof searchParams.freeShipping === "string" ? searchParams.freeShipping : undefined;
  const freeShipping = freeShippingParam === "1" ? true : undefined;

  return {
    category,
    dietaryTags,
    prepStyle,
    valueTier,
    householdFit,
    modelType,
    geography,
    textQuery,
    freeShipping,
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
