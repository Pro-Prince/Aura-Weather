import { useEffect, useCallback, useMemo } from 'react';
import { useWeatherContext, getCityId } from '../context/WeatherContext';

export function useWeather(
  coordinates: { lat?: number; lon?: number; name?: string } | null,
  skip: boolean = false
) {
  const { store, fetchWeather, getWeatherState } = useWeatherContext();
  
  const lat = coordinates?.lat !== undefined && coordinates?.lat !== null ? Number(coordinates.lat) : undefined;
  const lon = coordinates?.lon !== undefined && coordinates?.lon !== null ? Number(coordinates.lon) : undefined;
  const name = coordinates?.name;

  const key = useMemo(() => {
    if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
      return `${lat.toFixed(4)},${lon.toFixed(4)}`;
    }
    return name ? name.toLowerCase().trim() : 'unknown';
  }, [lat, lon, name]);

  const state = useMemo(() => {
    if (store[key]) {
      return store[key];
    }
    if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
      return getWeatherState({ name, lat, lon });
    }
    return {
      data: null,
      loading: false,
      error: null,
      isCached: false,
    };
  }, [store, key, lat, lon, name, getWeatherState]);

  const retry = useCallback(() => {
    if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
      fetchWeather({ name, lat, lon }, true);
    }
  }, [lat, lon, name, fetchWeather]);

  useEffect(() => {
    if (skip || lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
      return;
    }
    
    // Initial fetch
    fetchWeather({ name, lat, lon }, false);
    
    // Set up polling (every minute)
    const interval = setInterval(() => {
      fetchWeather({ name, lat, lon }, true); // Force update to bypass freshness check
    }, 60000);
    
    return () => clearInterval(interval);
  }, [lat, lon, name, skip, fetchWeather]);

  return {
    ...state,
    retry
  };
}
