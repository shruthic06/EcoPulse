import type { RewardEvent, RewardEventType } from "@ecopulse/shared";

/** Valid reward event types. */
const VALID_EVENT_TYPES: Set<RewardEventType> = new Set([
  "purchase",
  "rewear",
  "donation",
  "repair",
  "recycle",
]);

/** In-memory cumulative points balance per user. */
const balances = new Map<string, number>();

/** In-memory event history per user. */
const history = new Map<string, RewardEvent[]>();

/** Set of processed idempotency keys to prevent duplicate awards. */
const processedKeys = new Set<string>();

/**
 * Derive an idempotency key from a reward event.
 * Combines userId, type, itemDescription, and timestamp to uniquely identify an event.
 */
function deriveIdempotencyKey(event: RewardEvent): string {
  return `${event.userId}:${event.type}:${event.itemDescription}:${event.timestamp.getTime()}`;
}

/**
 * Award points for a sustainable behavior event.
 *
 * - Validates the event type
 * - Uses idempotency keys to prevent duplicate awards
 * - Updates cumulative balance and appends to history
 */
export async function awardPoints(event: RewardEvent): Promise<void> {
  if (!VALID_EVENT_TYPES.has(event.type)) {
    throw new Error(`Invalid event type: ${event.type}`);
  }

  const key = deriveIdempotencyKey(event);
  if (processedKeys.has(key)) {
    return; // Duplicate — silently skip
  }

  processedKeys.add(key);

  const currentBalance = balances.get(event.userId) ?? 0;
  balances.set(event.userId, currentBalance + event.points);

  const userHistory = history.get(event.userId) ?? [];
  userHistory.push(event);
  history.set(event.userId, userHistory);
}

/**
 * Get the cumulative reward points balance for a user.
 * Returns 0 for users with no recorded events.
 */
export async function getBalance(userId: string): Promise<number> {
  return balances.get(userId) ?? 0;
}

/**
 * Get the full reward event history for a user.
 * Returns an empty array for users with no recorded events.
 */
export async function getHistory(userId: string): Promise<RewardEvent[]> {
  return history.get(userId) ?? [];
}

/**
 * Reset all in-memory reward data. Useful for testing.
 */
export function _resetForTesting(): void {
  balances.clear();
  history.clear();
  processedKeys.clear();
}
