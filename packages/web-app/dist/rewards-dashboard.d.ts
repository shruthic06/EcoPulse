import type { RewardEvent, RewardEventType } from "@ecopulse/shared";
/** Supported loggable event types (excludes purchase which happens via alternatives) */
export declare const LOGGABLE_EVENT_TYPES: RewardEventType[];
/** Render the points balance */
export declare function renderBalance(balance: number): string;
/** Render a single reward history entry */
export declare function renderHistoryEntry(event: RewardEvent): string;
/** Render the reward history list */
export declare function renderHistory(events: RewardEvent[]): string;
/** Render the event logging form options */
export declare function renderEventForm(): string;
/** Render the full rewards dashboard */
export declare function renderRewardsDashboard(balance: number, history: RewardEvent[]): string;
//# sourceMappingURL=rewards-dashboard.d.ts.map