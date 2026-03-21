const colorMap = {
  dietary: "bg-primary-50 text-primary-700 ring-primary-600/20",
  category: "bg-accent-50 text-accent-700 ring-accent-600/20",
  default: "bg-gray-50 text-gray-700 ring-gray-600/20",
} as const;

export default function Badge({
  children,
  color = "default",
  className,
}: Readonly<{
  children: React.ReactNode;
  color?: keyof typeof colorMap;
  className?: string;
}>) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colorMap[color]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
