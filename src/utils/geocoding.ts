/**
 * Fallback geocoding using Nominatim (OpenStreetMap)
 * When DBKL API coordinates are bad, try to geocode by venue name and city.
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
}

/**
 * Geocode a venue name + city using Nominatim (OpenStreetMap).
 * Free to use, rate-limited to ~1 req/sec. No API key needed.
 *
 * @param venueName The name of the venue/facility
 * @param city City name (e.g. "Kuala Lumpur")
 * @returns Geocoded coordinates, or null if failed
 */
export async function geocodeByName(
  venueName: string,
  city: string = 'Kuala Lumpur'
): Promise<GeocodeResult | null> {
  try {
    // Build a search query with venue name + city + Malaysia
    const query = `${venueName}, ${city}, Malaysia`;
    const encoded = encodeURIComponent(query);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'CourtFinder/1.0', // Nominatim requires a user-agent
        },
      }
    );

    if (!res.ok) return null;

    const results = await res.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    const first = results[0];
    const lat = parseFloat(first.lat);
    const lng = parseFloat(first.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}
