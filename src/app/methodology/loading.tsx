export default function MethodologyLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-neutral-200" />
        <div className="h-4 w-4 rounded bg-neutral-200" />
        <div className="h-4 w-32 rounded bg-neutral-200" />
      </div>

      {/* Title skeleton */}
      <div className="mt-8">
        <div className="h-10 w-64 max-w-full rounded bg-neutral-200" />
        {/* Intro paragraph skeleton */}
        <div className="mt-4 space-y-2">
          <div className="h-5 w-full rounded bg-neutral-200" />
          <div className="h-5 w-5/6 rounded bg-neutral-200" />
          <div className="h-5 w-4/6 rounded bg-neutral-200" />
        </div>
      </div>

      {/* Section 1 skeleton */}
      <div className="mt-10">
        <div className="h-7 w-56 rounded bg-neutral-200" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-5/6 rounded bg-neutral-200" />
          <div className="h-4 w-4/5 rounded bg-neutral-200" />
          <div className="h-4 w-3/4 rounded bg-neutral-200" />
        </div>
        {/* Bullet list skeleton */}
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-neutral-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-full rounded bg-neutral-200" />
                <div className="h-4 w-4/5 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 skeleton */}
      <div className="mt-10">
        <div className="h-7 w-52 rounded bg-neutral-200" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-5/6 rounded bg-neutral-200" />
          <div className="h-4 w-4/5 rounded bg-neutral-200" />
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-neutral-200 shrink-0" />
              <div className="h-4 w-3/4 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 skeleton */}
      <div className="mt-10">
        <div className="h-7 w-44 rounded bg-neutral-200" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-5/6 rounded bg-neutral-200" />
          <div className="h-4 w-3/4 rounded bg-neutral-200" />
          <div className="h-4 w-4/5 rounded bg-neutral-200" />
        </div>
      </div>

      {/* Section 4 (affiliate disclosure box) skeleton */}
      <div className="mt-10 rounded-xl border border-neutral-200 bg-neutral-50/50 p-6">
        <div className="h-7 w-48 rounded bg-neutral-200" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-5/6 rounded bg-neutral-200" />
          <div className="h-4 w-4/5 rounded bg-neutral-200" />
          <div className="h-4 w-3/4 rounded bg-neutral-200" />
        </div>
      </div>

      {/* Section 5 skeleton */}
      <div className="mt-10">
        <div className="h-7 w-48 rounded bg-neutral-200" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-5/6 rounded bg-neutral-200" />
          <div className="h-4 w-4/5 rounded bg-neutral-200" />
        </div>
      </div>

      {/* Section 6 skeleton */}
      <div className="mt-10 mb-12">
        <div className="h-7 w-52 rounded bg-neutral-200" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-4/5 rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
