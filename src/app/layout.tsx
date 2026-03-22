import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompareProvider from "@/components/CompareProvider";
import CompareBar from "@/components/CompareBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://foodboxfinder.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "FoodBoxFinder - Discover & Compare Food Box Subscriptions",
    template: "%s | FoodBoxFinder",
  },
  description:
    "Find and compare the best meal kits, prepared meals, protein boxes, and produce boxes. Honest reviews, transparent pricing, and side-by-side comparisons.",
  openGraph: {
    siteName: "FoodBoxFinder",
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    title: "FoodBoxFinder - Discover & Compare Food Box Subscriptions",
    description:
      "Find and compare the best meal kits, prepared meals, protein boxes, and produce boxes. Honest reviews, transparent pricing, and side-by-side comparisons.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@foodboxfinder",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>
        <CompareProvider>
          <Header />
          <main id="main-content" className="flex-1 pb-20">{children}</main>
          <Footer />
          <CompareBar />
        </CompareProvider>
      </body>
    </html>
  );
}
