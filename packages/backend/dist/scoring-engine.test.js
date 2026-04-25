"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const scoring_engine_js_1 = require("./scoring-engine.js");
function makeInput(overrides = {}) {
    return {
        fabricComponents: [],
        certificationResults: [],
        greenwashingSignals: [],
        chemicalRisks: [],
        ...overrides,
    };
}
(0, vitest_1.describe)("ScoringEngine.computeScore", () => {
    // --- Score range ---
    (0, vitest_1.it)("returns all scores in [0, 100]", () => {
        const result = (0, scoring_engine_js_1.computeScore)(makeInput());
        (0, vitest_1.expect)(result.environmental).toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(result.environmental).toBeLessThanOrEqual(100);
        (0, vitest_1.expect)(result.health).toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(result.health).toBeLessThanOrEqual(100);
        (0, vitest_1.expect)(result.greenwashing).toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(result.greenwashing).toBeLessThanOrEqual(100);
    });
    // --- Empty fabric components → low default ---
    (0, vitest_1.it)("assigns low scores when fabric components are empty", () => {
        const result = (0, scoring_engine_js_1.computeScore)(makeInput());
        (0, vitest_1.expect)(result.environmental).toBe(20);
        (0, vitest_1.expect)(result.health).toBe(20);
        (0, vitest_1.expect)(result.overallIndicator).toBe("red");
    });
    // --- Environmental score ---
    (0, vitest_1.it)("boosts environmental score for sustainable qualifiers", () => {
        const result = (0, scoring_engine_js_1.computeScore)(makeInput({
            fabricComponents: [
                { material: "Cotton", percentage: 100, qualifier: "Organic" },
            ],
        }));
        // base 50 + (100/100)*30 = 80
        (0, vitest_1.expect)(result.environmental).toBe(80);
    });
    (0, vitest_1.it)("boosts environmental score for verified environmental certifications", () => {
        const result = (0, scoring_engine_js_1.computeScore)(makeInput({
            fabricComponents: [{ material: "Cotton", percentage: 100 }],
            certificationResults: [
                {
                    claim: "GOTS",
                    matched: {
                        id: "gots",
                        name: "GOTS",
                        aliases: [],
                        category: "environmental",
                    },
                    verified: true,
                },
            ],
        }));
        // base 50 + 10 (cert) = 60
        (0, vitest_1.expect)(result.environmental).toBe(60);
    });
    (0, vitest_1.it)("does not boost for unverified certifications", () => {
        const result = (0, scoring_engine_js_1.computeScore)(makeInput({
            fabricComponents: [{ material: "Cotton", percentage: 100 }],
            certificationResults: [
                { claim: "Unknown Cert", matched: null, verified: false },
            ],
        }));
        (0, vitest_1.expect)(result.environmental).toBe(50);
    });
    // --- Health score ---
    (0, vitest_1.it)("starts health at 80 with no chemical risks", () => {
        const result = (0, scoring_engine_js_1.computeScore)(makeInput({
            fabricComponents: [{ material: "Cotton", percentage: 100 }],
        }));
        (0, vitest_1.expect)(result.health).toBe(80);
    });
    (0, vitest_1.it)("reduces health score for chemical risks by severity", () => {
        const result = (0, scoring_engine_js_1.computeScore)(makeInput({
            fabricComponents: [{ material: "Polyester", percentage: 100 }],
            chemicalRisks: [
                {
                    substance: "Formaldehyde",
                    riskLevel: "high",
                    associatedMaterials: ["Polyester"],
                    healthEffects: ["Skin irritation"],
                },
            ],
        }));
        // 80 - 20 = 60
        (0, vitest_1.expect)(result.health).toBe(60);
    });
    // --- Greenwashing score ---
    (0, vitest_1.it)("returns 100 greenwashing score with no signals", () => {
        const result = (0, scoring_engine_js_1.computeScore)(makeInput());
        (0, vitest_1.expect)(result.greenwashing).toBe(100);
    });
    (0, vitest_1.it)("reduces greenwashing score per signal severity", () => {
        const result = (0, scoring_engine_js_1.computeScore)(makeInput({
            greenwashingSignals: [
                {
                    term: "eco-friendly",
                    context: "eco-friendly product",
                    severity: "high",
                    explanation: "Vague term",
                },
            ],
        }));
        // 100 - 25 = 75
        (0, vitest_1.expect)(result.greenwashing).toBe(75);
    });
    (0, vitest_1.it)("clamps greenwashing score to 0 with many signals", () => {
        const signals = Array.from({ length: 10 }, (_, i) => ({
            term: `term${i}`,
            context: `context${i}`,
            severity: "high",
            explanation: `explanation${i}`,
        }));
        const result = (0, scoring_engine_js_1.computeScore)(makeInput({ greenwashingSignals: signals }));
        (0, vitest_1.expect)(result.greenwashing).toBe(0);
    });
    // --- Overall indicator ---
    (0, vitest_1.it)("returns green when all scores >= 50", () => {
        const result = (0, scoring_engine_js_1.computeScore)(makeInput({
            fabricComponents: [
                { material: "Cotton", percentage: 100, qualifier: "Organic" },
            ],
        }));
        // env=80, health=80, greenwashing=100 → all >= 50
        (0, vitest_1.expect)(result.overallIndicator).toBe("green");
    });
    (0, vitest_1.it)("returns red when any score < 50", () => {
        // Empty fabric → env=20, health=20 → red
        const result = (0, scoring_engine_js_1.computeScore)(makeInput());
        (0, vitest_1.expect)(result.overallIndicator).toBe("red");
    });
    (0, vitest_1.it)("returns red when exactly one score is 49", () => {
        // 3 high greenwashing signals: 100 - 75 = 25 < 50
        const result = (0, scoring_engine_js_1.computeScore)(makeInput({
            fabricComponents: [
                { material: "Cotton", percentage: 100, qualifier: "Organic" },
            ],
            greenwashingSignals: [
                { term: "a", context: "a", severity: "high", explanation: "a" },
                { term: "b", context: "b", severity: "high", explanation: "b" },
                { term: "c", context: "c", severity: "high", explanation: "c" },
            ],
        }));
        // greenwashing = 100 - 75 = 25 < 50 → red
        (0, vitest_1.expect)(result.overallIndicator).toBe("red");
    });
});
//# sourceMappingURL=scoring-engine.test.js.map