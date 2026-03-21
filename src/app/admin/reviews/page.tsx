import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { approveReview, rejectReview } from "@/app/actions/admin";
import type { ReviewStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Reviews",
};

const STATUS_TABS: Array<{ value: ReviewStatus | "ALL"; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
];

function RatingDisplay({ rating }: Readonly<{ rating: number }>) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function AdminReviewsPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams.status ?? "PENDING";

  const where = statusFilter === "ALL"
    ? {}
    : { status: statusFilter as ReviewStatus };

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      provider: { select: { name: true, slug: true } },
    },
    take: 100,
  });

  const pendingCount = await prisma.review.count({ where: { status: "PENDING" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        {pendingCount > 0 && (
          <span className="bg-amber-100 text-amber-700 text-sm font-medium px-3 py-1 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <a
              key={tab.value}
              href={`/admin/reviews?status=${tab.value}`}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </a>
          );
        })}
      </div>

      {/* Review List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card p-8 text-center text-gray-500">
            No {statusFilter.toLowerCase()} reviews found.
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <RatingDisplay rating={review.rating} />
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      review.status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : review.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}>
                      {review.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="font-medium text-gray-700">{review.authorName}</span>
                    <span>on</span>
                    <a
                      href={`/admin/providers`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {review.provider.name}
                    </a>
                    <span className="text-gray-400">
                      {review.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {review.title && (
                    <p className="font-medium text-gray-900 mb-1">{review.title}</p>
                  )}

                  <p className="text-sm text-gray-600 line-clamp-3">{review.body}</p>

                  {review.authorEmail && (
                    <p className="mt-1 text-xs text-gray-400">{review.authorEmail}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {review.status !== "APPROVED" && (
                    <form action={approveReview}>
                      <input type="hidden" name="id" value={review.id} />
                      <button
                        type="submit"
                        className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        Approve
                      </button>
                    </form>
                  )}
                  {review.status !== "REJECTED" && (
                    <form action={rejectReview}>
                      <input type="hidden" name="id" value={review.id} />
                      <button
                        type="submit"
                        className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {reviews.length} review{reviews.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
