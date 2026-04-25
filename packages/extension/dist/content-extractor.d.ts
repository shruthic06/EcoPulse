import type { ExtractedProductData } from "@ecopulse/shared";
/**
 * Shows a browser notification suggesting AI_Chat for manual input.
 * Falls back to console warning in non-browser environments.
 */
export declare function showExtractionFailureNotification(): void;
/**
 * Content Extractor — extracts product data from a retailer product page DOM.
 *
 * Returns `ExtractedProductData` on success, or `null` if insufficient data
 * could be extracted (also triggers a notification suggesting AI_Chat).
 */
export declare function extract(doc: Document): ExtractedProductData | null;
export declare const ContentExtractor: {
    extract: typeof extract;
};
//# sourceMappingURL=content-extractor.d.ts.map