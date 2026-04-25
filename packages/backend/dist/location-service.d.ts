import type { Location } from "@ecopulse/shared";
/**
 * Haversine formula: computes the great-circle distance (km) between two
 * latitude/longitude points on Earth.
 */
declare function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
/**
 * Seed the in-memory store. Useful for testing or initial data load.
 */
export declare function setLocations(locs: Location[]): void;
/**
 * Find donation/recycling locations within `radiusKm` of the given
 * coordinates, sorted by distance ascending.
 * Requirements: 8.1, 8.2, 8.3
 */
export declare function findNearby(lat: number, lng: number, radiusKm: number): Location[];
/**
 * Generate a Google Maps directions URL for a given location.
 * Requirement: 8.3
 */
export declare function getDirectionsUrl(location: Location): string;
export { haversineDistance };
//# sourceMappingURL=location-service.d.ts.map