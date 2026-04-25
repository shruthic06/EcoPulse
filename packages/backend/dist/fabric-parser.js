"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
exports.format = format;
const KNOWN_QUALIFIERS = [
    "organic",
    "recycled",
    "virgin",
    "regenerated",
    "biodegradable",
    "certified",
    "sustainable",
    "raw",
    "pure",
    "natural",
];
const BLEND_KEYWORDS = ["blend", "mix", "mixed", "blended"];
/**
 * Parse raw fabric composition text into structured FabricComponent[].
 * Handles formats like "60% Organic Cotton, 40% Recycled Polyester".
 */
function parse(text) {
    const rawText = text;
    const trimmed = text.trim();
    if (!trimmed) {
        return { components: [], isComplete: false, rawText };
    }
    // Check for blend keywords without percentages → incomplete
    const lowerText = trimmed.toLowerCase();
    const hasPercentage = /%/.test(trimmed);
    const hasBlendKeyword = BLEND_KEYWORDS.some((kw) => lowerText.includes(kw));
    if (hasBlendKeyword && !hasPercentage) {
        // Try to extract at least the material name
        const components = parseBlendText(trimmed);
        return { components, isComplete: false, rawText };
    }
    // Split on common delimiters: comma, semicolon, slash, " and ", " & "
    const segments = trimmed
        .split(/[,;/]|\band\b|\s&\s/i)
        .map((s) => s.trim())
        .filter(Boolean);
    const components = [];
    let allHavePercentage = true;
    for (const segment of segments) {
        const parsed = parseSegment(segment);
        if (parsed) {
            components.push(parsed);
            if (parsed.percentage === 0 && !segment.includes("0%")) {
                allHavePercentage = false;
            }
        }
    }
    if (components.length === 0) {
        return { components: [], isComplete: false, rawText };
    }
    const isComplete = allHavePercentage && components.length > 0;
    return { components, isComplete, rawText };
}
/**
 * Parse a single segment like "60% Organic Cotton" or "Organic Cotton 60%".
 */
function parseSegment(segment) {
    const trimmed = segment.trim();
    if (!trimmed)
        return null;
    // Match percentage (before or after material name)
    const percentBeforeMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*%\s*(.+)$/i);
    const percentAfterMatch = trimmed.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*%$/i);
    let percentage = 0;
    let materialPart;
    if (percentBeforeMatch) {
        percentage = parseFloat(percentBeforeMatch[1]);
        materialPart = percentBeforeMatch[2].trim();
    }
    else if (percentAfterMatch) {
        materialPart = percentAfterMatch[1].trim();
        percentage = parseFloat(percentAfterMatch[2]);
    }
    else {
        // No percentage found
        materialPart = trimmed;
    }
    const { material, qualifier } = extractQualifierAndMaterial(materialPart);
    if (!material)
        return null;
    const component = {
        material: capitalize(material),
        percentage,
    };
    if (qualifier) {
        component.qualifier = capitalize(qualifier);
    }
    return component;
}
/**
 * Extract qualifier (e.g., "Organic", "Recycled") and base material from text.
 */
function extractQualifierAndMaterial(text) {
    const words = text.split(/\s+/);
    if (words.length >= 2) {
        const firstWord = words[0].toLowerCase();
        if (KNOWN_QUALIFIERS.includes(firstWord)) {
            return {
                qualifier: words[0],
                material: words.slice(1).join(" "),
            };
        }
    }
    return { material: text, qualifier: undefined };
}
/**
 * Parse blend text like "cotton blend" into components with 0% percentage.
 */
function parseBlendText(text) {
    const lower = text.toLowerCase();
    const cleaned = BLEND_KEYWORDS.reduce((t, kw) => t.replace(new RegExp(`\\b${kw}\\b`, "gi"), ""), lower).trim();
    if (!cleaned)
        return [];
    const { material, qualifier } = extractQualifierAndMaterial(cleaned);
    if (!material)
        return [];
    const component = {
        material: capitalize(material),
        percentage: 0,
    };
    if (qualifier) {
        component.qualifier = capitalize(qualifier);
    }
    return [component];
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * Format FabricComponent[] back to a human-readable string.
 * E.g., [{material: "Cotton", percentage: 60, qualifier: "Organic"}]
 *   → "60% Organic Cotton"
 */
function format(components) {
    if (components.length === 0)
        return "";
    return components
        .map((c) => {
        const qualifierPart = c.qualifier ? `${c.qualifier} ` : "";
        return `${c.percentage}% ${qualifierPart}${c.material}`;
    })
        .join(", ");
}
//# sourceMappingURL=fabric-parser.js.map