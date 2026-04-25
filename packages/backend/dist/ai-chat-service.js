"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLLMProvider = setLLMProvider;
exports.resetLLMProvider = resetLLMProvider;
exports.clearRateLimits = clearRateLimits;
exports.query = query;
exports.analyzeMaterialComposition = analyzeMaterialComposition;
const fabric_parser_js_1 = require("./fabric-parser.js");
const certification_verifier_js_1 = require("./certification-verifier.js");
const greenwashing_detector_js_1 = require("./greenwashing-detector.js");
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitMap = new Map();
/** Knowledge base for keyword-based responses when no external LLM is configured. */
const FABRIC_KNOWLEDGE = {
    cotton: {
        info: "Cotton is a natural fiber. Conventional cotton uses significant pesticides and water. Organic cotton (GOTS certified) reduces chemical exposure and environmental impact.",
        confidence: "high",
    },
    polyester: {
        info: "Polyester is a synthetic fiber derived from petroleum. It sheds microplastics during washing and is not biodegradable. Recycled polyester (rPET) reduces virgin plastic use but still sheds microplastics.",
        confidence: "high",
    },
    nylon: {
        info: "Nylon is a synthetic polymer. Production is energy-intensive and releases nitrous oxide. Recycled nylon (e.g., ECONYL) is a more sustainable option.",
        confidence: "high",
    },
    silk: {
        info: "Silk is a natural protein fiber. Conventional silk production involves boiling silkworms. Peace silk (Ahimsa silk) is a cruelty-free alternative.",
        confidence: "high",
    },
    wool: {
        info: "Wool is a natural, renewable, and biodegradable fiber. Environmental concerns include land use and methane from sheep. Look for RWS (Responsible Wool Standard) certification.",
        confidence: "high",
    },
    linen: {
        info: "Linen is made from flax, requiring less water and pesticides than cotton. It is biodegradable and durable. One of the more sustainable natural fibers.",
        confidence: "high",
    },
    rayon: {
        info: "Rayon (viscose) is a semi-synthetic fiber from wood pulp. Production uses toxic chemicals like carbon disulfide. TENCEL/Lyocell is a closed-loop, more sustainable alternative.",
        confidence: "high",
    },
    acrylic: {
        info: "Acrylic is a synthetic fiber that sheds microplastics and is derived from fossil fuels. It is not biodegradable and has limited recycling options.",
        confidence: "high",
    },
    leather: {
        info: "Leather tanning often uses chromium compounds, which pose health and environmental risks. Vegetable-tanned leather or certified leather (LWG) are better options.",
        confidence: "high",
    },
    hemp: {
        info: "Hemp is one of the most sustainable fibers. It requires minimal water, no pesticides, and improves soil health. It is biodegradable and very durable.",
        confidence: "high",
    },
};
const CHEMICAL_KNOWLEDGE = {
    formaldehyde: {
        info: "Formaldehyde is used in wrinkle-free and permanent-press finishes. It can cause skin irritation, respiratory issues, and is classified as a carcinogen. OEKO-TEX certification limits formaldehyde levels.",
        confidence: "high",
    },
    "azo dyes": {
        info: "Certain azo dyes can release carcinogenic aromatic amines. They are restricted under EU REACH regulation. Look for OEKO-TEX or Bluesign certification to ensure safe dye use.",
        confidence: "high",
    },
    phthalates: {
        info: "Phthalates are used as plasticizers in prints and coatings. They are endocrine disruptors. Avoid PVC-based prints and look for phthalate-free certifications.",
        confidence: "high",
    },
    pfas: {
        info: "PFAS (per- and polyfluoroalkyl substances) are used in water-repellent finishes. They are persistent environmental pollutants ('forever chemicals') linked to health issues. Look for PFAS-free alternatives.",
        confidence: "high",
    },
    microplastics: {
        info: "Microplastics are shed by synthetic fabrics (polyester, nylon, acrylic) during washing. They enter waterways and the food chain. Using a microfiber-catching wash bag can reduce shedding.",
        confidence: "high",
    },
};
/** Default stub LLM provider that uses keyword matching against the knowledge base. */
class DefaultLLMProvider {
    async generate(prompt) {
        const lower = prompt.toLowerCase();
        // Check fabric knowledge
        for (const [keyword, entry] of Object.entries(FABRIC_KNOWLEDGE)) {
            if (lower.includes(keyword)) {
                return { text: entry.info, confidence: entry.confidence };
            }
        }
        // Check chemical knowledge
        for (const [keyword, entry] of Object.entries(CHEMICAL_KNOWLEDGE)) {
            if (lower.includes(keyword)) {
                return { text: entry.info, confidence: entry.confidence };
            }
        }
        // No match — low confidence
        return {
            text: "I don't have enough information to provide a confident answer on this topic. I recommend consulting a verified certification database such as OEKO-TEX, GOTS, or Bluesign for detailed information.",
            confidence: "low",
        };
    }
}
let llmProvider = new DefaultLLMProvider();
/** Replace the LLM provider (useful for testing or plugging in a real provider). */
function setLLMProvider(provider) {
    llmProvider = provider;
}
/** Reset to the default stub provider. */
function resetLLMProvider() {
    llmProvider = new DefaultLLMProvider();
}
/**
 * Check and enforce rate limiting for a user.
 * Returns true if the request is allowed, false if rate-limited.
 */
function checkRateLimit(userId) {
    const now = Date.now();
    const entry = rateLimitMap.get(userId);
    if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(userId, { count: 1, windowStart: now });
        return true;
    }
    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }
    entry.count++;
    return true;
}
/** Clear rate limit state (for testing). */
function clearRateLimits() {
    rateLimitMap.clear();
}
/**
 * Handle a conversational query about fabrics, chemicals, or brand claims.
 * Requirements: 6.1, 6.3, 6.4
 */
async function query(userId, userMessage, conversationHistory) {
    if (!checkRateLimit(userId)) {
        return {
            message: "You have exceeded the rate limit. Please try again in a minute.",
            confidence: "low",
        };
    }
    // Build prompt with conversation context
    const contextMessages = conversationHistory
        .slice(-5) // keep last 5 messages for context
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");
    const prompt = contextMessages
        ? `${contextMessages}\nuser: ${userMessage}`
        : userMessage;
    // Check if this is a brand claim query — run greenwashing detection
    const brandClaimKeywords = ["claim", "claims", "brand says", "they say", "is it true", "greenwashing"];
    const isBrandClaimQuery = brandClaimKeywords.some((kw) => userMessage.toLowerCase().includes(kw));
    if (isBrandClaimQuery) {
        const claims = [userMessage];
        const signals = (0, greenwashing_detector_js_1.detect)(claims, []);
        if (signals.length > 0) {
            const signalSummary = signals
                .map((s) => `"${s.term}" — ${s.explanation} (severity: ${s.severity})`)
                .join("; ");
            return {
                message: `Greenwashing risk detected in the claims: ${signalSummary}. I recommend looking for verified certifications like GOTS, OEKO-TEX, or Fair Trade to support these claims.`,
                confidence: "high",
                sources: ["EcoPulse Greenwashing Detector"],
            };
        }
    }
    const result = await llmProvider.generate(prompt);
    if (result.confidence === "low") {
        return {
            message: result.text,
            confidence: "low",
            sources: ["Verified certification databases recommended"],
        };
    }
    return {
        message: result.text,
        confidence: result.confidence,
        sources: ["EcoPulse Knowledge Base"],
    };
}
/**
 * Analyze pasted material composition text.
 * Requirements: 6.2
 */
async function analyzeMaterialComposition(userId, compositionText) {
    if (!checkRateLimit(userId)) {
        return {
            message: "You have exceeded the rate limit. Please try again in a minute.",
            confidence: "low",
        };
    }
    const parseResult = (0, fabric_parser_js_1.parse)(compositionText);
    if (!parseResult.isComplete || parseResult.components.length === 0) {
        return {
            message: `I could not fully parse the composition "${compositionText}". The data appears ambiguous or incomplete. Please provide a clearer breakdown (e.g., "60% Organic Cotton, 40% Recycled Polyester").`,
            confidence: "low",
        };
    }
    // Verify any certifications implied by qualifiers
    const qualifiers = parseResult.components
        .filter((c) => c.qualifier)
        .map((c) => c.qualifier);
    const certResults = (0, certification_verifier_js_1.verify)(qualifiers);
    // Build assessment
    const lines = [];
    lines.push(`Composition: ${compositionText}`);
    lines.push("");
    for (const comp of parseResult.components) {
        const qualLabel = comp.qualifier ? ` (${comp.qualifier})` : "";
        const materialKey = comp.material.toLowerCase();
        const knowledge = FABRIC_KNOWLEDGE[materialKey];
        const impact = knowledge ? knowledge.info : "No detailed information available for this material.";
        lines.push(`• ${comp.percentage}% ${comp.material}${qualLabel}: ${impact}`);
    }
    if (certResults.some((r) => r.verified)) {
        lines.push("");
        lines.push("Verified qualifiers/certifications: " +
            certResults.filter((r) => r.verified).map((r) => r.matched.name).join(", "));
    }
    return {
        message: lines.join("\n"),
        confidence: "high",
        sources: ["EcoPulse Fabric Parser", "EcoPulse Knowledge Base"],
    };
}
//# sourceMappingURL=ai-chat-service.js.map