import type { ChatMessage, ChatResponse } from "@ecopulse/shared";
/** Render a single chat message */
export declare function renderMessage(msg: ChatMessage): string;
/** Render the confidence indicator for a response */
export declare function renderConfidence(response: ChatResponse): string;
/** Render a fallback message for low-confidence responses */
export declare function renderFallback(response: ChatResponse): string | null;
/** Render the full conversation history */
export declare function renderConversation(messages: ChatMessage[]): string;
/** Render a chat response with confidence and optional fallback */
export declare function renderChatResponse(response: ChatResponse): string;
/** Render the full chat interface page */
export declare function renderChatPage(messages: ChatMessage[], latestResponse?: ChatResponse): string;
//# sourceMappingURL=chat-interface.d.ts.map