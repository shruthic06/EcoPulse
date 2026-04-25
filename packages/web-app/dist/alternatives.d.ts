import type { SustainableAlternative } from "@ecopulse/shared";
/** Sort alternatives by composite sustainability score descending */
export declare function sortByScore(alternatives: SustainableAlternative[]): SustainableAlternative[];
/** Filter alternatives to those at or below the given price */
export declare function filterAffordable(alternatives: SustainableAlternative[], maxPrice: number): SustainableAlternative[];
/** Render a single alternative */
export declare function renderAlternative(alt: SustainableAlternative): string;
/** Render the full alternatives page */
export declare function renderAlternativesPage(alternatives: SustainableAlternative[], options?: {
    affordableMaxPrice?: number;
}): string;
//# sourceMappingURL=alternatives.d.ts.map