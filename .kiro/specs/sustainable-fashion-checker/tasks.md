# Implementation Plan: Sustainable Fashion Checker

## Overview

Incremental implementation of the Sustainable Fashion Checker (EcoPulse) system using TypeScript. The plan builds from core data models and parsing logic outward to scoring, detection, services, API layer, browser extension, and web app. Each step produces testable, integrated code.

## Tasks

- [x] 1. Set up project structure and shared types
  - [x] 1.1 Initialize TypeScript project with monorepo structure (packages: shared, backend, extension, web-app)
    - Configure `tsconfig.json`, `package.json`, install dependencies (express, fast-check, vitest or jest)
    - Create shared types package with all interfaces: `FabricComponent`, `ParseResult`, `VerificationResult`, `GreenwashingSignal`, `ChemicalRisk`, `ScoringInput`, `ProductScore`, `ProductAnalysis`, `ChatMessage`, `ChatResponse`, `RewardEvent`, `RewardEventType`, `Location`, `SustainableAlternative`, `CertificationRecord`, `ExtractedProductData`, `User`
    - _Requirements: 2.1, 2.2, 9.1_

- [x] 2. Implement Fabric Parser
  - [x] 2.1 Implement `FabricParser.parse` and `FabricParser.format`
    - Parse raw fabric composition text (e.g., "60% Organic Cotton, 40% Recycled Polyester") into `FabricComponent[]`
    - Handle qualifiers (Organic, Recycled), percentages, and material names
    - Set `isComplete: false` when data is ambiguous or incomplete (e.g., "cotton blend")
    - Implement `format` to convert `FabricComponent[]` back to a human-readable string
    - _Requirements: 9.1, 9.2, 9.3_
  - [ ]* 2.2 Write property test: Fabric composition parse-format round trip
    - **Property 15: Fabric composition parse-format round trip**
    - **Validates: Requirements 9.1, 9.3, 9.4**
  - [ ]* 2.3 Write unit tests for Fabric Parser
    - Test edge cases: empty string, "cotton blend", percentages not summing to 100, unicode characters, multiple qualifiers
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 3. Implement Certification Verifier
  - [x] 3.1 Create certification database (in-memory list of `CertificationRecord` entries for GOTS, OEKO-TEX, Fair Trade, Bluesign, etc.)
    - Include aliases for each certification
    - _Requirements: 10.1_
  - [x] 3.2 Implement `CertificationVerifier.verify`
    - Match claims against certification names and aliases (case-insensitive)
    - Return `verified: true` with matched `Certification` when found, `verified: false` with `matched: null` otherwise
    - _Requirements: 10.1, 10.2, 10.3_
  - [ ]* 3.3 Write property test: Certification verification correctness
    - **Property 16: Certification verification correctness**
    - **Validates: Requirements 10.1, 10.2, 10.3**
  - [ ]* 3.4 Write unit tests for Certification Verifier
    - Test known certifications, unknown claims, alias matching, case sensitivity
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 4. Implement Greenwashing Detector
  - [x] 4.1 Implement `GreenwashingDetector.detect`
    - Maintain a list of known vague terms ("eco-friendly", "green", "natural", "conscious", "sustainable", etc.)
    - Flag claims containing vague terms that lack supporting verified certifications
    - Assign severity based on term vagueness and context
    - Return `GreenwashingSignal[]` with term, context, severity, and explanation
    - _Requirements: 3.1, 3.2_
  - [ ]* 4.2 Write property test: Greenwashing detection of uncertified vague claims
    - **Property 3: Greenwashing detection of uncertified vague claims**
    - **Validates: Requirements 3.1**
  - [ ]* 4.3 Write unit tests for Greenwashing Detector
    - Test vague terms with and without supporting certifications, multiple signals, empty claims
    - _Requirements: 3.1, 3.2_

- [-] 5. Implement Scoring Engine
  - [x] 5.1 Implement `ScoringEngine.computeScore`
    - Compute environmental score from fabric components and certification results
    - Compute health score from chemical risks and fabric components
    - Compute greenwashing score from greenwashing signals (reduce proportionally to number and severity)
    - Clamp all scores to [0, 100]
    - Set `overallIndicator` to "green" if all scores >= 50, "red" otherwise
    - Handle edge case: empty fabric components → default low score
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2_
  - [ ]* 5.2 Write property test: Score range and completeness invariant
    - **Property 1: Score range and completeness invariant**
    - **Validates: Requirements 2.1, 2.2**
  - [ ]* 5.3 Write property test: Overall indicator threshold rule
    - **Property 2: Overall indicator threshold rule**
    - **Validates: Requirements 2.3, 2.4**
  - [ ]* 5.4 Write property test: Greenwashing score monotonicity
    - **Property 4: Greenwashing score monotonicity**
    - **Validates: Requirements 3.2**
  - [ ]* 5.5 Write unit tests for Scoring Engine
    - Test boundary conditions: all scores at 50, one at 49, all at 0, all at 100, empty input
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 6. Checkpoint - Core analysis pipeline
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Analyzer Service
  - [x] 7.1 Implement the Analyzer orchestration that wires Fabric Parser, Certification Verifier, Greenwashing Detector, and Scoring Engine
    - Accept `ExtractedProductData`, run through the pipeline, produce `ProductAnalysis`
    - Implement analysis caching (store results by URL)
    - Flag products with incomplete fabric data for manual review via AI_Chat
    - _Requirements: 1.1, 1.2, 1.3, 9.2_

- [x] 8. Implement Reward System
  - [x] 8.1 Implement `RewardSystem.awardPoints`, `getBalance`, and `getHistory`
    - Support all event types: purchase, rewear, donation, repair, recycle
    - Use idempotency keys to prevent duplicate awards
    - Maintain cumulative points balance per user
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [ ]* 8.2 Write property test: Reward points accumulation invariant
    - **Property 12: Reward points accumulation invariant**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**
  - [ ]* 8.3 Write unit tests for Reward System
    - Test duplicate event rejection, invalid event types, zero-point events, balance calculation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 9. Implement Location Service
  - [x] 9.1 Implement `LocationService.findNearby` and `getDirectionsUrl`
    - Filter locations by distance using Haversine formula
    - Return locations within specified radius sorted by distance
    - Generate map/directions URL for each location
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ]* 9.2 Write property test: Location proximity constraint
    - **Property 13: Location proximity constraint**
    - **Validates: Requirements 8.1**
  - [ ]* 9.3 Write unit tests for Location Service
    - Test empty results, single result, boundary distance cases
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 10. Implement AI Chat Service
  - [x] 10.1 Implement `AIChatService.query` and `analyzeMaterialComposition`
    - Integrate with LLM provider for conversational queries about fabrics, chemicals, brand claims
    - Implement confidence assessment; return inconclusive message when confidence is low
    - Handle material composition paste analysis
    - Implement rate limiting per user
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]* 10.2 Write unit tests for AI Chat Service
    - Test low-confidence fallback, service unavailable handling, rate limiting
    - _Requirements: 6.1, 6.4_

- [x] 11. Implement Sustainable Alternatives Query
  - [x] 11.1 Implement Product Database query for sustainable alternatives
    - Filter by clothing category
    - Sort by composite sustainability score descending
    - Support affordable filter (price <= original product price)
    - Return price, score, and brand for each alternative
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 11.2 Write property test: Alternatives category matching
    - **Property 8: Alternatives category matching**
    - **Validates: Requirements 5.1**
  - [ ]* 11.3 Write property test: Alternatives sorted by score descending
    - **Property 9: Alternatives sorted by score descending**
    - **Validates: Requirements 5.2**
  - [ ]* 11.4 Write property test: Affordable alternatives price filter
    - **Property 11: Affordable alternatives price filter**
    - **Validates: Requirements 5.4**
  - [ ]* 11.5 Write unit tests for alternatives query
    - Test empty database, single match, price filtering edge cases
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 12. Checkpoint - Backend services complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement API Gateway
  - [x] 13.1 Set up Express API server with route handlers
    - `POST /api/analyze` → Analyzer Service
    - `GET /api/analysis/:id` → Cached analysis lookup
    - `POST /api/chat` → AI Chat Service
    - `GET /api/alternatives` → Product Database query (with category and optional price filter)
    - `POST /api/rewards` → Reward System (log event)
    - `GET /api/rewards/:userId` → Reward System (balance + history)
    - `GET /api/locations` → Location Service (lat, lng, radius params)
    - Add input validation and error handling for all routes
    - _Requirements: 1.1, 1.3, 4.1, 5.1, 6.1, 7.1, 8.1_

- [x] 14. Implement Browser Extension
  - [x] 14.1 Implement Content Extractor
    - Create content script that extracts `ExtractedProductData` from product page DOM
    - Handle extraction failures gracefully: show notification suggesting AI_Chat for manual input
    - _Requirements: 1.1, 1.2_
  - [x] 14.2 Implement Extension Popup UI
    - Display green/red sustainability score summary from API response
    - Show three individual scores (environmental, health, greenwashing)
    - Include link to detailed analysis in Web_App
    - Handle loading, timeout (5s), and error states
    - _Requirements: 1.3, 2.3, 2.4, 4.1_
  - [x] 14.3 Wire extension: content script → API call → popup display
    - Connect Content Extractor output to API `/api/analyze` call
    - Pass API response to Popup UI for rendering
    - _Requirements: 1.1, 1.3_

- [x] 15. Implement Web App Frontend
  - [x] 15.1 Implement Detailed Analysis Page
    - Display three sections: environmental analysis, health analysis, greenwashing risk explanation
    - Environmental section: fabric composition breakdown, environmental impact per material, certification status
    - Health section: chemical risks with substance names and health effects
    - Greenwashing section: list each signal with term and explanation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 3.3_
  - [ ]* 15.2 Write property test: Greenwashing signals rendering completeness
    - **Property 5: Greenwashing signals rendering completeness**
    - **Validates: Requirements 3.3**
  - [ ]* 15.3 Write property test: Environmental analysis rendering completeness
    - **Property 6: Environmental analysis rendering completeness**
    - **Validates: Requirements 4.3**
  - [ ]* 15.4 Write property test: Health analysis rendering completeness
    - **Property 7: Health analysis rendering completeness**
    - **Validates: Requirements 4.4**
  - [x] 15.5 Implement Sustainable Alternatives Page
    - Display alternatives list with price, score, and brand
    - Support affordable filter toggle
    - Sort by sustainability score descending
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 15.6 Write property test: Alternative rendering completeness
    - **Property 10: Alternative rendering completeness**
    - **Validates: Requirements 5.3**
  - [x] 15.7 Implement AI Chat Interface
    - Text input for queries, display conversation history
    - Support material composition paste analysis
    - Show confidence indicators and fallback messages
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 15.8 Implement Reward Points Dashboard
    - Display cumulative points balance
    - Show reward history
    - Provide forms to log rewear, donation, repair, and recycle events
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [x] 15.9 Implement Donation & Recycling Locations Page
    - Location search with map/directions links
    - Display name, address, accepted items, operating hours for each facility
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ]* 15.10 Write property test: Location rendering completeness
    - **Property 14: Location rendering completeness**
    - **Validates: Requirements 8.2**

- [x] 16. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout; all implementation tasks use TypeScript
