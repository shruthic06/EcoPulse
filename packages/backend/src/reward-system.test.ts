import { describe, it, expect, beforeEach } from "vitest";
import {
  awardPoints,
  getBalance,
  getHistory,
  _resetForTesting,
} from "./reward-system.js";
import type { RewardEvent, RewardEventType } from "@ecopulse/shared";

function makeEvent(overrides: Partial<RewardEvent> = {}): RewardEvent {
  return {
    userId: "user-1",
    type: "purchase",
    points: 10,
    itemDescription: "Organic cotton t-shirt",
    timestamp: new Date("2024-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("RewardSystem", () => {
  beforeEach(() => {
    _resetForTesting();
  });

  // --- awardPoints ---
  describe("awardPoints", () => {
    it("awards points for each valid event type", async () => {
      const types: RewardEventType[] = [
        "purchase",
        "rewear",
        "donation",
        "repair",
        "recycle",
      ];
      for (const type of types) {
        await awardPoints(
          makeEvent({ type, points: 5, itemDescription: `item-${type}` })
        );
      }
      expect(await getBalance("user-1")).toBe(25);
    });

    it("rejects invalid event types", async () => {
      const event = makeEvent({ type: "invalid" as RewardEventType });
      await expect(awardPoints(event)).rejects.toThrow(
        "Invalid event type: invalid"
      );
    });

    it("prevents duplicate awards via idempotency key", async () => {
      const event = makeEvent({ points: 10 });
      await awardPoints(event);
      await awardPoints(event); // duplicate
      expect(await getBalance("user-1")).toBe(10);
      expect(await getHistory("user-1")).toHaveLength(1);
    });

    it("treats events with different timestamps as distinct", async () => {
      await awardPoints(
        makeEvent({ points: 10, timestamp: new Date("2024-01-01") })
      );
      await awardPoints(
        makeEvent({ points: 10, timestamp: new Date("2024-01-02") })
      );
      expect(await getBalance("user-1")).toBe(20);
    });

    it("handles zero-point events", async () => {
      await awardPoints(makeEvent({ points: 0 }));
      expect(await getBalance("user-1")).toBe(0);
      expect(await getHistory("user-1")).toHaveLength(1);
    });
  });

  // --- getBalance ---
  describe("getBalance", () => {
    it("returns 0 for unknown user", async () => {
      expect(await getBalance("nonexistent")).toBe(0);
    });

    it("accumulates points across multiple events", async () => {
      await awardPoints(
        makeEvent({
          points: 10,
          itemDescription: "item-1",
          timestamp: new Date("2024-01-01"),
        })
      );
      await awardPoints(
        makeEvent({
          points: 20,
          itemDescription: "item-2",
          timestamp: new Date("2024-01-02"),
        })
      );
      expect(await getBalance("user-1")).toBe(30);
    });

    it("tracks balances independently per user", async () => {
      await awardPoints(makeEvent({ userId: "user-a", points: 15 }));
      await awardPoints(makeEvent({ userId: "user-b", points: 25 }));
      expect(await getBalance("user-a")).toBe(15);
      expect(await getBalance("user-b")).toBe(25);
    });
  });

  // --- getHistory ---
  describe("getHistory", () => {
    it("returns empty array for unknown user", async () => {
      expect(await getHistory("nonexistent")).toEqual([]);
    });

    it("returns events in insertion order", async () => {
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
      await awardPoints(e1);
      await awardPoints(e2);
      const hist = await getHistory("user-1");
      expect(hist).toHaveLength(2);
      expect(hist[0].itemDescription).toBe("first");
      expect(hist[1].itemDescription).toBe("second");
    });
  });
});
