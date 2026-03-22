import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/Badge";
import RatingStars from "@/components/RatingStars";
import AddToCompareButton from "@/components/AddToCompareButton";
import { formatPriceLabel } from "@/lib/format";
import { CATEGORY_MAP } from "@/lib/categories";
import type { CategoryType, DietaryTag } from "@/generated/prisma/client";

export interface ProviderCardData {
  name: string;
  slug: string;
  shortDescription: string | null;
  logoUrl: string | null;
  heroImageUrl?: string | null;
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
  const imageUrl = provider.heroImageUrl ?? provider.logoUrl;
  const visibleTags = provider.dietaryTags.slice(0, 3);
  const remainingTagCount = provider.dietaryTags.length - visibleTags.length;

  return (
    <article className="group relative bg-white rounded-2xl ring-1 ring-neutral-100 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 overflow-hidden">
      {/* Hero image area */}
      <div className="relative h-44 bg-gradient-to-br from-neutral-50 to-neutral-100/80 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${provider.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-extrabold text-neutral-200" aria-hidden="true">
              {provider.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {provider.freeShipping && (
          <span className="absolute top-3 right-3 z-10">
            <Badge color="default">Free Shipping</Badge>
          </span>
        )}
        <div className="absolute bottom-3 right-3 z-10">
          <AddToCompareButton slug={provider.slug} name={provider.name} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
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
        <h3 className="text-base font-bold text-neutral-900 group-hover:text-primary-700 transition-colors line-clamp-1">
          <Link href={href} className="after:absolute after:inset-0">
            {provider.name}
          </Link>
        </h3>

        {/* Short description */}
        {provider.shortDescription && (
          <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
            {provider.shortDescription}
          </p>
        )}

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <RatingStars rating={provider.averageRating} size="sm" />
          <span className="text-xs text-neutral-600 font-medium">
            ({provider.reviewCount})
          </span>
        </div>

        {/* Price */}
        <p className="mt-2 text-lg font-bold text-primary-700">
          {formatPriceLabel(provider.minPricePerServingCents)}
        </p>

        {/* Dietary tags */}
        {provider.dietaryTags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap gap-1.5">
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
