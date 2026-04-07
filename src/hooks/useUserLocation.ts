import { useState, useEffect } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseUserLocationReturn {
  coords: Coordinates | null;
  error: string | null;
  loading: boolean;
}

export function useUserLocation(): UseUserLocationReturn {
  const geolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(geolocationSupported ? null : 'Geolocation not supported by this browser');
  const [loading, setLoading] = useState(geolocationSupported);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Geolocation request timed out');
    }, 10000); // 10 second timeout

    navigator.geolocation.getCurrentPosition(
      position => {
        clearTimeout(timeoutId);
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError(null);
        setLoading(false);
      },
      err => {
        clearTimeout(timeoutId);
        // User denied permission or error occurred
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission denied');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Location unavailable');
        } else if (err.code === err.TIMEOUT) {
          setError('Location request timed out');
        } else {
          setError('Failed to get user location');
        }
        setLoading(false);
      },
      {
        timeout: 10000,
        maximumAge: 3600000, // Cache location for 1 hour
      }
    );
  }, []);

  return { coords, error, loading };
}
