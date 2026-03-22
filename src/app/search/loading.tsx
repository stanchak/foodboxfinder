export default function SearchLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-primary-50 to-white px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-2xl">
          {/* Title skeleton */}
          <div className="flex justify-center mb-6">
            <div className="h-8 w-80 bg-neutral-200 rounded animate-pulse" />
          </div>
          {/* Search bar skeleton */}
          <div className="h-14 w-full bg-white rounded-2xl shadow-lg animate-pulse" />
          {/* Category tabs skeleton */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-32 bg-neutral-200 rounded-full animate-pulse"
              />
            ))}
          </div>
          {/* Result count skeleton */}
          <div className="flex justify-center mt-4">
            <div className="h-5 w-64 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="lg:flex lg:gap-8">
          {/* Sidebar skeleton (desktop only) */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-neutral-100 space-y-4">
              <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse" />
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 w-full bg-neutral-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </aside>

          {/* Results skeleton */}
          <div className="flex-1 min-w-0">
            {/* Results header skeleton */}
            <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse mb-6" />
            {/* Card grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl ring-1 ring-neutral-100 shadow-card overflow-hidden"
                >
                  <div className="h-48 bg-neutral-100 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-7 w-22 bg-neutral-200 rounded-full animate-pulse" />
                      <div className="h-7 w-18 bg-neutral-200 rounded-full animate-pulse" />
                    </div>
                    <div className="h-6 w-3/4 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-neutral-100 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-7 w-24 bg-neutral-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
