"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @vitest-environment jsdom
const vitest_1 = require("vitest");
const content_extractor_js_1 = require("./content-extractor.js");
/**
 * Helper to create a minimal DOM document for testing.
 */
function createDocument(html, url = "https://example.com/product/123") {
    const doc = new DOMParser().parseFromString(`<!DOCTYPE html><html><head></head><body>${html}</body></html>`, "text/html");
    Object.defineProperty(doc, "URL", { value: url, writable: false });
    return doc;
}
(0, vitest_1.describe)("ContentExtractor.extract", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)("extracts full product data from a well-structured page", () => {
        const html = `
      <h1 class="product-name">Organic Cotton T-Shirt</h1>
      <span class="brand-name">EcoWear</span>
      <div class="fabric-composition">60% Organic Cotton, 40% Recycled Polyester</div>
      <span class="product-price">$29.99</span>
      <div class="sustainability">Made with sustainable materials</div>
      <div class="certification">GOTS Certified</div>
      <nav aria-label="breadcrumb">
        <a>Home</a><a>Clothing</a><a>T-Shirts</a><a>Organic Cotton T-Shirt</a>
      </nav>
    `;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.productName).toBe("Organic Cotton T-Shirt");
        (0, vitest_1.expect)(result.brand).toBe("EcoWear");
        (0, vitest_1.expect)(result.fabricCompositionText).toBe("60% Organic Cotton, 40% Recycled Polyester");
        (0, vitest_1.expect)(result.price).toBe(29.99);
        (0, vitest_1.expect)(result.currency).toBe("USD");
        (0, vitest_1.expect)(result.category).toBe("T-Shirts");
        (0, vitest_1.expect)(result.sustainabilityClaims.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(result.certificationMentions.some((m) => m.includes("GOTS"))).toBe(true);
        (0, vitest_1.expect)(result.url).toBe("https://example.com/product/123");
    });
    (0, vitest_1.it)("extracts product data using meta tags", () => {
        const html = `
      <meta property="og:title" content="Linen Dress" />
      <meta name="brand" content="GreenStyle" />
      <meta property="product:price:amount" content="59.00" />
      <meta property="product:price:currency" content="EUR" />
      <meta property="product:category" content="Dresses" />
      <div class="material-composition">100% Linen</div>
    `;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.productName).toBe("Linen Dress");
        (0, vitest_1.expect)(result.brand).toBe("GreenStyle");
        (0, vitest_1.expect)(result.fabricCompositionText).toBe("100% Linen");
        (0, vitest_1.expect)(result.price).toBe(59.0);
        (0, vitest_1.expect)(result.currency).toBe("EUR");
        (0, vitest_1.expect)(result.category).toBe("Dresses");
    });
    (0, vitest_1.it)("returns null and shows notification when no product name found", () => {
        const alertSpy = vitest_1.vi.spyOn(window, "alert").mockImplementation(() => { });
        const html = `<div>Some random page content</div>`;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).toBeNull();
        (0, vitest_1.expect)(alertSpy).toHaveBeenCalledWith(vitest_1.expect.stringContaining("could not extract product information"));
    });
    (0, vitest_1.it)("returns null when product name exists but no brand or fabric info", () => {
        const alertSpy = vitest_1.vi.spyOn(window, "alert").mockImplementation(() => { });
        const html = `<h1>Some Product</h1>`;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).toBeNull();
        (0, vitest_1.expect)(alertSpy).toHaveBeenCalled();
    });
    (0, vitest_1.it)("succeeds with product name and brand even without fabric info", () => {
        const html = `
      <h1 class="product-title">Wool Sweater</h1>
      <a class="brand">NordicKnit</a>
    `;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.productName).toBe("Wool Sweater");
        (0, vitest_1.expect)(result.brand).toBe("NordicKnit");
        (0, vitest_1.expect)(result.fabricCompositionText).toBe("");
    });
    (0, vitest_1.it)("succeeds with product name and fabric info even without brand", () => {
        const html = `
      <h1>Cotton Pants</h1>
      <div class="fabric-composition">100% Cotton</div>
    `;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.productName).toBe("Cotton Pants");
        (0, vitest_1.expect)(result.brand).toBe("");
        (0, vitest_1.expect)(result.fabricCompositionText).toBe("100% Cotton");
    });
    (0, vitest_1.it)("detects sustainability keywords from body text when no dedicated section", () => {
        const html = `
      <h1 class="product-name">Eco Jacket</h1>
      <span class="brand-name">GreenBrand</span>
      <p>This eco-friendly jacket is made from recycled materials and is biodegradable.</p>
    `;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.sustainabilityClaims).toContain("eco-friendly");
        (0, vitest_1.expect)(result.sustainabilityClaims).toContain("recycled");
        (0, vitest_1.expect)(result.sustainabilityClaims).toContain("biodegradable");
    });
    (0, vitest_1.it)("detects certification mentions from body text", () => {
        const html = `
      <h1 class="product-name">Certified Shirt</h1>
      <span class="brand-name">TrustBrand</span>
      <p>This product is OEKO-TEX certified and meets Fair Trade standards.</p>
    `;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.certificationMentions).toContain("OEKO-TEX");
        (0, vitest_1.expect)(result.certificationMentions).toContain("Fair Trade");
    });
    (0, vitest_1.it)("parses price with euro symbol", () => {
        const html = `
      <h1 class="product-name">Silk Blouse</h1>
      <span class="brand-name">LuxEco</span>
      <span class="price">€45,50</span>
    `;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.price).toBe(45.5);
        (0, vitest_1.expect)(result.currency).toBe("EUR");
    });
    (0, vitest_1.it)("parses price with pound symbol", () => {
        const html = `
      <h1 class="product-name">Denim Jacket</h1>
      <span class="brand-name">BritEco</span>
      <span class="price">£89.99</span>
    `;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.price).toBe(89.99);
        (0, vitest_1.expect)(result.currency).toBe("GBP");
    });
    (0, vitest_1.it)("returns null price when no price element found", () => {
        const html = `
      <h1 class="product-name">Mystery Item</h1>
      <span class="brand-name">NoBrand</span>
    `;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.price).toBeNull();
        (0, vitest_1.expect)(result.currency).toBeNull();
    });
    (0, vitest_1.it)("returns null category when no breadcrumb or meta found", () => {
        const html = `
      <h1 class="product-name">Plain Tee</h1>
      <span class="brand-name">BasicBrand</span>
    `;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.category).toBeNull();
    });
    (0, vitest_1.it)("deduplicates sustainability claims", () => {
        const html = `
      <h1 class="product-name">Green Hoodie</h1>
      <span class="brand-name">EcoBrand</span>
      <div class="sustainability">organic materials</div>
      <div class="sustainability">organic cotton blend</div>
    `;
        const doc = createDocument(html);
        const result = (0, content_extractor_js_1.extract)(doc);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.sustainabilityClaims.length).toBeGreaterThan(0);
    });
});
(0, vitest_1.describe)("showExtractionFailureNotification", () => {
    (0, vitest_1.it)("calls alert with the expected message", () => {
        const alertSpy = vitest_1.vi.spyOn(window, "alert").mockImplementation(() => { });
        (0, content_extractor_js_1.showExtractionFailureNotification)();
        (0, vitest_1.expect)(alertSpy).toHaveBeenCalledWith(vitest_1.expect.stringContaining("AI Chat"));
        alertSpy.mockRestore();
    });
    (0, vitest_1.it)("falls back to console.warn when alert is unavailable", () => {
        const originalAlert = window.alert;
        // @ts-expect-error — removing alert to test fallback
        delete window.alert;
        const warnSpy = vitest_1.vi.spyOn(console, "warn").mockImplementation(() => { });
        (0, content_extractor_js_1.showExtractionFailureNotification)();
        (0, vitest_1.expect)(warnSpy).toHaveBeenCalledWith(vitest_1.expect.stringContaining("EcoPulse"));
        warnSpy.mockRestore();
        window.alert = originalAlert;
    });
});
//# sourceMappingURL=content-extractor.test.js.map