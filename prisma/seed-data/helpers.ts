import type { PrismaClient } from "../../src/generated/prisma/client";

/**
 * Convert a dollar amount to integer cents.
 * Example: dollarsToCents(7.99) => 799
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Recalculate denormalized pricing fields on a Provider from its active Plans.
 * Updates minPricePerServingCents, maxPricePerServingCents, and freeShipping.
 */
export async function recalculateProviderPricing(
  prisma: PrismaClient,
  providerId: string,
): Promise<void> {
  const plans = await prisma.plan.findMany({
    where: { providerId, active: true, pricePerServingCents: { not: null } },
    select: { pricePerServingCents: true, shippingCostCents: true },
  });

  const prices = plans
    .map((p) => p.pricePerServingCents)
    .filter((p): p is number => p !== null);

  const hasFreeShipping = plans.some((p) => p.shippingCostCents === 0);

  await prisma.provider.update({
    where: { id: providerId },
    data: {
      minPricePerServingCents: prices.length ? Math.min(...prices) : null,
      maxPricePerServingCents: prices.length ? Math.max(...prices) : null,
      freeShipping: hasFreeShipping,
    },
  });
}
