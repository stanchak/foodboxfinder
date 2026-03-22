import type { Metadata } from "next";
import Link from "next/link";
import ProviderForm from "@/components/admin/ProviderForm";

export const metadata: Metadata = {
  title: "New Provider",
};

export default function NewProviderPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/providers"
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          &larr; Back to Providers
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 mt-2">New Provider</h1>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <ProviderForm />
      </div>
    </div>
  );
}
