"use client";

import { useActionState } from "react";
import { savePlan } from "@/app/actions/admin";
import type { AdminFormState } from "@/app/actions/admin";

const FREQUENCY_OPTIONS = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Biweekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "FLEXIBLE", label: "Flexible" },
];

interface PlanData {
  id: string;
  name: string;
  description: string | null;
  pricePerServingCents: number | null;
  pricePerWeekCents: number | null;
  pricePerBoxCents: number | null;
  shippingCostCents: number;
  shippingNote: string | null;
  introOfferNote: string | null;
  servingsPerMeal: number | null;
  mealsPerWeek: number | null;
  frequency: string;
  minimumOrder: number | null;
  canSkip: boolean;
  canCancel: boolean;
  cancelPolicy: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
}

const initialState: AdminFormState = {
  success: false,
  message: "",
  errors: {},
};

export default function PlanForm({
  providerId,
  plan,
  onClose,
}: Readonly<{
  providerId: string;
  plan?: PlanData;
  onClose: () => void;
}>) {
  const [state, formAction, isPending] = useActionState(savePlan, initialState);

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="providerId" value={providerId} />
        {plan && <input type="hidden" name="id" value={plan.id} />}

        {state.message && (
          <div
            className={`border rounded-lg p-2 text-sm ${
              state.success
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="planName" className="block text-xs font-medium text-neutral-600 mb-1">
              Plan Name *
            </label>
            <input
              type="text"
              id="planName"
              name="name"
              required
              defaultValue={plan?.name ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label htmlFor="planFrequency" className="block text-xs font-medium text-neutral-600 mb-1">
              Frequency
            </label>
            <select
              id="planFrequency"
              name="frequency"
              defaultValue={plan?.frequency ?? "WEEKLY"}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="planSortOrder" className="block text-xs font-medium text-neutral-600 mb-1">
              Sort Order
            </label>
            <input
              type="number"
              id="planSortOrder"
              name="sortOrder"
              defaultValue={plan?.sortOrder ?? 0}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="planDescription" className="block text-xs font-medium text-neutral-600 mb-1">
            Description
          </label>
          <textarea
            id="planDescription"
            name="description"
            rows={2}
            defaultValue={plan?.description ?? ""}
            className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="planPricePerServing" className="block text-xs font-medium text-neutral-600 mb-1">
              Price/Serving (cents)
            </label>
            <input
              type="number"
              id="planPricePerServing"
              name="pricePerServingCents"
              defaultValue={plan?.pricePerServingCents ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label htmlFor="planPricePerWeek" className="block text-xs font-medium text-neutral-600 mb-1">
              Price/Week (cents)
            </label>
            <input
              type="number"
              id="planPricePerWeek"
              name="pricePerWeekCents"
              defaultValue={plan?.pricePerWeekCents ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label htmlFor="planPricePerBox" className="block text-xs font-medium text-neutral-600 mb-1">
              Price/Box (cents)
            </label>
            <input
              type="number"
              id="planPricePerBox"
              name="pricePerBoxCents"
              defaultValue={plan?.pricePerBoxCents ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label htmlFor="planShippingCost" className="block text-xs font-medium text-neutral-600 mb-1">
              Shipping (cents)
            </label>
            <input
              type="number"
              id="planShippingCost"
              name="shippingCostCents"
              defaultValue={plan?.shippingCostCents ?? 0}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="planServingsPerMeal" className="block text-xs font-medium text-neutral-600 mb-1">
              Servings/Meal
            </label>
            <input
              type="number"
              id="planServingsPerMeal"
              name="servingsPerMeal"
              defaultValue={plan?.servingsPerMeal ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label htmlFor="planMealsPerWeek" className="block text-xs font-medium text-neutral-600 mb-1">
              Meals/Week
            </label>
            <input
              type="number"
              id="planMealsPerWeek"
              name="mealsPerWeek"
              defaultValue={plan?.mealsPerWeek ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label htmlFor="planMinimumOrder" className="block text-xs font-medium text-neutral-600 mb-1">
              Min Order
            </label>
            <input
              type="number"
              id="planMinimumOrder"
              name="minimumOrder"
              defaultValue={plan?.minimumOrder ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="planShippingNote" className="block text-xs font-medium text-neutral-600 mb-1">
              Shipping Note
            </label>
            <input
              type="text"
              id="planShippingNote"
              name="shippingNote"
              defaultValue={plan?.shippingNote ?? ""}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label htmlFor="planIntroOffer" className="block text-xs font-medium text-neutral-600 mb-1">
              Intro Offer Note
            </label>
            <input
              type="text"
              id="planIntroOffer"
              name="introOfferNote"
              defaultValue={plan?.introOfferNote ?? ""}
              placeholder='e.g. "60% off first box"'
              className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="planCancelPolicy" className="block text-xs font-medium text-neutral-600 mb-1">
            Cancel Policy
          </label>
          <input
            type="text"
            id="planCancelPolicy"
            name="cancelPolicy"
            defaultValue={plan?.cancelPolicy ?? ""}
            className="block w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="canSkip"
              defaultChecked={plan?.canSkip ?? false}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            Can Skip
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="canCancel"
              defaultChecked={plan?.canCancel ?? false}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            Can Cancel
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={plan?.featured ?? false}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="active"
              defaultChecked={plan?.active ?? true}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            Active
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Saving..." : plan ? "Update Plan" : "Add Plan"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
