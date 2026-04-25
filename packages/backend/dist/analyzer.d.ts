import type { ExtractedProductData, ProductAnalysis } from "@ecopulse/shared";
/**
 * Analyze a product through the full sustainability pipeline.
 *
 * Pipeline: parse fabric → verify certifications → detect greenwashing → derive chemical risks → compute score.
 *
 * Results are cached by URL for subsequent lookups.
 */
export declare function analyze(data: ExtractedProductData): ProductAnalysis;
/**
 * Retrieve a previously cached analysis result by product URL.
 */
export declare function getCachedAnalysis(url: string): ProductAnalysis | undefined;
//# sourceMappingURL=analyzer.d.ts.map