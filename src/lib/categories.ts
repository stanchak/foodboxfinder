import type { CategoryType } from "@/generated/prisma/client";

export const CATEGORY_MAP: Record<CategoryType, { slug: string; label: string; description: string }> = {
  MEAL_KIT: { slug: "meal-kits", label: "Meal Kits", description: "Fresh ingredients with chef-designed recipes" },
  PREPARED_MEAL: { slug: "prepared-meals", label: "Prepared Meals", description: "Ready-to-eat meals delivered to your door" },
  PROTEIN_BOX: { slug: "protein-boxes", label: "Protein Boxes", description: "Premium meats and protein sources" },
  PRODUCE_BOX: { slug: "produce-boxes", label: "Produce Boxes", description: "Farm-fresh fruits and vegetables" },
  SPECIALTY: { slug: "specialty", label: "Specialty", description: "Unique and curated food experiences" },
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
