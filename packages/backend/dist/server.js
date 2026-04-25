"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const index_js_1 = require("./index.js");
const ai_openai_service_js_1 = require("./ai-openai-service.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
// Enable CORS for browser extension
app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (_req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }
    next();
});
// GET /api/image-proxy — proxy external product images to avoid CORS issues
app.get("/api/image-proxy", async (req, res) => {
    const imageUrl = req.query.url;
    if (typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
        res.status(400).json({ error: "Valid image URL required." });
        return;
    }
    try {
        const response = await fetch(imageUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; EcoPulse/1.0)" },
        });
        if (!response.ok) {
            res.status(response.status).end();
            return;
        }
        const contentType = response.headers.get("content-type") || "image/jpeg";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        const buffer = Buffer.from(await response.arrayBuffer());
        res.send(buffer);
    }
    catch {
        res.status(502).json({ error: "Failed to fetch image." });
    }
});
// Serve static images
app.get("/images/:filename", (req, res) => {
    const srcPath = path.resolve(__dirname, "..", "src", req.params.filename);
    const distPath = path.resolve(__dirname, req.params.filename);
    const filePath = fs.existsSync(srcPath) ? srcPath : distPath;
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    }
    else {
        res.status(404).send("Image not found");
    }
});
// Serve dashboard at root
app.get("/", (_req, res) => {
    // Try src/ first (dev), then same dir as compiled JS (dist/)
    const srcPath = path.resolve(__dirname, "..", "src", "dashboard.html");
    const distPath = path.resolve(__dirname, "dashboard.html");
    let html;
    try {
        html = fs.readFileSync(fs.existsSync(srcPath) ? srcPath : distPath, "utf-8");
    }
    catch {
        html = "<h1>EcoPulse API is running</h1><p>Dashboard HTML not found.</p>";
    }
    res.send(html);
});
// POST /api/analyze — run full product analysis
app.post("/api/analyze", async (req, res) => {
    try {
        const body = req.body;
        if (!body ||
            typeof body.url !== "string" ||
            typeof body.productName !== "string" ||
            typeof body.brand !== "string" ||
            typeof body.fabricCompositionText !== "string" ||
            !Array.isArray(body.sustainabilityClaims) ||
            !Array.isArray(body.certificationMentions)) {
            res.status(400).json({
                error: "Invalid input. Required fields: url, productName, brand, fabricCompositionText (strings), sustainabilityClaims, certificationMentions (arrays).",
            });
            return;
        }
        const result = (0, index_js_1.analyze)(body);
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error: message });
    }
});
// POST /api/ai-analyze — run AI-powered product analysis via OpenAI (Node.js direct)
app.post("/api/ai-analyze", async (req, res) => {
    try {
        const body = req.body;
        if (!body ||
            typeof body.productName !== "string" ||
            typeof body.brand !== "string" ||
            typeof body.fabricCompositionText !== "string") {
            res.status(400).json({
                error: "Invalid input. Required fields: productName, brand, fabricCompositionText (strings).",
            });
            return;
        }
        const { parse } = await import("./fabric-parser.js");
        const parsed = parse(body.fabricCompositionText);
        const aiData = await (0, ai_openai_service_js_1.aiAnalyze)({
            productName: body.productName,
            brand: body.brand,
            fabricComponents: parsed.components.map((c) => ({
                material: c.material,
                percentage: c.percentage,
                qualifier: c.qualifier ?? null,
            })),
            sustainabilityClaims: Array.isArray(body.sustainabilityClaims) ? body.sustainabilityClaims : [],
            certificationMentions: Array.isArray(body.certificationMentions) ? body.certificationMentions : [],
        });
        res.json(aiData);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error: message });
    }
});
// GET /api/analysis/:id — cached analysis lookup (id is URL-encoded product URL)
app.get("/api/analysis/:id", (req, res) => {
    try {
        const url = decodeURIComponent(req.params.id);
        const result = (0, index_js_1.getCachedAnalysis)(url);
        if (!result) {
            res.status(404).json({ error: "Analysis not found for the given URL." });
            return;
        }
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error: message });
    }
});
// POST /api/chat — AI Chat Service (direct OpenAI call)
app.post("/api/chat", async (req, res) => {
    try {
        const body = req.body;
        if (!body || typeof body.userId !== "string") {
            res.status(400).json({ error: "Invalid input. Required field: userId (string)." });
            return;
        }
        if (typeof body.compositionText === "string") {
            const result = await (0, index_js_1.analyzeMaterialComposition)(body.userId, body.compositionText);
            res.json(result);
            return;
        }
        if (typeof body.message === "string") {
            const conversationHistory = Array.isArray(body.conversationHistory)
                ? body.conversationHistory
                : [];
            try {
                const aiData = await (0, ai_openai_service_js_1.aiChat)({
                    message: body.message,
                    conversationHistory: conversationHistory.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    productContext: typeof body.productContext === "string" ? body.productContext : null,
                });
                res.json(aiData);
                return;
            }
            catch {
                // Fallback to local query if OpenAI fails
                const result = await (0, index_js_1.query)(body.userId, body.message, conversationHistory);
                res.json(result);
                return;
            }
        }
        res.status(400).json({
            error: "Invalid input. Provide either 'message' (string) or 'compositionText' (string).",
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error: message });
    }
});
// GET /api/alternatives — Product Database query
app.get("/api/alternatives", (req, res) => {
    try {
        const category = req.query.category;
        if (typeof category !== "string" || category.trim() === "") {
            res.status(400).json({ error: "Required query parameter: category (non-empty string)." });
            return;
        }
        const maxPriceRaw = req.query.maxPrice;
        let maxPrice;
        if (maxPriceRaw !== undefined) {
            maxPrice = Number(maxPriceRaw);
            if (isNaN(maxPrice)) {
                res.status(400).json({ error: "Query parameter 'maxPrice' must be a valid number." });
                return;
            }
        }
        const results = (0, index_js_1.queryAlternatives)({ category, maxPrice });
        res.json(results);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error: message });
    }
});
// POST /api/rewards — log a reward event
app.post("/api/rewards", async (req, res) => {
    try {
        const body = req.body;
        if (!body ||
            typeof body.userId !== "string" ||
            typeof body.type !== "string" ||
            typeof body.points !== "number" ||
            typeof body.itemDescription !== "string" ||
            !body.timestamp) {
            res.status(400).json({
                error: "Invalid input. Required fields: userId (string), type (string), points (number), itemDescription (string), timestamp.",
            });
            return;
        }
        const event = {
            userId: body.userId,
            type: body.type,
            points: body.points,
            itemDescription: body.itemDescription,
            timestamp: new Date(body.timestamp),
        };
        await (0, index_js_1.awardPoints)(event);
        res.status(201).json({ success: true });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error: message });
    }
});
// GET /api/rewards/:userId — balance + history
app.get("/api/rewards/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const [balance, userHistory] = await Promise.all([
            (0, index_js_1.getBalance)(userId),
            (0, index_js_1.getHistory)(userId),
        ]);
        res.json({ balance, history: userHistory });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error: message });
    }
});
// GET /api/locations — Location Service (lat, lng, radius)
app.get("/api/locations", (req, res) => {
    try {
        const latRaw = req.query.lat;
        const lngRaw = req.query.lng;
        const radiusRaw = req.query.radius;
        if (latRaw === undefined || lngRaw === undefined || radiusRaw === undefined) {
            res.status(400).json({
                error: "Required query parameters: lat, lng, radius (all numbers).",
            });
            return;
        }
        const lat = Number(latRaw);
        const lng = Number(lngRaw);
        const radius = Number(radiusRaw);
        if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
            res.status(400).json({
                error: "Query parameters lat, lng, and radius must be valid numbers.",
            });
            return;
        }
        const results = (0, index_js_1.findNearby)(lat, lng, radius);
        res.json(results);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error: message });
    }
});
//# sourceMappingURL=server.js.map