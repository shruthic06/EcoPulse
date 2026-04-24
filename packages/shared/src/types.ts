// Fabric composition types (Requirement 9.1)
export interface FabricComponent {
  material: string;
  percentage: number;
  qualifier?: string;
}

export interface ParseResult {
  components: FabricComponent[];
  isComplete: boolean;
  rawText: string;
}

// Certification types (Requirement 10.1)
export interface Certification {
  id: string;
  name: string;
  aliases: string[];
  category: string;
}

export interface VerificationResult {
  claim: string;
  matched: Certification | null;
  verified: boolean;
}

export interface CertificationRecord {
  id: string;
  name: string;
  aliases: string[];
  category: "environmental" | "health" | "social";
  description: string;
  verificationUrl: string;
}

// Greenwashing types (Requirement 3.1)
export interface GreenwashingSignal {
  term: string;
  context: string;
  severity: "low" | "medium" | "high";
  explanation: string;
}

// Chemical risk types
export interface ChemicalRisk {
  substance: string;
  riskLevel: "low" | "medium" | "high";
  associatedMaterials: string[];
  healthEffects: string[];
}

// Scoring types (Requirement 2.1, 2.2)
export interface ScoringInput {
  fabricComponents: FabricComponent[];
  certificationResults: VerificationResult[];
  greenwashingSignals: GreenwashingSignal[];
  chemicalRisks: ChemicalRisk[];
}

export interface ProductScore {
  environmental: number;
  health: number;
  greenwashing: number;
  overallIndicator: "green" | "red";
}

// Product analysis types
export interface ProductAnalysis {
  id: string;
  url: string;
  productName: string;
  brand: string;
  fabricComposition: ParseResult;
  certificationResults: VerificationResult[];
  greenwashingSignals: GreenwashingSignal[];
  chemicalRisks: ChemicalRisk[];
  score: ProductScore;
  analyzedAt: Date;
}

// Chat types (Requirement 6.1)
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  confidence: "high" | "medium" | "low";
  sources?: string[];
}

// Reward types (Requirement 7.1)
export type RewardEventType = "purchase" | "rewear" | "donation" | "repair" | "recycle";

export interface RewardEvent {
  userId: string;
  type: RewardEventType;
  points: number;
  itemDescription: string;
  timestamp: Date;
}

// Location types (Requirement 8.1)
export interface Location {
  id: string;
  name: string;
  address: string;
  acceptedItemTypes: string[];
  operatingHours: string;
  latitude: number;
  longitude: number;
  type: "donation" | "recycling";
}

// Sustainable alternatives types (Requirement 5.1)
export interface SustainableAlternative {
  id: string;
  productName: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  score: ProductScore;
  certifications: string[];
  purchaseUrl: string;
}

// Content extraction types (Requirement 1.1)
export interface ExtractedProductData {
  url: string;
  productName: string;
  brand: string;
  fabricCompositionText: string;
  sustainabilityClaims: string[];
  certificationMentions: string[];
  price: number | null;
  currency: string | null;
  category: string | null;
}

// User types (Requirement 7.6)
export interface User {
  id: string;
  email: string;
  rewardPoints: number;
  createdAt: Date;
}
