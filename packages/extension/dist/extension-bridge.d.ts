import type { ExtractedProductData, ProductAnalysis } from "@ecopulse/shared";
/**
 * Configuration for the extension bridge.
 */
export interface BridgeConfig {
    /** Base URL for the backend API (e.g. "http://localhost:3000") */
    apiBaseUrl: string;
    /** Base URL for the web app (passed through to PopupConfig) */
    webAppBaseUrl: string;
    /** Timeout in milliseconds before showing timeout error (default: 5000) */
    timeoutMs?: number;
}
/**
 * Sends extracted product data to the backend API for analysis.
 */
export declare function callAnalyzeApi(apiBaseUrl: string, data: ExtractedProductData): Promise<ProductAnalysis>;
/**
 * Initializes the extension: extracts product data, calls the API,
 * and mounts the popup with the result.
 *
 * Returns the container element (or null if extraction failed).
 */
export declare function initExtension(config: BridgeConfig, doc?: Document): Promise<HTMLElement | null>;
//# sourceMappingURL=extension-bridge.d.ts.map