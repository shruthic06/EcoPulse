// EcoPulse Floating Widget — injected into every page
(function () {
  if (document.getElementById("ecopulse-fab")) return;

  var API_BASE = "http://localhost:3000";

  // ===== Fabric & Material Keywords =====
  var FABRIC_KW = [
    "polyester","cotton","nylon","spandex","elastane","rayon","viscose",
    "linen","silk","wool","acrylic","modal","lyocell","tencel","bamboo",
    "cashmere","chiffon","satin","velvet","fleece","jersey","mesh","denim",
    "polypropylene","cupro","latex","rubber","hemp","jute","ramie",
    "polyamide","polylactic","microfiber","organza","twill","corduroy",
    "poplin","chambray","tweed","muslin","taffeta","tulle","georgette",
    "crepe","jacquard","terry","flannel","canvas","suede","faux leather",
  ];
  var CERT_KW = [
    "GOTS","OEKO-TEX","Oeko-Tex","Fair Trade","Fairtrade","Bluesign",
    "BCI","Better Cotton","Cradle to Cradle","GRS","Global Recycled Standard",
    "PETA-Approved","B Corp","RWS","Responsible Wool","FSC",
  ];
  var SUST_KW = [
    "eco-friendly","sustainable","organic","recycled","green","natural",
    "conscious","responsible","ethical","biodegradable","carbon neutral",
    "vegan","cruelty-free","climate positive","low impact","zero waste",
  ];

  // ===== Retailer-specific selectors for fabric/material info =====
  var FABRIC_SELECTORS = [
    // Shein
    ".product-intro__description-table",
    ".product-intro__description",
    ".goods-detail__description",
    // H&M
    ".pdp-description-list__content",
    '[class*="product-description"] [class*="composition"]',
    ".product-description-text",
    '[data-testid="product-description"]',
    // Zara
    ".product-detail-info__content",
    '[class*="product-detail"] [class*="description"]',
    ".structured-component-text",
    // ASOS
    '[data-testid="productDescription"]',
    '[class*="product-description"]',
    // Uniqlo
    '[class*="material-info"]',
    '[class*="product-material"]',
    // Nike
    '[class*="description-preview"]',
    // Amazon
    '#productDescription',
    '#feature-bullets',
    // Generic selectors
    '[itemprop="material"]',
    '[class*="fabric-composition"]',
    '[class*="fabricComposition"]',
    '[class*="material-composition"]',
    '[class*="materialComposition"]',
    '[class*="product-composition"]',
    '[class*="product-material"]',
    '[class*="product-details"]',
    '[class*="product-info"]',
    '[data-testid="fabric-composition"]',
    '[data-testid="product-details"]',
  ];

  var PRODUCT_NAME_SELECTORS = [
    // Shein
    ".product-intro__head-name",
    ".goods-detail__goods-name",
    ".product-intro__head-mainTitle",
    // H&M
    ".product-item-headline",
    '[data-testid="product-title"]',
    // Zara
    ".product-detail-info__header-name",
    // ASOS
    '[data-testid="product-title"]',
    "#aside-content h1",
    // Nike
    '[data-testid="product_title"]',
    // Amazon
    "#productTitle",
    // Generic
    'h1[class*="product-name"]',
    'h1[class*="product-title"]',
    'h1[class*="productName"]',
    '[data-testid="product-name"]',
  ];

  var BRAND_SELECTORS = [
    ".product-intro__head-brand",
    ".goods-detail__brand",
    ".product-item-brand",
    '[data-testid="brand-link"]',
    '[data-testid="brand-name"]',
    '[class*="brand-name"]',
    '[class*="product-brand"]',
    'a[class*="brand"]',
    'span[class*="brand"]',
    "#bylineInfo",
  ];

  // ===== Brand detection from hostname =====
  function brandFromHost() {
    var h = location.hostname.toLowerCase();
    var map = {
      "shein":"SHEIN","hm.com":"H&M","h&m":"H&M","zara":"Zara","asos":"ASOS",
      "uniqlo":"Uniqlo","forever21":"Forever 21","gap.com":"GAP",
      "nike":"Nike","adidas":"Adidas","mango":"Mango","primark":"Primark",
      "boohoo":"Boohoo","fashionnova":"Fashion Nova","nordstrom":"Nordstrom",
      "amazon":"Amazon","oldnavy":"Old Navy","target":"Target",
      "urbanoutfitters":"Urban Outfitters","topshop":"Topshop",
      "prettylittlething":"PrettyLittleThing","missguided":"Missguided",
      "lululemon":"Lululemon","patagonia":"Patagonia","everlane":"Everlane",
      "reformation":"Reformation","cos":"COS","arket":"ARKET",
      "weekday":"Weekday","monki":"Monki","stories":"& Other Stories",
    };
    for (var key in map) { if (h.indexOf(key) !== -1) return map[key]; }
    return "";
  }

  // ===== Query first matching selector =====
  function qFirst(selectors) {
    for (var i = 0; i < selectors.length; i++) {
      try {
        var el = document.querySelector(selectors[i]);
        if (!el) continue;
        if (el.tagName === "META") {
          var c = (el.getAttribute("content") || "").trim();
          if (c) return c;
        } else {
          var t = (el.textContent || "").trim();
          if (t && t.length > 1) return t;
        }
      } catch (e) {}
    }
    return "";
  }

  // ===== Product name extraction =====
  function getProductName() {
    // Try retailer-specific selectors first
    var fromSelector = qFirst(PRODUCT_NAME_SELECTORS);
    if (fromSelector && fromSelector.length > 3 && fromSelector.length < 200) return fromSelector;

    // og:title meta
    var og = document.querySelector('meta[property="og:title"]');
    if (og) {
      var c = (og.getAttribute("content") || "").trim();
      if (c) {
        c = c.replace(/\s*[\|–—\-]\s*(SHEIN|H&M|Zara|ASOS|Uniqlo|shein|Buy|Amazon|Nike|Adidas|Nordstrom|Target|GAP|Mango).*$/i, "").trim();
        if (c.length > 3 && c.length < 150) return c;
      }
    }
    // document.title
    var title = document.title || "";
    if (title.length > 3 && title.length < 200) {
      var cleaned = title.replace(/\s*[\|–—\-]\s*(SHEIN|H&M|Zara|ASOS|Uniqlo|shein|Buy|Amazon|Nike|Adidas|Nordstrom|Target|GAP|Mango).*$/i, "").trim();
      if (cleaned.length > 3 && cleaned.length < 150) return cleaned;
    }
    // h1 fallback
    var h1 = document.querySelector("h1");
    if (h1) { var t = (h1.textContent || "").trim(); if (t.length > 2 && t.length < 200) return t; }
    return "";
  }

  // ===== Extract fabric from text (with or without percentages) =====
  function extractFabricFromText(text) {
    if (!text || text.length < 3) return "";

    // Strategy A: Find "N% Material" patterns (e.g. "95% Polyester, 5% Spandex")
    var allMatches = [];
    var regex = /(\d+)\s*%\s*([A-Za-z][A-Za-z\s]{1,30})/g;
    var match;
    while ((match = regex.exec(text)) !== null) {
      var pct = parseInt(match[1], 10);
      var mat = match[2].trim().toLowerCase();
      if (pct > 0 && pct <= 100 && FABRIC_KW.some(function(k) { return mat.indexOf(k) !== -1; })) {
        allMatches.push(match[1] + "% " + match[2].trim());
      }
    }
    if (allMatches.length > 0) return allMatches.join(", ");

    // Strategy B: Find standalone fabric keywords (e.g. "Polyester" or "Cotton, Polyester")
    var textLower = text.toLowerCase();
    var foundFabrics = [];
    for (var i = 0; i < FABRIC_KW.length; i++) {
      // Match whole word (not inside another word)
      var kw = FABRIC_KW[i];
      var idx = textLower.indexOf(kw);
      if (idx !== -1) {
        // Check it's a word boundary (not part of a longer word)
        var before = idx > 0 ? textLower[idx - 1] : " ";
        var after = idx + kw.length < textLower.length ? textLower[idx + kw.length] : " ";
        if (/[\s,;:.(\/]/.test(before) || idx === 0) {
          if (/[\s,;:.)\/]/.test(after) || idx + kw.length === textLower.length) {
            // Get the original case version
            foundFabrics.push(text.substring(idx, idx + kw.length));
          }
        }
      }
    }
    if (foundFabrics.length > 0) return foundFabrics.join(", ");

    return "";
  }

  // ===== Extract from JSON-LD structured data =====
  function extractFromJsonLd() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var data = JSON.parse(scripts[i].textContent);
        // Handle arrays
        var items = Array.isArray(data) ? data : [data];
        for (var j = 0; j < items.length; j++) {
          var item = items[j];
          if (!item) continue;
          // Check @graph arrays
          if (item["@graph"]) items = items.concat(item["@graph"]);
          // Look for Product type
          if (item["@type"] === "Product" || item["@type"] === "ClothingStore" ||
              (typeof item["@type"] === "string" && item["@type"].indexOf("Product") !== -1)) {
            var mat = item.material || item.fabric || "";
            if (mat) {
              var fromMat = extractFabricFromText(mat);
              if (fromMat) return fromMat;
              // Sometimes it's just a plain string like "Cotton"
              if (typeof mat === "string" && mat.length > 2) return mat;
            }
            // Check description for fabric info
            var desc = item.description || "";
            if (desc) {
              var fromDesc = extractFabricFromText(desc);
              if (fromDesc) return fromDesc;
            }
          }
        }
      } catch (e) {}
    }
    return "";
  }

  // ===== Try to expand hidden description/details sections =====
  function tryExpandDetails() {
    var expandSelectors = [
      // Shein
      '[class*="description"] [class*="expand"]',
      '[class*="description"] [class*="more"]',
      '[class*="detail"] [class*="expand"]',
      'button[class*="view-more"]',
      // Generic accordion/tab triggers
      '[class*="accordion"] button',
      '[class*="tab"][data-tab*="detail"]',
      '[class*="tab"][data-tab*="description"]',
      'button[aria-expanded="false"]',
      'details:not([open]) summary',
    ];
    for (var i = 0; i < expandSelectors.length; i++) {
      try {
        var els = document.querySelectorAll(expandSelectors[i]);
        els.forEach(function(el) {
          try {
            el.click();
            if (el.tagName === "DETAILS") el.setAttribute("open", "");
          } catch (e) {}
        });
      } catch (e) {}
    }
  }

  // ===== Fabric composition extraction (multi-strategy) =====
  function extractFabric() {
    // Strategy 0: JSON-LD structured data (most reliable when available)
    var fromJsonLd = extractFromJsonLd();
    if (fromJsonLd) return fromJsonLd;

    // Strategy 1: Try retailer-specific DOM selectors
    for (var s = 0; s < FABRIC_SELECTORS.length; s++) {
      try {
        var el = document.querySelector(FABRIC_SELECTORS[s]);
        if (!el) continue;
        var elText = (el.innerText || el.textContent || "").trim();
        if (!elText || elText.length < 5) continue;
        var fromEl = extractFabricFromText(elText);
        if (fromEl) return fromEl;
      } catch (e) {}
    }

    // Strategy 2: Scan full page text line by line
    var text = document.body ? (document.body.innerText || document.body.textContent || "") : "";
    if (!text) return "";

    var lines = text.split(/\n/);
    var best = "";
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.length > 300) continue;
      var fromLine = extractFabricFromText(line);
      if (fromLine && fromLine.length > best.length) best = fromLine;
    }
    if (best) return best;

    // Strategy 3: Label patterns (Composition:, Material:, etc.)
    var labelPatterns = [
      /(?:Composition|Material|Fabric|Content|Made of|Materiale|Zusammensetzung|Composición)\s*[:：]\s*([^\n]{5,150})/i,
      /(?:Shell|Body|Lining|Main)\s*[:：]\s*(\d+%[^\n]{3,100})/i,
    ];
    for (var p = 0; p < labelPatterns.length; p++) {
      var m = text.match(labelPatterns[p]);
      if (m && m[1]) {
        var fromLabel = extractFabricFromText(m[1]);
        if (fromLabel) return fromLabel;
      }
    }

    // Strategy 4: Global regex scan
    var globalResult = extractFabricFromText(text);
    if (globalResult) return globalResult;

    // Strategy 5: Search inside ALL elements' textContent (catches shadow DOM, iframes, etc.)
    var allEls = document.querySelectorAll("p, span, div, td, li, dd");
    for (var e = 0; e < allEls.length && e < 2000; e++) {
      var elText2 = (allEls[e].textContent || "").trim();
      if (elText2.length < 5 || elText2.length > 200) continue;
      var fromAny = extractFabricFromText(elText2);
      if (fromAny) return fromAny;
    }

    return "";
  }

  // ===== Brand extraction =====
  function getBrand() {
    var fromSelector = qFirst(BRAND_SELECTORS);
    if (fromSelector && fromSelector.length > 1 && fromSelector.length < 60) return fromSelector;
    var fromMeta = "";
    var metaBrand = document.querySelector('meta[property="og:brand"]') || document.querySelector('meta[name="brand"]');
    if (metaBrand) fromMeta = (metaBrand.getAttribute("content") || "").trim();
    if (fromMeta) return fromMeta;
    return brandFromHost();
  }

  // ===== Full extraction =====
  function doExtract() {
    var fullLower = ((document.body && document.body.textContent) || "").toLowerCase();

    // Extract product image — retailer-specific selectors first, then generic
    var imageUrl = null;
    var imgSelectors = [
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
      // Generic / common patterns
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
    for (var i = 0; i < imgSelectors.length; i++) {
      var el = document.querySelector(imgSelectors[i]);
      if (!el) continue;
      if (el.tagName === 'META') {
        var c = el.getAttribute('content');
        if (c && c.trim()) { imageUrl = c.trim(); break; }
      } else if (el.tagName === 'IMG') {
        // Check src, then lazy-load attributes (data-src, data-lazy-src, data-original)
        var src = el.src || el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || el.getAttribute('data-original');
        if (src && src.trim() && src.indexOf('data:') !== 0) { imageUrl = src.trim(); break; }
      } else if (el.hasAttribute('content')) {
        var ct = el.getAttribute('content');
        if (ct && ct.trim()) { imageUrl = ct.trim(); break; }
      }
    }

    // Shein: upgrade thumbnail URLs to higher resolution
    if (imageUrl && imageUrl.indexOf('shein.com') !== -1) {
      imageUrl = imageUrl.replace(/_thumbnail_\d+x\d+/, '').replace(/_\d+x\d+\./, '_600x800.');
    }

    return {
      url: location.href,
      productName: getProductName(),
      brand: getBrand(),
      fabricCompositionText: extractFabric(),
      sustainabilityClaims: SUST_KW.filter(function(kw) { return fullLower.indexOf(kw) !== -1; }),
      certificationMentions: CERT_KW.filter(function(c) { return fullLower.indexOf(c.toLowerCase()) !== -1; }),
      imageUrl: imageUrl,
    };
  }

  // ===== UI Creation =====
  var fab = document.createElement("div");
  fab.id = "ecopulse-fab";
  fab.textContent = "🌿";
  fab.title = "EcoPulse — Analyze this product";
  document.body.appendChild(fab);

  var panel = document.createElement("div");
  panel.id = "ecopulse-panel";
  panel.innerHTML = buildFormHTML();
  document.body.appendChild(panel);

  function buildFormHTML() {
    return '<div class="ep-header"><h2>🌿 EcoPulse</h2><button class="ep-close" id="ep-close">✕</button></div>' +
      '<div class="ep-body" id="ep-body">' +
        '<div id="ep-form">' +
          '<div class="ep-hint" id="ep-hint"></div>' +
          '<label class="ep-label">Product Name</label>' +
          '<div class="ep-input-wrap"><span class="ep-input-icon" style="background:#ede9fe">👕</span><input class="ep-input" id="ep-name" placeholder="e.g. Slim Fit Crop Tank Top"></div>' +
          '<label class="ep-label">Brand</label>' +
          '<div class="ep-input-wrap"><span class="ep-input-icon" style="background:#fce7f3">💎</span><input class="ep-input" id="ep-brand" placeholder="e.g. SHEIN, H&M, Zara"></div>' +
          '<label class="ep-label">Fabric Composition</label>' +
          '<div class="ep-input-wrap"><span class="ep-input-icon" style="background:#e0f2fe">#</span><textarea class="ep-textarea" id="ep-fabric" placeholder="e.g. 95% Polyester, 5% Spandex"></textarea></div>' +
          '<div class="ep-small">Paste from the product page if not auto-filled</div>' +
          '<label class="ep-label">Sustainability Claims (optional)</label>' +
          '<div class="ep-input-wrap"><span class="ep-input-icon" style="background:#f0fdf4">🌿</span><input class="ep-input" id="ep-claims" placeholder="e.g. eco-friendly, recycled"></div>' +
          '<label class="ep-label">Certifications (optional)</label>' +
          '<div class="ep-input-wrap"><span class="ep-input-icon" style="background:#f0fdf4">🛡</span><input class="ep-input" id="ep-certs" placeholder="e.g. GOTS, OEKO-TEX"></div>' +
          '<button class="ep-btn" id="ep-analyze">🔍 Analyze</button>' +
          '<button class="ep-btn ep-btn-secondary" id="ep-rescan">🔄 Re-scan Page</button>' +
        '</div>' +
        '<div id="ep-loading" style="display:none"><div class="ep-loading"><div class="ep-spinner"></div><p style="margin-top:10px;font-size:.82rem">Analyzing…</p></div></div>' +
        '<div id="ep-result" style="display:none"></div>' +
      '</div>';
  }

  // ===== Event Handlers =====
  var isOpen = false;

  fab.addEventListener("click", function () {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add("open");
      fillFormFromPage();
    } else {
      panel.classList.remove("open");
    }
  });

  panel.addEventListener("click", function (e) {
    if (e.target && e.target.id === "ep-close") { isOpen = false; panel.classList.remove("open"); }
    if (e.target && e.target.id === "ep-analyze") { runAnalysis(); }
    if (e.target && e.target.id === "ep-rescan") { rescanPage(); }
    if (e.target && e.target.id === "ep-reset") { showForm(); }
    if (e.target && e.target.id === "ep-retry") { showForm(); }
  });

  panel.addEventListener("focusin", function (e) {
    if (e.target && e.target.classList) e.target.classList.remove("ep-error");
  });

  // ===== Auto-fill =====
  function fillFormFromPage() {
    // Try to expand hidden description sections first
    tryExpandDetails();

    // Extract immediately
    applyExtraction();

    // Also re-extract after a short delay (for content that loads after expand)
    setTimeout(applyExtraction, 800);
    setTimeout(applyExtraction, 2000);
  }

  function applyExtraction() {
    var data = doExtract();
    var nameEl = document.getElementById("ep-name");
    var brandEl = document.getElementById("ep-brand");
    var fabricEl = document.getElementById("ep-fabric");
    var claimsEl = document.getElementById("ep-claims");
    var certsEl = document.getElementById("ep-certs");
    var hintEl = document.getElementById("ep-hint");
    if (!nameEl) return;

    var filled = [];
    if (data.productName && !nameEl.value) { nameEl.value = data.productName; filled.push("name"); }
    if (data.brand && !brandEl.value) { brandEl.value = data.brand; filled.push("brand"); }
    if (data.fabricCompositionText && !fabricEl.value) { fabricEl.value = data.fabricCompositionText; filled.push("fabric"); }
    if (data.sustainabilityClaims.length && !claimsEl.value) { claimsEl.value = data.sustainabilityClaims.join(", "); filled.push("claims"); }
    if (data.certificationMentions.length && !certsEl.value) { certsEl.value = data.certificationMentions.join(", "); filled.push("certs"); }

    if (filled.length > 0 && hintEl) {
      hintEl.textContent = "✓ Auto-filled: " + filled.join(", ") + ". Review & edit if needed.";
      hintEl.style.display = "block";
    }
  }

  function rescanPage() {
    // Clear existing values to force re-fill
    document.getElementById("ep-name").value = "";
    document.getElementById("ep-brand").value = "";
    document.getElementById("ep-fabric").value = "";
    document.getElementById("ep-claims").value = "";
    document.getElementById("ep-certs").value = "";
    var hintEl = document.getElementById("ep-hint");
    if (hintEl) hintEl.style.display = "none";

    // Try expanding hidden sections
    tryExpandDetails();

    // Re-extract after a moment
    setTimeout(function() {
      applyExtraction();
      // If still no fabric, show what we can see
      var fabricEl = document.getElementById("ep-fabric");
      if (!fabricEl.value) {
        var hintEl2 = document.getElementById("ep-hint");
        if (hintEl2) {
          hintEl2.textContent = "Could not find fabric info. Try scrolling to the product description section, then click Re-scan again.";
          hintEl2.style.display = "block";
          hintEl2.style.borderLeftColor = "#ff9800";
        }
      }
    }, 500);
  }

  // ===== Analysis =====
  function showForm() {
    var f = document.getElementById("ep-form"), l = document.getElementById("ep-loading"), r = document.getElementById("ep-result");
    if (f) f.style.display = "block"; if (l) l.style.display = "none"; if (r) r.style.display = "none";
  }

  function runAnalysis() {
    var nameEl = document.getElementById("ep-name");
    var fabricEl = document.getElementById("ep-fabric");
    var name = (nameEl.value || "").trim();
    var fabric = (fabricEl.value || "").trim();
    var valid = true;
    if (!name) { nameEl.classList.add("ep-error"); valid = false; }
    if (!fabric) { fabricEl.classList.add("ep-error"); valid = false; }
    if (!valid) return;

    document.getElementById("ep-form").style.display = "none";
    document.getElementById("ep-loading").style.display = "block";

    var claims = (document.getElementById("ep-claims").value || "").trim();
    var certs = (document.getElementById("ep-certs").value || "").trim();

    // Get the extracted image URL
    var extractedData = doExtract();

    fetch(API_BASE + "/api/ai-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName: name,
        brand: (document.getElementById("ep-brand").value || "").trim() || "Unknown",
        fabricCompositionText: fabric,
        sustainabilityClaims: claims ? claims.split(",").map(function(s){return s.trim();}).filter(Boolean) : [],
        certificationMentions: certs ? certs.split(",").map(function(s){return s.trim();}).filter(Boolean) : [],
      }),
    })
    .then(function(res) { if (!res.ok) throw new Error("API error: " + res.status); return res.json(); })
    .then(function(aiData) { showAIResults(aiData, name, fabric); })
    .catch(function(err) { showError(err.message || "Failed to connect. Is the server running on localhost:3000?"); });
  }

  function sc(v) { return v >= 50 ? "ep-good" : "ep-bad"; }

  function showResults(analysis) {
    var s = analysis.score, ind = s.overallIndicator;
    var html =
      '<div class="ep-scores">' +
        '<div class="ep-score-item ep-score-env"><div class="ep-score-icon">🌿</div><div class="ep-score-lbl">Environ.</div><div class="ep-score-val">' + s.environmental + '</div></div>' +
        '<div class="ep-score-item ep-score-health"><div class="ep-score-icon">💜</div><div class="ep-score-lbl">Health</div><div class="ep-score-val">' + s.health + '</div></div>' +
        '<div class="ep-score-item ep-score-gw"><div class="ep-score-icon">🌱</div><div class="ep-score-lbl">Greenwash</div><div class="ep-score-val">' + s.greenwashing + '</div></div>' +
      '</div>' +
      '<div class="ep-indicator ' + ind + '">' + (ind === "green" ? "✓ Sustainable" : "⚠ Needs Improvement") + '</div>';

    if (analysis.greenwashingSignals && analysis.greenwashingSignals.length > 0) {
      html += '<div class="ep-signals"><h4>⚠️ Greenwashing Alerts</h4>';
      for (var i = 0; i < analysis.greenwashingSignals.length; i++) {
        var sig = analysis.greenwashingSignals[i];
        html += '<div class="ep-signal"><span class="ep-signal-term">&ldquo;' + sig.term + '&rdquo;</span> &mdash; ' + sig.explanation + '</div>';
      }
      html += '</div>';
    }

    if (analysis.fabricComposition && analysis.fabricComposition.components.length > 0) {
      html += '<div class="ep-section"><h4>🧵 Fabric Breakdown</h4>';
      for (var j = 0; j < analysis.fabricComposition.components.length; j++) {
        var c = analysis.fabricComposition.components[j];
        var label = (c.qualifier ? c.qualifier + " " : "") + c.material;
        html += '<div class="ep-fabric-row"><span class="ep-fabric-pct">' + c.percentage + '%</span><span class="ep-fabric-name">' + label + '</span><div class="ep-fabric-bar"><div class="ep-fabric-fill" style="width:' + c.percentage + '%"></div></div><span class="ep-fabric-pct-end">' + c.percentage + '%</span></div>';
      }
      html += '</div>';
    }

    if (analysis.chemicalRisks && analysis.chemicalRisks.length > 0) {
      html += '<div class="ep-section"><h4>⚠️ Chemical Risks</h4>';
      for (var k = 0; k < analysis.chemicalRisks.length; k++) {
        var cr = analysis.chemicalRisks[k];
        html += '<div class="ep-chem-item"><b>' + cr.substance + ' (' + cr.riskLevel + ')</b> — ' + cr.healthEffects.join(", ") + '</div>';
      }
      html += '</div>';
    }

    // Pass all product data to dashboard via URL params so AI analysis can run
    var dashParams = new URLSearchParams();
    dashParams.set('analysis', analysis.url);
    dashParams.set('productName', (document.getElementById("ep-name").value || "").trim());
    dashParams.set('brand', (document.getElementById("ep-brand").value || "").trim() || "Unknown");
    dashParams.set('fabric', (document.getElementById("ep-fabric").value || "").trim());
    var claimsVal = (document.getElementById("ep-claims").value || "").trim();
    var certsVal = (document.getElementById("ep-certs").value || "").trim();
    if (claimsVal) dashParams.set('claims', claimsVal);
    if (certsVal) dashParams.set('certs', certsVal);
    var imgData = doExtract();
    if (imgData.imageUrl) dashParams.set('imageUrl', imgData.imageUrl);
    html += '<a class="ep-link" href="' + API_BASE + '?' + dashParams.toString() + '" target="_blank">📊 Open Full Dashboard →</a>';
    html += '<button class="ep-btn ep-btn-secondary" id="ep-reset">🔄 Analyze Another</button>';

    document.getElementById("ep-loading").style.display = "none";
    var resultEl = document.getElementById("ep-result");
    resultEl.innerHTML = html;
    resultEl.style.display = "block";
  }

  function showError(msg) {
    document.getElementById("ep-loading").style.display = "none";
    var resultEl = document.getElementById("ep-result");
    resultEl.innerHTML = '<div class="ep-error-box">' + msg + '</div>' +
      '<button class="ep-btn" style="margin-top:8px" id="ep-retry">Try Again</button>';
    resultEl.style.display = "block";
  }

  function showAIResults(d, name, fabric) {
    var ind = d.overall_indicator;
    var html =
      '<div class="ep-scores">' +
        '<div class="ep-score-item ' + (d.environmental_score >= 50 ? 'ep-good' : 'ep-bad') + '"><div class="ep-score-icon">🌿</div><div class="ep-score-lbl">Environ.</div><div class="ep-score-val">' + d.environmental_score + '</div></div>' +
        '<div class="ep-score-item ' + (d.health_score >= 50 ? 'ep-good' : 'ep-bad') + '"><div class="ep-score-icon">💜</div><div class="ep-score-lbl">Health</div><div class="ep-score-val">' + d.health_score + '</div></div>' +
        '<div class="ep-score-item ' + (d.greenwashing_score >= 50 ? 'ep-good' : 'ep-bad') + '"><div class="ep-score-icon">🧪</div><div class="ep-score-lbl">Greenwash</div><div class="ep-score-val">' + d.greenwashing_score + '</div></div>' +
      '</div>' +
      '<div class="ep-indicator ' + ind + '">' + (ind === "green" ? "✓ Sustainable" : "⚠ Needs Improvement") + '</div>';

    if (d.greenwashing_signals && d.greenwashing_signals.length > 0) {
      html += '<div class="ep-signals"><h4>⚠️ Greenwashing Alerts</h4>';
      for (var i = 0; i < d.greenwashing_signals.length; i++) {
        var sig = d.greenwashing_signals[i];
        html += '<div class="ep-signal"><span class="ep-signal-term">&ldquo;' + sig.term + '&rdquo;</span> &mdash; ' + sig.explanation + '</div>';
      }
      html += '</div>';
    }

    if (d.materials && d.materials.length > 0) {
      html += '<div class="ep-section"><h4>🧵 Fabric Breakdown</h4>';
      for (var j = 0; j < d.materials.length; j++) {
        var m = d.materials[j];
        var label = (m.qualifier ? m.qualifier + ' ' : '') + m.material;
        html += '<div class="ep-fabric-row"><span class="ep-fabric-pct">' + m.percentage + '%</span><span class="ep-fabric-name">' + label + '</span><div class="ep-fabric-bar"><div class="ep-fabric-fill" style="width:' + m.percentage + '%"></div></div><span class="ep-fabric-pct-end">' + m.percentage + '%</span></div>';
      }
      html += '</div>';
    }

    if (d.chemical_risks && d.chemical_risks.length > 0) {
      html += '<div class="ep-section"><h4>⚠️ Chemical Risks</h4>';
      for (var k = 0; k < d.chemical_risks.length; k++) {
        var cr = d.chemical_risks[k];
        html += '<div class="ep-chem-item"><b>' + cr.substance + ' (' + cr.risk_level + ')</b> — ' + cr.health_effects.join(', ') + '</div>';
      }
      html += '</div>';
    }

    var dashParams = new URLSearchParams();
    dashParams.set('productName', name);
    dashParams.set('brand', (document.getElementById("ep-brand").value || "").trim() || "Unknown");
    dashParams.set('fabric', fabric);
    var claimsVal = (document.getElementById("ep-claims").value || "").trim();
    var certsVal = (document.getElementById("ep-certs").value || "").trim();
    if (claimsVal) dashParams.set('claims', claimsVal);
    if (certsVal) dashParams.set('certs', certsVal);
    var imgData = doExtract();
    if (imgData.imageUrl) dashParams.set('imageUrl', imgData.imageUrl);
    html += '<a class="ep-link" href="' + API_BASE + '?' + dashParams.toString() + '" target="_blank">📊 Open Full Dashboard →</a>';
    html += '<button class="ep-btn ep-btn-secondary" id="ep-reset">🔄 Analyze Another</button>';

    document.getElementById("ep-loading").style.display = "none";
    var resultEl = document.getElementById("ep-result");
    resultEl.innerHTML = html;
    resultEl.style.display = "block";
  }

  // ===== Pulse FAB when product data detected =====
  var pulseCheck = setInterval(function () {
    var data = doExtract();
    if (data.productName || data.fabricCompositionText) {
      fab.classList.add("has-data");
      clearInterval(pulseCheck);
    }
  }, 2000);
  setTimeout(function () { clearInterval(pulseCheck); }, 30000);

})();