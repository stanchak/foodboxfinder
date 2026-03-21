export default function ProviderDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-gray-200" />
        <div className="h-4 w-4 rounded bg-gray-200" />
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="h-4 w-4 rounded bg-gray-200" />
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>

      {/* Hero section skeleton */}
      <div className="mt-8 flex flex-col md:flex-row gap-8">
        {/* Logo / hero image */}
        <div className="w-full md:w-72 h-48 md:h-56 rounded-xl bg-gray-200 shrink-0" />

        {/* Provider info */}
        <div className="flex-1 space-y-4">
          {/* Category badge */}
          <div className="h-6 w-24 rounded-full bg-gray-200" />
          {/* Name */}
          <div className="h-10 w-72 max-w-full rounded bg-gray-200" />
          {/* Rating + reviews */}
          <div className="flex items-center gap-3">
            <div className="h-5 w-28 rounded bg-gray-200" />
            <div className="h-5 w-20 rounded bg-gray-200" />
          </div>
          {/* Short description */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
          </div>
          {/* Price range + CTA */}
          <div className="flex items-center gap-4 pt-2">
            <div className="h-8 w-36 rounded bg-gray-200" />
            <div className="h-10 w-32 rounded-lg bg-gray-200" />
          </div>
          {/* Dietary tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-6 w-20 rounded-full bg-gray-200" />
            ))}
          </div>
        </div>
      </div>

      {/* Pros / Cons skeleton */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="rounded-xl bg-white ring-1 ring-gray-100 p-6 space-y-3">
            <div className="h-6 w-16 rounded bg-gray-200" />
            {Array.from({ length: 3 }, (_, j) => (
              <div key={j} className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-gray-200 shrink-0 mt-0.5" />
                <div className="h-4 w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pricing table skeleton */}
      <div className="mt-10">
        <div className="h-7 w-40 rounded bg-gray-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-20 w-full rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>

      {/* Reviews skeleton */}
      <div className="mt-10">
        <div className="h-7 w-32 rounded bg-gray-200" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="rounded-lg bg-white ring-1 ring-gray-100 p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-5 w-28 rounded bg-gray-200" />
                <div className="h-5 w-20 rounded bg-gray-200" />
              </div>
              <div className="h-5 w-48 rounded bg-gray-200" />
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-5/6 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
