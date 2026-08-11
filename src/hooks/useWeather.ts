import { useState, useEffect, useCallback } from 'react';

interface WeatherData {
  current: any;
  hourly: any;
  daily: any;
  [key: string]: any;
}

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export function useWeather(coordinates: { lat: number; lon: number } | null, skip: boolean = false) {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: true,
    error: null,
  });
  
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setRetryCount(c => c + 1);
  }, []);

  useEffect(() => {
    if (!coordinates || skip) return;

    let isMounted = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    const fetchWeather = async () => {
      try {
        const { lat, lon } = coordinates;
        const weatherParams = new URLSearchParams({
          latitude: lat.toString(),
          longitude: lon.toString(),
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index',
          hourly: 'temperature_2m,precipitation_probability,weather_code',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max',
          minutely_15: 'precipitation',
          timezone: 'auto'
        });

        const aqiParams = new URLSearchParams({
          latitude: lat.toString(),
          longitude: lon.toString(),
          current: 'us_aqi,pm2_5',
          timezone: 'auto'
        });

        const [weatherResponse, aqiResponse] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`),
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${aqiParams.toString()}`)
        ]);
        
        if (!weatherResponse.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await weatherResponse.json();
        
        // AQI might fail or be unavailable for some locations, we shouldn't break the whole app
        if (aqiResponse.ok) {
          const aqiData = await aqiResponse.json();
          data.air_quality = aqiData.current;
        }
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error: any) {
        if (isMounted) {
          setState({ data: null, loading: false, error: error.message || 'Unknown error occurred' });
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [coordinates, retryCount]);

  return { ...state, retry };
}
