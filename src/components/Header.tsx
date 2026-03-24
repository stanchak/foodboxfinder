import Link from "next/link";
import Image from "next/image";
import MobileNav from "@/components/MobileNav";
import HeaderSearchForm from "@/components/HeaderSearchForm";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100 shadow-header">
      <nav aria-label="Main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          <Link href="/" className="flex-shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600" aria-label="FoodBoxFinder home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/foodboxfinder-logo.png"
              alt="FoodBoxFinder"
              className="h-16 sm:h-20 lg:h-14 w-auto object-contain"
            />
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-6">
            <Link
              href="/search"
              className="text-base font-medium text-neutral-600 hover:text-primary-600 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Discover
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
            <Link
              href="/about"
              className="text-base font-medium text-neutral-600 hover:text-primary-600 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              About
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
