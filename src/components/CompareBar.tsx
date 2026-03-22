"use client";

import { useRouter } from "next/navigation";
import { useCompare } from "@/components/CompareProvider";

export default function CompareBar() {
  const { selected, removeProvider, clearAll } = useCompare();
  const router = useRouter();

  if (selected.length === 0) {
    return null;
  }

  const canCompare = selected.length >= 2;

  function handleCompare() {
    if (!canCompare) return;
    const slugs = selected.map((entry) => entry.slug).join(",");
    router.push(`/compare?providers=${slugs}`);
  }

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 border-t border-neutral-200 bg-white/90 backdrop-blur-xl shadow-[0_-4px_12px_rgb(0_0_0/0.08)]"
      role="region"
      aria-label="Comparison selection"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div aria-live="polite" className="sr-only">
          {selected.length} {selected.length === 1 ? "provider" : "providers"} selected for comparison
        </div>
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Selected providers */}
          <div className="flex items-center gap-3 min-w-0 overflow-x-auto">
            <span className="shrink-0 text-sm font-medium text-neutral-500">
              {selected.length}/4
            </span>

            <div className="flex items-center gap-2">
              {selected.map((entry) => (
                <div
                  key={entry.slug}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 pl-3 pr-1.5 py-1 text-sm font-medium text-white shrink-0"
                >
                  <span className="max-w-[120px] truncate">{entry.name}</span>
                  <button
                    type="button"
                    onClick={() => removeProvider(entry.slug)}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-neutral-700 transition-colors"
                    aria-label={`Remove ${entry.name} from comparison`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors px-2 py-1"
              aria-label="Clear all providers from comparison"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleCompare}
              disabled={!canCompare}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <rect x="14" y="3" width="7" height="18" rx="1" />
              </svg>
              Compare{canCompare ? "" : ` (${2 - selected.length} more)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
