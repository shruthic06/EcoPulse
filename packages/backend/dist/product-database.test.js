"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const product_database_js_1 = require("./product-database.js");
function makeScore(env, health, gw) {
    return {
        environmental: env,
        health: health,
        greenwashing: gw,
        overallIndicator: env >= 50 && health >= 50 && gw >= 50 ? "green" : "red",
    };
}
function makeAlt(overrides) {
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
(0, vitest_1.describe)("product-database", () => {
    (0, vitest_1.beforeEach)(() => {
        (0, product_database_js_1.clearDatabase)();
    });
    (0, vitest_1.describe)("queryAlternatives", () => {
        (0, vitest_1.it)("returns empty array when database is empty", () => {
            const results = (0, product_database_js_1.queryAlternatives)({ category: "t-shirts" });
            (0, vitest_1.expect)(results).toEqual([]);
        });
        (0, vitest_1.it)("filters by category (case-insensitive)", () => {
            (0, product_database_js_1.seedDatabase)([
                makeAlt({ id: "1", category: "T-Shirts" }),
                makeAlt({ id: "2", category: "jeans" }),
                makeAlt({ id: "3", category: "t-shirts" }),
            ]);
            const results = (0, product_database_js_1.queryAlternatives)({ category: "t-shirts" });
            (0, vitest_1.expect)(results).toHaveLength(2);
            (0, vitest_1.expect)(results.every((r) => r.category.toLowerCase() === "t-shirts")).toBe(true);
        });
        (0, vitest_1.it)("sorts by composite score descending", () => {
            (0, product_database_js_1.seedDatabase)([
                makeAlt({ id: "1", score: makeScore(50, 50, 50) }), // composite = 150
                makeAlt({ id: "2", score: makeScore(90, 90, 90) }), // composite = 270
                makeAlt({ id: "3", score: makeScore(70, 80, 60) }), // composite = 210
            ]);
            const results = (0, product_database_js_1.queryAlternatives)({ category: "t-shirts" });
            (0, vitest_1.expect)(results[0].id).toBe("2");
            (0, vitest_1.expect)(results[1].id).toBe("3");
            (0, vitest_1.expect)(results[2].id).toBe("1");
        });
        (0, vitest_1.it)("supports affordable filter (maxPrice)", () => {
            (0, product_database_js_1.seedDatabase)([
                makeAlt({ id: "1", price: 25 }),
                makeAlt({ id: "2", price: 50 }),
                makeAlt({ id: "3", price: 30 }),
            ]);
            const results = (0, product_database_js_1.queryAlternatives)({ category: "t-shirts", maxPrice: 30 });
            (0, vitest_1.expect)(results).toHaveLength(2);
            (0, vitest_1.expect)(results.every((r) => r.price <= 30)).toBe(true);
        });
        (0, vitest_1.it)("returns price, score, and brand for each alternative", () => {
            (0, product_database_js_1.seedDatabase)([
                makeAlt({ id: "1", brand: "EcoBrand", price: 29.99, score: makeScore(80, 75, 90) }),
            ]);
            const results = (0, product_database_js_1.queryAlternatives)({ category: "t-shirts" });
            (0, vitest_1.expect)(results).toHaveLength(1);
            (0, vitest_1.expect)(results[0].price).toBe(29.99);
            (0, vitest_1.expect)(results[0].brand).toBe("EcoBrand");
            (0, vitest_1.expect)(results[0].score).toEqual(makeScore(80, 75, 90));
        });
        (0, vitest_1.it)("includes products at exactly maxPrice", () => {
            (0, product_database_js_1.seedDatabase)([
                makeAlt({ id: "1", price: 30 }),
                makeAlt({ id: "2", price: 30.01 }),
            ]);
            const results = (0, product_database_js_1.queryAlternatives)({ category: "t-shirts", maxPrice: 30 });
            (0, vitest_1.expect)(results).toHaveLength(1);
            (0, vitest_1.expect)(results[0].id).toBe("1");
        });
        (0, vitest_1.it)("returns all matching when no maxPrice is set", () => {
            (0, product_database_js_1.seedDatabase)([
                makeAlt({ id: "1", price: 10 }),
                makeAlt({ id: "2", price: 1000 }),
            ]);
            const results = (0, product_database_js_1.queryAlternatives)({ category: "t-shirts" });
            (0, vitest_1.expect)(results).toHaveLength(2);
        });
    });
    (0, vitest_1.describe)("compositeScore", () => {
        (0, vitest_1.it)("sums environmental, health, and greenwashing scores", () => {
            const alt = makeAlt({ id: "1", score: makeScore(60, 70, 80) });
            (0, vitest_1.expect)((0, product_database_js_1.compositeScore)(alt)).toBe(210);
        });
    });
});
//# sourceMappingURL=product-database.test.js.map