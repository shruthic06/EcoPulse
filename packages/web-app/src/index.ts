// Detailed Analysis Page (Requirements 4.1, 4.2, 4.3, 4.4, 3.3)
export {
  renderDetailedAnalysis,
  renderEnvironmentalSection,
  renderHealthSection,
  renderGreenwashingSection,
} from "./detailed-analysis.js";

// Sustainable Alternatives Page (Requirements 5.1, 5.2, 5.3, 5.4)
export {
  renderAlternativesPage,
  renderAlternative,
  sortByScore,
  filterAffordable,
} from "./alternatives.js";

// AI Chat Interface (Requirements 6.1, 6.2, 6.3, 6.4)
export {
  renderChatPage,
  renderChatResponse,
  renderConversation,
  renderMessage,
  renderConfidence,
  renderFallback,
} from "./chat-interface.js";

// Reward Points Dashboard (Requirements 7.1–7.6)
export {
  renderRewardsDashboard,
  renderBalance,
  renderHistory,
  renderHistoryEntry,
  renderEventForm,
  LOGGABLE_EVENT_TYPES,
} from "./rewards-dashboard.js";

// Donation & Recycling Locations (Requirements 8.1, 8.2, 8.3)
export {
  renderLocationsPage,
  renderLocation,
  getDirectionsUrl,
} from "./locations-page.js";
