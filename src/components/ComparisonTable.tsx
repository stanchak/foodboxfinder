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
      className="text-green-600"
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
      className="text-red-400"
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

            {/* Section: Featured Plan Header */}
            <tr>
              <td
                colSpan={colCount + 1}
                className="bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-y border-gray-200"
              >
                Featured Plan
              </td>
            </tr>

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

            {/* Section: Flexibility Header */}
            <tr>
              <td
                colSpan={colCount + 1}
                className="bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-y border-gray-200"
              >
                Flexibility
              </td>
            </tr>

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

            {/* Affiliate CTA Row */}
            <tr>
              <td className="sticky left-0 z-10 bg-accent-50/30 p-4 border-t border-gray-200 text-sm font-medium text-gray-600">
                Visit Provider
              </td>
              {providers.map((provider, index) => (
                <td
                  key={provider.id}
                  className={`bg-accent-50/30 p-4 text-center border-t border-gray-200 ${
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
              <td className="sticky left-0 z-10 bg-white p-4 border-t border-gray-200">
                <span className="sr-only">Actions</span>
              </td>
              {providers.map((provider, index) => (
                <td
                  key={provider.id}
                  className={`p-4 text-center border-t border-gray-200 ${
                    index < colCount - 1 ? "border-r border-gray-100" : ""
                  }`}
                >
                  <Link
                    href={`/providers/${provider.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
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
      <td
        className={`sticky left-0 z-10 ${bgClass} p-4 text-sm font-medium text-gray-600 border-b border-gray-100 w-40 sm:w-48`}
      >
        {label}
      </td>
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
