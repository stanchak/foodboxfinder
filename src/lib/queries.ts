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

// -- Search (Phase 80) --

export const searchProviders = cache(async (query: string) => {
  return prisma.provider.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { dietaryTags: true },
    take: 20,
  });
});

export const searchBlogPosts = cache(async (query: string) => {
  return prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      coverImageUrl: true,
      author: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 10,
  });
});

export const searchCollections = cache(async (query: string) => {
  return prisma.collection.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      title: true,
      slug: true,
      description: true,
      coverImageUrl: true,
      _count: { select: { items: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 10,
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

// -- Admin (Phase 100) --

export const getAdminStats = cache(async () => {
  const [providerCount, reviewCount, pendingReviewCount, affiliateClickCount] =
    await Promise.all([
      prisma.provider.count(),
      prisma.review.count(),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.affiliateClick.count(),
    ]);

  return { providerCount, reviewCount, pendingReviewCount, affiliateClickCount };
});

// -- Affiliate Analytics --

export const getTopAffiliateProviders = cache(
  async (days: number = 30, limit: number = 5) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const clickGroups = await prisma.affiliateClick.groupBy({
      by: ["providerId"],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });

    if (clickGroups.length === 0) return [];

    const providerIds = clickGroups.map((g) => g.providerId);

    const providers = await prisma.provider.findMany({
      where: { id: { in: providerIds } },
      select: { id: true, name: true, slug: true, logoUrl: true },
    });

    const providerMap = new Map(providers.map((p) => [p.id, p]));

    return clickGroups.map((group) => ({
      providerId: group.providerId,
      clickCount: group._count.id,
      provider: providerMap.get(group.providerId) ?? null,
    }));
  },
);

// -- Review Stats (Phase 90) --

export const getProviderReviewStats = cache(async (providerId: string) => {
  return prisma.review.groupBy({
    by: ["rating"],
    where: { providerId, status: "APPROVED" },
    _count: true,
  });
});

// -- Collections (Phase 70) --

export const getPublishedCollections = cache(async () => {
  return prisma.collection.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });
});

export const getCollectionBySlug = cache(async (slug: string) => {
  return prisma.collection.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          provider: {
            include: {
              dietaryTags: true,
              plans: { where: { active: true, featured: true }, take: 1 },
            },
          },
        },
      },
    },
  });
});

export const getAllCollectionSlugs = cache(async () => {
  return prisma.collection.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
});

// -- Blog (Phase 70) --

export const getPublishedBlogPosts = cache(
  async (page: number = 1, pageSize: number = 12) => {
    const where = { status: "PUBLISHED" as const };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return { posts, total, page, pageSize };
  },
);

export const getBlogPostBySlug = cache(async (slug: string) => {
  return prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
});

export const getAllBlogPostSlugs = cache(async () => {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
});
