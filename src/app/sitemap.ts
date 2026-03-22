import type { MetadataRoute } from "next";
import { CATEGORY_MAP } from "@/lib/categories";
import {
  getAllProviderSlugs,
  getAllCollectionSlugs,
  getAllBlogPostSlugs,
} from "@/lib/queries";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://foodboxfinder.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [providerSlugs, collectionSlugs, blogPostSlugs] = await Promise.all([
    getAllProviderSlugs(),
    getAllCollectionSlugs(),
    getAllBlogPostSlugs(),
  ]);

  const now = new Date();

  // -- Static pages --
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/best`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // -- Search category pages --
  const searchCategoryPages: MetadataRoute.Sitemap = Object.values(CATEGORY_MAP).map(
    ({ slug }) => ({
      url: `${BASE_URL}/search?category=${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  // -- Provider detail pages --
  const providerPages: MetadataRoute.Sitemap = providerSlugs.map(
    ({ slug }) => ({
      url: `${BASE_URL}/providers/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  // -- Collection pages --
  const collectionPages: MetadataRoute.Sitemap = collectionSlugs.map(
    ({ slug }) => ({
      url: `${BASE_URL}/best/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  // -- Blog post pages --
  const blogPages: MetadataRoute.Sitemap = blogPostSlugs.map(({ slug }) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...searchCategoryPages,
    ...providerPages,
    ...collectionPages,
    ...blogPages,
  ];
}
