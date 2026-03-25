import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteProvider } from "@/app/actions/admin";
import ProviderForm from "@/components/admin/ProviderForm";
import PlanManager from "@/components/admin/PlanManager";
import DeleteButton from "@/components/admin/DeleteButton";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";

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
      <AdminBreadcrumbs
        items={[
          { label: "Providers", href: "/admin/providers" },
          { label: `Edit "${provider.name}"` },
        ]}
      />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/providers"
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            &larr; Back to Providers
          </Link>
          <a
            href={`/providers/${provider.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View on site
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-neutral-900">
            Edit: {provider.name}
          </h1>
          <DeleteButton
            action={deleteProvider}
            entityId={provider.id}
            entityName={provider.name}
            entityType="Provider"
          />
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
