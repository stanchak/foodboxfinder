import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteBlogPost } from "@/app/actions/admin";
import BlogPostForm from "@/components/admin/BlogPostForm";
import DeleteButton from "@/components/admin/DeleteButton";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";

export const metadata: Metadata = {
  title: "Edit Blog Post",
};

export default async function EditBlogPostPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  return (
    <div>
      <AdminBreadcrumbs
        items={[
          { label: "Blog", href: "/admin/blog" },
          { label: `Edit "${post.title}"` },
        ]}
      />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/blog"
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            &larr; Back to Blog Posts
          </Link>
          <a
            href={`/blog/${post.slug}`}
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
            Edit: {post.title}
          </h1>
          <DeleteButton
            action={deleteBlogPost}
            entityId={post.id}
            entityName={post.title}
            entityType="Post"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <BlogPostForm post={post} />
      </div>
    </div>
  );
}
