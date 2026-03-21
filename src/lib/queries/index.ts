// Barrel re-export for backward compatibility.
// All existing imports like `import { getProviderBySlug } from "@/lib/queries"` continue to work.

export {
  getProvidersByCategory,
  getProviderBySlug,
  getProvidersForComparison,
  getFeaturedProviders,
  getCategoryCounts,
  getAllProviderSlugs,
  getRelatedProviders,
  getFilteredProviders,
} from "./providers";

export {
  searchProviders,
  searchBlogPosts,
  searchCollections,
  getPublishedBlogPosts,
  getBlogPostBySlug,
  getAllBlogPostSlugs,
  getPublishedCollections,
  getCollectionBySlug,
  getAllCollectionSlugs,
} from "./content";

export {
  getAdminStats,
  getTopAffiliateProviders,
  getProviderReviewStats,
} from "./admin";
