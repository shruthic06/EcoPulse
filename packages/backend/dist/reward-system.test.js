"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const reward_system_js_1 = require("./reward-system.js");
function makeEvent(overrides = {}) {
    return {
        userId: "user-1",
        type: "purchase",
        points: 10,
        itemDescription: "Organic cotton t-shirt",
        timestamp: new Date("2024-01-01T00:00:00Z"),
        ...overrides,
    };
}
(0, vitest_1.describe)("RewardSystem", () => {
    (0, vitest_1.beforeEach)(() => {
        (0, reward_system_js_1._resetForTesting)();
    });
    // --- awardPoints ---
    (0, vitest_1.describe)("awardPoints", () => {
        (0, vitest_1.it)("awards points for each valid event type", async () => {
            const types = [
                "purchase",
                "rewear",
                "donation",
                "repair",
                "recycle",
            ];
            for (const type of types) {
                await (0, reward_system_js_1.awardPoints)(makeEvent({ type, points: 5, itemDescription: `item-${type}` }));
            }
            (0, vitest_1.expect)(await (0, reward_system_js_1.getBalance)("user-1")).toBe(25);
        });
        (0, vitest_1.it)("rejects invalid event types", async () => {
            const event = makeEvent({ type: "invalid" });
            await (0, vitest_1.expect)((0, reward_system_js_1.awardPoints)(event)).rejects.toThrow("Invalid event type: invalid");
        });
        (0, vitest_1.it)("prevents duplicate awards via idempotency key", async () => {
            const event = makeEvent({ points: 10 });
            await (0, reward_system_js_1.awardPoints)(event);
            await (0, reward_system_js_1.awardPoints)(event); // duplicate
            (0, vitest_1.expect)(await (0, reward_system_js_1.getBalance)("user-1")).toBe(10);
            (0, vitest_1.expect)(await (0, reward_system_js_1.getHistory)("user-1")).toHaveLength(1);
        });
        (0, vitest_1.it)("treats events with different timestamps as distinct", async () => {
            await (0, reward_system_js_1.awardPoints)(makeEvent({ points: 10, timestamp: new Date("2024-01-01") }));
            await (0, reward_system_js_1.awardPoints)(makeEvent({ points: 10, timestamp: new Date("2024-01-02") }));
            (0, vitest_1.expect)(await (0, reward_system_js_1.getBalance)("user-1")).toBe(20);
        });
        (0, vitest_1.it)("handles zero-point events", async () => {
            await (0, reward_system_js_1.awardPoints)(makeEvent({ points: 0 }));
            (0, vitest_1.expect)(await (0, reward_system_js_1.getBalance)("user-1")).toBe(0);
            (0, vitest_1.expect)(await (0, reward_system_js_1.getHistory)("user-1")).toHaveLength(1);
        });
    });
    // --- getBalance ---
    (0, vitest_1.describe)("getBalance", () => {
        (0, vitest_1.it)("returns 0 for unknown user", async () => {
            (0, vitest_1.expect)(await (0, reward_system_js_1.getBalance)("nonexistent")).toBe(0);
        });
        (0, vitest_1.it)("accumulates points across multiple events", async () => {
            await (0, reward_system_js_1.awardPoints)(makeEvent({
                points: 10,
                itemDescription: "item-1",
                timestamp: new Date("2024-01-01"),
            }));
            await (0, reward_system_js_1.awardPoints)(makeEvent({
                points: 20,
                itemDescription: "item-2",
                timestamp: new Date("2024-01-02"),
            }));
            (0, vitest_1.expect)(await (0, reward_system_js_1.getBalance)("user-1")).toBe(30);
        });
        (0, vitest_1.it)("tracks balances independently per user", async () => {
            await (0, reward_system_js_1.awardPoints)(makeEvent({ userId: "user-a", points: 15 }));
            await (0, reward_system_js_1.awardPoints)(makeEvent({ userId: "user-b", points: 25 }));
            (0, vitest_1.expect)(await (0, reward_system_js_1.getBalance)("user-a")).toBe(15);
            (0, vitest_1.expect)(await (0, reward_system_js_1.getBalance)("user-b")).toBe(25);
        });
    });
    // --- getHistory ---
    (0, vitest_1.describe)("getHistory", () => {
        (0, vitest_1.it)("returns empty array for unknown user", async () => {
            (0, vitest_1.expect)(await (0, reward_system_js_1.getHistory)("nonexistent")).toEqual([]);
        });
        (0, vitest_1.it)("returns events in insertion order", async () => {
            const e1 = makeEvent({
                type: "purchase",
                itemDescription: "first",
                timestamp: new Date("2024-01-01"),
            });
            const e2 = makeEvent({
                type: "rewear",
                itemDescription: "second",
                timestamp: new Date("2024-01-02"),
            });
            await (0, reward_system_js_1.awardPoints)(e1);
            await (0, reward_system_js_1.awardPoints)(e2);
            const hist = await (0, reward_system_js_1.getHistory)("user-1");
            (0, vitest_1.expect)(hist).toHaveLength(2);
            (0, vitest_1.expect)(hist[0].itemDescription).toBe("first");
            (0, vitest_1.expect)(hist[1].itemDescription).toBe("second");
        });
    });
});
//# sourceMappingURL=reward-system.test.js.map