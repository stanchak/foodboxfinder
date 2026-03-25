"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompareProvider from "@/components/CompareProvider";
import CompareBar from "@/components/CompareBar";

export default function ConsumerShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CompareProvider>
      <Header />
      <main id="main-content" className="flex-1 pb-20">{children}</main>
      <Footer />
      <CompareBar />
    </CompareProvider>
  );
}
