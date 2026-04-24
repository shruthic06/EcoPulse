import type { Location } from "@ecopulse/shared";

/** Generate a directions URL for a location */
export function getDirectionsUrl(location: Location): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
}

/** Render a single location entry */
export function renderLocation(location: Location): string {
  const lines: string[] = [];
  lines.push(`### ${location.name}`);
  lines.push(`- Address: ${location.address}`);
  lines.push(`- Type: ${location.type}`);
  lines.push(`- Accepted items: ${location.acceptedItemTypes.join(", ")}`);
  lines.push(`- Hours: ${location.operatingHours}`);
  lines.push(`- [Get Directions](${getDirectionsUrl(location)})`);
  return lines.join("\n");
}

/** Render the full locations page */
export function renderLocationsPage(locations: Location[]): string {
  const lines: string[] = ["# Donation & Recycling Locations", ""];

  if (locations.length === 0) {
    lines.push("No locations found nearby. Try expanding your search radius.");
    return lines.join("\n");
  }

  for (const loc of locations) {
    lines.push(renderLocation(loc));
    lines.push("");
  }

  return lines.join("\n");
}
