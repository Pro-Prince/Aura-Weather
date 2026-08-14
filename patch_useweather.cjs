const fs = require('fs');
let code = fs.readFileSync('src/hooks/useWeather.ts', 'utf8');

const replacement = `import { useState, useEffect, useCallback } from 'react';
import defaultWeather from '../utils/defaultWeather.json';

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
  const [state, setState] = useState<WeatherState>(() => {
    let initialData = null;
    if (coordinates) {
      const cacheKey = \`aura_cache_\${coordinates.lat}_\${coordinates.lon}\`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try { initialData = JSON.parse(cached); } catch(e) {}
      }
    }
    if (!initialData) {
      const lastWeather = localStorage.getItem('aura-last-weather');
      if (lastWeather) {
        try { initialData = JSON.parse(lastWeather); } catch(e) {}
      }
    }
    if (!initialData) {
      initialData = defaultWeather;
    }
    return {
      data: initialData,
      loading: !skip,
      error: null,
    };
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
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,surface_pressure,visibility,cloud_cover',
          hourly: 'temperature_2m,precipitation_probability,weather_code',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,moonrise,moonset',
          minutely_15: 'precipitation',
          past_days: '1',
          timezone: 'auto'
        });

        const aqiParams = new URLSearchParams({
          latitude: lat.toString(),
          longitude: lon.toString(),
          current: 'us_aqi,pm2_5,pm10,sulphur_dioxide,carbon_monoxide',
          timezone: 'auto'
        });

        const [weatherResponse, aqiResponse] = await Promise.all([
          fetch(\`https://api.open-meteo.com/v1/forecast?\${weatherParams.toString()}\`),
          fetch(\`https://air-quality-api.open-meteo.com/v1/air-quality?\${aqiParams.toString()}\`)
        ]);
        
        if (!weatherResponse.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await weatherResponse.json();
        
        if (aqiResponse.ok) {
          const aqiData = await aqiResponse.json();
          data.air_quality = aqiData.current;
        }

        if (isMounted) {
          const cacheKey = \`aura_cache_\${lat}_\${lon}\`;
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem('aura-last-weather', JSON.stringify(data));
          setState({ data, loading: false, error: null });
        }
      } catch (error: any) {
        if (isMounted) {
          setState(prev => ({ ...prev, loading: false, error: error.message || 'Unknown error occurred' }));
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [coordinates, retryCount, skip]);

  return { ...state, retry };
}
`;

fs.writeFileSync('src/hooks/useWeather.ts', replacement);
