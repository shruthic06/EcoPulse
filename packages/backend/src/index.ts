export { parse, format } from "./fabric-parser.js";
export { certificationDatabase, verify } from "./certification-verifier.js";
export { detect } from "./greenwashing-detector.js";
export { computeScore } from "./scoring-engine.js";
export { analyze, getCachedAnalysis } from "./analyzer.js";
export { awardPoints, getBalance, getHistory } from "./reward-system.js";
export { findNearby, getDirectionsUrl, setLocations } from "./location-service.js";
export {
  query,
  analyzeMaterialComposition,
  setLLMProvider,
  resetLLMProvider,
  clearRateLimits,
} from "./ai-chat-service.js";
export type { LLMProvider } from "./ai-chat-service.js";
export {
  queryAlternatives,
  seedDatabase,
  getDatabase,
  clearDatabase,
  compositeScore,
} from "./product-database.js";
export type { QueryOptions } from "./product-database.js";
export { app } from "./server.js";
