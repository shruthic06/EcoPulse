import type {
  ScoringInput,
  ProductScore,
  FabricComponent,
  VerificationResult,
  GreenwashingSignal,
  ChemicalRisk,
} from "@ecopulse/shared";

/** Qualifiers that indicate sustainable sourcing. */
const SUSTAINABLE_QUALIFIERS = new Set(["organic", "recycled"]);

/** Severity-based penalty for greenwashing signals. */
const GREENWASHING_PENALTY: Record<string, number> = {
  high: 25,
  medium: 15,
  low: 10,
};

/** Severity-based penalty for chemical risks. */
const CHEMICAL_RISK_PENALTY: Record<string, number> = {
  high: 20,
  medium: 12,
  low: 5,
};

/** Clamp a value to the [0, 100] range. */
function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Compute the environmental score from fabric components and certification results.
 *
 * - Base score of 50
 * - Boost for sustainable qualifiers (Organic, Recycled) proportional to percentage
 * - Boost for verified environmental certifications (+10 each)
 * - Empty fabric components → default low score of 20
 */
function computeEnvironmentalScore(
  fabricComponents: FabricComponent[],
  certificationResults: VerificationResult[]
): number {
  if (fabricComponents.length === 0) {
    return 20;
  }

  let score = 50;

  for (const component of fabricComponents) {
    if (
      component.qualifier &&
      SUSTAINABLE_QUALIFIERS.has(component.qualifier.toLowerCase())
    ) {
      score += (component.percentage / 100) * 30;
    }
  }

  for (const cert of certificationResults) {
    if (cert.verified && cert.matched) {
      if (cert.matched.category === "environmental") {
        score += 10;
      }
    }
  }

  return clamp(score);
}

/**
 * Compute the health score from chemical risks and fabric components.
 *
 * - Base score of 80 (assuming safe by default)
 * - Reduce based on chemical risk severity
 * - Empty fabric components → default low score of 20
 */
function computeHealthScore(
  chemicalRisks: ChemicalRisk[],
  fabricComponents: FabricComponent[]
): number {
  if (fabricComponents.length === 0) {
    return 20;
  }

  let score = 80;

  for (const risk of chemicalRisks) {
    score -= CHEMICAL_RISK_PENALTY[risk.riskLevel] ?? 0;
  }

  return clamp(score);
}

/**
 * Compute the greenwashing score from greenwashing signals.
 *
 * - Start at 100 (no greenwashing = perfect score)
 * - Reduce proportionally to number and severity of signals
 * - Ensures monotonicity: more/higher-severity signals → lower score
 */
function computeGreenwashingScore(
  greenwashingSignals: GreenwashingSignal[]
): number {
  let score = 100;

  for (const signal of greenwashingSignals) {
    score -= GREENWASHING_PENALTY[signal.severity] ?? 0;
  }

  return clamp(score);
}

/**
 * Compute the three-axis sustainability score for a product.
 *
 * @param input - Scoring input containing fabric components, certification results,
 *                greenwashing signals, and chemical risks
 * @returns ProductScore with environmental, health, greenwashing scores and overall indicator
 */
export function computeScore(input: ScoringInput): ProductScore {
  const environmental = computeEnvironmentalScore(
    input.fabricComponents,
    input.certificationResults
  );
  const health = computeHealthScore(
    input.chemicalRisks,
    input.fabricComponents
  );
  const greenwashing = computeGreenwashingScore(input.greenwashingSignals);

  const overallIndicator: "green" | "red" =
    environmental >= 50 && health >= 50 && greenwashing >= 50
      ? "green"
      : "red";

  return { environmental, health, greenwashing, overallIndicator };
}
