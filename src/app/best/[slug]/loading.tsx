export default function CollectionDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-neutral-200" />
        <div className="h-4 w-4 rounded bg-neutral-200" />
        <div className="h-4 w-20 rounded bg-neutral-200" />
        <div className="h-4 w-4 rounded bg-neutral-200" />
        <div className="h-4 w-32 rounded bg-neutral-200" />
      </div>

      {/* Title skeleton */}
      <div className="mt-8">
        <div className="h-10 w-80 max-w-full rounded bg-neutral-200" />
        <div className="mt-3 h-5 w-96 max-w-full rounded bg-neutral-200" />
      </div>

      {/* Body skeleton */}
      <div className="mt-6 max-w-3xl space-y-3">
        <div className="h-4 w-full rounded bg-neutral-200" />
        <div className="h-4 w-5/6 rounded bg-neutral-200" />
        <div className="h-4 w-4/6 rounded bg-neutral-200" />
      </div>

      {/* Count */}
      <div className="mt-8 h-4 w-40 rounded bg-neutral-200" />

      {/* Provider cards skeleton */}
      <div className="mt-6 space-y-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row rounded-xl bg-white shadow-card ring-1 ring-neutral-100 overflow-hidden"
          >
            <div className="h-36 sm:h-auto sm:w-32 bg-neutral-100 shrink-0" />
            <div className="flex-1 p-5 sm:p-6 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-neutral-200" />
                <div className="h-5 w-20 rounded-full bg-neutral-200" />
              </div>
              <div className="h-6 w-48 rounded bg-neutral-200" />
              <div className="h-4 w-72 max-w-full rounded bg-neutral-200" />
              <div className="flex gap-4">
                <div className="h-4 w-24 rounded bg-neutral-200" />
                <div className="h-4 w-28 rounded bg-neutral-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
