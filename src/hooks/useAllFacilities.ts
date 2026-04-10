import { useState, useEffect } from 'react';
import type { LocationFacility, LocationData, SportCategory } from '../types';

interface LocationCourtGroup {
  location_id: string;
  location_name: string;
  courts: LocationFacility[];
}

interface UseAllFacilitiesReturn {
  results: LocationCourtGroup[];
  loading: boolean;
  progress: number; // 0-100
  loadedCount: number;
  totalCount: number;
  error: string | null;
}

export function useAllFacilities(
  locations: LocationData[],
  date: string,
  enabled: boolean,
  sport: SportCategory,
  refreshKey = 0
): UseAllFacilitiesReturn {
  const [results, setResults] = useState<LocationCourtGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !date || locations.length === 0) {
      setResults([]);
      setProgress(0);
      setLoadedCount(0);
      return;
    }

    // Each effect invocation gets its own cancelled flag.
    // Using a ref shared across invocations was broken under React StrictMode:
    // the second invocation would reset the flag, allowing the first (stale)
    // async loop to continue appending results alongside the second one.
    let cancelled = false;
    let processed = 0;

    const fetchAllFacilities = async () => {
      try {
        setLoading(true);
        setProgress(0);
        setLoadedCount(0);
        setResults([]);
        setError(null);

        const batchSize = 10;

        for (let i = 0; i < locations.length; i += batchSize) {
          if (cancelled) break;

          const batch = locations.slice(i, i + batchSize);

          const batchPromises = batch.map(loc =>
            fetch(
              `https://apihub.dbkl.gov.my/api/public/v1/location/facility?sub_category=${encodeURIComponent(sport)}&location_id=${loc.location_id}&search_date=${date}`
            )
              .then(res => {
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                return res.json();
              })
              .then(data => ({
                location_id: loc.location_id,
                location_name: loc.location_name,
                courts: (data.success && data.data?.data ? data.data.data : []) as LocationFacility[],
              }))
              .catch(() => ({
                location_id: loc.location_id,
                location_name: loc.location_name,
                courts: [] as LocationFacility[],
              }))
          );

          const batchResults = await Promise.all(batchPromises);

          if (!cancelled) {
            setResults(prev => [...prev, ...batchResults]);
            processed += batchResults.length;
            setLoadedCount(processed);
            setProgress(Math.round((processed / locations.length) * 100));
          }

          if (i + batchSize < locations.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        if (!cancelled) {
          setProgress(100);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch facilities');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAllFacilities();

    return () => {
      cancelled = true;
    };
  }, [locations, date, enabled, sport, refreshKey]);

  return { results, loading, progress, loadedCount, totalCount: locations.length, error };
}
