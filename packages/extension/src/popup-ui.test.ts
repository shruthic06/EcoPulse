// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  renderPopup,
  mountPopup,
  buildDetailUrl,
  startTimeout,
} from "./popup-ui.js";
import type { PopupState, PopupConfig } from "./popup-ui.js";
import type { ProductScore } from "@ecopulse/shared";

const BASE_CONFIG: PopupConfig = {
  webAppBaseUrl: "https://ecopulse.example.com",
  timeoutMs: 5000,
};

function greenScore(env = 80, health = 70, gw = 90): ProductScore {
  return { environmental: env, health, greenwashing: gw, overallIndicator: "green" };
}

function redScore(env = 30, health = 60, gw = 40): ProductScore {
  return { environmental: env, health, greenwashing: gw, overallIndicator: "red" };
}

describe("renderPopup", () => {
  // --- Loading state ---
  it("renders loading state", () => {
    const html = renderPopup({ kind: "loading" }, BASE_CONFIG);
    expect(html).toContain("ecopulse-loading");
    expect(html).toContain("Analyzing product");
  });

  // --- Error state ---
  it("renders error state with message", () => {
    const state: PopupState = { kind: "error", message: "Network failure" };
    const html = renderPopup(state, BASE_CONFIG);
    expect(html).toContain("ecopulse-error");
    expect(html).toContain("Network failure");
  });

  it("escapes HTML in error messages", () => {
    const state: PopupState = { kind: "error", message: '<script>alert("xss")</script>' };
    const html = renderPopup(state, BASE_CONFIG);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  // --- Success / green indicator ---
  it("renders green indicator when all scores >= 50", () => {
    const state: PopupState = { kind: "success", score: greenScore(), analysisId: "abc" };
    const html = renderPopup(state, BASE_CONFIG);
    expect(html).toContain("ecopulse-indicator-green");
    expect(html).toContain("Sustainable");
  });

  // --- Success / red indicator ---
  it("renders red indicator when any score < 50", () => {
    const state: PopupState = { kind: "success", score: redScore(), analysisId: "abc" };
    const html = renderPopup(state, BASE_CONFIG);
    expect(html).toContain("ecopulse-indicator-red");
    expect(html).toContain("Needs Improvement");
  });

  // --- Three individual scores ---
  it("displays all three individual scores", () => {
    const score = greenScore(85, 72, 91);
    const state: PopupState = { kind: "success", score, analysisId: "x" };
    const html = renderPopup(state, BASE_CONFIG);
    expect(html).toContain("Environmental");
    expect(html).toContain("85");
    expect(html).toContain("Health");
    expect(html).toContain("72");
    expect(html).toContain("Greenwashing");
    expect(html).toContain("91");
  });

  // --- Detail link ---
  it("includes a detail link to the web app", () => {
    const state: PopupState = { kind: "success", score: greenScore(), analysisId: "analysis-123" };
    const html = renderPopup(state, BASE_CONFIG);
    expect(html).toContain("View Details");
    expect(html).toContain("https://ecopulse.example.com/analysis/analysis-123");
    expect(html).toContain('target="_blank"');
  });

  // --- Timeout error message ---
  it("renders timeout error state", () => {
    const state: PopupState = { kind: "error", message: "Analysis timed out. Please try again." };
    const html = renderPopup(state, BASE_CONFIG);
    expect(html).toContain("timed out");
  });
});

describe("buildDetailUrl", () => {
  it("builds correct URL from config and analysis ID", () => {
    expect(buildDetailUrl(BASE_CONFIG, "abc-123")).toBe(
      "https://ecopulse.example.com/analysis/abc-123"
    );
  });

  it("strips trailing slashes from base URL", () => {
    const config: PopupConfig = { webAppBaseUrl: "https://app.example.com/" };
    expect(buildDetailUrl(config, "id1")).toBe("https://app.example.com/analysis/id1");
  });

  it("encodes special characters in analysis ID", () => {
    const url = buildDetailUrl(BASE_CONFIG, "id with spaces");
    expect(url).toContain("id%20with%20spaces");
  });
});

describe("mountPopup", () => {
  it("replaces container innerHTML with rendered popup", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>old content</p>";

    const state: PopupState = { kind: "success", score: greenScore(), analysisId: "m1" };
    mountPopup(container, state, BASE_CONFIG);

    expect(container.innerHTML).toContain("ecopulse-indicator-green");
    expect(container.innerHTML).not.toContain("old content");
  });

  it("mounts loading state into container", () => {
    const container = document.createElement("div");
    mountPopup(container, { kind: "loading" }, BASE_CONFIG);
    expect(container.innerHTML).toContain("Analyzing product");
  });
});

describe("startTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onTimeout after configured timeout", () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    const config: PopupConfig = { webAppBaseUrl: "https://x.com", timeoutMs: 3000 };

    startTimeout(config, onTimeout);

    vi.advanceTimersByTime(2999);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onTimeout).toHaveBeenCalledWith({
      kind: "error",
      message: "Analysis timed out. Please try again.",
    });
  });

  it("does not call onTimeout if aborted before timeout", () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    const config: PopupConfig = { webAppBaseUrl: "https://x.com", timeoutMs: 2000 };

    const controller = startTimeout(config, onTimeout);
    vi.advanceTimersByTime(1000);
    controller.abort();
    vi.advanceTimersByTime(2000);

    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("defaults to 5000ms when timeoutMs is not set", () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    const config: PopupConfig = { webAppBaseUrl: "https://x.com" };

    startTimeout(config, onTimeout);

    vi.advanceTimersByTime(4999);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onTimeout).toHaveBeenCalled();
  });
});
