const skeletonVariants = {
  text: "h-4 w-3/4 rounded",
  title: "h-6 w-1/2 rounded",
  avatar: "h-10 w-10 rounded-full",
  card: "h-64 w-full rounded-xl",
  rating: "h-4 w-24 rounded",
  badge: "h-6 w-16 rounded-full",
  image: "h-48 w-full rounded-xl",
  button: "h-10 w-28 rounded-lg",
} as const;

export default function Skeleton({
  variant = "text",
  className,
}: Readonly<{
  variant?: keyof typeof skeletonVariants;
  className?: string;
}>) {
  return (
    <div
      className={`animate-pulse bg-neutral-200 ${skeletonVariants[variant]} ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}
