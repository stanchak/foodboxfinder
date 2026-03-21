import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/Badge";
import RatingStars from "@/components/RatingStars";
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
  dietaryTags: Array<{ tag: DietaryTag }>;
}

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
      <Link href={href} className="block" aria-label={`View ${provider.name}`}>
        {/* Logo / Image area */}
        <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
          {provider.logoUrl ? (
            <Image
              src={provider.logoUrl}
              alt={`${provider.name} logo`}
              width={160}
              height={80}
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-2xl font-bold text-gray-300">
                {provider.name.charAt(0)}
              </span>
            </div>
          )}

          {provider.freeShipping && (
            <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-medium text-white">
              Free Shipping
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category badge */}
          <Badge color="category" className="mb-2">
            {categoryInfo.label}
          </Badge>

          {/* Provider name */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-1">
            {provider.name}
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
            <span className="text-xs text-gray-500">
              ({provider.reviewCount})
            </span>
          </div>

          {/* Price */}
          <p className="mt-2 text-sm font-medium text-gray-900">
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
      </Link>
    </article>
  );
}
