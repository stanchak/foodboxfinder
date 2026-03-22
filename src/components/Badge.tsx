const colorMap = {
  category: "rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-200",
  dietary: "rounded-full bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200",
  valueTier: "rounded-md bg-accent-50 text-accent-700 ring-1 ring-accent-200",
  success: "rounded-full bg-success-50 text-success-700 ring-1 ring-success-600/20",
  collection: "rounded-md bg-primary-100 text-primary-600 ring-1 ring-primary-200",
  default: "rounded-md bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200",
} as const;

export default function Badge({
  children,
  color = "default",
  className,
}: Readonly<{
  children: React.ReactNode;
  color?: "category" | "dietary" | "valueTier" | "success" | "collection" | "default";
  className?: string;
}>) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${colorMap[color]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
