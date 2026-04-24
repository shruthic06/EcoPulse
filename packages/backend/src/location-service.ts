import type { Location } from "@ecopulse/shared";

// In-memory location store
const locations: Location[] = [];

/**
 * Haversine formula: computes the great-circle distance (km) between two
 * latitude/longitude points on Earth.
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const EARTH_RADIUS_KM = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Seed the in-memory store. Useful for testing or initial data load.
 */
export function setLocations(locs: Location[]): void {
  locations.length = 0;
  locations.push(...locs);
}

/**
 * Find donation/recycling locations within `radiusKm` of the given
 * coordinates, sorted by distance ascending.
 * Requirements: 8.1, 8.2, 8.3
 */
export function findNearby(
  lat: number,
  lng: number,
  radiusKm: number
): Location[] {
  return locations
    .map((loc) => ({
      location: loc,
      distance: haversineDistance(lat, lng, loc.latitude, loc.longitude),
    }))
    .filter((entry) => entry.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .map((entry) => entry.location);
}

/**
 * Generate a Google Maps directions URL for a given location.
 * Requirement: 8.3
 */
export function getDirectionsUrl(location: Location): string {
  const destination = encodeURIComponent(location.address);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

// Re-export haversine for testing
export { haversineDistance };
