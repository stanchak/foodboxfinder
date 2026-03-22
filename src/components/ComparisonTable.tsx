import Link from "next/link";
import ProviderLogo from "@/components/ProviderLogo";
import type { CategoryType, DietaryTag, PlanFrequency } from "@/generated/prisma/client";
import { CATEGORY_MAP } from "@/lib/categories";
import { formatPrice, formatPriceRange } from "@/lib/format";
import RatingStars from "@/components/RatingStars";
import Badge from "@/components/Badge";
import AffiliateLink from "@/components/AffiliateLink";

// -- Types --

interface ComparisonPlan {
  id: string;
  name: string;
  pricePerServingCents: number | null;
  pricePerWeekCents: number | null;
  pricePerBoxCents: number | null;
  shippingCostCents: number;
  servingsPerMeal: number | null;
  mealsPerWeek: number | null;
  frequency: PlanFrequency;
  canSkip: boolean;
  canCancel: boolean;
  featured: boolean;
}

interface ComparisonProvider {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  logoUrl: string | null;
  website: string;
  affiliateUrl: string | null;
  averageRating: number;
  reviewCount: number;
  minPricePerServingCents: number | null;
  maxPricePerServingCents: number | null;
  freeShipping: boolean;
  category: CategoryType;
  secondaryCategory: CategoryType | null;
  dietaryTags: Array<{ tag: DietaryTag }>;
  plans: ComparisonPlan[];
  // New dataset fields
  prepStyle: string | null;
  valueTier: string | null;
  modelType: string | null;
  householdFit: string | null;
  geography: string | null;
  shippingNotes: string | null;
  flexibility: string | null;
  prosJson: unknown;
  consJson: unknown;
}

// -- Helpers --

function formatDietaryLabel(tag: DietaryTag): string {
  return tag
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function formatFrequency(freq: PlanFrequency): string {
  const map: Record<PlanFrequency, string> = {
    WEEKLY: "Weekly",
    BIWEEKLY: "Biweekly",
    MONTHLY: "Monthly",
    FLEXIBLE: "Flexible",
  };
  return map[freq];
}

const VALUE_TIER_LABELS: Record<string, string> = {
  BUDGET: "Budget",
  MID: "Mid-Range",
  PREMIUM: "Premium",
  LUXURY: "Luxury",
};

function formatValueTier(tier: string | null): string {
  if (!tier) return "N/A";
  return VALUE_TIER_LABELS[tier] ?? tier;
}

function isFieldEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function parseJsonStringArray(json: unknown): string[] {
  if (!Array.isArray(json)) return [];
  return json.filter((item): item is string => typeof item === "string");
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
      className="text-gray-300"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// -- Component --

export default function ComparisonTable({
  providers,
}: Readonly<{
  providers: ComparisonProvider[];
}>) {
  const colCount = providers.length;

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-top sm:rounded-xl sm:border sm:border-gray-200 sm:overflow-hidden">
        <table
          className="min-w-full border-collapse"
          role="table"
          aria-label="Provider comparison"
        >
          {/* Provider Header Row */}
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-gray-50 w-40 sm:w-48 p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200"
              >
                <span className="sr-only">Feature</span>
              </th>
              {providers.map((provider, index) => (
                <th
                  key={provider.id}
                  scope="col"
                  className={`p-4 text-center border-b border-gray-200 bg-white min-w-[200px] ${
                    index < colCount - 1 ? "border-r border-gray-100" : ""
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Link
                      href={`/providers/${provider.slug}`}
                      className="group flex flex-col items-center gap-2"
                    >
                      <ProviderLogo
                        logoUrl={provider.logoUrl}
                        name={provider.name}
                        size="md"
                      />
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                        {provider.name}
                      </span>
                    </Link>
                    <Badge color="category">
                      {CATEGORY_MAP[provider.category].label}
                    </Badge>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Rating Row */}
            <ComparisonRow label="Rating" providers={providers}>
              {(provider) => (
                <div className="flex flex-col items-center gap-1">
                  {provider.reviewCount > 0 ? (
                    <>
                      <RatingStars
                        rating={provider.averageRating}
                        size="sm"
                        showNumeric={false}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {provider.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {provider.reviewCount}{" "}
                        {provider.reviewCount === 1 ? "review" : "reviews"}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">No reviews</span>
                  )}
                </div>
              )}
            </ComparisonRow>

            {/* Price Range Row */}
            <ComparisonRow label="Price/Serving" providers={providers} highlight>
              {(provider) => (
                <span className="text-sm font-semibold text-gray-900">
                  {formatPriceRange(
                    provider.minPricePerServingCents,
                    provider.maxPricePerServingCents,
                  )}
                </span>
              )}
            </ComparisonRow>

            {/* Free Shipping Row */}
            <ComparisonRow label="Free Shipping" providers={providers}>
              {(provider) => (
                <div className="flex justify-center" aria-label={provider.freeShipping ? "Yes" : "No"}>
                  {provider.freeShipping ? <CheckIcon /> : <XIcon />}
                </div>
              )}
            </ComparisonRow>

            {/* Dietary Tags Row */}
            <ComparisonRow label="Dietary Options" providers={providers} highlight>
              {(provider) =>
                provider.dietaryTags.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-1">
                    {provider.dietaryTags.map(({ tag }) => (
                      <Badge key={tag} color="dietary">
                        {formatDietaryLabel(tag)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">None listed</span>
                )
              }
            </ComparisonRow>

            {/* Section: Provider Details Header */}
            <SectionHeader label="Provider Details" colCount={colCount} />

            {/* Prep Style */}
            <HideableComparisonRow
              label="Prep Style"
              providers={providers}
              values={providers.map((p) => p.prepStyle)}
            >
              {(provider) => (
                <span className="text-sm text-gray-700">
                  {provider.prepStyle ?? "N/A"}
                </span>
              )}
            </HideableComparisonRow>

            {/* Value Tier */}
            <HideableComparisonRow
              label="Value Tier"
              providers={providers}
              values={providers.map((p) => p.valueTier)}
              highlight
            >
              {(provider) => (
                <span className="text-sm text-gray-700">
                  {formatValueTier(provider.valueTier)}
                </span>
              )}
            </HideableComparisonRow>

            {/* Model Type */}
            <HideableComparisonRow
              label="Model Type"
              providers={providers}
              values={providers.map((p) => p.modelType)}
            >
              {(provider) => (
                <span className="text-sm text-gray-700">
                  {provider.modelType ?? "N/A"}
                </span>
              )}
            </HideableComparisonRow>

            {/* Household Fit */}
            <HideableComparisonRow
              label="Household Fit"
              providers={providers}
              values={providers.map((p) => p.householdFit)}
              highlight
            >
              {(provider) => (
                <span className="text-sm text-gray-700">
                  {provider.householdFit ?? "N/A"}
                </span>
              )}
            </HideableComparisonRow>

            {/* Geography */}
            <HideableComparisonRow
              label="Geography"
              providers={providers}
              values={providers.map((p) => p.geography)}
            >
              {(provider) => (
                <span className="text-sm text-gray-700">
                  {provider.geography ?? "N/A"}
                </span>
              )}
            </HideableComparisonRow>

            {/* Section: Pros & Cons Header */}
            <SectionHeader label="Pros & Cons" colCount={colCount} />

            {/* Pros */}
            <HideableComparisonRow
              label="Pros"
              providers={providers}
              values={providers.map((p) => parseJsonStringArray(p.prosJson))}
            >
              {(provider) => {
                const pros = parseJsonStringArray(provider.prosJson);
                return pros.length > 0 ? (
                  <ul className="text-sm text-gray-700 text-left space-y-1">
                    {pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" aria-hidden="true" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm text-gray-400">N/A</span>
                );
              }}
            </HideableComparisonRow>

            {/* Cons */}
            <HideableComparisonRow
              label="Cons"
              providers={providers}
              values={providers.map((p) => parseJsonStringArray(p.consJson))}
              highlight
            >
              {(provider) => {
                const cons = parseJsonStringArray(provider.consJson);
                return cons.length > 0 ? (
                  <ul className="text-sm text-gray-700 text-left space-y-1">
                    {cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
                        {con}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm text-gray-400">N/A</span>
                );
              }}
            </HideableComparisonRow>

            {/* Section: Featured Plan Header */}
            <SectionHeader label="Featured Plan" colCount={colCount} />

            {/* Featured Plan: Name */}
            <ComparisonRow label="Plan Name" providers={providers}>
              {(provider) => {
                const plan =
                  provider.plans.find((p) => p.featured) ?? provider.plans[0];
                return plan ? (
                  <span className="text-sm font-medium text-gray-900">
                    {plan.name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">N/A</span>
                );
              }}
            </ComparisonRow>

            {/* Featured Plan: Per Serving Price */}
            <ComparisonRow label="Per Serving" providers={providers} highlight>
              {(provider) => {
                const plan =
                  provider.plans.find((p) => p.featured) ?? provider.plans[0];
                return (
                  <span className="text-sm font-semibold text-gray-900">
                    {plan ? formatPrice(plan.pricePerServingCents) : "N/A"}
                  </span>
                );
              }}
            </ComparisonRow>

            {/* Featured Plan: Per Week Price */}
            <ComparisonRow label="Per Week" providers={providers}>
              {(provider) => {
                const plan =
                  provider.plans.find((p) => p.featured) ?? provider.plans[0];
                return (
                  <span className="text-sm text-gray-700">
                    {plan ? formatPrice(plan.pricePerWeekCents) : "N/A"}
                  </span>
                );
              }}
            </ComparisonRow>

            {/* Featured Plan: Shipping */}
            <ComparisonRow label="Shipping Cost" providers={providers} highlight>
              {(provider) => {
                const plan =
                  provider.plans.find((p) => p.featured) ?? provider.plans[0];
                if (!plan) {
                  return <span className="text-sm text-gray-400">N/A</span>;
                }
                return (
                  <span className="text-sm text-gray-700">
                    {plan.shippingCostCents === 0
                      ? "Free"
                      : formatPrice(plan.shippingCostCents)}
                  </span>
                );
              }}
            </ComparisonRow>

            {/* Featured Plan: Servings & Meals */}
            <ComparisonRow label="Servings/Meals" providers={providers}>
              {(provider) => {
                const plan =
                  provider.plans.find((p) => p.featured) ?? provider.plans[0];
                if (!plan) {
                  return <span className="text-sm text-gray-400">N/A</span>;
                }
                const parts: string[] = [];
                if (plan.servingsPerMeal != null) {
                  parts.push(
                    `${plan.servingsPerMeal} serving${plan.servingsPerMeal !== 1 ? "s" : ""}`,
                  );
                }
                if (plan.mealsPerWeek != null) {
                  parts.push(
                    `${plan.mealsPerWeek} meal${plan.mealsPerWeek !== 1 ? "s" : ""}/wk`,
                  );
                }
                return (
                  <span className="text-sm text-gray-700">
                    {parts.length > 0 ? parts.join(", ") : "N/A"}
                  </span>
                );
              }}
            </ComparisonRow>

            {/* Featured Plan: Frequency */}
            <ComparisonRow label="Frequency" providers={providers} highlight>
              {(provider) => {
                const plan =
                  provider.plans.find((p) => p.featured) ?? provider.plans[0];
                return (
                  <span className="text-sm text-gray-700">
                    {plan ? formatFrequency(plan.frequency) : "N/A"}
                  </span>
                );
              }}
            </ComparisonRow>

            {/* Section: Plan Flexibility Header */}
            <SectionHeader label="Plan Flexibility" colCount={colCount} />

            {/* Can Skip */}
            <ComparisonRow label="Skip Deliveries" providers={providers}>
              {(provider) => {
                const plan =
                  provider.plans.find((p) => p.featured) ?? provider.plans[0];
                if (!plan) {
                  return <span className="text-sm text-gray-400">N/A</span>;
                }
                return (
                  <div className="flex justify-center" aria-label={plan.canSkip ? "Yes" : "No"}>
                    {plan.canSkip ? <CheckIcon /> : <XIcon />}
                  </div>
                );
              }}
            </ComparisonRow>

            {/* Can Cancel */}
            <ComparisonRow label="Easy Cancel" providers={providers} highlight>
              {(provider) => {
                const plan =
                  provider.plans.find((p) => p.featured) ?? provider.plans[0];
                if (!plan) {
                  return <span className="text-sm text-gray-400">N/A</span>;
                }
                return (
                  <div className="flex justify-center" aria-label={plan.canCancel ? "Yes" : "No"}>
                    {plan.canCancel ? <CheckIcon /> : <XIcon />}
                  </div>
                );
              }}
            </ComparisonRow>

            {/* Total Plans Available */}
            <ComparisonRow label="Total Plans" providers={providers}>
              {(provider) => (
                <span className="text-sm text-gray-700">
                  {provider.plans.length}{" "}
                  {provider.plans.length === 1 ? "plan" : "plans"}
                </span>
              )}
            </ComparisonRow>

            {/* Shipping Notes */}
            <HideableComparisonRow
              label="Shipping Notes"
              providers={providers}
              values={providers.map((p) => p.shippingNotes)}
              highlight
            >
              {(provider) => (
                <span className="text-sm text-gray-700 max-w-[200px] text-left inline-block">
                  {provider.shippingNotes ?? "N/A"}
                </span>
              )}
            </HideableComparisonRow>

            {/* Flexibility Info (provider-level) */}
            <HideableComparisonRow
              label="Flexibility Info"
              providers={providers}
              values={providers.map((p) => p.flexibility)}
            >
              {(provider) => (
                <span className="text-sm text-gray-700 max-w-[200px] text-left inline-block">
                  {provider.flexibility ?? "N/A"}
                </span>
              )}
            </HideableComparisonRow>

            {/* Affiliate CTA Row */}
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-accent-50 p-4 border-t border-gray-200 text-sm font-medium text-gray-600 text-left">
                Visit Provider
              </th>
              {providers.map((provider, index) => (
                <td
                  key={provider.id}
                  className={`bg-accent-50 p-4 text-center border-t border-gray-200 ${
                    index < colCount - 1 ? "border-r border-gray-100" : ""
                  }`}
                >
                  <AffiliateLink
                    providerId={provider.id}
                    providerName={provider.name}
                    affiliateUrl={provider.affiliateUrl}
                    website={provider.website}
                    source="/compare"
                    variant="compact"
                  />
                </td>
              ))}
            </tr>

            {/* View Details Link Row */}
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-white p-4 border-t border-gray-200 text-left">
                <span className="sr-only">Actions</span>
              </th>
              {providers.map((provider, index) => (
                <td
                  key={provider.id}
                  className={`p-4 text-center border-t border-gray-200 ${
                    index < colCount - 1 ? "border-r border-gray-100" : ""
                  }`}
                >
                  <Link
                    href={`/providers/${provider.slug}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
                    aria-label={`View details for ${provider.name}`}
                  >
                    View Details
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -- Section Header Component --

function SectionHeader({
  label,
  colCount,
}: Readonly<{
  label: string;
  colCount: number;
}>) {
  return (
    <tr>
      <td
        colSpan={colCount + 1}
        className="bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-y border-gray-200"
      >
        {label}
      </td>
    </tr>
  );
}

// -- Row Component --

function ComparisonRow({
  label,
  providers,
  highlight = false,
  children,
}: Readonly<{
  label: string;
  providers: ComparisonProvider[];
  highlight?: boolean;
  children: (provider: ComparisonProvider) => React.ReactNode;
}>) {
  const colCount = providers.length;
  const bgClass = highlight ? "bg-gray-50/50" : "bg-white";

  return (
    <tr>
      <th
        scope="row"
        className={`sticky left-0 z-10 ${bgClass} p-4 text-sm font-medium text-gray-600 border-b border-gray-100 w-40 sm:w-48 text-left`}
      >
        {label}
      </th>
      {providers.map((provider, index) => (
        <td
          key={provider.id}
          className={`${bgClass} p-4 text-center border-b border-gray-100 ${
            index < colCount - 1 ? "border-r border-gray-100" : ""
          }`}
        >
          {children(provider)}
        </td>
      ))}
    </tr>
  );
}

// -- Hideable Row Component (hides when ALL providers have empty values) --

function HideableComparisonRow({
  label,
  providers,
  values,
  highlight = false,
  children,
}: Readonly<{
  label: string;
  providers: ComparisonProvider[];
  values: unknown[];
  highlight?: boolean;
  children: (provider: ComparisonProvider) => React.ReactNode;
}>) {
  const allNa = values.every(isFieldEmpty);
  if (allNa) return null;

  return (
    <ComparisonRow label={label} providers={providers} highlight={highlight}>
      {children}
    </ComparisonRow>
  );
}
