export default function ReviewsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-neutral-200 rounded" />

      {/* Tab bar skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-neutral-200 rounded-lg" />
        ))}
      </div>

      {/* Review cards skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-neutral-200 rounded" />
              <div className="h-6 w-20 bg-neutral-100 rounded-full" />
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-4 w-4 bg-neutral-100 rounded" />
              ))}
            </div>
            <div className="space-y-1">
              <div className="h-3 w-full bg-neutral-100 rounded" />
              <div className="h-3 w-3/4 bg-neutral-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
