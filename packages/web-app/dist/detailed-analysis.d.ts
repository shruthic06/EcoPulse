import type { ProductAnalysis, GreenwashingSignal, ChemicalRisk } from "@ecopulse/shared";
/** Render the environmental analysis section */
export declare function renderEnvironmentalSection(analysis: ProductAnalysis): string;
/** Render the health analysis section */
export declare function renderHealthSection(chemicalRisks: ChemicalRisk[]): string;
/** Render the greenwashing risk section */
export declare function renderGreenwashingSection(signals: GreenwashingSignal[]): string;
/** Render the full detailed analysis page */
export declare function renderDetailedAnalysis(analysis: ProductAnalysis): string;
//# sourceMappingURL=detailed-analysis.d.ts.map