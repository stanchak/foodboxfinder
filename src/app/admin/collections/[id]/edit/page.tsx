import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteCollection } from "@/app/actions/admin";
import CollectionForm from "@/components/admin/CollectionForm";

export const metadata: Metadata = {
  title: "Edit Collection",
};

export default async function EditCollectionPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const [collection, providers] = await Promise.all([
    prisma.collection.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            provider: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.provider.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!collection) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/collections"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Collections
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit: {collection.title}
          </h1>
          <form action={deleteCollection}>
            <input type="hidden" name="id" value={collection.id} />
            <button
              type="submit"
              className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-100 transition-colors"
              onClick={(e) => {
                if (!confirm(`Delete "${collection.title}"? This cannot be undone.`)) {
                  e.preventDefault();
                }
              }}
            >
              Delete Collection
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <CollectionForm collection={collection} providers={providers} />
      </div>
    </div>
  );
}
