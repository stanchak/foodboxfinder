import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s | Admin | FoodBoxFinder",
  },
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pendingReviewCount = await prisma.review.count({
    where: { status: "PENDING" },
  });

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <AdminSidebar pendingReviewCount={pendingReviewCount} />

      {/* Main content - add top padding on mobile for the fixed header bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 pt-16 lg:p-6 lg:pt-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
