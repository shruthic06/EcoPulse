"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMessage = renderMessage;
exports.renderConfidence = renderConfidence;
exports.renderFallback = renderFallback;
exports.renderConversation = renderConversation;
exports.renderChatResponse = renderChatResponse;
exports.renderChatPage = renderChatPage;
/** Confidence indicator labels */
const CONFIDENCE_LABELS = {
    high: "🟢 High confidence",
    medium: "🟡 Medium confidence",
    low: "🔴 Low confidence",
};
/** Render a single chat message */
function renderMessage(msg) {
    const role = msg.role === "user" ? "You" : "EcoPulse AI";
    return `[${role}]: ${msg.content}`;
}
/** Render the confidence indicator for a response */
function renderConfidence(response) {
    return CONFIDENCE_LABELS[response.confidence] ?? "Unknown confidence";
}
/** Render a fallback message for low-confidence responses */
function renderFallback(response) {
    if (response.confidence === "low") {
        return "⚠️ This information is inconclusive. Consider consulting a verified certification database for more reliable data.";
    }
    return null;
}
/** Render the full conversation history */
function renderConversation(messages) {
    if (messages.length === 0) {
        return "No messages yet. Ask a question about fabrics, dyes, chemicals, or brand claims.";
    }
    return messages.map(renderMessage).join("\n");
}
/** Render a chat response with confidence and optional fallback */
function renderChatResponse(response) {
    const lines = [];
    lines.push(response.message);
    lines.push(renderConfidence(response));
    const fallback = renderFallback(response);
    if (fallback) {
        lines.push(fallback);
    }
    if (response.sources && response.sources.length > 0) {
        lines.push(`Sources: ${response.sources.join(", ")}`);
    }
    return lines.join("\n");
}
/** Render the full chat interface page */
function renderChatPage(messages, latestResponse) {
    const lines = ["# AI Material Chat", ""];
    lines.push(renderConversation(messages));
    if (latestResponse) {
        lines.push("");
        lines.push("---");
        lines.push(renderChatResponse(latestResponse));
    }
    lines.push("");
    lines.push("💡 Tip: Paste a material composition label to get an instant analysis.");
    return lines.join("\n");
}
//# sourceMappingURL=chat-interface.js.map