# Requirements Document

## Introduction

The Sustainable Fashion Checker is an AI-enabled shopping assistant that helps fast fashion consumers make more informed, sustainable, and health-conscious purchasing decisions. The solution operates as a hybrid model: a browser extension provides quick analysis at the moment of purchase (fabric composition, sustainability claims, certifications, material risks, greenwashing signals), while a companion web/mobile app delivers detailed environmental and health analysis, verified sustainable alternatives, reward points, and an AI chat for deeper material inquiries. Users earn reward points for sustainable behaviors such as choosing safer products, rewearing clothing, donating items, repairing garments, and recycling textiles.

## Glossary

- **Extension**: The browser extension component that analyzes clothing product pages and shopping carts, displaying a summary popup with a green or red score
- **Web_App**: The companion web and mobile application that provides detailed analysis, alternatives, reward points, AI chat, and recycling/donation information
- **Analyzer**: The core analysis engine that evaluates clothing products based on fabric composition, sustainability claims, certifications, material risks, chemical/health transparency, environmental impact indicators, and greenwashing signals
- **Scoring_Engine**: The component that computes environmental impact score, health transparency score, and greenwashing risk score for a given product
- **AI_Chat**: The conversational AI component that allows users to paste material information or ask questions about fabrics, dyes, chemicals, or brand claims
- **Product_Database**: The curated database of verified sustainable alternative products and affordable safer brands
- **Reward_System**: The component that tracks and awards reward points for sustainable user behaviors
- **User**: A consumer using the Extension or Web_App to evaluate clothing purchases
- **Product_Page**: A clothing product listing on a retailer website containing fabric composition, brand claims, and certification information
- **Sustainability_Score**: A composite score representing environmental impact, health transparency, and greenwashing risk for a product
- **Greenwashing_Signal**: A vague, misleading, or unverifiable sustainability claim made by a brand or product listing

## Requirements

### Requirement 1: Product Page Analysis

**User Story:** As a User, I want the Extension to analyze a clothing product page while I shop, so that I can quickly understand the environmental and health implications of a product before purchasing.

#### Acceptance Criteria

1. WHEN a User navigates to a Product_Page, THE Extension SHALL extract fabric composition, sustainability claims, certifications, material risk indicators, chemical/health transparency data, environmental impact indicators, and greenwashing signals from the page content
2. IF the Extension cannot extract sufficient product information from the Product_Page, THEN THE Extension SHALL display a notification informing the User that manual input via AI_Chat is available
3. WHEN the Analyzer completes analysis of a product, THE Extension SHALL display a popup containing a green or red Sustainability_Score summary within 5 seconds of page load completion

### Requirement 2: Sustainability Scoring

**User Story:** As a User, I want to see a clear score for each product, so that I can make quick comparisons between products.

#### Acceptance Criteria

1. WHEN the Analyzer provides analysis results, THE Scoring_Engine SHALL compute three separate scores: an environmental impact score, a health transparency score, and a greenwashing risk score
2. THE Scoring_Engine SHALL represent each score on a numeric scale from 0 to 100, where 0 indicates the worst rating and 100 indicates the best rating
3. WHEN any of the three scores falls below a threshold of 50, THE Extension SHALL display a red overall indicator for the product
4. WHEN all three scores are at or above a threshold of 50, THE Extension SHALL display a green overall indicator for the product

### Requirement 3: Greenwashing Detection

**User Story:** As a User, I want to be alerted when a brand uses vague or misleading sustainability claims, so that I can avoid being misled by greenwashing.

#### Acceptance Criteria

1. WHEN the Analyzer evaluates a Product_Page, THE Analyzer SHALL identify Greenwashing_Signals including vague terms such as "eco-friendly", "green", "natural", and "conscious" that lack supporting certifications or evidence
2. WHEN one or more Greenwashing_Signals are detected, THE Scoring_Engine SHALL reduce the greenwashing risk score proportionally to the number and severity of detected signals
3. WHEN the User views the detailed analysis in the Web_App, THE Web_App SHALL list each detected Greenwashing_Signal with an explanation of why the claim is considered vague or misleading

### Requirement 4: Detailed Analysis View

**User Story:** As a User, I want to view a detailed breakdown of a product's analysis, so that I can understand the specific environmental and health factors behind the score.

#### Acceptance Criteria

1. WHEN the User clicks the detail link in the Extension popup, THE Web_App SHALL display a detailed analysis page for the corresponding product
2. THE Web_App SHALL present the detailed analysis organized into three sections: environmental analysis, health analysis, and greenwashing risk explanation
3. WHEN displaying the environmental analysis section, THE Web_App SHALL show fabric composition breakdown, environmental impact of each material, and relevant certification status
4. WHEN displaying the health analysis section, THE Web_App SHALL show known chemical and material risks associated with the product's fabric composition and dye processes

### Requirement 5: Sustainable Alternatives

**User Story:** As a User, I want to see verified sustainable alternatives to the product I am viewing, so that I can choose a better option.

#### Acceptance Criteria

1. WHEN the User views a detailed analysis page, THE Web_App SHALL display a list of verified sustainable alternatives from the Product_Database that match the same clothing category
2. THE Web_App SHALL sort alternative products by Sustainability_Score in descending order
3. THE Web_App SHALL display the price, Sustainability_Score, and brand name for each alternative product
4. WHEN the User requests affordable alternatives, THE Web_App SHALL filter the alternatives list to show products at or below the price of the originally analyzed product

### Requirement 6: AI Chat for Material Inquiries

**User Story:** As a User, I want to ask questions about fabrics, dyes, chemicals, or brand claims, so that I can get clear explanations when the automated analysis is insufficient.

#### Acceptance Criteria

1. WHEN the User submits a text query to the AI_Chat, THE AI_Chat SHALL provide a response about fabric safety, sustainability, chemical risks, or brand claim validity within 10 seconds
2. WHEN the User pastes material composition information into the AI_Chat, THE AI_Chat SHALL analyze the composition and return an assessment of environmental impact and health risks
3. WHEN the User asks about a specific brand's sustainability claims, THE AI_Chat SHALL evaluate the claims against known certifications and provide a greenwashing risk assessment
4. IF the AI_Chat cannot determine an answer with sufficient confidence, THEN THE AI_Chat SHALL inform the User that the information is inconclusive and suggest consulting a verified certification database


### Requirement 7: Reward Points System

**User Story:** As a User, I want to earn reward points for making sustainable choices, so that I am incentivized to continue sustainable shopping and clothing care behaviors.

#### Acceptance Criteria

1. WHEN the User purchases a sustainable alternative through the Web_App, THE Reward_System SHALL award reward points to the User's account
2. WHEN the User logs a rewear event for a clothing item, THE Reward_System SHALL award reward points to the User's account
3. WHEN the User logs a donation of wearable clothing items, THE Reward_System SHALL award reward points to the User's account
4. WHEN the User logs a garment repair event, THE Reward_System SHALL award reward points to the User's account
5. WHEN the User logs a textile recycling event, THE Reward_System SHALL award reward points to the User's account
6. THE Reward_System SHALL maintain a cumulative points balance visible to the User in the Web_App

### Requirement 8: Donation and Recycling Locations

**User Story:** As a User, I want to find nearby donation centers and textile recycling locations, so that I can responsibly dispose of clothing I no longer need.

#### Acceptance Criteria

1. WHEN the User requests donation or recycling locations, THE Web_App SHALL display a list of nearby donation centers and textile recycling facilities based on the User's provided location
2. THE Web_App SHALL display the name, address, accepted item types, and operating hours for each location
3. WHEN the User selects a location, THE Web_App SHALL provide directions or a map link to the selected facility

### Requirement 9: Fabric Composition Parsing

**User Story:** As a User, I want the system to accurately parse fabric composition labels, so that the analysis is based on correct material data.

#### Acceptance Criteria

1. WHEN the Analyzer receives fabric composition text from a Product_Page, THE Analyzer SHALL parse the text into a structured list of materials with their corresponding percentage values
2. IF the fabric composition text contains ambiguous or incomplete data, THEN THE Analyzer SHALL flag the product as requiring manual review via AI_Chat
3. THE Analyzer SHALL format parsed fabric composition data back into a human-readable fabric composition string
4. FOR ALL valid fabric composition data, parsing then formatting then parsing SHALL produce an equivalent structured result (round-trip property)

### Requirement 10: Certification Verification

**User Story:** As a User, I want to know whether a product's claimed certifications are legitimate, so that I can trust the sustainability claims.

#### Acceptance Criteria

1. WHEN the Analyzer detects a certification claim on a Product_Page, THE Analyzer SHALL verify the claim against a maintained list of recognized sustainability certifications (e.g., GOTS, OEKO-TEX, Fair Trade, Bluesign)
2. WHEN a certification claim matches a recognized certification, THE Analyzer SHALL mark the certification as verified in the analysis results
3. WHEN a certification claim does not match any recognized certification, THE Analyzer SHALL mark the certification as unverified and flag the claim as a potential Greenwashing_Signal
