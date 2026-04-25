// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ExtractedProductData, ProductAnalysis, ProductScore } from "@ecopulse/shared";
import { callAnalyzeApi, initExtension } from "./extension-bridge.js";
import type { BridgeConfig } from "./extension-bridge.js";

const BRIDGE_CONFIG: BridgeConfig = {
  apiBaseUrl: "https://api.ecopulse.test",
  webAppBaseUrl: "https://app.ecopulse.test",
  timeoutMs: 5000,
};

function makeProductData(overrides: Partial<ExtractedProductData> = {}): ExtractedProductData {
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

function makeScore(overrides: Partial<ProductScore> = {}): ProductScore {
  return {
    environmental: 80,
    health: 70,
    greenwashing: 90,
    overallIndicator: "green",
    ...overrides,
  };
}

function makeAnalysis(overrides: Partial<ProductAnalysis> = {}): ProductAnalysis {
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
function setupProductPageDom(doc: Document): void {
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

describe("callAnalyzeApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends POST request with product data and returns analysis", async () => {
    const analysis = makeAnalysis();
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(analysis),
    } as Response);

    const result = await callAnalyzeApi("https://api.test", makeProductData());

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.test/api/analyze");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({ "Content-Type": "application/json" });
    expect(result.id).toBe("analysis-001");
  });

  it("strips trailing slashes from API base URL", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(makeAnalysis()),
    } as Response);

    await callAnalyzeApi("https://api.test///", makeProductData());

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.test/api/analyze");
  });

  it("throws on non-ok response", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(callAnalyzeApi("https://api.test", makeProductData())).rejects.toThrow(
      "API request failed with status 500"
    );
  });
});

describe("initExtension", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("alert", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("returns null when extraction fails (no product data on page)", async () => {
    // Empty DOM — extractor will fail
    document.body.innerHTML = "<p>Not a product page</p>";

    const result = await initExtension(BRIDGE_CONFIG, document);

    expect(result).toBeNull();
  });

  it("shows loading state then success on API response", async () => {
    setupProductPageDom(document);
    const analysis = makeAnalysis();
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(analysis),
    } as Response);

    const promise = initExtension(BRIDGE_CONFIG, document);

    // Container should exist with loading state
    const container = document.getElementById("ecopulse-popup-container");
    expect(container).not.toBeNull();
    expect(container!.innerHTML).toContain("ecopulse-loading");

    // Resolve the fetch
    await promise;

    // Now should show success
    expect(container!.innerHTML).toContain("ecopulse-indicator-green");
    expect(container!.innerHTML).toContain("Sustainable");
    expect(container!.innerHTML).toContain("analysis-001");
  });

  it("shows error state on API failure", async () => {
    setupProductPageDom(document);
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const container = await initExtension(BRIDGE_CONFIG, document);

    expect(container).not.toBeNull();
    expect(container!.innerHTML).toContain("ecopulse-error");
    expect(container!.innerHTML).toContain("Network error");
  });

  it("shows timeout error when API takes too long", async () => {
    setupProductPageDom(document);
    const mockFetch = vi.mocked(fetch);

    // Create a fetch that never resolves during the test
    let resolveFetch!: (value: Response) => void;
    mockFetch.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      })
    );

    const config: BridgeConfig = { ...BRIDGE_CONFIG, timeoutMs: 3000 };
    const promise = initExtension(config, document);

    const container = document.getElementById("ecopulse-popup-container");
    expect(container).not.toBeNull();

    // Advance past the timeout
    vi.advanceTimersByTime(3001);

    // Now resolve the fetch (too late)
    resolveFetch({
      ok: true,
      json: () => Promise.resolve(makeAnalysis()),
    } as Response);

    await promise;

    // Should show timeout error, not the success
    expect(container!.innerHTML).toContain("timed out");
  });

  it("cancels timeout on successful API response", async () => {
    setupProductPageDom(document);
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(makeAnalysis()),
    } as Response);

    const container = await initExtension(BRIDGE_CONFIG, document);

    // Advance timers past the timeout — should NOT show timeout error
    vi.advanceTimersByTime(6000);

    expect(container!.innerHTML).toContain("ecopulse-indicator-green");
    expect(container!.innerHTML).not.toContain("timed out");
  });

  it("shows error state on non-ok API response", async () => {
    setupProductPageDom(document);
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response);

    const container = await initExtension(BRIDGE_CONFIG, document);

    expect(container!.innerHTML).toContain("ecopulse-error");
    expect(container!.innerHTML).toContain("503");
  });

  it("displays red indicator for low-scoring products", async () => {
    setupProductPageDom(document);
    const analysis = makeAnalysis({
      score: makeScore({
        environmental: 30,
        health: 40,
        greenwashing: 20,
        overallIndicator: "red",
      }),
    });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(analysis),
    } as Response);

    const container = await initExtension(BRIDGE_CONFIG, document);

    expect(container!.innerHTML).toContain("ecopulse-indicator-red");
    expect(container!.innerHTML).toContain("Needs Improvement");
  });
});
