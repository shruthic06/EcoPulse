import { describe, it, expect } from "vitest";
import { computeScore } from "./scoring-engine.js";
import type { ScoringInput } from "@ecopulse/shared";

function makeInput(overrides: Partial<ScoringInput> = {}): ScoringInput {
  return {
    fabricComponents: [],
    certificationResults: [],
    greenwashingSignals: [],
    chemicalRisks: [],
    ...overrides,
  };
}

describe("ScoringEngine.computeScore", () => {
  // --- Score range ---
  it("returns all scores in [0, 100]", () => {
    const result = computeScore(makeInput());
    expect(result.environmental).toBeGreaterThanOrEqual(0);
    expect(result.environmental).toBeLessThanOrEqual(100);
    expect(result.health).toBeGreaterThanOrEqual(0);
    expect(result.health).toBeLessThanOrEqual(100);
    expect(result.greenwashing).toBeGreaterThanOrEqual(0);
    expect(result.greenwashing).toBeLessThanOrEqual(100);
  });

  // --- Empty fabric components → low default ---
  it("assigns low scores when fabric components are empty", () => {
    const result = computeScore(makeInput());
    expect(result.environmental).toBe(20);
    expect(result.health).toBe(20);
    expect(result.overallIndicator).toBe("red");
  });

  // --- Environmental score ---
  it("boosts environmental score for sustainable qualifiers", () => {
    const result = computeScore(
      makeInput({
        fabricComponents: [
          { material: "Cotton", percentage: 100, qualifier: "Organic" },
        ],
      })
    );
    // base 50 + (100/100)*30 = 80
    expect(result.environmental).toBe(80);
  });

  it("boosts environmental score for verified environmental certifications", () => {
    const result = computeScore(
      makeInput({
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
      })
    );
    // base 50 + 10 (cert) = 60
    expect(result.environmental).toBe(60);
  });

  it("does not boost for unverified certifications", () => {
    const result = computeScore(
      makeInput({
        fabricComponents: [{ material: "Cotton", percentage: 100 }],
        certificationResults: [
          { claim: "Unknown Cert", matched: null, verified: false },
        ],
      })
    );
    expect(result.environmental).toBe(50);
  });

  // --- Health score ---
  it("starts health at 80 with no chemical risks", () => {
    const result = computeScore(
      makeInput({
        fabricComponents: [{ material: "Cotton", percentage: 100 }],
      })
    );
    expect(result.health).toBe(80);
  });

  it("reduces health score for chemical risks by severity", () => {
    const result = computeScore(
      makeInput({
        fabricComponents: [{ material: "Polyester", percentage: 100 }],
        chemicalRisks: [
          {
            substance: "Formaldehyde",
            riskLevel: "high",
            associatedMaterials: ["Polyester"],
            healthEffects: ["Skin irritation"],
          },
        ],
      })
    );
    // 80 - 20 = 60
    expect(result.health).toBe(60);
  });

  // --- Greenwashing score ---
  it("returns 100 greenwashing score with no signals", () => {
    const result = computeScore(makeInput());
    expect(result.greenwashing).toBe(100);
  });

  it("reduces greenwashing score per signal severity", () => {
    const result = computeScore(
      makeInput({
        greenwashingSignals: [
          {
            term: "eco-friendly",
            context: "eco-friendly product",
            severity: "high",
            explanation: "Vague term",
          },
        ],
      })
    );
    // 100 - 25 = 75
    expect(result.greenwashing).toBe(75);
  });

  it("clamps greenwashing score to 0 with many signals", () => {
    const signals = Array.from({ length: 10 }, (_, i) => ({
      term: `term${i}`,
      context: `context${i}`,
      severity: "high" as const,
      explanation: `explanation${i}`,
    }));
    const result = computeScore(makeInput({ greenwashingSignals: signals }));
    expect(result.greenwashing).toBe(0);
  });

  // --- Overall indicator ---
  it("returns green when all scores >= 50", () => {
    const result = computeScore(
      makeInput({
        fabricComponents: [
          { material: "Cotton", percentage: 100, qualifier: "Organic" },
        ],
      })
    );
    // env=80, health=80, greenwashing=100 → all >= 50
    expect(result.overallIndicator).toBe("green");
  });

  it("returns red when any score < 50", () => {
    // Empty fabric → env=20, health=20 → red
    const result = computeScore(makeInput());
    expect(result.overallIndicator).toBe("red");
  });

  it("returns red when exactly one score is 49", () => {
    // 3 high greenwashing signals: 100 - 75 = 25 < 50
    const result = computeScore(
      makeInput({
        fabricComponents: [
          { material: "Cotton", percentage: 100, qualifier: "Organic" },
        ],
        greenwashingSignals: [
          { term: "a", context: "a", severity: "high", explanation: "a" },
          { term: "b", context: "b", severity: "high", explanation: "b" },
          { term: "c", context: "c", severity: "high", explanation: "c" },
        ],
      })
    );
    // greenwashing = 100 - 75 = 25 < 50 → red
    expect(result.overallIndicator).toBe("red");
  });
});
