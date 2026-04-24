import { describe, it, expect, beforeEach } from "vitest";
import type { SustainableAlternative, ProductScore } from "@ecopulse/shared";
import {
  queryAlternatives,
  seedDatabase,
  clearDatabase,
  compositeScore,
} from "./product-database.js";

function makeScore(env: number, health: number, gw: number): ProductScore {
  return {
    environmental: env,
    health: health,
    greenwashing: gw,
    overallIndicator: env >= 50 && health >= 50 && gw >= 50 ? "green" : "red",
  };
}

function makeAlt(
  overrides: Partial<SustainableAlternative> & { id: string }
): SustainableAlternative {
  return {
    productName: "Test Product",
    brand: "TestBrand",
    category: "t-shirts",
    price: 30,
    currency: "USD",
    score: makeScore(70, 80, 90),
    certifications: ["GOTS"],
    purchaseUrl: "https://example.com",
    ...overrides,
  };
}

describe("product-database", () => {
  beforeEach(() => {
    clearDatabase();
  });

  describe("queryAlternatives", () => {
    it("returns empty array when database is empty", () => {
      const results = queryAlternatives({ category: "t-shirts" });
      expect(results).toEqual([]);
    });

    it("filters by category (case-insensitive)", () => {
      seedDatabase([
        makeAlt({ id: "1", category: "T-Shirts" }),
        makeAlt({ id: "2", category: "jeans" }),
        makeAlt({ id: "3", category: "t-shirts" }),
      ]);

      const results = queryAlternatives({ category: "t-shirts" });
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.category.toLowerCase() === "t-shirts")).toBe(true);
    });

    it("sorts by composite score descending", () => {
      seedDatabase([
        makeAlt({ id: "1", score: makeScore(50, 50, 50) }),   // composite = 150
        makeAlt({ id: "2", score: makeScore(90, 90, 90) }),   // composite = 270
        makeAlt({ id: "3", score: makeScore(70, 80, 60) }),   // composite = 210
      ]);

      const results = queryAlternatives({ category: "t-shirts" });
      expect(results[0].id).toBe("2");
      expect(results[1].id).toBe("3");
      expect(results[2].id).toBe("1");
    });

    it("supports affordable filter (maxPrice)", () => {
      seedDatabase([
        makeAlt({ id: "1", price: 25 }),
        makeAlt({ id: "2", price: 50 }),
        makeAlt({ id: "3", price: 30 }),
      ]);

      const results = queryAlternatives({ category: "t-shirts", maxPrice: 30 });
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.price <= 30)).toBe(true);
    });

    it("returns price, score, and brand for each alternative", () => {
      seedDatabase([
        makeAlt({ id: "1", brand: "EcoBrand", price: 29.99, score: makeScore(80, 75, 90) }),
      ]);

      const results = queryAlternatives({ category: "t-shirts" });
      expect(results).toHaveLength(1);
      expect(results[0].price).toBe(29.99);
      expect(results[0].brand).toBe("EcoBrand");
      expect(results[0].score).toEqual(makeScore(80, 75, 90));
    });

    it("includes products at exactly maxPrice", () => {
      seedDatabase([
        makeAlt({ id: "1", price: 30 }),
        makeAlt({ id: "2", price: 30.01 }),
      ]);

      const results = queryAlternatives({ category: "t-shirts", maxPrice: 30 });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("1");
    });

    it("returns all matching when no maxPrice is set", () => {
      seedDatabase([
        makeAlt({ id: "1", price: 10 }),
        makeAlt({ id: "2", price: 1000 }),
      ]);

      const results = queryAlternatives({ category: "t-shirts" });
      expect(results).toHaveLength(2);
    });
  });

  describe("compositeScore", () => {
    it("sums environmental, health, and greenwashing scores", () => {
      const alt = makeAlt({ id: "1", score: makeScore(60, 70, 80) });
      expect(compositeScore(alt)).toBe(210);
    });
  });
});
