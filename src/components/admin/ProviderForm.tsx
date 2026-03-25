"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createProvider, updateProvider } from "@/app/actions/admin";
import type { AdminFormState } from "@/app/actions/admin";
import FormBanner from "@/components/admin/FormBanner";

const CATEGORY_OPTIONS = [
  { value: "MEAL_KIT", label: "Meal Kit" },
  { value: "PREPARED_MEAL", label: "Prepared Meal" },
  { value: "PROTEIN_BOX", label: "Protein Box" },
  { value: "PRODUCE_BOX", label: "Produce Box" },
  { value: "SPECIALTY", label: "Specialty" },
];

const VALUE_TIER_OPTIONS = [
  { value: "BUDGET", label: "Budget" },
  { value: "MID", label: "Mid" },
  { value: "PREMIUM", label: "Premium" },
  { value: "LUXURY", label: "Luxury" },
];

const DIETARY_TAG_OPTIONS = [
  { value: "VEGAN", label: "Vegan" },
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "PESCATARIAN", label: "Pescatarian" },
  { value: "KETO", label: "Keto" },
  { value: "PALEO", label: "Paleo" },
  { value: "GLUTEN_FREE", label: "Gluten Free" },
  { value: "DAIRY_FREE", label: "Dairy Free" },
  { value: "NUT_FREE", label: "Nut Free" },
  { value: "LOW_CARB", label: "Low Carb" },
  { value: "LOW_SODIUM", label: "Low Sodium" },
  { value: "ORGANIC", label: "Organic" },
  { value: "HALAL", label: "Halal" },
  { value: "KOSHER", label: "Kosher" },
  { value: "DIABETIC_FRIENDLY", label: "Diabetic Friendly" },
  { value: "WHOLE30", label: "Whole30" },
  { value: "MEDITERRANEAN", label: "Mediterranean" },
];

interface ProviderData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  website: string;
  affiliateUrl: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  heroImageSource: string | null;
  foundedYear: number | null;
  headquarters: string | null;
  deliveryAreaDescription: string | null;
  editorNote: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  category: string;
  secondaryCategory: string | null;
  featured: boolean;
  status: string;
  freeShipping: boolean;
  minPricePerServingCents: number | null;
  maxPricePerServingCents: number | null;
  prosJson: unknown;
  consJson: unknown;
  dietaryTags: Array<{ tag: string }>;
  modelType: string | null;
  prepStyle: string | null;
  valueTier: string | null;
  householdFit: string | null;
  geography: string | null;
  flexibility: string | null;
  shippingNotes: string | null;
  pricingSignal: string | null;
  parentCompany: string | null;
}

const initialState: AdminFormState = {
  success: false,
  message: "",
  errors: {},
};

export default function ProviderForm({
  provider,
}: Readonly<{
  provider?: ProviderData;
}>) {
  const action = provider ? updateProvider : createProvider;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const prosArray = Array.isArray(provider?.prosJson) ? provider.prosJson as string[] : [];
  const consArray = Array.isArray(provider?.consJson) ? provider.consJson as string[] : [];
  const selectedTags = provider?.dietaryTags.map((t) => t.tag) ?? [];

  return (
    <form action={formAction} className="space-y-8">
      {provider && <input type="hidden" name="id" value={provider.id} />}

      <FormBanner success={state.success} message={state.message} />

      {/* Basic Info */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 w-full">
          Basic Information
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={provider?.name ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            {state.errors.name && (
              <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-neutral-700 mb-1">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              defaultValue={provider?.slug ?? ""}
              placeholder="Auto-generated from name if empty"
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="text-xs text-neutral-500 mt-1">URL-friendly identifier (e.g. &quot;hello-fresh&quot;). Auto-generated from name if left blank.</p>
            {state.errors.slug && (
              <p className="mt-1 text-sm text-red-600">{state.errors.slug}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-neutral-700 mb-1">
            Short Description
          </label>
          <input
            type="text"
            id="shortDescription"
            name="shortDescription"
            maxLength={300}
            defaultValue={provider?.shortDescription ?? ""}
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <p className="text-xs text-neutral-500 mt-1">One-liner shown on cards and search results (max 300 chars).</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={provider?.description ?? ""}
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <p className="text-xs text-neutral-500 mt-1">Full description shown on the provider detail page.</p>
          {state.errors.description && (
            <p className="mt-1 text-sm text-red-600">{state.errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-neutral-700 mb-1">
              Website URL *
            </label>
            <input
              type="url"
              id="website"
              name="website"
              required
              defaultValue={provider?.website ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            {state.errors.website && (
              <p className="mt-1 text-sm text-red-600">{state.errors.website}</p>
            )}
          </div>

          <div>
            <label htmlFor="affiliateUrl" className="block text-sm font-medium text-neutral-700 mb-1">
              Affiliate URL
            </label>
            <input
              type="url"
              id="affiliateUrl"
              name="affiliateUrl"
              defaultValue={provider?.affiliateUrl ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="text-xs text-neutral-500 mt-1">Tracked link for monetization. Users clicking &quot;Visit Site&quot; go here instead of the website URL.</p>
          </div>
        </div>
      </fieldset>

      {/* Category & Tags */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 w-full">
          Category & Dietary Tags
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
              Primary Category *
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={provider?.category ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select category...</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {state.errors.category && (
              <p className="mt-1 text-sm text-red-600">{state.errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="secondaryCategory" className="block text-sm font-medium text-neutral-700 mb-1">
              Secondary Category
            </label>
            <select
              id="secondaryCategory"
              name="secondaryCategory"
              defaultValue={provider?.secondaryCategory ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">None</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">Dietary Tags</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {DIETARY_TAG_OPTIONS.map((tag) => (
              <label key={tag.value} className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="dietaryTags"
                  value={tag.value}
                  defaultChecked={selectedTags.includes(tag.value)}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                {tag.label}
              </label>
            ))}
          </div>
          {state.errors.dietaryTags && (
            <p className="mt-1 text-sm text-red-600">{state.errors.dietaryTags}</p>
          )}
        </div>
      </fieldset>

      {/* Provider Characteristics */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 w-full">
          Provider Characteristics
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="valueTier" className="block text-sm font-medium text-neutral-700 mb-1">
              Value Tier
            </label>
            <select
              id="valueTier"
              name="valueTier"
              defaultValue={provider?.valueTier ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Not set</option>
              {VALUE_TIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1">Price positioning: Budget (&lt;$7), Mid ($7-10), Premium ($10-14), Luxury ($14+) per serving.</p>
          </div>

          <div>
            <label htmlFor="modelType" className="block text-sm font-medium text-neutral-700 mb-1">
              Model Type
            </label>
            <input
              type="text"
              id="modelType"
              name="modelType"
              placeholder="e.g. Traditional, Marketplace"
              defaultValue={provider?.modelType ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="text-xs text-neutral-500 mt-1">Business model: Traditional (curated menu), Marketplace (choose from vendors), or Hybrid.</p>
          </div>

          <div>
            <label htmlFor="prepStyle" className="block text-sm font-medium text-neutral-700 mb-1">
              Prep Style
            </label>
            <input
              type="text"
              id="prepStyle"
              name="prepStyle"
              placeholder="e.g. Cook from scratch, Heat and eat"
              defaultValue={provider?.prepStyle ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="text-xs text-neutral-500 mt-1">How much cooking is involved: Cook from scratch, Heat and eat, Ready to eat, No cook.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="householdFit" className="block text-sm font-medium text-neutral-700 mb-1">
              Household Fit
            </label>
            <input
              type="text"
              id="householdFit"
              name="householdFit"
              placeholder="e.g. Couples, Families, Singles"
              defaultValue={provider?.householdFit ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="text-xs text-neutral-500 mt-1">Who this service works best for: Singles, Couples, Families, Large families.</p>
          </div>

          <div>
            <label htmlFor="geography" className="block text-sm font-medium text-neutral-700 mb-1">
              Geography
            </label>
            <input
              type="text"
              id="geography"
              name="geography"
              placeholder="e.g. Nationwide, Regional (West Coast)"
              defaultValue={provider?.geography ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="text-xs text-neutral-500 mt-1">Delivery coverage: Nationwide, Regional, or specific area (e.g. &quot;West Coast only&quot;).</p>
          </div>

          <div>
            <label htmlFor="pricingSignal" className="block text-sm font-medium text-neutral-700 mb-1">
              Pricing Signal
            </label>
            <input
              type="text"
              id="pricingSignal"
              name="pricingSignal"
              placeholder="e.g. $8-12/serving"
              defaultValue={provider?.pricingSignal ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="text-xs text-neutral-500 mt-1">Human-readable price range shown on cards when plan data is unavailable.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="shippingNotes" className="block text-sm font-medium text-neutral-700 mb-1">
              Shipping Notes
            </label>
            <textarea
              id="shippingNotes"
              name="shippingNotes"
              rows={2}
              placeholder="Shipping details..."
              defaultValue={provider?.shippingNotes ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label htmlFor="flexibility" className="block text-sm font-medium text-neutral-700 mb-1">
              Flexibility
            </label>
            <textarea
              id="flexibility"
              name="flexibility"
              rows={2}
              placeholder="Skip, pause, cancel policies..."
              defaultValue={provider?.flexibility ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="text-xs text-neutral-500 mt-1">Subscription flexibility: skip/pause/cancel policies, commitment length, etc.</p>
          </div>
        </div>
      </fieldset>

      {/* Images */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 w-full">
          Images
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-neutral-700 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              id="logoUrl"
              name="logoUrl"
              defaultValue={provider?.logoUrl ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label htmlFor="heroImageUrl" className="block text-sm font-medium text-neutral-700 mb-1">
              Hero Image URL
            </label>
            <input
              type="url"
              id="heroImageUrl"
              name="heroImageUrl"
              defaultValue={provider?.heroImageUrl ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            {provider?.heroImageSource && (
              <p className="mt-1 text-xs text-neutral-500">
                Source: <span className="font-medium">{provider.heroImageSource.replace("_", " ").toLowerCase()}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="pullHeroFromUrl" className="block text-sm font-medium text-neutral-700 mb-1">
              Pull Hero Image from URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="pullHeroFromUrl"
                name="pullHeroFromUrl"
                placeholder="Paste any image URL to download locally..."
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              If provided, this URL will be downloaded and saved as the hero image (overrides Hero Image URL above).
            </p>
          </div>

          <div>
            <label htmlFor="heroImageSource" className="block text-sm font-medium text-neutral-700 mb-1">
              Hero Image Source
            </label>
            <select
              id="heroImageSource"
              name="heroImageSource"
              defaultValue={provider?.heroImageSource ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Not set</option>
              <option value="OG_IMAGE">OG Image (from provider site)</option>
              <option value="SITE_SCRAPE">Site Scrape (from provider homepage)</option>
              <option value="GENERATED">Generated (stock/AI fallback)</option>
              <option value="MANUAL">Manual (admin-provided)</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* Business Details */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 w-full">
          Business Details
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="foundedYear" className="block text-sm font-medium text-neutral-700 mb-1">
              Founded Year
            </label>
            <input
              type="number"
              id="foundedYear"
              name="foundedYear"
              min={1900}
              max={2100}
              defaultValue={provider?.foundedYear ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label htmlFor="headquarters" className="block text-sm font-medium text-neutral-700 mb-1">
              Headquarters
            </label>
            <input
              type="text"
              id="headquarters"
              name="headquarters"
              defaultValue={provider?.headquarters ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label htmlFor="deliveryAreaDescription" className="block text-sm font-medium text-neutral-700 mb-1">
              Delivery Area
            </label>
            <input
              type="text"
              id="deliveryAreaDescription"
              name="deliveryAreaDescription"
              defaultValue={provider?.deliveryAreaDescription ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="parentCompany" className="block text-sm font-medium text-neutral-700 mb-1">
            Parent Company
          </label>
          <input
            type="text"
            id="parentCompany"
            name="parentCompany"
            placeholder="e.g. HelloFresh SE, Wonder Group"
            defaultValue={provider?.parentCompany ?? ""}
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </fieldset>

      {/* Pricing (edit only) */}
      {provider && (
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 w-full">
            Price Overrides (cents)
          </legend>
          <p className="text-xs text-neutral-500">
            These are normally auto-calculated from plans. Override only if needed. Enter values in cents (e.g. 899 = $8.99).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minPricePerServingCents" className="block text-sm font-medium text-neutral-700 mb-1">
                Min Price/Serving (cents)
              </label>
              <input
                type="number"
                id="minPricePerServingCents"
                name="minPricePerServingCents"
                defaultValue={provider.minPricePerServingCents ?? ""}
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label htmlFor="maxPricePerServingCents" className="block text-sm font-medium text-neutral-700 mb-1">
                Max Price/Serving (cents)
              </label>
              <input
                type="number"
                id="maxPricePerServingCents"
                name="maxPricePerServingCents"
                defaultValue={provider.maxPricePerServingCents ?? ""}
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </fieldset>
      )}

      {/* Editorial */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 w-full">
          Editorial Content
        </legend>

        <div>
          <label htmlFor="editorNote" className="block text-sm font-medium text-neutral-700 mb-1">
            Editor Note
          </label>
          <textarea
            id="editorNote"
            name="editorNote"
            rows={3}
            defaultValue={provider?.editorNote ?? ""}
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pros" className="block text-sm font-medium text-neutral-700 mb-1">
              Pros (one per line)
            </label>
            <textarea
              id="pros"
              name="pros"
              rows={4}
              defaultValue={prosArray.join("\n")}
              placeholder="Great variety of meals&#10;Easy to cook&#10;Fresh ingredients"
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label htmlFor="cons" className="block text-sm font-medium text-neutral-700 mb-1">
              Cons (one per line)
            </label>
            <textarea
              id="cons"
              name="cons"
              rows={4}
              defaultValue={consArray.join("\n")}
              placeholder="Higher price point&#10;Limited options for large families"
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </fieldset>

      {/* SEO */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 w-full">
          SEO
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-neutral-700 mb-1">
              Meta Title (max 70 chars)
            </label>
            <input
              type="text"
              id="metaTitle"
              name="metaTitle"
              maxLength={70}
              defaultValue={provider?.metaTitle ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-neutral-700 mb-1">
              Meta Description (max 160 chars)
            </label>
            <input
              type="text"
              id="metaDescription"
              name="metaDescription"
              maxLength={160}
              defaultValue={provider?.metaDescription ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </fieldset>

      {/* Flags */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 w-full">
          Status & Flags
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={provider?.status ?? "ACTIVE"}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="ACTIVE">Active</option>
              <option value="HYBRID">Hybrid</option>
              <option value="UNCLEAR">Unclear</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
            {state.errors.status && (
              <p className="mt-1 text-sm text-red-600">{state.errors.status}</p>
            )}
          </div>

          <div className="flex items-end gap-6">
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={provider?.featured ?? false}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              Featured
            </label>

            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                name="freeShipping"
                defaultChecked={provider?.freeShipping ?? false}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              Free Shipping
            </label>
          </div>
        </div>
      </fieldset>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending
            ? "Saving..."
            : provider
              ? "Update Provider"
              : "Create Provider"}
        </button>
        <Link
          href="/admin/providers"
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
