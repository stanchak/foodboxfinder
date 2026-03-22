export default function CollectionsIndexLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-neutral-200" />
        <div className="h-4 w-4 rounded bg-neutral-200" />
        <div className="h-4 w-24 rounded bg-neutral-200" />
      </div>

      {/* Page header skeleton */}
      <div className="mt-6 text-center">
        <div className="mx-auto h-10 w-72 max-w-full rounded bg-neutral-200" />
        <div className="mx-auto mt-3 h-5 w-96 max-w-full rounded bg-neutral-200" />
      </div>

      {/* Collections grid skeleton */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-100"
          >
            {/* Cover image placeholder */}
            <div className="relative h-48 bg-neutral-100">
              <div className="absolute bottom-3 right-3 h-6 w-24 rounded-full bg-neutral-200" />
            </div>
            {/* Content */}
            <div className="flex flex-1 flex-col p-5 space-y-3">
              <div className="h-6 w-48 rounded bg-neutral-200" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-full rounded bg-neutral-200" />
                <div className="h-4 w-5/6 rounded bg-neutral-200" />
                <div className="h-4 w-3/4 rounded bg-neutral-200" />
              </div>
              <div className="h-4 w-28 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
