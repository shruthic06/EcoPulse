"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirectionsUrl = getDirectionsUrl;
exports.renderLocation = renderLocation;
exports.renderLocationsPage = renderLocationsPage;
/** Generate a directions URL for a location */
function getDirectionsUrl(location) {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
}
/** Render a single location entry */
function renderLocation(location) {
    const lines = [];
    lines.push(`### ${location.name}`);
    lines.push(`- Address: ${location.address}`);
    lines.push(`- Type: ${location.type}`);
    lines.push(`- Accepted items: ${location.acceptedItemTypes.join(", ")}`);
    lines.push(`- Hours: ${location.operatingHours}`);
    lines.push(`- [Get Directions](${getDirectionsUrl(location)})`);
    return lines.join("\n");
}
/** Render the full locations page */
function renderLocationsPage(locations) {
    const lines = ["# Donation & Recycling Locations", ""];
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
//# sourceMappingURL=locations-page.js.map