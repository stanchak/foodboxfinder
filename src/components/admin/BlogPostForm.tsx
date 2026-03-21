"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createBlogPost, updateBlogPost } from "@/app/actions/admin";
import type { AdminFormState } from "@/app/actions/admin";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImageUrl: string | null;
  author: string | null;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

const initialState: AdminFormState = {
  success: false,
  message: "",
  errors: {},
};

export default function BlogPostForm({
  post,
}: Readonly<{
  post?: BlogPostData;
}>) {
  const action = post ? updateBlogPost : createBlogPost;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

      {state.message && (
        <div
          className={`border rounded-lg p-3 text-sm ${
            state.success
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={post?.title ?? ""}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          {state.errors.title && (
            <p className="mt-1 text-sm text-red-600">{state.errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            defaultValue={post?.slug ?? ""}
            placeholder="Auto-generated from title if empty"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          {state.errors.slug && (
            <p className="mt-1 text-sm text-red-600">{state.errors.slug}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
            Author
          </label>
          <input
            type="text"
            id="author"
            name="author"
            defaultValue={post?.author ?? ""}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={post?.status ?? "DRAFT"}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {state.errors.status && (
            <p className="mt-1 text-sm text-red-600">{state.errors.status}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
          Excerpt (max 300 chars)
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          maxLength={300}
          defaultValue={post?.excerpt ?? ""}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          Body *
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={16}
          defaultValue={post?.body ?? ""}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        {state.errors.body && (
          <p className="mt-1 text-sm text-red-600">{state.errors.body}</p>
        )}
      </div>

      <div>
        <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image URL
        </label>
        <input
          type="url"
          id="coverImageUrl"
          name="coverImageUrl"
          defaultValue={post?.coverImageUrl ?? ""}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* SEO */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 w-full">
          SEO
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title (max 70 chars)
            </label>
            <input
              type="text"
              id="metaTitle"
              name="metaTitle"
              maxLength={70}
              defaultValue={post?.metaTitle ?? ""}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description (max 160 chars)
            </label>
            <input
              type="text"
              id="metaDescription"
              name="metaDescription"
              maxLength={160}
              defaultValue={post?.metaDescription ?? ""}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </fieldset>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : post ? "Update Post" : "Create Post"}
        </button>
        <Link
          href="/admin/blog"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
