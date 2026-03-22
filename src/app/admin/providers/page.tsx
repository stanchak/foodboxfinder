import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CATEGORY_MAP } from "@/lib/categories";
import type { CategoryType } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Providers",
};

export default async function AdminProvidersPage(props: {
  searchParams: Promise<{ q?: string; category?: string; status?: string; sort?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q ?? "";
  const categoryFilter = searchParams.category ?? "";
  const statusFilter = searchParams.status ?? "";
  const sortParam = searchParams.sort ?? "updated";

  const where = {
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { slug: { contains: query, mode: "insensitive" as const } },
      ],
    }),
    ...(categoryFilter && { category: categoryFilter as CategoryType }),
    ...(statusFilter === "ACTIVE" && { status: "ACTIVE" as const }),
    ...(statusFilter === "HYBRID" && { status: "HYBRID" as const }),
    ...(statusFilter === "UNCLEAR" && { status: "UNCLEAR" as const }),
    ...(statusFilter === "DISCONTINUED" && { status: "DISCONTINUED" as const }),
    ...(statusFilter === "featured" && { featured: true }),
  };

  const orderByMap: Record<string, object> = {
    updated: { updatedAt: "desc" as const },
    name_asc: { name: "asc" as const },
    name_desc: { name: "desc" as const },
    rating: { averageRating: "desc" as const },
    created: { createdAt: "desc" as const },
  };
  const orderBy = orderByMap[sortParam] ?? orderByMap.updated;

  const providers = await prisma.provider.findMany({
    where,
    orderBy,
    include: {
      _count: { select: { reviews: true, plans: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Providers</h1>
        <Link
          href="/admin/providers/new"
          className="bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Add Provider
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-4 mb-6">
        <form method="get" className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="q" className="block text-xs font-medium text-neutral-500 mb-1">
              Search
            </label>
            <input
              type="text"
              id="q"
              name="q"
              defaultValue={query}
              placeholder="Search by name or slug..."
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-xs font-medium text-neutral-500 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={categoryFilter}
              className="block rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-neutral-500 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={statusFilter}
              className="block rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="HYBRID">Hybrid</option>
              <option value="UNCLEAR">Unclear</option>
              <option value="DISCONTINUED">Discontinued</option>
              <option value="featured">Featured</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="block text-xs font-medium text-neutral-500 mb-1">
              Sort
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sortParam}
              className="block rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="updated">Last Updated</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="rating">Highest Rating</option>
              <option value="created">Newest First</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-neutral-100 text-neutral-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Category</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500">Status</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500">Reviews</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500">Plans</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500">Rating</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {providers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    No providers found.
                  </td>
                </tr>
              ) : (
                providers.map((provider) => (
                  <tr key={provider.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-neutral-900">{provider.name}</p>
                        <p className="text-xs text-neutral-500">/{provider.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {CATEGORY_MAP[provider.category]?.label ?? provider.category}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {provider.status === "ACTIVE" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                            {provider.status.charAt(0) + provider.status.slice(1).toLowerCase()}
                          </span>
                        )}
                        {provider.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-neutral-600">
                      {provider._count.reviews}
                    </td>
                    <td className="px-4 py-3 text-center text-neutral-600">
                      {provider._count.plans}
                    </td>
                    <td className="px-4 py-3 text-center text-neutral-600">
                      {provider.averageRating > 0 ? provider.averageRating.toFixed(1) : "--"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/providers/${provider.id}/edit`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
          {providers.length} provider{providers.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
