"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callAnalyzeApi = callAnalyzeApi;
exports.initExtension = initExtension;
const content_extractor_js_1 = require("./content-extractor.js");
const popup_ui_js_1 = require("./popup-ui.js");
/**
 * Sends extracted product data to the backend API for analysis.
 */
async function callAnalyzeApi(apiBaseUrl, data) {
    const url = `${apiBaseUrl.replace(/\/+$/, "")}/api/analyze`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
}
/**
 * Initializes the extension: extracts product data, calls the API,
 * and mounts the popup with the result.
 *
 * Returns the container element (or null if extraction failed).
 */
async function initExtension(config, doc = document) {
    const data = (0, content_extractor_js_1.extract)(doc);
    if (!data) {
        // Extractor already showed the failure notification
        return null;
    }
    const popupConfig = {
        webAppBaseUrl: config.webAppBaseUrl,
        timeoutMs: config.timeoutMs,
    };
    // Create a container for the popup
    const container = doc.createElement("div");
    container.id = "ecopulse-popup-container";
    doc.body.appendChild(container);
    // Show loading state immediately
    (0, popup_ui_js_1.mountPopup)(container, { kind: "loading" }, popupConfig);
    // Start the 5-second timeout
    let timedOut = false;
    const timeoutController = (0, popup_ui_js_1.startTimeout)(popupConfig, (state) => {
        timedOut = true;
        (0, popup_ui_js_1.mountPopup)(container, state, popupConfig);
    });
    try {
        const analysis = await callAnalyzeApi(config.apiBaseUrl, data);
        if (timedOut) {
            // Timeout already fired — don't overwrite the timeout error
            return container;
        }
        // Cancel the timeout and show success
        timeoutController.abort();
        (0, popup_ui_js_1.mountPopup)(container, { kind: "success", score: analysis.score, analysisId: analysis.id }, popupConfig);
    }
    catch (err) {
        if (timedOut) {
            return container;
        }
        timeoutController.abort();
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        (0, popup_ui_js_1.mountPopup)(container, { kind: "error", message }, popupConfig);
    }
    return container;
}
//# sourceMappingURL=extension-bridge.js.map