export default function CollectionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 bg-neutral-200 rounded" />
        <div className="h-10 w-32 bg-neutral-200 rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="flex-1 space-y-1">
                <div className="h-4 w-56 bg-neutral-200 rounded" />
                <div className="h-3 w-36 bg-neutral-100 rounded" />
              </div>
              <div className="h-6 w-20 bg-neutral-100 rounded-full" />
              <div className="h-3 w-20 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
