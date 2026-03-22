export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-neutral-200" />
        <div className="h-4 w-4 rounded bg-neutral-200" />
        <div className="h-4 w-24 rounded bg-neutral-200" />
      </div>

      {/* Page heading skeleton */}
      <div className="mt-6">
        <div className="h-9 w-64 max-w-full rounded bg-neutral-200" />
        <div className="mt-2 h-5 w-80 max-w-full rounded bg-neutral-200" />
      </div>

      {/* Filters skeleton */}
      <div className="mt-6 flex flex-wrap gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-9 w-28 rounded-lg bg-neutral-200" />
        ))}
      </div>

      {/* Results count skeleton */}
      <div className="mt-6 h-4 w-32 rounded bg-neutral-200" />

      {/* Provider cards grid skeleton */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white shadow-sm ring-1 ring-neutral-100 overflow-hidden"
          >
            {/* Image placeholder */}
            <div className="h-40 bg-neutral-100" />
            {/* Content */}
            <div className="p-5 space-y-3">
              {/* Badges */}
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-neutral-200" />
                <div className="h-5 w-20 rounded-full bg-neutral-200" />
              </div>
              {/* Title */}
              <div className="h-6 w-40 rounded bg-neutral-200" />
              {/* Description */}
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded bg-neutral-200" />
                <div className="h-4 w-4/5 rounded bg-neutral-200" />
              </div>
              {/* Price and rating */}
              <div className="flex justify-between pt-2">
                <div className="h-4 w-24 rounded bg-neutral-200" />
                <div className="h-4 w-20 rounded bg-neutral-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
