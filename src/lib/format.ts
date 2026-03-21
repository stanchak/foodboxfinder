/**
 * Format integer cents to a dollar string.
 * formatPrice(799) => "$7.99"
 * formatPrice(null) => "N/A"
 * formatPrice(0) => "$0.00"
 */
export function formatPrice(cents: number | null): string {
  if (cents === null) return "N/A";
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format a price range from two cent values.
 * formatPriceRange(799, 1299) => "$7.99 - $12.99"
 * formatPriceRange(799, 799) => "$7.99"
 * formatPriceRange(null, null) => "Contact for pricing"
 */
export function formatPriceRange(
  minCents: number | null,
  maxCents: number | null,
): string {
  if (minCents === null || maxCents === null) return "Contact for pricing";
  if (minCents === maxCents) return formatPrice(minCents);
  return `${formatPrice(minCents)} - ${formatPrice(maxCents)}`;
}

/**
 * Format cents to a short price label for cards.
 * formatPriceLabel(799) => "From $7.99/serving"
 * formatPriceLabel(null) => "See pricing"
 */
export function formatPriceLabel(
  minCents: number | null,
  unit: string = "serving",
): string {
  if (minCents === null) return "See pricing";
  return `From ${formatPrice(minCents)}/${unit}`;
}

/**
 * Convert a dollar amount to cents for seed data.
 * dollarsToCents(7.99) => 799
 * dollarsToCents(0) => 0
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
