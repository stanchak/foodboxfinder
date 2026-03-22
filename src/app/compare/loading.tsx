export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-gray-200" />
        <div className="h-4 w-4 rounded bg-gray-200" />
        <div className="h-4 w-20 rounded bg-gray-200" />
      </div>

      {/* Hero section skeleton */}
      <div className="mt-10 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-gray-200" />
        <div className="mx-auto mt-4 h-10 w-80 max-w-full rounded bg-gray-200" />
        <div className="mx-auto mt-3 h-5 w-96 max-w-full rounded bg-gray-200" />
        <div className="mx-auto mt-2 h-5 w-72 max-w-full rounded bg-gray-200" />
      </div>

      {/* How it works steps skeleton */}
      <div className="mt-12 grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-gray-200" />
            <div className="mx-auto mt-3 h-4 w-28 rounded bg-gray-200" />
            <div className="mx-auto mt-2 h-3 w-36 rounded bg-gray-200" />
            <div className="mx-auto mt-1 h-3 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Section heading skeleton */}
      <div className="mt-14 text-center">
        <div className="mx-auto h-7 w-64 rounded bg-gray-200" />
        <div className="mx-auto mt-2 h-5 w-56 rounded bg-gray-200" />
      </div>

      {/* Provider cards grid skeleton */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden"
          >
            <div className="h-40 bg-gray-100" />
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-gray-200" />
                <div className="h-5 w-20 rounded-full bg-gray-200" />
              </div>
              <div className="h-6 w-40 rounded bg-gray-200" />
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-4/5 rounded bg-gray-200" />
              </div>
              <div className="flex justify-between pt-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
