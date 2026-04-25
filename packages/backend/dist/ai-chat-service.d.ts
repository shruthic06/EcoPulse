import type { ChatMessage, ChatResponse } from "@ecopulse/shared";
/**
 * LLM provider interface — allows plugging in any LLM backend.
 * The default implementation is a stub that returns keyword-based responses.
 */
export interface LLMProvider {
    generate(prompt: string): Promise<{
        text: string;
        confidence: "high" | "medium" | "low";
    }>;
}
/** Replace the LLM provider (useful for testing or plugging in a real provider). */
export declare function setLLMProvider(provider: LLMProvider): void;
/** Reset to the default stub provider. */
export declare function resetLLMProvider(): void;
/** Clear rate limit state (for testing). */
export declare function clearRateLimits(): void;
/**
 * Handle a conversational query about fabrics, chemicals, or brand claims.
 * Requirements: 6.1, 6.3, 6.4
 */
export declare function query(userId: string, userMessage: string, conversationHistory: ChatMessage[]): Promise<ChatResponse>;
/**
 * Analyze pasted material composition text.
 * Requirements: 6.2
 */
export declare function analyzeMaterialComposition(userId: string, compositionText: string): Promise<ChatResponse>;
//# sourceMappingURL=ai-chat-service.d.ts.map