import type { ScoringInput, ProductScore } from "@ecopulse/shared";
/**
 * Compute the three-axis sustainability score for a product.
 *
 * @param input - Scoring input containing fabric components, certification results,
 *                greenwashing signals, and chemical risks
 * @returns ProductScore with environmental, health, greenwashing scores and overall indicator
 */
export declare function computeScore(input: ScoringInput): ProductScore;
//# sourceMappingURL=scoring-engine.d.ts.map