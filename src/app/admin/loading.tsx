export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page title skeleton */}
      <div className="h-8 w-48 bg-neutral-200 rounded" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-card p-5 space-y-3">
            <div className="h-4 w-20 bg-neutral-200 rounded" />
            <div className="h-8 w-16 bg-neutral-200 rounded" />
            <div className="h-3 w-24 bg-neutral-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl shadow-card p-6 space-y-4">
        <div className="h-5 w-40 bg-neutral-200 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-8 bg-neutral-100 rounded" />
            <div className="h-4 flex-1 bg-neutral-100 rounded" />
            <div className="h-4 w-16 bg-neutral-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
