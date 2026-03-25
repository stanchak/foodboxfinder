import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog Posts",
};

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          New Post
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Author</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Published</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Updated</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    No blog posts yet.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-neutral-900">{post.title}</p>
                        <p className="text-xs text-neutral-500"><code className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded">/{post.slug}</code></p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {post.author ?? "--"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : post.status === "DRAFT"
                            ? "bg-neutral-100 text-neutral-600"
                            : "bg-amber-100 text-amber-700"
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 text-sm">
                      {post.publishedAt
                        ? post.publishedAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "--"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 text-sm">
                      {post.updatedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
          {posts.length} post{posts.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
