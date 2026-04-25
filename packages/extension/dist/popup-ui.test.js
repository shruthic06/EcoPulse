"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @vitest-environment jsdom
const vitest_1 = require("vitest");
const popup_ui_js_1 = require("./popup-ui.js");
const BASE_CONFIG = {
    webAppBaseUrl: "https://ecopulse.example.com",
    timeoutMs: 5000,
};
function greenScore(env = 80, health = 70, gw = 90) {
    return { environmental: env, health, greenwashing: gw, overallIndicator: "green" };
}
function redScore(env = 30, health = 60, gw = 40) {
    return { environmental: env, health, greenwashing: gw, overallIndicator: "red" };
}
(0, vitest_1.describe)("renderPopup", () => {
    // --- Loading state ---
    (0, vitest_1.it)("renders loading state", () => {
        const html = (0, popup_ui_js_1.renderPopup)({ kind: "loading" }, BASE_CONFIG);
        (0, vitest_1.expect)(html).toContain("ecopulse-loading");
        (0, vitest_1.expect)(html).toContain("Analyzing product");
    });
    // --- Error state ---
    (0, vitest_1.it)("renders error state with message", () => {
        const state = { kind: "error", message: "Network failure" };
        const html = (0, popup_ui_js_1.renderPopup)(state, BASE_CONFIG);
        (0, vitest_1.expect)(html).toContain("ecopulse-error");
        (0, vitest_1.expect)(html).toContain("Network failure");
    });
    (0, vitest_1.it)("escapes HTML in error messages", () => {
        const state = { kind: "error", message: '<script>alert("xss")</script>' };
        const html = (0, popup_ui_js_1.renderPopup)(state, BASE_CONFIG);
        (0, vitest_1.expect)(html).not.toContain("<script>");
        (0, vitest_1.expect)(html).toContain("&lt;script&gt;");
    });
    // --- Success / green indicator ---
    (0, vitest_1.it)("renders green indicator when all scores >= 50", () => {
        const state = { kind: "success", score: greenScore(), analysisId: "abc" };
        const html = (0, popup_ui_js_1.renderPopup)(state, BASE_CONFIG);
        (0, vitest_1.expect)(html).toContain("ecopulse-indicator-green");
        (0, vitest_1.expect)(html).toContain("Sustainable");
    });
    // --- Success / red indicator ---
    (0, vitest_1.it)("renders red indicator when any score < 50", () => {
        const state = { kind: "success", score: redScore(), analysisId: "abc" };
        const html = (0, popup_ui_js_1.renderPopup)(state, BASE_CONFIG);
        (0, vitest_1.expect)(html).toContain("ecopulse-indicator-red");
        (0, vitest_1.expect)(html).toContain("Needs Improvement");
    });
    // --- Three individual scores ---
    (0, vitest_1.it)("displays all three individual scores", () => {
        const score = greenScore(85, 72, 91);
        const state = { kind: "success", score, analysisId: "x" };
        const html = (0, popup_ui_js_1.renderPopup)(state, BASE_CONFIG);
        (0, vitest_1.expect)(html).toContain("Environmental");
        (0, vitest_1.expect)(html).toContain("85");
        (0, vitest_1.expect)(html).toContain("Health");
        (0, vitest_1.expect)(html).toContain("72");
        (0, vitest_1.expect)(html).toContain("Greenwashing");
        (0, vitest_1.expect)(html).toContain("91");
    });
    // --- Detail link ---
    (0, vitest_1.it)("includes a detail link to the web app", () => {
        const state = { kind: "success", score: greenScore(), analysisId: "analysis-123" };
        const html = (0, popup_ui_js_1.renderPopup)(state, BASE_CONFIG);
        (0, vitest_1.expect)(html).toContain("View Details");
        (0, vitest_1.expect)(html).toContain("https://ecopulse.example.com/analysis/analysis-123");
        (0, vitest_1.expect)(html).toContain('target="_blank"');
    });
    // --- Timeout error message ---
    (0, vitest_1.it)("renders timeout error state", () => {
        const state = { kind: "error", message: "Analysis timed out. Please try again." };
        const html = (0, popup_ui_js_1.renderPopup)(state, BASE_CONFIG);
        (0, vitest_1.expect)(html).toContain("timed out");
    });
});
(0, vitest_1.describe)("buildDetailUrl", () => {
    (0, vitest_1.it)("builds correct URL from config and analysis ID", () => {
        (0, vitest_1.expect)((0, popup_ui_js_1.buildDetailUrl)(BASE_CONFIG, "abc-123")).toBe("https://ecopulse.example.com/analysis/abc-123");
    });
    (0, vitest_1.it)("strips trailing slashes from base URL", () => {
        const config = { webAppBaseUrl: "https://app.example.com/" };
        (0, vitest_1.expect)((0, popup_ui_js_1.buildDetailUrl)(config, "id1")).toBe("https://app.example.com/analysis/id1");
    });
    (0, vitest_1.it)("encodes special characters in analysis ID", () => {
        const url = (0, popup_ui_js_1.buildDetailUrl)(BASE_CONFIG, "id with spaces");
        (0, vitest_1.expect)(url).toContain("id%20with%20spaces");
    });
});
(0, vitest_1.describe)("mountPopup", () => {
    (0, vitest_1.it)("replaces container innerHTML with rendered popup", () => {
        const container = document.createElement("div");
        container.innerHTML = "<p>old content</p>";
        const state = { kind: "success", score: greenScore(), analysisId: "m1" };
        (0, popup_ui_js_1.mountPopup)(container, state, BASE_CONFIG);
        (0, vitest_1.expect)(container.innerHTML).toContain("ecopulse-indicator-green");
        (0, vitest_1.expect)(container.innerHTML).not.toContain("old content");
    });
    (0, vitest_1.it)("mounts loading state into container", () => {
        const container = document.createElement("div");
        (0, popup_ui_js_1.mountPopup)(container, { kind: "loading" }, BASE_CONFIG);
        (0, vitest_1.expect)(container.innerHTML).toContain("Analyzing product");
    });
});
(0, vitest_1.describe)("startTimeout", () => {
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.useRealTimers();
    });
    (0, vitest_1.it)("calls onTimeout after configured timeout", () => {
        vitest_1.vi.useFakeTimers();
        const onTimeout = vitest_1.vi.fn();
        const config = { webAppBaseUrl: "https://x.com", timeoutMs: 3000 };
        (0, popup_ui_js_1.startTimeout)(config, onTimeout);
        vitest_1.vi.advanceTimersByTime(2999);
        (0, vitest_1.expect)(onTimeout).not.toHaveBeenCalled();
        vitest_1.vi.advanceTimersByTime(1);
        (0, vitest_1.expect)(onTimeout).toHaveBeenCalledWith({
            kind: "error",
            message: "Analysis timed out. Please try again.",
        });
    });
    (0, vitest_1.it)("does not call onTimeout if aborted before timeout", () => {
        vitest_1.vi.useFakeTimers();
        const onTimeout = vitest_1.vi.fn();
        const config = { webAppBaseUrl: "https://x.com", timeoutMs: 2000 };
        const controller = (0, popup_ui_js_1.startTimeout)(config, onTimeout);
        vitest_1.vi.advanceTimersByTime(1000);
        controller.abort();
        vitest_1.vi.advanceTimersByTime(2000);
        (0, vitest_1.expect)(onTimeout).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("defaults to 5000ms when timeoutMs is not set", () => {
        vitest_1.vi.useFakeTimers();
        const onTimeout = vitest_1.vi.fn();
        const config = { webAppBaseUrl: "https://x.com" };
        (0, popup_ui_js_1.startTimeout)(config, onTimeout);
        vitest_1.vi.advanceTimersByTime(4999);
        (0, vitest_1.expect)(onTimeout).not.toHaveBeenCalled();
        vitest_1.vi.advanceTimersByTime(1);
        (0, vitest_1.expect)(onTimeout).toHaveBeenCalled();
    });
});
//# sourceMappingURL=popup-ui.test.js.map