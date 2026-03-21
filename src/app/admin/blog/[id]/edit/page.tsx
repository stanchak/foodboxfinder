import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteBlogPost } from "@/app/actions/admin";
import BlogPostForm from "@/components/admin/BlogPostForm";

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
      <div className="mb-6">
        <Link
          href="/admin/blog"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Blog Posts
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit: {post.title}
          </h1>
          <form action={deleteBlogPost}>
            <input type="hidden" name="id" value={post.id} />
            <button
              type="submit"
              className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-100 transition-colors"
              onClick={(e) => {
                if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) {
                  e.preventDefault();
                }
              }}
            >
              Delete Post
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <BlogPostForm post={post} />
      </div>
    </div>
  );
}
