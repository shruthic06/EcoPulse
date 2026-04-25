"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detect = detect;
const VAGUE_TERMS = [
    {
        term: "eco-friendly",
        severity: "high",
        explanation: "\"Eco-friendly\" is a broad, undefined term with no standard criteria or certification backing.",
    },
    {
        term: "green",
        severity: "medium",
        explanation: "\"Green\" is vague and has no measurable environmental standard behind it.",
    },
    {
        term: "natural",
        severity: "medium",
        explanation: "\"Natural\" does not guarantee sustainability or safety — many natural processes are environmentally harmful.",
    },
    {
        term: "conscious",
        severity: "medium",
        explanation: "\"Conscious\" is a marketing term with no verifiable sustainability criteria.",
    },
    {
        term: "sustainable",
        severity: "high",
        explanation: "\"Sustainable\" without supporting certifications is an unverifiable claim.",
    },
    {
        term: "earth-friendly",
        severity: "high",
        explanation: "\"Earth-friendly\" lacks any standardized definition or certification requirement.",
    },
    {
        term: "environmentally friendly",
        severity: "high",
        explanation: "\"Environmentally friendly\" is a broad claim with no measurable criteria.",
    },
    {
        term: "clean",
        severity: "low",
        explanation: "\"Clean\" is ambiguous in a fashion context and does not correspond to any certification.",
    },
    {
        term: "responsible",
        severity: "low",
        explanation: "\"Responsible\" is subjective and lacks a verifiable standard.",
    },
    {
        term: "ethical",
        severity: "medium",
        explanation: "\"Ethical\" covers a wide range of practices and is not backed by a specific certification.",
    },
];
/**
 * Detect greenwashing signals in sustainability claims.
 *
 * Flags claims containing vague terms that lack supporting verified certifications.
 * Claims that are backed by a verified certification are not flagged.
 *
 * @param claims - Raw sustainability claims from a product page
 * @param verifiedCertifications - Names of certifications that were verified for this product
 * @returns Array of greenwashing signals found
 */
function detect(claims, verifiedCertifications) {
    const verifiedSet = new Set(verifiedCertifications.map((c) => c.toLowerCase()));
    const signals = [];
    for (const claim of claims) {
        const lowerClaim = claim.toLowerCase();
        for (const vague of VAGUE_TERMS) {
            if (lowerClaim.includes(vague.term)) {
                // Skip if the claim is backed by a verified certification
                const isBacked = verifiedSet.size > 0 && isClaimBacked(lowerClaim, verifiedSet);
                if (isBacked)
                    continue;
                signals.push({
                    term: vague.term,
                    context: claim,
                    severity: vague.severity,
                    explanation: vague.explanation,
                });
            }
        }
    }
    return signals;
}
/**
 * Check if a claim is backed by any verified certification.
 * A claim is considered backed if it directly mentions a verified certification name.
 */
function isClaimBacked(lowerClaim, verifiedSet) {
    for (const cert of verifiedSet) {
        if (lowerClaim.includes(cert)) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=greenwashing-detector.js.map