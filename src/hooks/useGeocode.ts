import { useState, useEffect } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseGeocodeReturn {
  geocodes: Map<string, Coordinates | null>;
  loading: boolean;
  error: string | null;
}

export function useGeocode(locationNames: string[]): UseGeocodeReturn {
  const [geocodes, setGeocodes] = useState<Map<string, Coordinates | null>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locationNames.length === 0) {
      setGeocodes(new Map());
      return;
    }

    const geocodeLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = new Map<string, Coordinates | null>();

        // Check cache in localStorage
        const cacheKey = 'geocode_cache';
        const cached = localStorage.getItem(cacheKey);
        const cache = cached ? JSON.parse(cached) : {};

        for (const location of locationNames) {
          // Skip if already in cache
          if (cache[location] !== undefined) {
            result.set(location, cache[location]);
            continue;
          }

          try {
            // Call Nominatim API with User-Agent header
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}+Kuala+Lumpur&format=json&limit=1`,
              {
                headers: {
                  'User-Agent': 'DBKL-Court-Finder/1.0',
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.length > 0) {
                const coords = {
                  lat: parseFloat(data[0].lat),
                  lng: parseFloat(data[0].lon),
                };
                result.set(location, coords);
                cache[location] = coords;
              } else {
                result.set(location, null);
                cache[location] = null;
              }
            } else {
              result.set(location, null);
              cache[location] = null;
            }
          } catch {
            result.set(location, null);
            cache[location] = null;
          }

          // Rate limit: 1 request per second as per Nominatim policy
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(cache));
        setGeocodes(result);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to geocode locations';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    geocodeLocations();
  }, [locationNames.length]); // Only depend on length to avoid re-running on order changes

  return { geocodes, loading, error };
}
