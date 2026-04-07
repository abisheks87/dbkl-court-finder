import { useState, useEffect } from 'react';
import type { LocationData } from '../types';

interface UseLocationsReturn {
  locations: LocationData[];
  loading: boolean;
  error: string | null;
}

export function useLocations(): UseLocationsReturn {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          const locationMap = new Map<string, LocationData>();
          
          // Iterate through all numeric keys in data.data
          Object.values(data.data).forEach((subCategoryArray: any) => {
            if (Array.isArray(subCategoryArray)) {
              // Each item in the array has a "locations" property
              subCategoryArray.forEach((subCategory: any) => {
                if (subCategory.locations && Array.isArray(subCategory.locations)) {
                  subCategory.locations.forEach((loc: any) => {
                    // Use location_id as key to avoid duplicates
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
          
          const locationData = Array.from(locationMap.values());
          setLocations(locationData);
        }
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch locations';
        setError(errorMsg);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, loading, error };
}
