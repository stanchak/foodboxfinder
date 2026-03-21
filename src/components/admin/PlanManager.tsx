"use client";

import { useState } from "react";
import { deletePlan } from "@/app/actions/admin";
import PlanForm from "./PlanForm";

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

function formatCents(cents: number | null): string {
  if (cents === null) return "--";
  return `$${(cents / 100).toFixed(2)}`;
}

export default function PlanManager({
  providerId,
  plans,
}: Readonly<{
  providerId: string;
  plans: PlanData[];
}>) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Plans</h2>
        {!showNewForm && (
          <button
            type="button"
            onClick={() => { setShowNewForm(true); setEditingPlanId(null); }}
            className="bg-primary-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Add Plan
          </button>
        )}
      </div>

      {showNewForm && (
        <PlanForm
          providerId={providerId}
          onClose={() => setShowNewForm(false)}
        />
      )}

      {plans.length === 0 && !showNewForm ? (
        <p className="text-sm text-gray-500 py-4">No plans yet. Click &quot;Add Plan&quot; to create one.</p>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.id}>
              {editingPlanId === plan.id ? (
                <PlanForm
                  providerId={providerId}
                  plan={plan}
                  onClose={() => setEditingPlanId(null)}
                />
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{plan.name}</h3>
                        {plan.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Featured
                          </span>
                        )}
                        {!plan.active && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>Per serving: {formatCents(plan.pricePerServingCents)}</span>
                        <span>Per week: {formatCents(plan.pricePerWeekCents)}</span>
                        <span>Shipping: {formatCents(plan.shippingCostCents)}</span>
                        <span>Frequency: {plan.frequency}</span>
                      </div>
                      {plan.description && (
                        <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => { setEditingPlanId(plan.id); setShowNewForm(false); }}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Edit
                      </button>
                      <form action={deletePlan}>
                        <input type="hidden" name="id" value={plan.id} />
                        <input type="hidden" name="providerId" value={providerId} />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                          onClick={(e) => {
                            if (!confirm("Delete this plan?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
