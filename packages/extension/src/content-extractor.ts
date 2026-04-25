import type { ExtractedProductData } from "@ecopulse/shared";

/**
 * Known CSS selectors and meta tags commonly used by retailers
 * for product page elements.
 */
const PRODUCT_NAME_SELECTORS = [
  'h1[data-testid="product-title"]',
  'h1[class*="product-name"]',
  'h1[class*="product-title"]',
  'h1[class*="productName"]',
  '[data-testid="product-name"]',
  'meta[property="og:title"]',
  "h1",
];

const BRAND_SELECTORS = [
  '[data-testid="brand-name"]',
  '[class*="brand-name"]',
  '[class*="brandName"]',
  '[class*="product-brand"]',
  'meta[property="og:brand"]',
  'meta[name="brand"]',
  'a[class*="brand"]',
  'span[class*="brand"]',
];

const PRICE_SELECTORS = [
  '[data-testid="product-price"]',
  '[class*="product-price"]',
  '[class*="productPrice"]',
  '[class*="sale-price"]',
  'meta[property="product:price:amount"]',
  'meta[property="og:price:amount"]',
  'span[class*="price"]',
  '[itemprop="price"]',
];

const CURRENCY_SELECTORS = [
  'meta[property="product:price:currency"]',
  'meta[property="og:price:currency"]',
  '[itemprop="priceCurrency"]',
];

const FABRIC_SELECTORS = [
  '[data-testid="fabric-composition"]',
  '[class*="fabric-composition"]',
  '[class*="fabricComposition"]',
  '[class*="material-composition"]',
  '[class*="materialComposition"]',
  '[class*="product-composition"]',
  '[class*="product-material"]',
  '[itemprop="material"]',
];

const SUSTAINABILITY_SELECTORS = [
  '[data-testid="sustainability"]',
  '[class*="sustainability"]',
  '[class*="eco-"]',
  '[class*="environmental"]',
  '[class*="green-"]',
];

const CERTIFICATION_SELECTORS = [
  '[data-testid="certifications"]',
  '[class*="certification"]',
  '[class*="certificate"]',
  '[class*="badge"]',
];

const CATEGORY_SELECTORS = [
  'meta[property="product:category"]',
  '[data-testid="product-category"]',
  '[class*="breadcrumb"]',
  'nav[aria-label="breadcrumb"]',
];

const IMAGE_SELECTORS = [
  // Shein
  '.crop-image-container img',
  '.swiper-slide img',
  '[class*="crop-image"] img',
  // H&M
  '[class*="product-detail"] img',
  'figure.pdp-image img',
  'figure img',
  // Zara
  '[class*="media-image"] img',
  '[class*="product-media"] img',
  // ASOS
  '[data-testid="product-image"] img',
  '#product-image img',
  // Generic
  'meta[property="og:image"]',
  'meta[name="twitter:image"]',
  '[class*="product-image"] img',
  '[class*="product-gallery"] img',
  '[class*="productImage"] img',
  '[class*="pdp-image"] img',
  '[itemprop="image"]',
  '.product-detail img',
  '[class*="gallery"] img',
  '[class*="hero-image"] img',
  '[class*="main-image"] img',
];

const KNOWN_CERTIFICATIONS = [
  "GOTS",
  "OEKO-TEX",
  "Oeko-Tex",
  "Fair Trade",
  "Fairtrade",
  "Bluesign",
  "BCI",
  "Better Cotton",
  "Cradle to Cradle",
  "GRS",
  "Global Recycled Standard",
  "RWS",
  "Responsible Wool",
  "FSC",
  "PETA-Approved",
  "B Corp",
];

const SUSTAINABILITY_KEYWORDS = [
  "eco-friendly",
  "sustainable",
  "organic",
  "recycled",
  "green",
  "natural",
  "conscious",
  "responsible",
  "ethical",
  "biodegradable",
  "carbon neutral",
  "climate positive",
  "vegan",
  "cruelty-free",
  "low impact",
  "zero waste",
];

/**
 * Queries the document for the first matching element from a list of selectors.
 * For meta tags, returns the content attribute value.
 */
function queryText(doc: Document, selectors: string[]): string | null {
  for (const selector of selectors) {
    const el = doc.querySelector(selector);
    if (!el) continue;

    if (el instanceof HTMLMetaElement) {
      const content = el.getAttribute("content");
      if (content?.trim()) return content.trim();
    } else {
      const text = el.textContent?.trim();
      if (text) return text;
    }
  }
  return null;
}

/**
 * Extracts a numeric price from text, stripping currency symbols.
 */
function parsePrice(text: string | null): number | null {
  if (!text) return null;
  const match = text.match(/[\d]+[.,]?\d*/);
  if (!match) return null;
  const num = parseFloat(match[0].replace(",", "."));
  return isNaN(num) ? null : num;
}

/**
 * Scans the full page text for sustainability-related claims.
 */
function extractSustainabilityClaims(doc: Document): string[] {
  const claims: string[] = [];

  // First try dedicated sustainability sections
  for (const selector of SUSTAINABILITY_SELECTORS) {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((el) => {
      const text = el.textContent?.trim();
      if (text) claims.push(text);
    });
  }

  // Scan body text for sustainability keywords if no dedicated sections found
  if (claims.length === 0) {
    const bodyText = doc.body?.textContent?.toLowerCase() ?? "";
    for (const keyword of SUSTAINABILITY_KEYWORDS) {
      if (bodyText.includes(keyword.toLowerCase())) {
        claims.push(keyword);
      }
    }
  }

  return [...new Set(claims)];
}

/**
 * Scans the page for certification mentions.
 */
function extractCertificationMentions(doc: Document): string[] {
  const mentions: string[] = [];

  // Check dedicated certification elements
  for (const selector of CERTIFICATION_SELECTORS) {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((el) => {
      const text = el.textContent?.trim();
      if (text) mentions.push(text);
    });
  }

  // Scan body text for known certification names
  const bodyText = doc.body?.textContent ?? "";
  for (const cert of KNOWN_CERTIFICATIONS) {
    if (bodyText.toLowerCase().includes(cert.toLowerCase()) && !mentions.some((m) => m.toLowerCase().includes(cert.toLowerCase()))) {
      mentions.push(cert);
    }
  }

  return [...new Set(mentions)];
}

/**
 * Extracts currency from meta tags or price text.
 */
function extractCurrency(doc: Document, priceText: string | null): string | null {
  const metaCurrency = queryText(doc, CURRENCY_SELECTORS);
  if (metaCurrency) return metaCurrency;

  if (priceText) {
    if (priceText.includes("$")) return "USD";
    if (priceText.includes("€")) return "EUR";
    if (priceText.includes("£")) return "GBP";
    if (priceText.includes("¥")) return "JPY";
  }

  return null;
}

/**
 * Extracts the last breadcrumb segment as the product category.
 */
function extractCategory(doc: Document): string | null {
  const metaCategory = queryText(doc, [
    'meta[property="product:category"]',
    '[data-testid="product-category"]',
  ]);
  if (metaCategory) return metaCategory;

  // Try breadcrumbs — take the last meaningful segment
  const breadcrumb = doc.querySelector(
    '[class*="breadcrumb"], nav[aria-label="breadcrumb"]'
  );
  if (breadcrumb) {
    const items = breadcrumb.querySelectorAll("a, span, li");
    const segments: string[] = [];
    items.forEach((item) => {
      const text = item.textContent?.trim();
      if (text && text !== "/" && text !== ">") segments.push(text);
    });
    // Return second-to-last or last segment (last is often the product itself)
    if (segments.length >= 2) return segments[segments.length - 2];
    if (segments.length === 1) return segments[0];
  }

  return null;
}

/**
 * Extracts the primary product image URL from the page.
 */
function extractImageUrl(doc: Document): string | null {
  for (const selector of IMAGE_SELECTORS) {
    const el = doc.querySelector(selector);
    if (!el) continue;

    if (el instanceof HTMLMetaElement) {
      const content = el.getAttribute("content");
      if (content?.trim()) return upgradeImageUrl(content.trim());
    } else if (el instanceof HTMLImageElement) {
      // Check src, then lazy-load attributes
      const src = el.src || el.getAttribute("data-src") || el.getAttribute("data-lazy-src") || el.getAttribute("data-original");
      if (src?.trim() && !src.startsWith("data:")) return upgradeImageUrl(src.trim());
    } else if (el.hasAttribute("content")) {
      const content = el.getAttribute("content");
      if (content?.trim()) return upgradeImageUrl(content.trim());
    }
  }
  return null;
}

/** Upgrade retailer thumbnail URLs to higher resolution versions. */
function upgradeImageUrl(url: string): string {
  // Shein: swap thumbnail sizes for better quality
  if (url.includes("shein.com")) {
    return url.replace(/_thumbnail_\d+x\d+/, "").replace(/_\d+x\d+\./, "_600x800.");
  }
  return url;
}

/**
 * Shows a browser notification suggesting AI_Chat for manual input.
 * Falls back to console warning in non-browser environments.
 */
export function showExtractionFailureNotification(): void {
  const message =
    "EcoPulse could not extract product information from this page. " +
    "You can manually input product details via AI Chat for analysis.";

  if (typeof window !== "undefined" && typeof alert === "function") {
    alert(message);
  } else {
    console.warn(`[EcoPulse] ${message}`);
  }
}

/**
 * Content Extractor — extracts product data from a retailer product page DOM.
 *
 * Returns `ExtractedProductData` on success, or `null` if insufficient data
 * could be extracted (also triggers a notification suggesting AI_Chat).
 */
export function extract(doc: Document): ExtractedProductData | null {
  const productName = queryText(doc, PRODUCT_NAME_SELECTORS);
  const brand = queryText(doc, BRAND_SELECTORS);
  const fabricCompositionText = queryText(doc, FABRIC_SELECTORS);

  // We need at least a product name and either brand or fabric info
  // to consider the extraction successful
  if (!productName || (!brand && !fabricCompositionText)) {
    showExtractionFailureNotification();
    return null;
  }

  const priceText = queryText(doc, PRICE_SELECTORS);

  return {
    url: doc.URL || doc.location?.href || "",
    productName,
    brand: brand ?? "",
    fabricCompositionText: fabricCompositionText ?? "",
    sustainabilityClaims: extractSustainabilityClaims(doc),
    certificationMentions: extractCertificationMentions(doc),
    price: parsePrice(priceText),
    currency: extractCurrency(doc, priceText),
    category: extractCategory(doc),
    imageUrl: extractImageUrl(doc),
  };
}

export const ContentExtractor = { extract };
