const skeletonVariants = {
  text: "h-4 w-3/4 rounded",
  title: "h-6 w-1/2 rounded",
  avatar: "h-10 w-10 rounded-full",
  card: "h-72 w-full rounded-xl",
  rating: "h-5 w-28 rounded",
  badge: "h-7 w-18 rounded-full",
  image: "h-52 w-full rounded-xl",
  button: "h-12 w-32 rounded-full",
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
