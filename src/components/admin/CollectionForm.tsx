"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createCollection, updateCollection } from "@/app/actions/admin";
import type { AdminFormState } from "@/app/actions/admin";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

interface CollectionData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  body: string | null;
  coverImageUrl: string | null;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
  items: Array<{
    id: string;
    providerId: string;
    sortOrder: number;
    note: string | null;
    provider: { id: string; name: string };
  }>;
}

interface ProviderOption {
  id: string;
  name: string;
}

interface CollectionItemState {
  key: string;
  providerId: string;
  sortOrder: number;
  note: string;
}

const initialState: AdminFormState = {
  success: false,
  message: "",
  errors: {},
};

export default function CollectionForm({
  collection,
  providers,
}: Readonly<{
  collection?: CollectionData;
  providers: ProviderOption[];
}>) {
  const action = collection ? updateCollection : createCollection;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const initialItems: CollectionItemState[] = collection?.items.map((item) => ({
    key: item.id,
    providerId: item.providerId,
    sortOrder: item.sortOrder,
    note: item.note ?? "",
  })) ?? [];

  const [items, setItems] = useState<CollectionItemState[]>(initialItems);

  function addItem() {
    setItems([
      ...items,
      {
        key: `new-${Date.now()}`,
        providerId: "",
        sortOrder: items.length,
        note: "",
      },
    ]);
  }

  function removeItem(key: string) {
    setItems(items.filter((item) => item.key !== key));
  }

  function updateItem(key: string, field: keyof CollectionItemState, value: string | number) {
    setItems(items.map((item) =>
      item.key === key ? { ...item, [field]: value } : item
    ));
  }

  return (
    <form action={formAction} className="space-y-6">
      {collection && <input type="hidden" name="id" value={collection.id} />}

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
            defaultValue={collection?.title ?? ""}
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
            defaultValue={collection?.slug ?? ""}
            placeholder="Auto-generated from title if empty"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          {state.errors.slug && (
            <p className="mt-1 text-sm text-red-600">{state.errors.slug}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={collection?.status ?? "DRAFT"}
          className="block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={collection?.description ?? ""}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          Body (editorial content)
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          defaultValue={collection?.body ?? ""}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div>
        <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image URL
        </label>
        <input
          type="url"
          id="coverImageUrl"
          name="coverImageUrl"
          defaultValue={collection?.coverImageUrl ?? ""}
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
              defaultValue={collection?.metaTitle ?? ""}
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
              defaultValue={collection?.metaDescription ?? ""}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </fieldset>

      {/* Collection Items (Provider Picker) */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 w-full">
          Collection Items
        </legend>

        {items.length === 0 && (
          <p className="text-sm text-gray-500">
            No providers added yet. Click &quot;Add Provider&quot; below.
          </p>
        )}

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.key}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-sm font-medium text-gray-400 mt-2 w-6 text-center flex-shrink-0">
                  {index + 1}
                </span>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Provider
                    </label>
                    <select
                      name="itemProviderId"
                      value={item.providerId}
                      onChange={(e) => updateItem(item.key, "providerId", e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">Select provider...</option>
                      {providers.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      name="itemSortOrder"
                      value={item.sortOrder}
                      onChange={(e) => updateItem(item.key, "sortOrder", parseInt(e.target.value, 10) || 0)}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Note
                    </label>
                    <input
                      type="text"
                      name="itemNote"
                      value={item.note}
                      onChange={(e) => updateItem(item.key, "note", e.target.value)}
                      placeholder="Optional note"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="mt-5 text-red-500 hover:text-red-700 flex-shrink-0"
                  title="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          + Add Provider
        </button>
      </fieldset>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending
            ? "Saving..."
            : collection
              ? "Update Collection"
              : "Create Collection"}
        </button>
        <Link
          href="/admin/collections"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
