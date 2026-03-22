export default function BlogPostLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-neutral-200" />
        <div className="h-4 w-4 rounded bg-neutral-200" />
        <div className="h-4 w-12 rounded bg-neutral-200" />
        <div className="h-4 w-4 rounded bg-neutral-200" />
        <div className="h-4 w-40 rounded bg-neutral-200" />
      </div>

      {/* Header skeleton */}
      <div className="mx-auto max-w-3xl mt-8">
        {/* Meta */}
        <div className="flex items-center gap-3">
          <div className="h-4 w-28 rounded bg-neutral-200" />
          <div className="h-4 w-4 rounded bg-neutral-200" />
          <div className="h-4 w-20 rounded bg-neutral-200" />
        </div>

        {/* Title */}
        <div className="mt-4 space-y-3">
          <div className="h-10 w-full rounded bg-neutral-200" />
          <div className="h-10 w-3/4 rounded bg-neutral-200" />
        </div>

        {/* Excerpt */}
        <div className="mt-5 space-y-2">
          <div className="h-5 w-full rounded bg-neutral-200" />
          <div className="h-5 w-5/6 rounded bg-neutral-200" />
        </div>

        {/* Author */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-neutral-200" />
          <div className="space-y-1.5">
            <div className="h-4 w-24 rounded bg-neutral-200" />
            <div className="h-3 w-12 rounded bg-neutral-200" />
          </div>
        </div>
      </div>

      {/* Cover image skeleton */}
      <div className="mt-8 mx-auto max-w-4xl h-64 sm:h-80 lg:h-96 rounded-xl bg-neutral-200" />

      {/* Body skeleton */}
      <div className="mt-10 mx-auto max-w-3xl space-y-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-5/6 rounded bg-neutral-200" />
            {i % 2 === 0 && <div className="h-4 w-3/4 rounded bg-neutral-200" />}
          </div>
        ))}
      </div>
    </div>
  );
}
