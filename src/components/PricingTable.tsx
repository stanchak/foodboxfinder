import type { PlanFrequency } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/format";
import Badge from "@/components/Badge";

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
  frequency: PlanFrequency;
  canSkip: boolean;
  canCancel: boolean;
  cancelPolicy: string | null;
  featured: boolean;
}

function formatFrequency(frequency: PlanFrequency): string {
  const map: Record<PlanFrequency, string> = {
    WEEKLY: "Weekly",
    BIWEEKLY: "Every 2 Weeks",
    MONTHLY: "Monthly",
    FLEXIBLE: "Flexible",
  };
  return map[frequency];
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary-600"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-300"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function PricingTable({
  plans,
}: Readonly<{
  plans: PlanData[];
}>) {
  if (plans.length === 0) {
    return (
      <p className="text-neutral-500 text-sm">
        Pricing information is not yet available for this provider.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative rounded-2xl border p-6 flex flex-col ${
            plan.featured
              ? "border-primary-400 border-2 ring-2 ring-primary-100 bg-primary-50/30 scale-[1.02] shadow-md"
              : "border-neutral-200 bg-white"
          }`}
        >
          {/* Featured badge */}
          {plan.featured && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge color="dietary">Most Popular</Badge>
            </div>
          )}

          {/* Plan header */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-900">{plan.name}</h4>
            {plan.description && (
              <p className="mt-1 text-sm text-neutral-600">{plan.description}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="mt-4">
            {plan.pricePerServingCents != null && (
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-neutral-900">
                  {formatPrice(plan.pricePerServingCents)}
                </span>
                <span className="text-sm text-neutral-500">/serving</span>
              </div>
            )}
            {plan.pricePerWeekCents != null && (
              <p className="mt-1 text-sm text-neutral-600">
                {formatPrice(plan.pricePerWeekCents)}/week
              </p>
            )}
            {plan.pricePerBoxCents != null && (
              <p className="mt-1 text-sm text-neutral-600">
                {formatPrice(plan.pricePerBoxCents)}/box
              </p>
            )}
          </div>

          {/* Intro offer */}
          {plan.introOfferNote && (
            <div className="mt-3 rounded-lg bg-accent-50 px-3 py-2 text-sm font-medium text-accent-700">
              {plan.introOfferNote}
            </div>
          )}

          {/* Details */}
          <dl className="mt-5 space-y-3 text-sm flex-1">
            {plan.mealsPerWeek != null && (
              <div className="flex justify-between">
                <dt className="text-neutral-600">Meals per week</dt>
                <dd className="font-medium text-neutral-900">{plan.mealsPerWeek}</dd>
              </div>
            )}
            {plan.servingsPerMeal != null && (
              <div className="flex justify-between">
                <dt className="text-neutral-600">Servings per meal</dt>
                <dd className="font-medium text-neutral-900">{plan.servingsPerMeal}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-neutral-600">Frequency</dt>
              <dd className="font-medium text-neutral-900">{formatFrequency(plan.frequency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Shipping</dt>
              <dd className="font-medium text-neutral-900">
                {plan.shippingCostCents === 0
                  ? "Free"
                  : formatPrice(plan.shippingCostCents)}
                {plan.shippingNote && (
                  <span className="text-neutral-500 font-normal"> ({plan.shippingNote})</span>
                )}
              </dd>
            </div>
          </dl>

          {/* Flexibility */}
          <div className="mt-5 border-t border-neutral-200 pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {plan.canSkip ? <CheckIcon /> : <XIcon />}
              <span className={plan.canSkip ? "text-neutral-900" : "text-neutral-400"}>
                Skip deliveries
              </span>
              <span className="sr-only">
                {plan.canSkip ? "— available" : "— not available"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {plan.canCancel ? <CheckIcon /> : <XIcon />}
              <span className={plan.canCancel ? "text-neutral-900" : "text-neutral-400"}>
                Cancel anytime
              </span>
              <span className="sr-only">
                {plan.canCancel ? "— available" : "— not available"}
              </span>
            </div>
            {plan.cancelPolicy && (
              <p className="text-xs text-neutral-500 ml-6.5">
                {plan.cancelPolicy}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
