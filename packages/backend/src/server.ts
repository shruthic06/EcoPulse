import express, { Request, Response } from "express";
import {
  analyze,
  getCachedAnalysis,
  query,
  analyzeMaterialComposition,
  queryAlternatives,
  awardPoints,
  getBalance,
  getHistory,
  findNearby,
} from "./index.js";

import * as fs from "fs";
import * as path from "path";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const app = express();
app.use(express.json());

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

// Serve dashboard at root
app.get("/", (_req: Request, res: Response) => {
  // Try src/ first (dev), then same dir as compiled JS (dist/)
  const srcPath = path.resolve(__dirname, "..", "src", "dashboard.html");
  const distPath = path.resolve(__dirname, "dashboard.html");
  let html: string;
  try {
    html = fs.readFileSync(fs.existsSync(srcPath) ? srcPath : distPath, "utf-8");
  } catch {
    html = "<h1>EcoPulse API is running</h1><p>Dashboard HTML not found.</p>";
  }
  res.send(html);
});

// POST /api/analyze — run full product analysis
app.post("/api/analyze", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (
      !body ||
      typeof body.url !== "string" ||
      typeof body.productName !== "string" ||
      typeof body.brand !== "string" ||
      typeof body.fabricCompositionText !== "string" ||
      !Array.isArray(body.sustainabilityClaims) ||
      !Array.isArray(body.certificationMentions)
    ) {
      res.status(400).json({
        error:
          "Invalid input. Required fields: url, productName, brand, fabricCompositionText (strings), sustainabilityClaims, certificationMentions (arrays).",
      });
      return;
    }
    const result = analyze(body);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

// POST /api/ai-analyze — run AI-powered product analysis via Python service
app.post("/api/ai-analyze", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (
      !body ||
      typeof body.productName !== "string" ||
      typeof body.brand !== "string" ||
      typeof body.fabricCompositionText !== "string"
    ) {
      res.status(400).json({
        error:
          "Invalid input. Required fields: productName, brand, fabricCompositionText (strings).",
      });
      return;
    }

    // First parse fabric locally so we can send structured components to the AI
    const { parse } = await import("./fabric-parser.js");
    const parsed = parse(body.fabricCompositionText);

    const aiPayload = {
      product_name: body.productName,
      brand: body.brand,
      fabric_components: parsed.components.map((c: { material: string; percentage: number; qualifier?: string }) => ({
        material: c.material,
        percentage: c.percentage,
        qualifier: c.qualifier ?? null,
      })),
      sustainability_claims: Array.isArray(body.sustainabilityClaims)
        ? body.sustainabilityClaims
        : [],
      certification_mentions: Array.isArray(body.certificationMentions)
        ? body.certificationMentions
        : [],
    };

    const aiRes = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aiPayload),
    });

    if (!aiRes.ok) {
      const errBody = await aiRes.text();
      res.status(aiRes.status).json({ error: `AI service error: ${errBody}` });
      return;
    }

    const aiData = await aiRes.json();
    res.json(aiData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

// GET /api/analysis/:id — cached analysis lookup (id is URL-encoded product URL)
app.get("/api/analysis/:id", (req: Request, res: Response) => {
  try {
    const url = decodeURIComponent(req.params.id);
    const result = getCachedAnalysis(url);
    if (!result) {
      res.status(404).json({ error: "Analysis not found for the given URL." });
      return;
    }
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

// POST /api/chat — AI Chat Service (proxied to Python AI service)
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body || typeof body.userId !== "string") {
      res.status(400).json({ error: "Invalid input. Required field: userId (string)." });
      return;
    }

    // Route: analyzeMaterialComposition (keep existing behavior)
    if (typeof body.compositionText === "string") {
      const result = await analyzeMaterialComposition(body.userId, body.compositionText);
      res.json(result);
      return;
    }

    // Route: conversational query — forward to Python AI service
    if (typeof body.message === "string") {
      const conversationHistory = Array.isArray(body.conversationHistory)
        ? body.conversationHistory
        : [];

      const aiPayload = {
        message: body.message,
        conversation_history: conversationHistory.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        product_context: typeof body.productContext === "string" ? body.productContext : null,
      };

      try {
        const aiRes = await fetch(`${AI_SERVICE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(aiPayload),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          res.json(aiData);
          return;
        }
      } catch {
        // Fall through to local LLM if AI service is unavailable
      }

      // Fallback to local query if AI service is down
      const result = await query(body.userId, body.message, conversationHistory);
      res.json(result);
      return;
    }

    res.status(400).json({
      error:
        "Invalid input. Provide either 'message' (string) with optional 'conversationHistory', or 'compositionText' (string).",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

// GET /api/alternatives — Product Database query
app.get("/api/alternatives", (req: Request, res: Response) => {
  try {
    const category = req.query.category;
    if (typeof category !== "string" || category.trim() === "") {
      res.status(400).json({ error: "Required query parameter: category (non-empty string)." });
      return;
    }

    const maxPriceRaw = req.query.maxPrice;
    let maxPrice: number | undefined;
    if (maxPriceRaw !== undefined) {
      maxPrice = Number(maxPriceRaw);
      if (isNaN(maxPrice)) {
        res.status(400).json({ error: "Query parameter 'maxPrice' must be a valid number." });
        return;
      }
    }

    const results = queryAlternatives({ category, maxPrice });
    res.json(results);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

// POST /api/rewards — log a reward event
app.post("/api/rewards", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (
      !body ||
      typeof body.userId !== "string" ||
      typeof body.type !== "string" ||
      typeof body.points !== "number" ||
      typeof body.itemDescription !== "string" ||
      !body.timestamp
    ) {
      res.status(400).json({
        error:
          "Invalid input. Required fields: userId (string), type (string), points (number), itemDescription (string), timestamp.",
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

    await awardPoints(event as any);
    res.status(201).json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

// GET /api/rewards/:userId — balance + history
app.get("/api/rewards/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const [balance, userHistory] = await Promise.all([
      getBalance(userId),
      getHistory(userId),
    ]);
    res.json({ balance, history: userHistory });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

// GET /api/locations — Location Service (lat, lng, radius)
app.get("/api/locations", (req: Request, res: Response) => {
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

    const results = findNearby(lat, lng, radius);
    res.json(results);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

export { app };
