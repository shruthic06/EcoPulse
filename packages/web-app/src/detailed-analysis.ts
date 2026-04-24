import type {
  ProductAnalysis,
  GreenwashingSignal,
  ChemicalRisk,
  VerificationResult,
  FabricComponent,
} from "@ecopulse/shared";

/** Environmental impact descriptions per material */
const MATERIAL_IMPACT: Record<string, string> = {
  cotton: "High water usage, pesticide-intensive unless organic",
  polyester: "Petroleum-derived, non-biodegradable, microplastic shedding",
  nylon: "Energy-intensive production, non-biodegradable",
  silk: "Low environmental impact, biodegradable",
  wool: "Methane from livestock, land use, but biodegradable",
  linen: "Low water/pesticide use, biodegradable",
  rayon: "Deforestation risk, chemical-intensive processing",
  viscose: "Deforestation risk, chemical-intensive processing",
  spandex: "Petroleum-derived, non-recyclable",
  elastane: "Petroleum-derived, non-recyclable",
  hemp: "Low water/pesticide use, biodegradable, carbon-sequestering",
  bamboo: "Fast-growing but chemical-intensive processing",
  acrylic: "Petroleum-derived, non-biodegradable",
  lyocell: "Sustainably sourced wood pulp, closed-loop process",
  tencel: "Sustainably sourced wood pulp, closed-loop process",
};

function getEnvironmentalImpact(material: string): string {
  const key = material.toLowerCase();
  return MATERIAL_IMPACT[key] ?? "Environmental impact data not available";
}

/** Render the environmental analysis section */
export function renderEnvironmentalSection(analysis: ProductAnalysis): string {
  const lines: string[] = ["## Environmental Analysis", ""];

  // Fabric composition breakdown
  lines.push("### Fabric Composition");
  if (analysis.fabricComposition.components.length === 0) {
    lines.push("No fabric composition data available.");
  } else {
    for (const comp of analysis.fabricComposition.components) {
      const qualifierStr = comp.qualifier ? ` (${comp.qualifier})` : "";
      const impact = getEnvironmentalImpact(comp.material);
      lines.push(`- ${comp.percentage}% ${comp.material}${qualifierStr} — ${impact}`);
    }
  }
  lines.push("");

  // Certification status
  lines.push("### Certification Status");
  if (analysis.certificationResults.length === 0) {
    lines.push("No certification claims found.");
  } else {
    for (const cert of analysis.certificationResults) {
      const status = cert.verified ? "✅ Verified" : "❌ Unverified";
      const matchName = cert.matched ? ` (${cert.matched.name})` : "";
      lines.push(`- ${cert.claim}${matchName}: ${status}`);
    }
  }

  return lines.join("\n");
}

/** Render the health analysis section */
export function renderHealthSection(chemicalRisks: ChemicalRisk[]): string {
  const lines: string[] = ["## Health Analysis", ""];

  if (chemicalRisks.length === 0) {
    lines.push("No known chemical risks identified.");
    return lines.join("\n");
  }

  for (const risk of chemicalRisks) {
    lines.push(`### ${risk.substance} (Risk: ${risk.riskLevel})`);
    lines.push(`- Associated materials: ${risk.associatedMaterials.join(", ")}`);
    lines.push(`- Health effects: ${risk.healthEffects.join(", ")}`);
    lines.push("");
  }

  return lines.join("\n");
}

/** Render the greenwashing risk section */
export function renderGreenwashingSection(signals: GreenwashingSignal[]): string {
  const lines: string[] = ["## Greenwashing Risk", ""];

  if (signals.length === 0) {
    lines.push("No greenwashing signals detected.");
    return lines.join("\n");
  }

  for (const signal of signals) {
    lines.push(`### "${signal.term}" (Severity: ${signal.severity})`);
    lines.push(`- ${signal.explanation}`);
    lines.push("");
  }

  return lines.join("\n");
}

/** Render the full detailed analysis page */
export function renderDetailedAnalysis(analysis: ProductAnalysis): string {
  const header = `# ${analysis.productName} by ${analysis.brand}\n\nScore: Environmental ${analysis.score.environmental}/100 | Health ${analysis.score.health}/100 | Greenwashing ${analysis.score.greenwashing}/100 | Overall: ${analysis.score.overallIndicator.toUpperCase()}\n`;

  return [
    header,
    renderEnvironmentalSection(analysis),
    renderHealthSection(analysis.chemicalRisks),
    renderGreenwashingSection(analysis.greenwashingSignals),
  ].join("\n\n");
}
