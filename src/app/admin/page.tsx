import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getTopAffiliateProviders } from "@/lib/queries";
import { CATEGORY_MAP } from "@/lib/categories";
import type { CategoryType } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Dashboard",
};

function getThirtyDaysAgo(): Date {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

export default async function AdminDashboardPage() {
  const thirtyDaysAgo = getThirtyDaysAgo();

  const [
    providerCount,
    activeProviderCount,
    reviewCount,
    pendingReviewCount,
    blogPostCount,
    publishedBlogPostCount,
    collectionCount,
    publishedCollectionCount,
    recentClickCount,
    topProviders,
    categoryBreakdown,
  ] = await Promise.all([
    prisma.provider.count(),
    prisma.provider.count({ where: { status: "ACTIVE" } }),
    prisma.review.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.collection.count(),
    prisma.collection.count({ where: { status: "PUBLISHED" } }),
    prisma.affiliateClick.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    getTopAffiliateProviders(30, 5),
    prisma.provider.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);

  const stats = [
    {
      label: "Providers",
      value: providerCount,
      sub: `${activeProviderCount} active`,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Reviews",
      value: reviewCount,
      sub: `${pendingReviewCount} pending`,
      color: "bg-amber-50 text-amber-700",
      alert: pendingReviewCount > 0,
    },
    {
      label: "Blog Posts",
      value: blogPostCount,
      sub: `${publishedBlogPostCount} published`,
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Collections",
      value: collectionCount,
      sub: `${publishedCollectionCount} published`,
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Affiliate Clicks",
      value: recentClickCount,
      sub: "Last 30 days",
      color: "bg-pink-50 text-pink-700",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-card p-5"
          >
            <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-neutral-900">{stat.value}</p>
            <p className={`mt-1 text-sm ${stat.alert ? "text-amber-600 font-medium" : "text-neutral-500"}`}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {pendingReviewCount > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">
                {pendingReviewCount} review{pendingReviewCount !== 1 ? "s" : ""} pending moderation
              </p>
              <Link
                href="/admin/reviews"
                className="text-sm text-amber-700 underline hover:text-amber-900"
              >
                Review now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Top Providers by Affiliate Clicks */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Top Providers by Clicks (Last 30 Days)
        </h2>
        {topProviders.length > 0 ? (
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Rank
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Provider
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Clicks
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProviders.map((item, index) => (
                  <tr
                    key={item.providerId}
                    className={index < topProviders.length - 1 ? "border-b border-neutral-100" : ""}
                  >
                    <td className="px-5 py-3 text-sm text-neutral-500 w-16">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-neutral-900">
                      {item.provider ? (
                        <Link
                          href={`/admin/providers/${item.provider.slug}/edit`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {item.provider.name}
                        </Link>
                      ) : (
                        <span className="text-neutral-400">Unknown provider</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-neutral-900 text-right tabular-nums">
                      {item.clickCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-6 text-center text-sm text-neutral-500">
            No affiliate clicks recorded in the last 30 days.
          </div>
        )}
      </div>

      {/* Providers by Category */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Providers by Category
        </h2>
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Category
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((item, index) => (
                <tr
                  key={item.category}
                  className={index < categoryBreakdown.length - 1 ? "border-b border-neutral-100" : ""}
                >
                  <td className="px-5 py-3 text-sm font-medium text-neutral-900">
                    {CATEGORY_MAP[item.category as CategoryType]?.label ?? item.category}
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-neutral-900 text-right tabular-nums">
                    {item._count.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
