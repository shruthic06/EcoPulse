import type { FabricComponent, ParseResult } from "@ecopulse/shared";
/**
 * Parse raw fabric composition text into structured FabricComponent[].
 * Handles formats like "60% Organic Cotton, 40% Recycled Polyester".
 */
export declare function parse(text: string): ParseResult;
/**
 * Format FabricComponent[] back to a human-readable string.
 * E.g., [{material: "Cotton", percentage: 60, qualifier: "Organic"}]
 *   → "60% Organic Cotton"
 */
export declare function format(components: FabricComponent[]): string;
//# sourceMappingURL=fabric-parser.d.ts.map