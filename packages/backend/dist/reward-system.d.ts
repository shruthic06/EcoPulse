import type { RewardEvent } from "@ecopulse/shared";
/**
 * Award points for a sustainable behavior event.
 *
 * - Validates the event type
 * - Uses idempotency keys to prevent duplicate awards
 * - Updates cumulative balance and appends to history
 */
export declare function awardPoints(event: RewardEvent): Promise<void>;
/**
 * Get the cumulative reward points balance for a user.
 * Returns 0 for users with no recorded events.
 */
export declare function getBalance(userId: string): Promise<number>;
/**
 * Get the full reward event history for a user.
 * Returns an empty array for users with no recorded events.
 */
export declare function getHistory(userId: string): Promise<RewardEvent[]>;
/**
 * Reset all in-memory reward data. Useful for testing.
 */
export declare function _resetForTesting(): void;
//# sourceMappingURL=reward-system.d.ts.map