import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import CollectionForm from "@/components/admin/CollectionForm";

export const metadata: Metadata = {
  title: "New Collection",
};

export default async function NewCollectionPage() {
  const providers = await prisma.provider.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/collections"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Collections
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Collection</h1>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <CollectionForm providers={providers} />
      </div>
    </div>
  );
}
