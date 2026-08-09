import { useState, useEffect } from 'react';

interface GeolocationState {
  coordinates: { lat: number; lon: number } | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}

// Fallback to London
const FALLBACK_COORDS = { lat: 51.5074, lon: -0.1278 };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: true,
    error: null,
    isFallback: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: FALLBACK_COORDS,
        loading: false,
        error: 'Geolocation is not supported by your browser',
        isFallback: true,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          loading: false,
          error: null,
          isFallback: false,
        });
      },
      (error) => {
        let errorMessage = 'Failed to retrieve location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied';
        }
        setState({
          coordinates: FALLBACK_COORDS,
          loading: false,
          error: errorMessage,
          isFallback: true,
        });
      },
      { timeout: 10000 }
    );
  }, []);

  return state;
}
