import Link from "next/link";
import Badge from "@/components/Badge";
import RatingStars from "@/components/RatingStars";
import ProviderLogo from "@/components/ProviderLogo";
import AddToCompareButton from "@/components/AddToCompareButton";
import { formatPriceLabel } from "@/lib/format";
import { CATEGORY_MAP } from "@/lib/categories";
import type { CategoryType, DietaryTag } from "@/generated/prisma/client";

export interface ProviderCardData {
  name: string;
  slug: string;
  shortDescription: string | null;
  logoUrl: string | null;
  averageRating: number;
  reviewCount: number;
  minPricePerServingCents: number | null;
  maxPricePerServingCents: number | null;
  freeShipping: boolean;
  category: CategoryType;
  valueTier: string | null;
  dietaryTags: Array<{ tag: DietaryTag }>;
}

const VALUE_TIER_LABELS: Record<string, string> = {
  BUDGET: "Budget",
  MID: "Mid-Range",
  PREMIUM: "Premium",
  LUXURY: "Luxury",
};

function formatDietaryLabel(tag: DietaryTag): string {
  return tag
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default function ProviderCard({
  provider,
}: Readonly<{
  provider: ProviderCardData;
}>) {
  const categoryInfo = CATEGORY_MAP[provider.category];
  const href = `/providers/${provider.slug}`;
  const visibleTags = provider.dietaryTags.slice(0, 3);
  const remainingTagCount = provider.dietaryTags.length - visibleTags.length;

  return (
    <article className="group relative bg-white rounded-xl shadow-card transition-shadow duration-200 hover:shadow-card-hover overflow-hidden">
      {/* Logo / Image area */}
      <div className="relative h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
        <ProviderLogo
          logoUrl={provider.logoUrl}
          name={provider.name}
          size="md"
          className="group-hover:scale-105 transition-transform duration-200 border-0"
        />
        {provider.freeShipping && (
          <span className="absolute top-3 right-3">
            <Badge color="default">Free Shipping</Badge>
          </span>
        )}
        <div className="absolute bottom-3 right-3">
          <AddToCompareButton slug={provider.slug} name={provider.name} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category and value tier badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Badge color="category">
            {categoryInfo.label}
          </Badge>
          {provider.valueTier && VALUE_TIER_LABELS[provider.valueTier] && (
            <Badge color="default">
              {VALUE_TIER_LABELS[provider.valueTier]}
            </Badge>
          )}
        </div>

        {/* Provider name — stretched link covers entire card */}
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-1">
          <Link href={href} className="after:absolute after:inset-0">
            {provider.name}
          </Link>
        </h3>

        {/* Short description */}
        {provider.shortDescription && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {provider.shortDescription}
          </p>
        )}

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <RatingStars rating={provider.averageRating} size="sm" />
          <span className="text-xs text-gray-600 font-medium">
            ({provider.reviewCount})
          </span>
        </div>

        {/* Price */}
        <p className="mt-2 text-base font-semibold text-primary-700">
          {formatPriceLabel(provider.minPricePerServingCents)}
        </p>

        {/* Dietary tags */}
        {provider.dietaryTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleTags.map(({ tag }) => (
              <Badge key={tag} color="dietary">
                {formatDietaryLabel(tag)}
              </Badge>
            ))}
            {remainingTagCount > 0 && (
              <Badge color="default">+{remainingTagCount}</Badge>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
