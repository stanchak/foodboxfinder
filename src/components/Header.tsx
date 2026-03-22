import Link from "next/link";
import Image from "next/image";
import { CATEGORY_NAV_ITEMS } from "@/lib/categories";
import MobileNav from "@/components/MobileNav";
import HeaderSearchForm from "@/components/HeaderSearchForm";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100 shadow-header">
      <nav aria-label="Main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/foodboxfinder-logo-transparent.png"
              alt="FoodBoxFinder"
              width={180}
              height={48}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {CATEGORY_NAV_ITEMS.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <span className="h-5 w-px bg-neutral-200" aria-hidden="true" />
            <Link
              href="/compare"
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/best"
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Best Of
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
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
