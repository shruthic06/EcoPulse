import type { SustainableAlternative } from "@ecopulse/shared";

/**
 * In-memory product database of verified sustainable alternatives.
 * Supports querying by category, sorting by composite score, and price filtering.
 */

/** Internal database storage. */
let database: SustainableAlternative[] = [];

/** Compute composite sustainability score (sum of all three axes). */
export function compositeScore(alt: SustainableAlternative): number {
  return alt.score.environmental + alt.score.health + alt.score.greenwashing;
}

/**
 * Seed the product database with a list of sustainable alternatives.
 * Replaces any existing data.
 */
export function seedDatabase(products: SustainableAlternative[]): void {
  database = [...products];
}

/**
 * Get the current database contents (for testing/inspection).
 */
export function getDatabase(): SustainableAlternative[] {
  return [...database];
}

/**
 * Clear all products from the database.
 */
export function clearDatabase(): void {
  database = [];
}

export interface QueryOptions {
  category: string;
  maxPrice?: number;
}

/**
 * Query the product database for sustainable alternatives.
 *
 * - Filters by clothing category (case-insensitive)
 * - Sorts by composite sustainability score (environmental + health + greenwashing) descending
 * - Optionally filters to affordable alternatives (price <= maxPrice)
 * - Returns price, score, and brand for each alternative
 *
 * @param options - Query options with required category and optional maxPrice
 * @returns Filtered and sorted list of SustainableAlternative items
 */
export function queryAlternatives(
  options: QueryOptions
): SustainableAlternative[] {
  const categoryLower = options.category.toLowerCase();

  let results = database.filter(
    (alt) => alt.category.toLowerCase() === categoryLower
  );

  if (options.maxPrice !== undefined) {
    results = results.filter((alt) => alt.price <= options.maxPrice!);
  }

  results.sort((a, b) => compositeScore(b) - compositeScore(a));

  return results;
}
