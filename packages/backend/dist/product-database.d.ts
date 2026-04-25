import type { SustainableAlternative } from "@ecopulse/shared";
/** Compute composite sustainability score (sum of all three axes). */
export declare function compositeScore(alt: SustainableAlternative): number;
/**
 * Seed the product database with a list of sustainable alternatives.
 * Replaces any existing data.
 */
export declare function seedDatabase(products: SustainableAlternative[]): void;
/**
 * Get the current database contents (for testing/inspection).
 */
export declare function getDatabase(): SustainableAlternative[];
/**
 * Clear all products from the database.
 */
export declare function clearDatabase(): void;
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
export declare function queryAlternatives(options: QueryOptions): SustainableAlternative[];
//# sourceMappingURL=product-database.d.ts.map