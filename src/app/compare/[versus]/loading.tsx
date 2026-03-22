export default function VersusLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-gray-200" />
        <div className="h-4 w-4 rounded bg-gray-200" />
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="h-4 w-4 rounded bg-gray-200" />
        <div className="h-4 w-36 rounded bg-gray-200" />
      </div>

      {/* Page header skeleton */}
      <div className="mt-6">
        <div className="h-10 w-96 max-w-full rounded bg-gray-200" />
        <div className="mt-3 h-5 w-full max-w-3xl rounded bg-gray-200" />
        <div className="mt-2 h-5 w-4/5 max-w-3xl rounded bg-gray-200" />
      </div>

      {/* Quick summary cards skeleton */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="h-6 w-36 rounded bg-gray-200" />
              <div className="h-5 w-20 rounded-full bg-gray-200" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, j) => (
                <div key={j}>
                  <div className="h-3 w-16 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-24 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Full Comparison heading skeleton */}
      <div className="mt-10">
        <div className="h-7 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-5 w-40 rounded bg-gray-200" />
      </div>

      {/* Comparison table skeleton */}
      <div className="mt-6 space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-10 w-full rounded bg-gray-100" />
        ))}
      </div>

      {/* The Bottom Line skeleton */}
      <div className="mt-12">
        <div className="h-7 w-40 rounded bg-gray-200" />
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-6 space-y-4">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-4/6 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </div>
      </div>

      {/* CTA buttons skeleton */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <div className="h-12 w-36 rounded-lg bg-gray-200" />
        <div className="h-12 w-36 rounded-lg bg-gray-200" />
        <div className="h-5 w-40 rounded bg-gray-200" />
      </div>
    </div>
  );
}
