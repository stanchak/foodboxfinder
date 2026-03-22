import type { CategoryType } from "@/generated/prisma/client";

export const CATEGORY_MAP: Record<CategoryType, { slug: string; label: string; description: string }> = {
  MEAL_KIT: { slug: "meal-kits", label: "Meal Kits", description: "Fresh ingredients with chef-designed recipes" },
  PREPARED_MEAL: { slug: "prepared-meals", label: "Prepared Meals", description: "Ready-to-eat meals delivered to your door" },
  PROTEIN_BOX: { slug: "protein-boxes", label: "Protein Boxes", description: "Premium meats and protein sources" },
  PRODUCE_BOX: { slug: "produce-boxes", label: "Produce Boxes", description: "Farm-fresh fruits and vegetables" },
  SPECIALTY: { slug: "specialty", label: "Specialty", description: "Unique and curated food experiences" },
};

export const CATEGORY_COLOR_MAP: Record<CategoryType, {
  badgeBg: string;
  badgeText: string;
  badgeRing: string;
  borderTop: string;
}> = {
  MEAL_KIT: {
    badgeBg: "bg-cat-meal-kits-50",
    badgeText: "text-cat-meal-kits-700",
    badgeRing: "ring-cat-meal-kits-100",
    borderTop: "border-t-cat-meal-kits-600",
  },
  PREPARED_MEAL: {
    badgeBg: "bg-cat-prepared-meals-50",
    badgeText: "text-cat-prepared-meals-700",
    badgeRing: "ring-cat-prepared-meals-100",
    borderTop: "border-t-cat-prepared-meals-600",
  },
  PROTEIN_BOX: {
    badgeBg: "bg-cat-protein-boxes-50",
    badgeText: "text-cat-protein-boxes-700",
    badgeRing: "ring-cat-protein-boxes-100",
    borderTop: "border-t-cat-protein-boxes-600",
  },
  PRODUCE_BOX: {
    badgeBg: "bg-cat-produce-boxes-50",
    badgeText: "text-cat-produce-boxes-700",
    badgeRing: "ring-cat-produce-boxes-100",
    borderTop: "border-t-cat-produce-boxes-600",
  },
  SPECIALTY: {
    badgeBg: "bg-cat-specialty-50",
    badgeText: "text-cat-specialty-700",
    badgeRing: "ring-cat-specialty-100",
    borderTop: "border-t-cat-specialty-600",
  },
};

export function getCategoryBySlug(slug: string): { key: CategoryType; slug: string; label: string; description: string } | undefined {
  const entry = Object.entries(CATEGORY_MAP).find(([, v]) => v.slug === slug);
  if (!entry) return undefined;
  const [key, value] = entry;
  return { key: key as CategoryType, ...value };
}

export function getSlugByCategory(category: CategoryType): string {
  return CATEGORY_MAP[category].slug;
}

export const CATEGORY_NAV_ITEMS: Array<{ slug: string; label: string }> = Object.values(CATEGORY_MAP).map(
  ({ slug, label }) => ({ slug, label }),
);
