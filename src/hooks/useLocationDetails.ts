import { useState, useEffect } from 'react';
import { isValidMalaysiaCoord } from '../utils/distance';
import { geocodeByName } from '../utils/geocoding';

export interface LocationDetail {
  location_id: string;
  lat: number;
  lng: number;
  parliment_id: string;
  parliment_name: string;
  location_name?: string; // For geocoding fallback
}

const CACHE_KEY = 'dbkl_location_details_v2';

function loadCache(): Map<string, LocationDetail> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return new Map(JSON.parse(raw));
  } catch { /* corrupt cache — ignore */ }
  return new Map();
}

function saveCache(cache: Map<string, LocationDetail>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify([...cache.entries()]));
  } catch { /* storage full — ignore */ }
}

// Shared in-memory cache for the lifetime of the session (faster than localStorage reads per item)
const memCache = loadCache();

// Fetch location detail (lat/lng + parliment_id) then parliment name, with a delay between requests
// If coordinates are bad, try to geocode using venue name as fallback.
async function fetchLocationDetail(locationId: string): Promise<LocationDetail | null> {
  try {
    const locRes = await fetch(`https://apihub.dbkl.gov.my/api/public/v1/location?id=${locationId}`);
    if (!locRes.ok) return null;
    const locData = await locRes.json();
    const loc = locData?.data?.data?.[0];
    if (!loc) return null;

    let lat = parseFloat(loc.latitude);
    let lng = parseFloat(loc.longitude);
    const locationName = String(loc.location_name ?? '');
    const parlimentId = String(loc.parliment_id ?? '');

    // Validate coordinates. If bad, try to geocode using location name.
    if (!isValidMalaysiaCoord(lat, lng)) {
      const geocoded = await geocodeByName(locationName, 'Kuala Lumpur');
      if (geocoded) {
        lat = geocoded.lat;
        lng = geocoded.lng;
      } else {
        // Coordinates are bad and geocoding failed. Skip this location's distance.
        return { location_id: locationId, lat: NaN, lng: NaN, parliment_id: parlimentId, parliment_name: '', location_name: locationName };
      }
    }

    let parlimentName = '';
    if (parlimentId) {
      await new Promise(r => setTimeout(r, 100)); // rate-limit between calls
      const parlRes = await fetch(`https://apihub.dbkl.gov.my/api/public/v1/parliment?id=${parlimentId}`);
      if (parlRes.ok) {
        const parlData = await parlRes.json();
        parlimentName = parlData?.data?.[0]?.name ?? '';
      }
    }

    return { location_id: locationId, lat, lng, parliment_id: parlimentId, parliment_name: parlimentName, location_name: locationName };
  } catch {
    return null;
  }
}

export function useLocationDetails(locationIds: string[]): Map<string, LocationDetail> {
  const [details, setDetails] = useState<Map<string, LocationDetail>>(new Map(memCache));

  useEffect(() => {
    if (locationIds.length === 0) return;

    let cancelled = false;

    const missingIds = locationIds.filter(id => !memCache.has(id));
    if (missingIds.length === 0) return;

    const fetchMissing = async () => {
      // Batch: fetch 5 at a time with 150ms delay between batches to stay under rate limits
      const batchSize = 5;
      for (let i = 0; i < missingIds.length; i += batchSize) {
        if (cancelled) break;
        const batch = missingIds.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(fetchLocationDetail));
        if (cancelled) break;

        let changed = false;
        results.forEach((detail, idx) => {
          if (detail) {
            memCache.set(batch[idx], detail);
            changed = true;
          }
        });

        if (changed) {
          saveCache(memCache);
          setDetails(new Map(memCache));
        }

        if (i + batchSize < missingIds.length) {
          await new Promise(r => setTimeout(r, 150));
        }
      }
    };

    fetchMissing();
    return () => { cancelled = true; };
  }, [locationIds.join(',')]); // stable dependency: join the ids into a string

  return details;
}
