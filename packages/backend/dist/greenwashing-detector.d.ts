import type { GreenwashingSignal } from "@ecopulse/shared";
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
export declare function detect(claims: string[], verifiedCertifications: string[]): GreenwashingSignal[];
//# sourceMappingURL=greenwashing-detector.d.ts.map