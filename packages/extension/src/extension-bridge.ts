import type { ExtractedProductData, ProductAnalysis } from "@ecopulse/shared";
import { extract } from "./content-extractor.js";
import { mountPopup, startTimeout } from "./popup-ui.js";
import type { PopupState, PopupConfig } from "./popup-ui.js";

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
export async function callAnalyzeApi(
  apiBaseUrl: string,
  data: ExtractedProductData
): Promise<ProductAnalysis> {
  const url = `${apiBaseUrl.replace(/\/+$/, "")}/api/analyze`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json() as Promise<ProductAnalysis>;
}

/**
 * Initializes the extension: extracts product data, calls the API,
 * and mounts the popup with the result.
 *
 * Returns the container element (or null if extraction failed).
 */
export async function initExtension(
  config: BridgeConfig,
  doc: Document = document
): Promise<HTMLElement | null> {
  const data = extract(doc);
  if (!data) {
    // Extractor already showed the failure notification
    return null;
  }

  const popupConfig: PopupConfig = {
    webAppBaseUrl: config.webAppBaseUrl,
    timeoutMs: config.timeoutMs,
  };

  // Create a container for the popup
  const container = doc.createElement("div");
  container.id = "ecopulse-popup-container";
  doc.body.appendChild(container);

  // Show loading state immediately
  mountPopup(container, { kind: "loading" }, popupConfig);

  // Start the 5-second timeout
  let timedOut = false;
  const timeoutController = startTimeout(popupConfig, (state: PopupState) => {
    timedOut = true;
    mountPopup(container, state, popupConfig);
  });

  try {
    const analysis = await callAnalyzeApi(config.apiBaseUrl, data);

    if (timedOut) {
      // Timeout already fired — don't overwrite the timeout error
      return container;
    }

    // Cancel the timeout and show success
    timeoutController.abort();
    mountPopup(
      container,
      { kind: "success", score: analysis.score, analysisId: analysis.id },
      popupConfig
    );
  } catch (err: unknown) {
    if (timedOut) {
      return container;
    }

    timeoutController.abort();
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    mountPopup(container, { kind: "error", message }, popupConfig);
  }

  return container;
}
