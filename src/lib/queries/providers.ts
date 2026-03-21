import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { CategoryType, DietaryTag } from "@/generated/prisma/client";

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
    include: {
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
