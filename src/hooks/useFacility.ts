import { useState, useEffect } from 'react';
import type { LocationFacility, SportCategory } from '../types';

interface UseFacilityReturn {
  courts: LocationFacility[];
  loading: boolean;
  error: string | null;
}

export function useFacility(
  locationId: string | null,
  date: string | null,
  sport: SportCategory
): UseFacilityReturn {
  const [courts, setCourts] = useState<LocationFacility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationId || !date) {
      setCourts([]);
      return;
    }

    const fetchFacility = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://apihub.dbkl.gov.my/api/public/v1/location/facility?sub_category=${encodeURIComponent(sport)}&location_id=${locationId}&search_date=${date}`
        );
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success && data.data && data.data.data) {
          setCourts(data.data.data);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch facility data');
      } finally {
        setLoading(false);
      }
    };

    fetchFacility();
  }, [locationId, date, sport]);

  return { courts, loading, error };
}
