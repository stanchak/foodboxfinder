"use client";

import { useCompare } from "@/components/CompareProvider";

export default function AddToCompareButton({
  slug,
  name,
  size = "md",
  className,
}: Readonly<{
  slug: string;
  name: string;
  size?: "sm" | "md";
  className?: string;
}>) {
  const { addProvider, removeProvider, isSelected, isFull } = useCompare();

  const selected = isSelected(slug);
  const disabled = !selected && isFull;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (selected) {
      removeProvider(slug);
    } else {
      addProvider(slug, name);
    }
  }

  const sizeClasses =
    size === "sm" ? "px-2.5 py-1 text-xs gap-1" : "px-3.5 py-2 text-sm gap-1.5";

  if (selected) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`relative z-10 inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 border border-primary-600 bg-primary-50 text-primary-700 shadow-sm hover:bg-primary-100 ${sizeClasses} ${className ?? ""}`}
        aria-label={`Remove ${name} from comparison`}
        aria-pressed={true}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size === "sm" ? 14 : 16}
          height={size === "sm" ? 14 : 16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Comparing
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`relative z-10 inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 bg-white/90 backdrop-blur-sm border border-neutral-200/80 text-neutral-700 shadow-sm hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${className ?? ""}`}
      aria-label={
        disabled
          ? "Comparison is full (4 providers max)"
          : `Add ${name} to comparison`
      }
      aria-pressed={false}
      title={disabled ? "Remove a provider first (4 max)" : undefined}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size === "sm" ? 14 : 16}
        height={size === "sm" ? 14 : 16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Compare
    </button>
  );
}
