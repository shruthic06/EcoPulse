import type {
  Certification,
  CertificationRecord,
  VerificationResult,
} from "@ecopulse/shared";

/**
 * In-memory database of recognized sustainability certifications.
 * Each record includes aliases for flexible matching.
 */
export const certificationDatabase: CertificationRecord[] = [
  {
    id: "gots",
    name: "GOTS",
    aliases: [
      "global organic textile standard",
      "gots certified",
      "gots organic",
    ],
    category: "environmental",
    description:
      "Global Organic Textile Standard ensuring organic status of textiles from harvesting through manufacturing.",
    verificationUrl: "https://global-standard.org/",
  },
  {
    id: "oeko-tex-100",
    name: "OEKO-TEX Standard 100",
    aliases: [
      "oeko-tex",
      "oekotex",
      "oeko tex",
      "oeko-tex standard 100",
      "oeko-tex 100",
      "oekotex 100",
    ],
    category: "health",
    description:
      "Tests for harmful substances in textiles to ensure product safety.",
    verificationUrl: "https://www.oeko-tex.com/",
  },
  {
    id: "fair-trade",
    name: "Fair Trade",
    aliases: [
      "fairtrade",
      "fair trade certified",
      "fair trade usa",
      "fairtrade international",
    ],
    category: "social",
    description:
      "Ensures fair wages, safe working conditions, and sustainable livelihoods for workers.",
    verificationUrl: "https://www.fairtrade.net/",
  },
  {
    id: "bluesign",
    name: "Bluesign",
    aliases: [
      "bluesign approved",
      "bluesign certified",
      "bluesign system",
    ],
    category: "environmental",
    description:
      "Tracks the path of each textile through the manufacturing process to eliminate harmful substances.",
    verificationUrl: "https://www.bluesign.com/",
  },
  {
    id: "grs",
    name: "GRS",
    aliases: [
      "global recycled standard",
      "grs certified",
    ],
    category: "environmental",
    description:
      "Verifies recycled content in products and tracks recycled materials through the supply chain.",
    verificationUrl: "https://textileexchange.org/",
  },
  {
    id: "cradle-to-cradle",
    name: "Cradle to Cradle",
    aliases: [
      "c2c",
      "cradle to cradle certified",
      "c2c certified",
    ],
    category: "environmental",
    description:
      "Assesses products across material health, material reutilization, renewable energy, water stewardship, and social fairness.",
    verificationUrl: "https://www.c2ccertified.org/",
  },
  {
    id: "bci",
    name: "BCI",
    aliases: [
      "better cotton initiative",
      "better cotton",
      "bci certified",
    ],
    category: "environmental",
    description:
      "Promotes better standards in cotton farming for environmental and social sustainability.",
    verificationUrl: "https://bettercotton.org/",
  },
];

/**
 * Verify certification claims against the certification database.
 * Matching is case-insensitive against both certification names and aliases.
 */
export function verify(claims: string[]): VerificationResult[] {
  return claims.map((claim) => {
    const normalizedClaim = claim.trim().toLowerCase();
    const matchedRecord = certificationDatabase.find(
      (record) =>
        record.name.toLowerCase() === normalizedClaim ||
        record.aliases.some((alias) => alias.toLowerCase() === normalizedClaim)
    );

    if (matchedRecord) {
      const certification: Certification = {
        id: matchedRecord.id,
        name: matchedRecord.name,
        aliases: matchedRecord.aliases,
        category: matchedRecord.category,
      };
      return { claim, matched: certification, verified: true };
    }

    return { claim, matched: null, verified: false };
  });
}
