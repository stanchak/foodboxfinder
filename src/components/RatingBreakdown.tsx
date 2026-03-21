interface RatingBreakdownProps {
  stats: Array<{ rating: number; _count: number }>;
  totalReviews: number;
  averageRating: number;
}

export default function RatingBreakdown({
  stats,
  totalReviews,
  averageRating,
}: Readonly<RatingBreakdownProps>) {
  // Build a map for O(1) lookup, fill in missing ratings with 0
  const countByRating = new Map<number, number>();
  for (const stat of stats) {
    countByRating.set(stat.rating, stat._count);
  }

  const rows = [5, 4, 3, 2, 1].map((rating) => {
    const count = countByRating.get(rating) ?? 0;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
      {/* Summary */}
      <div className="flex flex-col items-center justify-center sm:min-w-[120px]">
        <p className="text-5xl font-bold text-gray-900">
          {averageRating.toFixed(1)}
        </p>
        <div className="mt-1 flex gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => {
            const fill = averageRating - i;
            let className = "text-star-empty";
            if (fill >= 0.75) className = "text-star";
            else if (fill >= 0.25) className = "text-star";
            return (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={className}
                style={fill >= 0.25 && fill < 0.75 ? { clipPath: "inset(0 50% 0 0)" } : undefined}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            );
          })}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* Bars */}
      <div className="flex-1 space-y-2" role="list" aria-label="Rating distribution">
        {rows.map((row) => (
          <div key={row.rating} className="flex items-center gap-3" role="listitem">
            <span className="w-12 text-sm text-gray-600 text-right shrink-0">
              {row.rating} star{row.rating !== 1 ? "s" : ""}
            </span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-star rounded-full transition-all duration-300"
                style={{ width: `${row.percentage}%` }}
                role="progressbar"
                aria-valuenow={row.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${row.rating} stars: ${row.count} reviews, ${Math.round(row.percentage)}%`}
              />
            </div>
            <span className="w-8 text-sm text-gray-500 text-right shrink-0">
              {row.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
