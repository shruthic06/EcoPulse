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
export interface GreenwashingSignal {
    term: string;
    context: string;
    severity: "low" | "medium" | "high";
    explanation: string;
}
export interface ChemicalRisk {
    substance: string;
    riskLevel: "low" | "medium" | "high";
    associatedMaterials: string[];
    healthEffects: string[];
}
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
    imageUrl: string | null;
}
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
export type RewardEventType = "purchase" | "rewear" | "donation" | "repair" | "recycle";
export interface RewardEvent {
    userId: string;
    type: RewardEventType;
    points: number;
    itemDescription: string;
    timestamp: Date;
}
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
    imageUrl: string | null;
}
export interface User {
    id: string;
    email: string;
    rewardPoints: number;
    createdAt: Date;
}
//# sourceMappingURL=types.d.ts.map