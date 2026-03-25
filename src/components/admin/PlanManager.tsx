"use client";

import { useState, useRef } from "react";
import { deletePlan } from "@/app/actions/admin";
import PlanForm from "./PlanForm";
import ConfirmModal from "./ConfirmModal";

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
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const deleteFormRefs = useRef<Map<string, HTMLFormElement>>(new Map());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Plans</h2>
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
        <p className="text-sm text-neutral-500 py-4">No plans yet. Click &quot;Add Plan&quot; to create one.</p>
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
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-neutral-900">{plan.name}</h3>
                        {plan.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Featured
                          </span>
                        )}
                        {!plan.active && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-4 text-sm text-neutral-600">
                        <span>Per serving: {formatCents(plan.pricePerServingCents)}</span>
                        <span>Per week: {formatCents(plan.pricePerWeekCents)}</span>
                        <span>Shipping: {formatCents(plan.shippingCostCents)}</span>
                        <span>Frequency: {plan.frequency}</span>
                      </div>
                      {plan.description && (
                        <p className="mt-1 text-sm text-neutral-500">{plan.description}</p>
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
                      <form
                        ref={(el) => {
                          if (el) deleteFormRefs.current.set(plan.id, el);
                          else deleteFormRefs.current.delete(plan.id);
                        }}
                        action={deletePlan}
                      >
                        <input type="hidden" name="id" value={plan.id} />
                        <input type="hidden" name="providerId" value={providerId} />
                        <button
                          type="button"
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                          onClick={() => setDeletingPlanId(plan.id)}
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

      <ConfirmModal
        open={deletingPlanId !== null}
        title="Delete Plan"
        message={`Delete this plan? This cannot be undone.`}
        confirmLabel="Delete Plan"
        onConfirm={() => {
          if (deletingPlanId) {
            const form = deleteFormRefs.current.get(deletingPlanId);
            form?.requestSubmit();
          }
          setDeletingPlanId(null);
        }}
        onCancel={() => setDeletingPlanId(null)}
      />
    </div>
  );
}
