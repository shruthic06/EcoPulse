import type { ProductScore } from "@ecopulse/shared";

/**
 * Popup UI states
 */
export type PopupState =
  | { kind: "loading" }
  | { kind: "success"; score: ProductScore; analysisId: string }
  | { kind: "error"; message: string };

/**
 * Configuration for the popup UI.
 */
export interface PopupConfig {
  /** Base URL for the web app detailed analysis pages */
  webAppBaseUrl: string;
  /** Timeout in milliseconds before showing a timeout error (default: 5000) */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Returns the CSS class name for the overall indicator.
 */
function indicatorClass(indicator: "green" | "red"): string {
  return indicator === "green" ? "ecopulse-indicator-green" : "ecopulse-indicator-red";
}

/**
 * Returns a human-readable label for the overall indicator.
 */
function indicatorLabel(indicator: "green" | "red"): string {
  return indicator === "green" ? "Sustainable" : "Needs Improvement";
}

/**
 * Renders a single score bar row as an HTML string.
 */
function renderScoreRow(label: string, value: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    `<div class="ecopulse-score-row">` +
    `<span class="ecopulse-score-label">${label}</span>` +
    `<span class="ecopulse-score-value">${clamped}</span>` +
    `</div>`
  );
}

/**
 * Renders the loading state HTML.
 */
function renderLoading(): string {
  return `<div class="ecopulse-popup ecopulse-loading"><p>Analyzing product…</p></div>`;
}

/**
 * Renders the error state HTML.
 */
function renderError(message: string): string {
  return (
    `<div class="ecopulse-popup ecopulse-error">` +
    `<p class="ecopulse-error-message">${escapeHtml(message)}</p>` +
    `</div>`
  );
}

/**
 * Renders the success state HTML with scores and detail link.
 */
function renderSuccess(score: ProductScore, detailUrl: string): string {
  return (
    `<div class="ecopulse-popup ecopulse-success">` +
    `<div class="ecopulse-indicator ${indicatorClass(score.overallIndicator)}">` +
    `${indicatorLabel(score.overallIndicator)}` +
    `</div>` +
    `<div class="ecopulse-scores">` +
    renderScoreRow("Environmental", score.environmental) +
    renderScoreRow("Health", score.health) +
    renderScoreRow("Greenwashing", score.greenwashing) +
    `</div>` +
    `<a class="ecopulse-detail-link" href="${escapeHtml(detailUrl)}" target="_blank">View Details</a>` +
    `</div>`
  );
}

/**
 * Minimal HTML escaping for attribute/content injection safety.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Builds the detail URL for a given analysis ID.
 */
export function buildDetailUrl(config: PopupConfig, analysisId: string): string {
  const base = config.webAppBaseUrl.replace(/\/+$/, "");
  return `${base}/analysis/${encodeURIComponent(analysisId)}`;
}

/**
 * Renders the popup HTML for a given state.
 */
export function renderPopup(state: PopupState, config: PopupConfig): string {
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
export function mountPopup(container: HTMLElement, state: PopupState, config: PopupConfig): void {
  container.innerHTML = renderPopup(state, config);
}

/**
 * Creates a timeout error state after the configured timeout.
 * Returns an AbortController so the caller can cancel the timer if the
 * analysis completes in time.
 */
export function startTimeout(
  config: PopupConfig,
  onTimeout: (state: PopupState) => void
): AbortController {
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

export const PopupUI = {
  renderPopup,
  mountPopup,
  buildDetailUrl,
  startTimeout,
};
