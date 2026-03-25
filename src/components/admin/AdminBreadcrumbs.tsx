import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function AdminBreadcrumbs({
  items,
}: Readonly<{
  items: BreadcrumbItem[];
}>) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
        <li>
          <Link href="/admin" className="hover:text-neutral-700 transition-colors">
            Admin
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {item.href ? (
              <Link href={item.href} className="hover:text-neutral-700 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-neutral-900 font-medium truncate max-w-xs">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
