export default function BlogIndexLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-gray-200" />
        <div className="h-4 w-4 rounded bg-gray-200" />
        <div className="h-4 w-12 rounded bg-gray-200" />
      </div>

      {/* Page header skeleton */}
      <div className="mt-6 text-center">
        <div className="mx-auto h-10 w-48 max-w-full rounded bg-gray-200" />
        <div className="mx-auto mt-3 h-5 w-80 max-w-full rounded bg-gray-200" />
      </div>

      {/* Featured post skeleton */}
      <div className="mt-10 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-col lg:flex-row">
          <div className="h-64 lg:h-80 lg:w-1/2 bg-gray-100 shrink-0" />
          <div className="flex flex-1 flex-col justify-center p-6 lg:p-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="h-4 w-4 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
            </div>
            <div className="h-8 w-80 max-w-full rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
            </div>
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-5 w-24 rounded bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Post grid skeleton */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100"
          >
            <div className="h-48 bg-gray-100 shrink-0" />
            <div className="flex flex-1 flex-col p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-24 rounded bg-gray-200" />
                <div className="h-3 w-3 rounded bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-200" />
              </div>
              <div className="h-6 w-48 rounded bg-gray-200" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-5/6 rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
              </div>
              <div className="h-3 w-20 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
