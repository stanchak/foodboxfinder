import Link from "next/link";

export default function Card({
  children,
  className,
  href,
  padding = true,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  href?: string;
  padding?: boolean;
}>) {
  const cardClasses = `bg-white rounded-2xl shadow-card transition-shadow duration-200 hover:shadow-card-hover overflow-hidden ${padding ? "p-6" : ""} ${className ?? ""}`;

  if (href) {
    return (
      <Link href={href} className={`block ${cardClasses}`}>
        {children}
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
}
