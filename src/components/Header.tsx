import Link from "next/link";
import { CATEGORY_NAV_ITEMS } from "@/lib/categories";
import MobileNav from "@/components/MobileNav";
import HeaderSearchForm from "@/components/HeaderSearchForm";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-header">
      <nav aria-label="Main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary-700">
            FoodBoxFinder
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {CATEGORY_NAV_ITEMS.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <span className="h-5 w-px bg-gray-200" aria-hidden="true" />
            <Link
              href="/compare"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/best"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Best Of
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Blog
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <HeaderSearchForm />

            <MobileNav />
          </div>
        </div>
      </nav>
    </header>
  );
}
