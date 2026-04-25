"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGGABLE_EVENT_TYPES = void 0;
exports.renderBalance = renderBalance;
exports.renderHistoryEntry = renderHistoryEntry;
exports.renderHistory = renderHistory;
exports.renderEventForm = renderEventForm;
exports.renderRewardsDashboard = renderRewardsDashboard;
/** Event type display labels */
const EVENT_LABELS = {
    purchase: "🛒 Sustainable Purchase",
    rewear: "👕 Rewear",
    donation: "🎁 Donation",
    repair: "🔧 Repair",
    recycle: "♻️ Recycle",
};
/** Supported loggable event types (excludes purchase which happens via alternatives) */
exports.LOGGABLE_EVENT_TYPES = [
    "rewear",
    "donation",
    "repair",
    "recycle",
];
/** Render the points balance */
function renderBalance(balance) {
    return `🏆 Your Points: ${balance}`;
}
/** Render a single reward history entry */
function renderHistoryEntry(event) {
    const label = EVENT_LABELS[event.type] ?? event.type;
    const date = event.timestamp instanceof Date
        ? event.timestamp.toLocaleDateString()
        : new Date(event.timestamp).toLocaleDateString();
    return `${label}: +${event.points} pts — ${event.itemDescription} (${date})`;
}
/** Render the reward history list */
function renderHistory(events) {
    if (events.length === 0) {
        return "No reward history yet. Start earning points by making sustainable choices.";
    }
    return events.map(renderHistoryEntry).join("\n");
}
/** Render the event logging form options */
function renderEventForm() {
    const lines = ["### Log a Sustainable Action", ""];
    for (const type of exports.LOGGABLE_EVENT_TYPES) {
        lines.push(`- ${EVENT_LABELS[type]}`);
    }
    return lines.join("\n");
}
/** Render the full rewards dashboard */
function renderRewardsDashboard(balance, history) {
    const lines = [
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
//# sourceMappingURL=rewards-dashboard.js.map