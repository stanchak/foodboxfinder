import Link from "next/link";
import Image from "next/image";
import { CATEGORY_NAV_ITEMS } from "@/lib/categories";
import MobileNav from "@/components/MobileNav";
import HeaderSearchForm from "@/components/HeaderSearchForm";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100 shadow-header">
      <nav aria-label="Main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 lg:h-40">
          <Link href="/" className="flex-shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600" aria-label="FoodBoxFinder home">
            <Image
              src="/foodboxfinder-logo-transparent.png"
              alt="FoodBoxFinder"
              width={450}
              height={150}
              className="h-16 sm:h-20 lg:h-[150px] w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {CATEGORY_NAV_ITEMS.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="text-base font-medium text-neutral-600 hover:text-primary-600 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                {item.label}
              </Link>
            ))}
            <span className="h-5 w-px bg-neutral-200" aria-hidden="true" />
            <Link
              href="/compare"
              className="text-base font-medium text-neutral-600 hover:text-primary-600 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Compare
            </Link>
            <Link
              href="/best"
              className="text-base font-medium text-neutral-600 hover:text-primary-600 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Best Of
            </Link>
            <Link
              href="/blog"
              className="text-base font-medium text-neutral-600 hover:text-primary-600 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
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
