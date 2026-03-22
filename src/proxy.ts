import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CATEGORY_MAP } from "@/lib/categories";

// Build a Set of category slugs for O(1) lookup
const categorySlugs = new Set(
  Object.values(CATEGORY_MAP).map(({ slug }) => slug),
);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old category URLs to /search?category={slug}
  const segment = pathname.slice(1);
  if (categorySlugs.has(segment)) {
    return NextResponse.redirect(
      new URL(`/search?category=${segment}`, request.url),
      301,
    );
  }

  // Only protect /admin routes (except login page)
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow the login page through without auth
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Check for admin_token cookie
  const adminToken = request.cookies.get("admin_token")?.value;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    // If ADMIN_SECRET is not configured, block all admin access
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (adminToken !== adminSecret) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/meal-kits", "/prepared-meals", "/protein-boxes", "/produce-boxes", "/specialty"],
};
