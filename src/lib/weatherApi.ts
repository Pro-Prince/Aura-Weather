export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  [key: string]: any;
}

export function isValidCoordinate(lat: any, lon: any): boolean {
  if (lat === null || lat === undefined || lon === null || lon === undefined) {
    return false;
  }
  const l = Number(lat);
  const r = Number(lon);
  return (
    !isNaN(l) &&
    !isNaN(r) &&
    l >= -90 &&
    l <= 90 &&
    r >= -180 &&
    r <= 180
  );
}

function buildUrl(baseUrl: string, params: Record<string, string | number | boolean>): string {
  const cleanParams: Record<string, string> = {};
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null) {
      cleanParams[key] = String(val);
    }
  }
  const urlParams = new URLSearchParams(cleanParams);
  return `${baseUrl}?${urlParams.toString()}`;
}

async function fetchWithTimeoutAndRetry(
  url: string,
  options: RequestInit = {},
  timeoutMs = 9000,
  maxRetries = 1
): Promise<Response> {
  let attempt = 0;
  while (true) {
    const controller = new AbortController();
    const { signal: parentSignal, ...restOptions } = options;

    let cleanupSignalListener: (() => void) | null = null;
    if (parentSignal) {
      if (parentSignal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      const listener = () => {
        controller.abort();
      };
      parentSignal.addEventListener('abort', listener);
      cleanupSignalListener = () => parentSignal.removeEventListener('abort', listener);
    }

    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        ...restOptions,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (cleanupSignalListener) cleanupSignalListener();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (err: any) {
      clearTimeout(timer);
      if (cleanupSignalListener) cleanupSignalListener();

      const isAbortFromParent = parentSignal?.aborted;
      if (isAbortFromParent) {
        throw err;
      }

      attempt++;
      if (attempt > maxRetries) {
        throw err;
      }
      console.warn(`Fetch failed for ${url}. Retrying attempt ${attempt}... Error:`, err);
    }
  }
}

export async function getForecast(lat: number, lon: number, signal?: AbortSignal) {
  if (!isValidCoordinate(lat, lon)) {
    throw new Error(`Invalid coordinates for forecast: lat=${lat}, lon=${lon}`);
  }

  const url = buildUrl('https://api.open-meteo.com/v1/forecast', {
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,surface_pressure,visibility,cloud_cover',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,moonrise,moonset',
    minutely_15: 'precipitation',
    past_days: 1,
    timezone: 'auto'
  });

  const res = await fetchWithTimeoutAndRetry(url, { signal });
  return res.json();
}

export async function getNowcast(lat: number, lon: number, signal?: AbortSignal) {
  if (!isValidCoordinate(lat, lon)) {
    throw new Error(`Invalid coordinates for nowcast: lat=${lat}, lon=${lon}`);
  }

  const url = buildUrl('https://api.open-meteo.com/v1/forecast', {
    latitude: lat,
    longitude: lon,
    minutely_15: 'precipitation',
    timezone: 'auto'
  });

  const res = await fetchWithTimeoutAndRetry(url, { signal });
  return res.json();
}

export async function getAirQuality(lat: number, lon: number, signal?: AbortSignal) {
  if (!isValidCoordinate(lat, lon)) {
    throw new Error(`Invalid coordinates for air quality: lat=${lat}, lon=${lon}`);
  }

  const url = buildUrl('https://air-quality-api.open-meteo.com/v1/air-quality', {
    latitude: lat,
    longitude: lon,
    current: 'us_aqi,pm2_5,pm10,sulphur_dioxide,carbon_monoxide',
    timezone: 'auto'
  });

  const res = await fetchWithTimeoutAndRetry(url, { signal });
  return res.json();
}

export async function getGeocoding(query: string, count = 10, signal?: AbortSignal): Promise<GeocodingResult[]> {
  if (!query || !query.trim()) {
    return [];
  }
  const url = buildUrl('https://geocoding-api.open-meteo.com/v1/search', {
    name: query.trim(),
    count: count
  });

  try {
    const res = await fetchWithTimeoutAndRetry(url, { signal });
    const data = await res.json();
    return data.results || [];
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.error('Geocoding error:', err);
    }
    throw err;
  }
}
