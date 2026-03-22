export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Page heading */}
      <div className="h-9 w-32 rounded bg-neutral-200" />

      {/* Search input skeleton */}
      <div className="mt-4 h-12 w-full max-w-xl rounded-lg bg-neutral-200" />

      {/* Results count skeleton */}
      <div className="mt-8 h-5 w-48 rounded bg-neutral-200" />

      {/* Provider results section */}
      <div className="mt-6">
        <div className="h-6 w-40 rounded bg-neutral-200" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white shadow-sm ring-1 ring-neutral-100 overflow-hidden"
            >
              <div className="h-36 bg-neutral-100" />
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded-full bg-neutral-200" />
                  <div className="h-5 w-20 rounded-full bg-neutral-200" />
                </div>
                <div className="h-6 w-40 rounded bg-neutral-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-full rounded bg-neutral-200" />
                  <div className="h-4 w-4/5 rounded bg-neutral-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog results section */}
      <div className="mt-10">
        <div className="h-6 w-36 rounded bg-neutral-200" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white shadow-sm ring-1 ring-neutral-100 p-5 space-y-3"
            >
              <div className="h-5 w-48 rounded bg-neutral-200" />
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded bg-neutral-200" />
                <div className="h-4 w-3/4 rounded bg-neutral-200" />
              </div>
              <div className="h-4 w-24 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Collections section */}
      <div className="mt-10">
        <div className="h-6 w-32 rounded bg-neutral-200" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white shadow-sm ring-1 ring-neutral-100 p-5 space-y-3"
            >
              <div className="h-5 w-44 rounded bg-neutral-200" />
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded bg-neutral-200" />
                <div className="h-4 w-2/3 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
