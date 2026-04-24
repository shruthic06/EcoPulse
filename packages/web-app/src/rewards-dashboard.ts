import type { RewardEvent, RewardEventType } from "@ecopulse/shared";

/** Event type display labels */
const EVENT_LABELS: Record<RewardEventType, string> = {
  purchase: "🛒 Sustainable Purchase",
  rewear: "👕 Rewear",
  donation: "🎁 Donation",
  repair: "🔧 Repair",
  recycle: "♻️ Recycle",
};

/** Supported loggable event types (excludes purchase which happens via alternatives) */
export const LOGGABLE_EVENT_TYPES: RewardEventType[] = [
  "rewear",
  "donation",
  "repair",
  "recycle",
];

/** Render the points balance */
export function renderBalance(balance: number): string {
  return `🏆 Your Points: ${balance}`;
}

/** Render a single reward history entry */
export function renderHistoryEntry(event: RewardEvent): string {
  const label = EVENT_LABELS[event.type] ?? event.type;
  const date = event.timestamp instanceof Date
    ? event.timestamp.toLocaleDateString()
    : new Date(event.timestamp).toLocaleDateString();
  return `${label}: +${event.points} pts — ${event.itemDescription} (${date})`;
}

/** Render the reward history list */
export function renderHistory(events: RewardEvent[]): string {
  if (events.length === 0) {
    return "No reward history yet. Start earning points by making sustainable choices.";
  }
  return events.map(renderHistoryEntry).join("\n");
}

/** Render the event logging form options */
export function renderEventForm(): string {
  const lines: string[] = ["### Log a Sustainable Action", ""];
  for (const type of LOGGABLE_EVENT_TYPES) {
    lines.push(`- ${EVENT_LABELS[type]}`);
  }
  return lines.join("\n");
}

/** Render the full rewards dashboard */
export function renderRewardsDashboard(balance: number, history: RewardEvent[]): string {
  const lines: string[] = [
    "# Reward Points",
    "",
    renderBalance(balance),
    "",
    "## History",
    renderHistory(history),
    "",
    renderEventForm(),
  ];
  return lines.join("\n");
}
