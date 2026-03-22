import type { Metadata } from "next";
import Link from "next/link";
import BlogPostForm from "@/components/admin/BlogPostForm";

export const metadata: Metadata = {
  title: "New Blog Post",
};

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/blog"
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          &larr; Back to Blog Posts
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 mt-2">New Blog Post</h1>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <BlogPostForm />
      </div>
    </div>
  );
}
