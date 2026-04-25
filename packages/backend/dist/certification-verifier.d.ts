import type { CertificationRecord, VerificationResult } from "@ecopulse/shared";
/**
 * In-memory database of recognized sustainability certifications.
 * Each record includes aliases for flexible matching.
 */
export declare const certificationDatabase: CertificationRecord[];
/**
 * Verify certification claims against the certification database.
 * Matching is case-insensitive against both certification names and aliases.
 */
export declare function verify(claims: string[]): VerificationResult[];
//# sourceMappingURL=certification-verifier.d.ts.map