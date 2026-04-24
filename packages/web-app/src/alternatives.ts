import type { SustainableAlternative, ProductScore } from "@ecopulse/shared";

/** Compute composite sustainability score */
function compositeScore(score: ProductScore): number {
  return score.environmental + score.health + score.greenwashing;
}

/** Sort alternatives by composite sustainability score descending */
export function sortByScore(alternatives: SustainableAlternative[]): SustainableAlternative[] {
  return [...alternatives].sort((a, b) => compositeScore(b.score) - compositeScore(a.score));
}

/** Filter alternatives to those at or below the given price */
export function filterAffordable(
  alternatives: SustainableAlternative[],
  maxPrice: number
): SustainableAlternative[] {
  return alternatives.filter((alt) => alt.price <= maxPrice);
}

/** Render a single alternative */
export function renderAlternative(alt: SustainableAlternative): string {
  const score = compositeScore(alt.score);
  return `${alt.productName} by ${alt.brand} — ${alt.currency} ${alt.price} — Score: ${score}/300`;
}

/** Render the full alternatives page */
export function renderAlternativesPage(
  alternatives: SustainableAlternative[],
  options?: { affordableMaxPrice?: number }
): string {
  let items = sortByScore(alternatives);

  if (options?.affordableMaxPrice !== undefined) {
    items = filterAffordable(items, options.affordableMaxPrice);
  }

  const lines: string[] = ["# Sustainable Alternatives", ""];

  if (items.length === 0) {
    lines.push("No sustainable alternatives found.");
    return lines.join("\n");
  }

  for (const alt of items) {
    lines.push(`- ${renderAlternative(alt)}`);
  }

  return lines.join("\n");
}
