"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @vitest-environment jsdom
const vitest_1 = require("vitest");
const extension_bridge_js_1 = require("./extension-bridge.js");
const BRIDGE_CONFIG = {
    apiBaseUrl: "https://api.ecopulse.test",
    webAppBaseUrl: "https://app.ecopulse.test",
    timeoutMs: 5000,
};
function makeProductData(overrides = {}) {
    return {
        url: "https://shop.example.com/product/1",
        productName: "Organic Cotton Tee",
        brand: "GreenBrand",
        fabricCompositionText: "100% Organic Cotton",
        sustainabilityClaims: ["organic"],
        certificationMentions: ["GOTS"],
        price: 29.99,
        currency: "USD",
        category: "T-Shirts",
        imageUrl: null,
        ...overrides,
    };
}
function makeScore(overrides = {}) {
    return {
        environmental: 80,
        health: 70,
        greenwashing: 90,
        overallIndicator: "green",
        ...overrides,
    };
}
function makeAnalysis(overrides = {}) {
    return {
        id: "analysis-001",
        url: "https://shop.example.com/product/1",
        productName: "Organic Cotton Tee",
        brand: "GreenBrand",
        fabricComposition: {
            components: [{ material: "Cotton", percentage: 100, qualifier: "Organic" }],
            isComplete: true,
            rawText: "100% Organic Cotton",
        },
        certificationResults: [],
        greenwashingSignals: [],
        chemicalRisks: [],
        score: makeScore(),
        analyzedAt: new Date(),
        imageUrl: null,
        ...overrides,
    };
}
/**
 * Sets up a minimal product page DOM that the content extractor can parse.
 */
function setupProductPageDom(doc) {
    doc.body.innerHTML = "";
    const h1 = doc.createElement("h1");
    h1.setAttribute("data-testid", "product-title");
    h1.textContent = "Organic Cotton Tee";
    doc.body.appendChild(h1);
    const brandEl = doc.createElement("span");
    brandEl.setAttribute("data-testid", "brand-name");
    brandEl.textContent = "GreenBrand";
    doc.body.appendChild(brandEl);
    const fabricEl = doc.createElement("div");
    fabricEl.setAttribute("data-testid", "fabric-composition");
    fabricEl.textContent = "100% Organic Cotton";
    doc.body.appendChild(fabricEl);
}
(0, vitest_1.describe)("callAnalyzeApi", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.stubGlobal("fetch", vitest_1.vi.fn());
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)("sends POST request with product data and returns analysis", async () => {
        const analysis = makeAnalysis();
        const mockFetch = vitest_1.vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(analysis),
        });
        const result = await (0, extension_bridge_js_1.callAnalyzeApi)("https://api.test", makeProductData());
        (0, vitest_1.expect)(mockFetch).toHaveBeenCalledOnce();
        const [url, options] = mockFetch.mock.calls[0];
        (0, vitest_1.expect)(url).toBe("https://api.test/api/analyze");
        (0, vitest_1.expect)(options?.method).toBe("POST");
        (0, vitest_1.expect)(options?.headers).toEqual({ "Content-Type": "application/json" });
        (0, vitest_1.expect)(result.id).toBe("analysis-001");
    });
    (0, vitest_1.it)("strips trailing slashes from API base URL", async () => {
        const mockFetch = vitest_1.vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(makeAnalysis()),
        });
        await (0, extension_bridge_js_1.callAnalyzeApi)("https://api.test///", makeProductData());
        const [url] = mockFetch.mock.calls[0];
        (0, vitest_1.expect)(url).toBe("https://api.test/api/analyze");
    });
    (0, vitest_1.it)("throws on non-ok response", async () => {
        const mockFetch = vitest_1.vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });
        await (0, vitest_1.expect)((0, extension_bridge_js_1.callAnalyzeApi)("https://api.test", makeProductData())).rejects.toThrow("API request failed with status 500");
    });
});
(0, vitest_1.describe)("initExtension", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.useFakeTimers();
        vitest_1.vi.stubGlobal("fetch", vitest_1.vi.fn());
        vitest_1.vi.stubGlobal("alert", vitest_1.vi.fn());
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.useRealTimers();
        vitest_1.vi.restoreAllMocks();
        document.body.innerHTML = "";
    });
    (0, vitest_1.it)("returns null when extraction fails (no product data on page)", async () => {
        // Empty DOM — extractor will fail
        document.body.innerHTML = "<p>Not a product page</p>";
        const result = await (0, extension_bridge_js_1.initExtension)(BRIDGE_CONFIG, document);
        (0, vitest_1.expect)(result).toBeNull();
    });
    (0, vitest_1.it)("shows loading state then success on API response", async () => {
        setupProductPageDom(document);
        const analysis = makeAnalysis();
        const mockFetch = vitest_1.vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(analysis),
        });
        const promise = (0, extension_bridge_js_1.initExtension)(BRIDGE_CONFIG, document);
        // Container should exist with loading state
        const container = document.getElementById("ecopulse-popup-container");
        (0, vitest_1.expect)(container).not.toBeNull();
        (0, vitest_1.expect)(container.innerHTML).toContain("ecopulse-loading");
        // Resolve the fetch
        await promise;
        // Now should show success
        (0, vitest_1.expect)(container.innerHTML).toContain("ecopulse-indicator-green");
        (0, vitest_1.expect)(container.innerHTML).toContain("Sustainable");
        (0, vitest_1.expect)(container.innerHTML).toContain("analysis-001");
    });
    (0, vitest_1.it)("shows error state on API failure", async () => {
        setupProductPageDom(document);
        const mockFetch = vitest_1.vi.mocked(fetch);
        mockFetch.mockRejectedValueOnce(new Error("Network error"));
        const container = await (0, extension_bridge_js_1.initExtension)(BRIDGE_CONFIG, document);
        (0, vitest_1.expect)(container).not.toBeNull();
        (0, vitest_1.expect)(container.innerHTML).toContain("ecopulse-error");
        (0, vitest_1.expect)(container.innerHTML).toContain("Network error");
    });
    (0, vitest_1.it)("shows timeout error when API takes too long", async () => {
        setupProductPageDom(document);
        const mockFetch = vitest_1.vi.mocked(fetch);
        // Create a fetch that never resolves during the test
        let resolveFetch;
        mockFetch.mockReturnValueOnce(new Promise((resolve) => {
            resolveFetch = resolve;
        }));
        const config = { ...BRIDGE_CONFIG, timeoutMs: 3000 };
        const promise = (0, extension_bridge_js_1.initExtension)(config, document);
        const container = document.getElementById("ecopulse-popup-container");
        (0, vitest_1.expect)(container).not.toBeNull();
        // Advance past the timeout
        vitest_1.vi.advanceTimersByTime(3001);
        // Now resolve the fetch (too late)
        resolveFetch({
            ok: true,
            json: () => Promise.resolve(makeAnalysis()),
        });
        await promise;
        // Should show timeout error, not the success
        (0, vitest_1.expect)(container.innerHTML).toContain("timed out");
    });
    (0, vitest_1.it)("cancels timeout on successful API response", async () => {
        setupProductPageDom(document);
        const mockFetch = vitest_1.vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(makeAnalysis()),
        });
        const container = await (0, extension_bridge_js_1.initExtension)(BRIDGE_CONFIG, document);
        // Advance timers past the timeout — should NOT show timeout error
        vitest_1.vi.advanceTimersByTime(6000);
        (0, vitest_1.expect)(container.innerHTML).toContain("ecopulse-indicator-green");
        (0, vitest_1.expect)(container.innerHTML).not.toContain("timed out");
    });
    (0, vitest_1.it)("shows error state on non-ok API response", async () => {
        setupProductPageDom(document);
        const mockFetch = vitest_1.vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 503,
        });
        const container = await (0, extension_bridge_js_1.initExtension)(BRIDGE_CONFIG, document);
        (0, vitest_1.expect)(container.innerHTML).toContain("ecopulse-error");
        (0, vitest_1.expect)(container.innerHTML).toContain("503");
    });
    (0, vitest_1.it)("displays red indicator for low-scoring products", async () => {
        setupProductPageDom(document);
        const analysis = makeAnalysis({
            score: makeScore({
                environmental: 30,
                health: 40,
                greenwashing: 20,
                overallIndicator: "red",
            }),
        });
        const mockFetch = vitest_1.vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(analysis),
        });
        const container = await (0, extension_bridge_js_1.initExtension)(BRIDGE_CONFIG, document);
        (0, vitest_1.expect)(container.innerHTML).toContain("ecopulse-indicator-red");
        (0, vitest_1.expect)(container.innerHTML).toContain("Needs Improvement");
    });
});
//# sourceMappingURL=extension-bridge.test.js.map