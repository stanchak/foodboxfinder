import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteProvider } from "@/app/actions/admin";
import ProviderForm from "@/components/admin/ProviderForm";
import PlanManager from "@/components/admin/PlanManager";

export const metadata: Metadata = {
  title: "Edit Provider",
};

export default async function EditProviderPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      dietaryTags: true,
      plans: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!provider) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/providers"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Providers
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit: {provider.name}
          </h1>
          <form action={deleteProvider}>
            <input type="hidden" name="id" value={provider.id} />
            <button
              type="submit"
              className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-100 transition-colors"
              onClick={(e) => {
                if (!confirm(`Delete "${provider.name}"? This cannot be undone.`)) {
                  e.preventDefault();
                }
              }}
            >
              Delete Provider
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <ProviderForm provider={provider} />
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <PlanManager providerId={provider.id} plans={provider.plans} />
        </div>
      </div>
    </div>
  );
}
