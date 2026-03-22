import type { CategoryType } from "@/generated/prisma/client";
import { CATEGORY_COLOR_MAP } from "@/lib/categories";

const colorMap = {
  category: "rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-200",
  dietary: "rounded-full bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200",
  valueTier: "rounded-full bg-accent-50 text-accent-700 ring-1 ring-accent-200",
  success: "rounded-full bg-success-50 text-success-700 ring-1 ring-success-600/20",
  collection: "rounded-full bg-primary-100 text-primary-600 ring-1 ring-primary-200",
  default: "rounded-full bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200",
} as const;

export default function Badge({
  children,
  color = "default",
  categoryType,
  className,
}: Readonly<{
  children: React.ReactNode;
  color?: "category" | "dietary" | "valueTier" | "success" | "collection" | "default";
  categoryType?: CategoryType;
  className?: string;
}>) {
  // Use per-category colors when categoryType is provided and color is "category"
  const colorClasses = categoryType && color === "category"
    ? `rounded-full ${CATEGORY_COLOR_MAP[categoryType].badgeBg} ${CATEGORY_COLOR_MAP[categoryType].badgeText} ring-1 ${CATEGORY_COLOR_MAP[categoryType].badgeRing}`
    : colorMap[color];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${colorClasses} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
