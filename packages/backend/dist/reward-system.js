"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awardPoints = awardPoints;
exports.getBalance = getBalance;
exports.getHistory = getHistory;
exports._resetForTesting = _resetForTesting;
/** Valid reward event types. */
const VALID_EVENT_TYPES = new Set([
    "purchase",
    "rewear",
    "donation",
    "repair",
    "recycle",
]);
/** In-memory cumulative points balance per user. */
const balances = new Map();
/** In-memory event history per user. */
const history = new Map();
/** Set of processed idempotency keys to prevent duplicate awards. */
const processedKeys = new Set();
/**
 * Derive an idempotency key from a reward event.
 * Combines userId, type, itemDescription, and timestamp to uniquely identify an event.
 */
function deriveIdempotencyKey(event) {
    return `${event.userId}:${event.type}:${event.itemDescription}:${event.timestamp.getTime()}`;
}
/**
 * Award points for a sustainable behavior event.
 *
 * - Validates the event type
 * - Uses idempotency keys to prevent duplicate awards
 * - Updates cumulative balance and appends to history
 */
async function awardPoints(event) {
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
async function getBalance(userId) {
    return balances.get(userId) ?? 0;
}
/**
 * Get the full reward event history for a user.
 * Returns an empty array for users with no recorded events.
 */
async function getHistory(userId) {
    return history.get(userId) ?? [];
}
/**
 * Reset all in-memory reward data. Useful for testing.
 */
function _resetForTesting() {
    balances.clear();
    history.clear();
    processedKeys.clear();
}
//# sourceMappingURL=reward-system.js.map