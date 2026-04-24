import type {
  ExtractedProductData,
  ProductAnalysis,
  ChemicalRisk,
  FabricComponent,
} from "@ecopulse/shared";
import { parse } from "./fabric-parser.js";
import { verify } from "./certification-verifier.js";
import { detect } from "./greenwashing-detector.js";
import { computeScore } from "./scoring-engine.js";

/**
 * Mapping of common materials to known chemical risks.
 * Used to derive ChemicalRisk[] from parsed fabric components.
 */
const MATERIAL_CHEMICAL_RISKS: Record<
  string,
  { substance: string; riskLevel: "low" | "medium" | "high"; healthEffects: string[] }[]
> = {
  polyester: [
    {
      substance: "Microplastics",
      riskLevel: "high",
      healthEffects: ["ocean pollution", "potential ingestion through food chain"],
    },
  ],
  nylon: [
    {
      substance: "Microplastics",
      riskLevel: "high",
      healthEffects: ["ocean pollution", "potential ingestion through food chain"],
    },
  ],
  cotton: [
    {
      substance: "Pesticide residues",
      riskLevel: "medium",
      healthEffects: ["skin irritation", "potential endocrine disruption"],
    },
  ],
  rayon: [
    {
      substance: "Carbon disulfide",
      riskLevel: "medium",
      healthEffects: ["respiratory irritation", "potential nervous system effects"],
    },
  ],
  viscose: [
    {
      substance: "Carbon disulfide",
      riskLevel: "medium",
      healthEffects: ["respiratory irritation", "potential nervous system effects"],
    },
  ],
  acrylic: [
    {
      substance: "Acrylonitrile residues",
      riskLevel: "medium",
      healthEffects: ["skin sensitization", "potential respiratory irritation"],
    },
  ],
  leather: [
    {
      substance: "Chromium compounds",
      riskLevel: "high",
      healthEffects: ["skin allergies", "potential carcinogen exposure"],
    },
  ],
};

/** Qualifiers that reduce chemical risk (e.g., organic cotton has fewer pesticides). */
const RISK_REDUCING_QUALIFIERS = new Set(["organic", "recycled"]);

/** In-memory cache of analysis results keyed by product URL. */
const analysisCache = new Map<string, ProductAnalysis>();

/** Simple ID generator using crypto.randomUUID when available, fallback to timestamp-based. */
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Derive chemical risks from parsed fabric components.
 * Materials with sustainable qualifiers (organic, recycled) get reduced risk levels.
 */
function deriveChemicalRisks(components: FabricComponent[]): ChemicalRisk[] {
  const risks: ChemicalRisk[] = [];
  const seen = new Set<string>();

  for (const component of components) {
    const materialKey = component.material.toLowerCase();
    const knownRisks = MATERIAL_CHEMICAL_RISKS[materialKey];
    if (!knownRisks) continue;

    const hasReducingQualifier =
      component.qualifier != null &&
      RISK_REDUCING_QUALIFIERS.has(component.qualifier.toLowerCase());

    for (const risk of knownRisks) {
      const key = `${risk.substance}-${materialKey}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const riskLevel = hasReducingQualifier ? downgradeRisk(risk.riskLevel) : risk.riskLevel;

      risks.push({
        substance: risk.substance,
        riskLevel,
        associatedMaterials: [component.material],
        healthEffects: risk.healthEffects,
      });
    }
  }

  return risks;
}

/** Downgrade a risk level by one step for sustainably-qualified materials. */
function downgradeRisk(level: "low" | "medium" | "high"): "low" | "medium" | "high" {
  if (level === "high") return "medium";
  if (level === "medium") return "low";
  return "low";
}

/**
 * Analyze a product through the full sustainability pipeline.
 *
 * Pipeline: parse fabric → verify certifications → detect greenwashing → derive chemical risks → compute score.
 *
 * Results are cached by URL for subsequent lookups.
 */
export function analyze(data: ExtractedProductData): ProductAnalysis {
  // 1. Parse fabric composition
  const fabricComposition = parse(data.fabricCompositionText);

  // 2. Verify certification claims
  const certificationResults = verify(data.certificationMentions);

  // 3. Detect greenwashing signals
  const verifiedCertNames = certificationResults
    .filter((r) => r.verified && r.matched)
    .map((r) => r.matched!.name);
  const greenwashingSignals = detect(data.sustainabilityClaims, verifiedCertNames);

  // 4. Derive chemical risks from fabric components
  const chemicalRisks = deriveChemicalRisks(fabricComposition.components);

  // 5. Compute score
  const score = computeScore({
    fabricComponents: fabricComposition.components,
    certificationResults,
    greenwashingSignals,
    chemicalRisks,
  });

  const analysis: ProductAnalysis = {
    id: generateId(),
    url: data.url,
    productName: data.productName,
    brand: data.brand,
    fabricComposition,
    certificationResults,
    greenwashingSignals,
    chemicalRisks,
    score,
    analyzedAt: new Date(),
  };

  // Cache by URL
  analysisCache.set(data.url, analysis);

  return analysis;
}

/**
 * Retrieve a previously cached analysis result by product URL.
 */
export function getCachedAnalysis(url: string): ProductAnalysis | undefined {
  return analysisCache.get(url);
}
