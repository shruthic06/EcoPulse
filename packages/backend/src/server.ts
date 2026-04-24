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

// POST /api/chat — AI Chat Service
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body || typeof body.userId !== "string") {
      res.status(400).json({ error: "Invalid input. Required field: userId (string)." });
      return;
    }

    // Route: analyzeMaterialComposition
    if (typeof body.compositionText === "string") {
      const result = await analyzeMaterialComposition(body.userId, body.compositionText);
      res.json(result);
      return;
    }

    // Route: conversational query
    if (typeof body.message === "string") {
      const conversationHistory = Array.isArray(body.conversationHistory)
        ? body.conversationHistory
        : [];
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
