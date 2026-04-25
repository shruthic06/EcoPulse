"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortByScore = sortByScore;
exports.filterAffordable = filterAffordable;
exports.renderAlternative = renderAlternative;
exports.renderAlternativesPage = renderAlternativesPage;
/** Compute composite sustainability score */
function compositeScore(score) {
    return score.environmental + score.health + score.greenwashing;
}
/** Sort alternatives by composite sustainability score descending */
function sortByScore(alternatives) {
    return [...alternatives].sort((a, b) => compositeScore(b.score) - compositeScore(a.score));
}
/** Filter alternatives to those at or below the given price */
function filterAffordable(alternatives, maxPrice) {
    return alternatives.filter((alt) => alt.price <= maxPrice);
}
/** Render a single alternative */
function renderAlternative(alt) {
    const score = compositeScore(alt.score);
    return `${alt.productName} by ${alt.brand} — ${alt.currency} ${alt.price} — Score: ${score}/300`;
}
/** Render the full alternatives page */
function renderAlternativesPage(alternatives, options) {
    let items = sortByScore(alternatives);
    if (options?.affordableMaxPrice !== undefined) {
        items = filterAffordable(items, options.affordableMaxPrice);
    }
    const lines = ["# Sustainable Alternatives", ""];
    if (items.length === 0) {
        lines.push("No sustainable alternatives found.");
        return lines.join("\n");
    }
    for (const alt of items) {
        lines.push(`- ${renderAlternative(alt)}`);
    }
    return lines.join("\n");
}
//# sourceMappingURL=alternatives.js.map