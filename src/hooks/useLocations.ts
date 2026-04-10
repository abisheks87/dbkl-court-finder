import { useState, useEffect, useMemo } from 'react';
import type { LocationData, SportCategory } from '../types';

interface UseLocationsReturn {
  locations: LocationData[];
  loading: boolean;
  error: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawCategoryData = Record<string, any[]>;

export function useLocations(sport: SportCategory): UseLocationsReturn {
  const [rawData, setRawData] = useState<RawCategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch once — the API returns all sports in a single response
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://apihub.dbkl.gov.my/api/public/v1/location/getCategoryByLocation'
        );
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();

        if (data.success && data.data && typeof data.data === 'object') {
          setRawData(data.data);
        }
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch locations';
        setError(errorMsg);
        setRawData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Derive filtered locations from cached response + selected sport
  const locations = useMemo(() => {
    if (!rawData) return [];
    const locationMap = new Map<string, LocationData>();

    Object.values(rawData).forEach((subCategoryArray) => {
      if (Array.isArray(subCategoryArray)) {
        subCategoryArray.forEach((subCategory) => {
          if (subCategory.sub_category_name !== sport) return;
          if (subCategory.locations && Array.isArray(subCategory.locations)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            subCategory.locations.forEach((loc: any) => {
              if (loc.location_id && loc.location_name) {
                locationMap.set(loc.location_id, {
                  location_id: loc.location_id,
                  location_name: loc.location_name,
                });
              }
            });
          }
        });
      }
    });

    return Array.from(locationMap.values());
  }, [rawData, sport]);

  return { locations, loading, error };
}
