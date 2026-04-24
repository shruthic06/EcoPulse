import type { ChatMessage, ChatResponse } from "@ecopulse/shared";

/** Confidence indicator labels */
const CONFIDENCE_LABELS: Record<string, string> = {
  high: "🟢 High confidence",
  medium: "🟡 Medium confidence",
  low: "🔴 Low confidence",
};

/** Render a single chat message */
export function renderMessage(msg: ChatMessage): string {
  const role = msg.role === "user" ? "You" : "EcoPulse AI";
  return `[${role}]: ${msg.content}`;
}

/** Render the confidence indicator for a response */
export function renderConfidence(response: ChatResponse): string {
  return CONFIDENCE_LABELS[response.confidence] ?? "Unknown confidence";
}

/** Render a fallback message for low-confidence responses */
export function renderFallback(response: ChatResponse): string | null {
  if (response.confidence === "low") {
    return "⚠️ This information is inconclusive. Consider consulting a verified certification database for more reliable data.";
  }
  return null;
}

/** Render the full conversation history */
export function renderConversation(messages: ChatMessage[]): string {
  if (messages.length === 0) {
    return "No messages yet. Ask a question about fabrics, dyes, chemicals, or brand claims.";
  }
  return messages.map(renderMessage).join("\n");
}

/** Render a chat response with confidence and optional fallback */
export function renderChatResponse(response: ChatResponse): string {
  const lines: string[] = [];
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
export function renderChatPage(
  messages: ChatMessage[],
  latestResponse?: ChatResponse
): string {
  const lines: string[] = ["# AI Material Chat", ""];
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
