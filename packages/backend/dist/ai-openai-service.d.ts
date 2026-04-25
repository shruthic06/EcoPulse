interface FabricComponent {
    material: string;
    percentage: number;
    qualifier?: string | null;
}
interface AnalyzeInput {
    productName: string;
    brand: string;
    fabricComponents: FabricComponent[];
    sustainabilityClaims: string[];
    certificationMentions: string[];
}
export declare function aiAnalyze(input: AnalyzeInput): Promise<Record<string, unknown>>;
interface ChatInput {
    message: string;
    conversationHistory: {
        role: string;
        content: string;
    }[];
    productContext?: string | null;
}
export declare function aiChat(input: ChatInput): Promise<{
    message: string;
    confidence: string;
}>;
export {};
//# sourceMappingURL=ai-openai-service.d.ts.map