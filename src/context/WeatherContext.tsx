import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import defaultWeather from '../utils/defaultWeather.json';
import { getForecast, getAirQuality, isValidCoordinate } from '../lib/weatherApi';

export interface WeatherData {
  current: any;
  hourly: any;
  daily: any;
  air_quality?: any;
  minutely_15?: any;
  [key: string]: any;
}

export interface WeatherStoreEntry {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  isCached: boolean;
  lastUpdated?: number;
}

export function getCityId(loc: { name?: string; lat?: number; lon?: number } | null | undefined): string {
  if (!loc) return 'unknown';
  if (
    loc.lat !== undefined && 
    loc.lon !== undefined && 
    loc.lat !== null && 
    loc.lon !== null && 
    !isNaN(Number(loc.lat)) && 
    !isNaN(Number(loc.lon))
  ) {
    return `${Number(loc.lat).toFixed(4)},${Number(loc.lon).toFixed(4)}`;
  }
  return loc.name ? loc.name.toLowerCase().trim() : 'unknown';
}

interface WeatherContextType {
  store: Record<string, WeatherStoreEntry>;
  fetchWeather: (
    location: { name?: string; lat?: number; lon?: number },
    force?: boolean
  ) => Promise<void>;
  getWeatherState: (location: { name?: string; lat?: number; lon?: number }) => WeatherStoreEntry;
}

const WeatherContext = createContext<WeatherContextType | null>(null);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Record<string, WeatherStoreEntry>>({});
  const storeRef = useRef<Record<string, WeatherStoreEntry>>({});
  storeRef.current = store;
  
  // Track active in-flight fetches to prevent duplicate concurrent API calls for the same city
  const activeFetches = useRef<Record<string, Promise<void>>>({});

  const getWeatherState = useCallback((location: { name?: string; lat?: number; lon?: number }): WeatherStoreEntry => {
    const key = getCityId(location);
    const entry = storeRef.current[key];
    if (entry) return entry;

    // Check localStorage cache for initial instant render
    const lat = location.lat !== undefined && location.lat !== null ? Number(location.lat) : null;
    const lon = location.lon !== undefined && location.lon !== null ? Number(location.lon) : null;
    let initialData: WeatherData | null = null;
    let isCached = false;

    if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
      const cacheKey = `aura_cache_${lat.toFixed(4)}_${lon.toFixed(4)}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          initialData = JSON.parse(cached);
          isCached = true;
        } catch (e) {}
      }
    }

    if (!initialData) {
      const lastWeather = localStorage.getItem('aura-last-weather');
      if (lastWeather) {
        try {
          initialData = JSON.parse(lastWeather);
          isCached = true;
        } catch (e) {}
      }
    }

    return {
      data: initialData,
      loading: false,
      error: null,
      isCached,
    };
  }, []);

  const fetchWeather = useCallback(async (
    location: { name?: string; lat?: number; lon?: number },
    force = false
  ) => {
    const key = getCityId(location);
    const lat = location.lat !== undefined && location.lat !== null ? Number(location.lat) : null;
    const lon = location.lon !== undefined && location.lon !== null ? Number(location.lon) : null;

    if (lat === null || lon === null || isNaN(lat) || isNaN(lon) || !isValidCoordinate(lat, lon)) {
      return;
    }

    const cacheKey = `aura_cache_${lat.toFixed(4)}_${lon.toFixed(4)}`;
    const tsKey = `aura_cache_ts_${lat.toFixed(4)}_${lon.toFixed(4)}`;
    const now = Date.now();
    const CACHE_FRESHNESS_DURATION = 10 * 60 * 1000; // 10 minutes

    const existing = storeRef.current[key];
    
    // Check if live data in memory is fresh
    if (!force && existing && existing.data && existing.lastUpdated && (now - existing.lastUpdated) < CACHE_FRESHNESS_DURATION) {
      return;
    }

    // Check if localStorage cache is fresh
    const cachedTs = localStorage.getItem(tsKey);
    if (!force && cachedTs && (now - Number(cachedTs)) < CACHE_FRESHNESS_DURATION) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setStore(prev => {
            if (prev[key]?.data && prev[key]?.lastUpdated === Number(cachedTs)) {
              return prev;
            }
            return {
              ...prev,
              [key]: {
                data: cachedData,
                loading: false,
                error: null,
                isCached: false,
                lastUpdated: Number(cachedTs)
              }
            };
          });
          return;
        } catch (e) {}
      }
    }

    // De-duplicate in-flight requests for the exact same city
    if (activeFetches.current[key]) {
      return activeFetches.current[key];
    }

    // Set loading state in central store
    setStore(prev => {
      if (prev[key]?.loading) return prev;
      return {
        ...prev,
        [key]: {
          ...(prev[key] || getWeatherState(location)),
          loading: true,
          error: null,
        }
      };
    });

    const fetchPromise = (async () => {
      const abortController = new AbortController();
      try {
        const [forecastData, airQualityData] = await Promise.all([
          getForecast(lat, lon, abortController.signal),
          getAirQuality(lat, lon, abortController.signal)
        ]);

        const mergedData: WeatherData = {
          ...forecastData,
          air_quality: airQualityData?.current || null,
          minutely_15: forecastData?.minutely_15 || null,
        };

        try {
          localStorage.setItem(cacheKey, JSON.stringify(mergedData));
          localStorage.setItem(tsKey, String(now));
          localStorage.setItem('aura-last-weather', JSON.stringify(mergedData));
        } catch (e) {
          console.warn('Failed to save to localStorage:', e);
        }

        setStore(prev => ({
          ...prev,
          [key]: {
            data: mergedData,
            loading: false,
            error: null,
            isCached: false,
            lastUpdated: now
          }
        }));
      } catch (error: any) {
        console.warn('Weather fetch failed, attempting cache fallback:', error);

        let fallbackData: WeatherData | null = null;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            fallbackData = JSON.parse(cached);
          } catch (e) {}
        }

        if (!fallbackData) {
          const lastWeather = localStorage.getItem('aura-last-weather');
          if (lastWeather) {
            try {
              fallbackData = JSON.parse(lastWeather);
            } catch (e) {}
          }
        }

        if (!fallbackData) {
          fallbackData = defaultWeather as WeatherData;
        }

        setStore(prev => ({
          ...prev,
          [key]: {
            data: fallbackData,
            loading: false,
            error: `Could not fetch live weather. Showing cached data.`,
            isCached: true,
            lastUpdated: Number(cachedTs) || (now - CACHE_FRESHNESS_DURATION - 1000)
          }
        }));
      } finally {
        delete activeFetches.current[key];
      }
    })();

    activeFetches.current[key] = fetchPromise;
    await fetchPromise;
  }, [getWeatherState]);

  const contextValue = useMemo(() => ({
    store,
    fetchWeather,
    getWeatherState
  }), [store, fetchWeather, getWeatherState]);

  return (
    <WeatherContext.Provider value={contextValue}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeatherContext() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeatherContext must be used within a WeatherProvider');
  }
  return context;
}
