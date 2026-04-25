import type { ProductScore } from "@ecopulse/shared";
/**
 * Popup UI states
 */
export type PopupState = {
    kind: "loading";
} | {
    kind: "success";
    score: ProductScore;
    analysisId: string;
} | {
    kind: "error";
    message: string;
};
/**
 * Configuration for the popup UI.
 */
export interface PopupConfig {
    /** Base URL for the web app detailed analysis pages */
    webAppBaseUrl: string;
    /** Timeout in milliseconds before showing a timeout error (default: 5000) */
    timeoutMs?: number;
}
/**
 * Builds the detail URL for a given analysis ID.
 */
export declare function buildDetailUrl(config: PopupConfig, analysisId: string): string;
/**
 * Renders the popup HTML for a given state.
 */
export declare function renderPopup(state: PopupState, config: PopupConfig): string;
/**
 * Mounts the popup HTML into a container element, replacing its contents.
 */
export declare function mountPopup(container: HTMLElement, state: PopupState, config: PopupConfig): void;
/**
 * Creates a timeout error state after the configured timeout.
 * Returns an AbortController so the caller can cancel the timer if the
 * analysis completes in time.
 */
export declare function startTimeout(config: PopupConfig, onTimeout: (state: PopupState) => void): AbortController;
export declare const PopupUI: {
    renderPopup: typeof renderPopup;
    mountPopup: typeof mountPopup;
    buildDetailUrl: typeof buildDetailUrl;
    startTimeout: typeof startTimeout;
};
//# sourceMappingURL=popup-ui.d.ts.map