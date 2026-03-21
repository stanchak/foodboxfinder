import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

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
