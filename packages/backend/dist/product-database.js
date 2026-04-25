"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compositeScore = compositeScore;
exports.seedDatabase = seedDatabase;
exports.getDatabase = getDatabase;
exports.clearDatabase = clearDatabase;
exports.queryAlternatives = queryAlternatives;
/**
 * In-memory product database of verified sustainable alternatives.
 * Supports querying by category, sorting by composite score, and price filtering.
 */
/** Internal database storage. */
let database = [];
/** Compute composite sustainability score (sum of all three axes). */
function compositeScore(alt) {
    return alt.score.environmental + alt.score.health + alt.score.greenwashing;
}
/**
 * Seed the product database with a list of sustainable alternatives.
 * Replaces any existing data.
 */
function seedDatabase(products) {
    database = [...products];
}
/**
 * Get the current database contents (for testing/inspection).
 */
function getDatabase() {
    return [...database];
}
/**
 * Clear all products from the database.
 */
function clearDatabase() {
    database = [];
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
function queryAlternatives(options) {
    const categoryLower = options.category.toLowerCase();
    let results = database.filter((alt) => alt.category.toLowerCase() === categoryLower);
    if (options.maxPrice !== undefined) {
        results = results.filter((alt) => alt.price <= options.maxPrice);
    }
    results.sort((a, b) => compositeScore(b) - compositeScore(a));
    return results;
}
//# sourceMappingURL=product-database.js.map