import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { CategoryType, DietaryTag } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import type { ProviderFilters, SortOption } from "@/lib/filters";
import { nullAwareStringFilter, nullAwareEnumFilter } from "@/lib/filters";

// -- Category Listing (Phase 40) --

export const getProvidersByCategory = cache(
  async (options: {
    category: CategoryType;
    dietaryTags?: DietaryTag[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: "rating" | "price-asc" | "price-desc" | "reviews" | "newest";
    page?: number;
    pageSize?: number;
  }) => {
    const {
      category,
      dietaryTags,
      minPrice,
      maxPrice,
      minRating,
      sortBy = "rating",
      page = 1,
      pageSize = 12,
    } = options;

    const where = {
      status: "ACTIVE" as const,
      OR: [{ category }, { secondaryCategory: category }],
      ...(dietaryTags?.length && {
        dietaryTags: { some: { tag: { in: dietaryTags } } },
      }),
      ...(minPrice != null && {
        minPricePerServingCents: { gte: minPrice },
      }),
      ...(maxPrice != null && {
        maxPricePerServingCents: { lte: maxPrice },
      }),
      ...(minRating != null && {
        averageRating: { gte: minRating },
      }),
    };

    const orderByMap = {
      rating: { averageRating: "desc" as const },
      "price-asc": { minPricePerServingCents: "asc" as const },
      "price-desc": { maxPricePerServingCents: "desc" as const },
      reviews: { reviewCount: "desc" as const },
      newest: { createdAt: "desc" as const },
    };

    const orderBy = orderByMap[sortBy];

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          dietaryTags: true,
          plans: { where: { active: true, featured: true }, take: 1 },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.provider.count({ where }),
    ]);

    return { providers, total, page, pageSize };
  }
);

// -- Provider Detail (Phase 50) --

export const getProviderBySlug = cache(async (slug: string) => {
  return prisma.provider.findUnique({
    where: { slug },
    include: {
      plans: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      dietaryTags: true,
      faqs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: [{ helpful: "desc" }, { createdAt: "desc" }],
        take: 10,
      },
    },
  });
});

// -- Comparison (Phase 60) --

export const getProvidersForComparison = cache(async (slugs: string[]) => {
  return prisma.provider.findMany({
    where: { slug: { in: slugs }, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      logoUrl: true,
      website: true,
      affiliateUrl: true,
      averageRating: true,
      reviewCount: true,
      minPricePerServingCents: true,
      maxPricePerServingCents: true,
      freeShipping: true,
      category: true,
      secondaryCategory: true,
      // New dataset fields
      prepStyle: true,
      valueTier: true,
      modelType: true,
      householdFit: true,
      geography: true,
      shippingNotes: true,
      flexibility: true,
      prosJson: true,
      consJson: true,
      // Relations
      plans: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      dietaryTags: true,
    },
  });
});

// -- Homepage (Phase 30) --

export const getFeaturedProviders = cache(async () => {
  return prisma.provider.findMany({
    where: { status: "ACTIVE", featured: true },
    include: { dietaryTags: true },
    orderBy: { averageRating: "desc" },
    take: 8,
  });
});

export const getCategoryCounts = cache(async () => {
  return prisma.provider.groupBy({
    by: ["category"],
    where: { status: "ACTIVE" },
    _count: true,
  });
});

// -- SEO / Static Generation --

export const getAllProviderSlugs = cache(async () => {
  return prisma.provider.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true },
  });
});

// -- Related Providers (Phase 50) --

export const getRelatedProviders = cache(
  async (slug: string, category: CategoryType, limit: number = 4) => {
    return prisma.provider.findMany({
      where: {
        status: "ACTIVE",
        slug: { not: slug },
        OR: [{ category }, { secondaryCategory: category }],
      },
      orderBy: { averageRating: "desc" },
      include: { dietaryTags: true },
      take: limit,
    });
  }
);

// -- Filtered Listing (Phase 02 Plan 02) --

/**
 * Multi-dimension filtered provider listing with null-aware handling for sparse fields.
 * Uses Prisma AND array to compose multiple null-aware OR clauses without key collision.
 * Returns paginated results with total count for pagination UI.
 */
export const getFilteredProviders = cache(async (filters: ProviderFilters) => {
  // CRITICAL: Use Prisma AND array to compose multiple null-aware filters.
  // Each null-aware filter produces its own OR clause. Spreading multiple OR keys
  // into a single object would cause later ones to overwrite earlier ones.
  // Instead, each condition is an element of the AND array.

  const conditions: Prisma.ProviderWhereInput[] = [
    // Status filter (always applied)
    { status: { in: filters.status } },
  ];

  // Category filter (optional -- omitted on cross-category pages)
  if (filters.category) {
    conditions.push({
      OR: [
        { category: filters.category },
        { secondaryCategory: filters.category },
      ],
    });
  }

  // Dietary tags (enum via join table -- not null-aware, providers without tags just don't match)
  if (filters.dietaryTags.length > 0) {
    conditions.push({
      dietaryTags: { some: { tag: { in: filters.dietaryTags } } },
    });
  }

  // Null-aware string filters (providers with null/empty values pass through)
  const prepStyleFilter = nullAwareStringFilter("prepStyle", filters.prepStyle);
  if (Object.keys(prepStyleFilter).length > 0) conditions.push(prepStyleFilter);

  const householdFitFilter = nullAwareStringFilter("householdFit", filters.householdFit);
  if (Object.keys(householdFitFilter).length > 0) conditions.push(householdFitFilter);

  const modelTypeFilter = nullAwareStringFilter("modelType", filters.modelType);
  if (Object.keys(modelTypeFilter).length > 0) conditions.push(modelTypeFilter);

  const geoFilter = nullAwareStringFilter("geography", filters.geography);
  if (Object.keys(geoFilter).length > 0) conditions.push(geoFilter);

  // Null-aware enum filter (valueTier)
  const valueTierFilter = nullAwareEnumFilter("valueTier", filters.valueTier);
  if (Object.keys(valueTierFilter).length > 0) conditions.push(valueTierFilter);

  const where: Prisma.ProviderWhereInput = { AND: conditions };

  // Sort mapping
  const orderByMap: Record<SortOption, Prisma.ProviderOrderByWithRelationInput> = {
    featured: { featured: "desc" },
    rating: { averageRating: "desc" },
    "name-asc": { name: "asc" },
    "value-tier": { valueTier: "asc" },
  };

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      include: {
        dietaryTags: true,
        plans: { where: { active: true, featured: true }, take: 1 },
      },
      orderBy: orderByMap[filters.sortBy],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.provider.count({ where }),
  ]);

  return { providers, total, page: filters.page, pageSize: filters.pageSize };
});
