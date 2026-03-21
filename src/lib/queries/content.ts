import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { CATEGORY_MAP } from "@/lib/categories";
import type { CategoryType } from "@/generated/prisma/client";

// -- Search (Phase 80) --

export const searchProviders = cache(async (query: string) => {
  // Match categories whose label contains the query or vice versa
  const lowerQuery = query.toLowerCase();
  const matchingCategories = (
    Object.entries(CATEGORY_MAP) as Array<[CategoryType, { slug: string; label: string; description: string }]>
  )
    .filter(([, { label }]) => {
      const lowerLabel = label.toLowerCase();
      return lowerLabel.includes(lowerQuery) || lowerQuery.includes(lowerLabel);
    })
    .map(([key]) => key);

  return prisma.provider.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { shortDescription: { contains: query, mode: "insensitive" } },
        ...(matchingCategories.length > 0
          ? [
              { category: { in: matchingCategories } },
              { secondaryCategory: { in: matchingCategories } },
            ]
          : []),
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
