"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupUI = void 0;
exports.buildDetailUrl = buildDetailUrl;
exports.renderPopup = renderPopup;
exports.mountPopup = mountPopup;
exports.startTimeout = startTimeout;
const DEFAULT_TIMEOUT_MS = 5000;
/**
 * Returns the CSS class name for the overall indicator.
 */
function indicatorClass(indicator) {
    return indicator === "green" ? "ecopulse-indicator-green" : "ecopulse-indicator-red";
}
/**
 * Returns a human-readable label for the overall indicator.
 */
function indicatorLabel(indicator) {
    return indicator === "green" ? "Sustainable" : "Needs Improvement";
}
/**
 * Renders a single score bar row as an HTML string.
 */
function renderScoreRow(label, value) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    return (`<div class="ecopulse-score-row">` +
        `<span class="ecopulse-score-label">${label}</span>` +
        `<span class="ecopulse-score-value">${clamped}</span>` +
        `</div>`);
}
/**
 * Renders the loading state HTML.
 */
function renderLoading() {
    return `<div class="ecopulse-popup ecopulse-loading"><p>Analyzing product…</p></div>`;
}
/**
 * Renders the error state HTML.
 */
function renderError(message) {
    return (`<div class="ecopulse-popup ecopulse-error">` +
        `<p class="ecopulse-error-message">${escapeHtml(message)}</p>` +
        `</div>`);
}
/**
 * Renders the success state HTML with scores and detail link.
 */
function renderSuccess(score, detailUrl) {
    return (`<div class="ecopulse-popup ecopulse-success">` +
        `<div class="ecopulse-indicator ${indicatorClass(score.overallIndicator)}">` +
        `${indicatorLabel(score.overallIndicator)}` +
        `</div>` +
        `<div class="ecopulse-scores">` +
        renderScoreRow("Environmental", score.environmental) +
        renderScoreRow("Health", score.health) +
        renderScoreRow("Greenwashing", score.greenwashing) +
        `</div>` +
        `<a class="ecopulse-detail-link" href="${escapeHtml(detailUrl)}" target="_blank">View Details</a>` +
        `</div>`);
}
/**
 * Minimal HTML escaping for attribute/content injection safety.
 */
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
/**
 * Builds the detail URL for a given analysis ID.
 */
function buildDetailUrl(config, analysisId) {
    const base = config.webAppBaseUrl.replace(/\/+$/, "");
    return `${base}/analysis/${encodeURIComponent(analysisId)}`;
}
/**
 * Renders the popup HTML for a given state.
 */
function renderPopup(state, config) {
    switch (state.kind) {
        case "loading":
            return renderLoading();
        case "error":
            return renderError(state.message);
        case "success":
            return renderSuccess(state.score, buildDetailUrl(config, state.analysisId));
    }
}
/**
 * Mounts the popup HTML into a container element, replacing its contents.
 */
function mountPopup(container, state, config) {
    container.innerHTML = renderPopup(state, config);
}
/**
 * Creates a timeout error state after the configured timeout.
 * Returns an AbortController so the caller can cancel the timer if the
 * analysis completes in time.
 */
function startTimeout(config, onTimeout) {
    const controller = new AbortController();
    const ms = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const id = setTimeout(() => {
        if (!controller.signal.aborted) {
            onTimeout({ kind: "error", message: "Analysis timed out. Please try again." });
        }
    }, ms);
    controller.signal.addEventListener("abort", () => clearTimeout(id));
    return controller;
}
exports.PopupUI = {
    renderPopup,
    mountPopup,
    buildDetailUrl,
    startTimeout,
};
//# sourceMappingURL=popup-ui.js.map