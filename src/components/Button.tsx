const variants = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
  secondary: "border border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500",
  ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: Readonly<{
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: React.ReactNode;
  className?: string;
}> & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
