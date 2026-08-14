export type WeatherPreset = 
  | 'none' 
  | 'fog' 
  | 'drizzle' 
  | 'freezing_drizzle' 
  | 'rain' 
  | 'freezing_rain' 
  | 'snow' 
  | 'thunderstorm';

export interface VisualState {
  preset: WeatherPreset;
  intensity: 'low' | 'medium' | 'high';
  intensityFactor: number; // Continuous 0.15 to 1.5 scaling
  precipRate: number; // mm/hr
  isFreezing: boolean;
  isThunderstorm: boolean;
  driftAngle: number;
  cloudOpacity: number;
  timeOfDayProgress: number;
}

export function getWeatherVisualState(
  current: any,
  daily: any
): VisualState {
  if (!current || !daily) {
    return { 
      preset: 'none', 
      intensity: 'low', 
      intensityFactor: 0.2, 
      precipRate: 0,
      isFreezing: false,
      isThunderstorm: false,
      driftAngle: 0, 
      cloudOpacity: 0, 
      timeOfDayProgress: 0.5 
    };
  }

  const { weather_code, cloud_cover, precipitation, wind_speed_10m, wind_direction_10m, time, is_day } = current;
  const sunriseStr = daily.sunrise?.[0];
  const sunsetStr = daily.sunset?.[0];

  let timeOfDayProgress = is_day ? 0.5 : 0.0;
  
  if (time && sunriseStr && sunsetStr) {
     const nowDate = new Date(time);
     const nowMs = nowDate.getHours() * 3600000 + nowDate.getMinutes() * 60000 + nowDate.getSeconds() * 1000;

     const sunriseDate = new Date(sunriseStr);
     const sunriseMs = sunriseDate.getHours() * 3600000 + sunriseDate.getMinutes() * 60000;

     const sunsetDate = new Date(sunsetStr);
     const sunsetMs = sunsetDate.getHours() * 3600000 + sunsetDate.getMinutes() * 60000;

     const noonMs = sunriseMs + (sunsetMs - sunriseMs) / 2;
     const midnightMs = 24 * 3600000;

     if (nowMs < sunriseMs) {
         // Midnight to Sunrise (Night -> Dawn)
         timeOfDayProgress = (nowMs / sunriseMs) * 0.25;
     } else if (nowMs >= sunriseMs && nowMs < noonMs) {
         // Sunrise to Solar Noon (Dawn -> Day)
         timeOfDayProgress = 0.25 + ((nowMs - sunriseMs) / (noonMs - sunriseMs)) * 0.25;
     } else if (nowMs >= noonMs && nowMs <= sunsetMs) {
         // Solar Noon to Sunset (Day -> Dusk)
         timeOfDayProgress = 0.5 + ((nowMs - noonMs) / (sunsetMs - noonMs)) * 0.25;
     } else {
         // Sunset to Midnight (Dusk -> Night)
         timeOfDayProgress = 0.75 + ((nowMs - sunsetMs) / (midnightMs - sunsetMs)) * 0.25;
     }
  }

  let preset: WeatherPreset = 'none';
  let isFreezing = false;
  let isThunderstorm = false;
  let defaultPrecipRate = 0;
  let codeCloudOpacity: number | null = null;
  
  const code = weather_code !== undefined && weather_code !== null ? Number(weather_code) : 0;

  switch (code) {
    case 0: // Clear sky
      preset = 'none';
      codeCloudOpacity = 0.02;
      break;
    case 1: // Mainly clear
      preset = 'none';
      codeCloudOpacity = 0.2;
      break;
    case 2: // Partly cloudy
      preset = 'none';
      codeCloudOpacity = 0.5;
      break;
    case 3: // Overcast
      preset = 'none';
      codeCloudOpacity = 0.95;
      break;
    case 45: // Fog
    case 48: // Depositing rime fog
      preset = 'fog';
      codeCloudOpacity = 0.85;
      break;
    case 51: // Drizzle: light
      preset = 'drizzle';
      defaultPrecipRate = 0.4;
      break;
    case 53: // Drizzle: moderate
      preset = 'drizzle';
      defaultPrecipRate = 0.9;
      break;
    case 55: // Drizzle: dense
      preset = 'drizzle';
      defaultPrecipRate = 1.6;
      break;
    case 56: // Freezing drizzle: light
      preset = 'freezing_drizzle';
      isFreezing = true;
      defaultPrecipRate = 0.5;
      break;
    case 57: // Freezing drizzle: dense
      preset = 'freezing_drizzle';
      isFreezing = true;
      defaultPrecipRate = 1.6;
      break;
    case 61: // Rain: slight
      preset = 'rain';
      defaultPrecipRate = 1.2;
      break;
    case 63: // Rain: moderate
      preset = 'rain';
      defaultPrecipRate = 4.0;
      break;
    case 65: // Rain: heavy
      preset = 'rain';
      defaultPrecipRate = 9.0;
      break;
    case 66: // Freezing rain: light
      preset = 'freezing_rain';
      isFreezing = true;
      defaultPrecipRate = 1.5;
      break;
    case 67: // Freezing rain: heavy
      preset = 'freezing_rain';
      isFreezing = true;
      defaultPrecipRate = 8.0;
      break;
    case 71: // Snow fall: slight
      preset = 'snow';
      defaultPrecipRate = 0.8;
      break;
    case 73: // Snow fall: moderate
      preset = 'snow';
      defaultPrecipRate = 2.5;
      break;
    case 75: // Snow fall: heavy
      preset = 'snow';
      defaultPrecipRate = 6.0;
      break;
    case 77: // Snow grains
      preset = 'snow';
      defaultPrecipRate = 1.0;
      break;
    case 80: // Rain showers: slight
      preset = 'rain';
      defaultPrecipRate = 1.5;
      break;
    case 81: // Rain showers: moderate
      preset = 'rain';
      defaultPrecipRate = 4.5;
      break;
    case 82: // Rain showers: violent
      preset = 'rain';
      defaultPrecipRate = 12.0;
      break;
    case 85: // Snow showers: slight
      preset = 'snow';
      defaultPrecipRate = 1.2;
      break;
    case 86: // Snow showers: heavy
      preset = 'snow';
      defaultPrecipRate = 5.5;
      break;
    case 95: // Thunderstorm
      preset = 'thunderstorm';
      isThunderstorm = true;
      defaultPrecipRate = 8.0;
      break;
    case 96: // Thunderstorm with slight hail
      preset = 'thunderstorm';
      isThunderstorm = true;
      defaultPrecipRate = 12.0;
      break;
    case 99: // Thunderstorm with heavy hail
      preset = 'thunderstorm';
      isThunderstorm = true;
      defaultPrecipRate = 16.0;
      break;
    default:
      preset = 'none';
      break;
  }

  // Calculate actual precipitation rate (interpolate real API value with code baseline)
  const apiPrecip = typeof precipitation === 'number' && !isNaN(precipitation) ? precipitation : 0;
  const precipRate = Math.max(apiPrecip, defaultPrecipRate);

  // Intensity categorization
  let intensity: 'low' | 'medium' | 'high' = 'low';
  if (precipRate > 5.0) {
    intensity = 'high';
  } else if (precipRate > 1.0) {
    intensity = 'medium';
  }

  // Continuous intensity factor from 0.15 (very light) to 1.5 (extreme)
  // Maps 0 mm/h -> 0.2, 1 mm/h -> 0.45, 4 mm/h -> 0.8, 10 mm/h -> 1.2, 15+ mm/h -> 1.5
  const intensityFactor = Math.min(1.5, Math.max(0.15, 0.2 + Math.sqrt(precipRate) * 0.35));

  let driftAngle = 0;
  if (wind_speed_10m > 0 && wind_direction_10m !== undefined) {
     const windRad = (wind_direction_10m * Math.PI) / 180;
     driftAngle = Math.sin(windRad) * Math.min(1, wind_speed_10m / 20); 
  }

  // Cloud opacity combining cloud_cover metric and WMO baseline
  let cloudOpacity = Math.max(0, Math.min(1, (cloud_cover || 0) / 100));
  if (codeCloudOpacity !== null) {
    cloudOpacity = Math.max(cloudOpacity, codeCloudOpacity);
  }
  if (preset === 'thunderstorm' || preset === 'rain' || preset === 'freezing_rain') {
    cloudOpacity = Math.max(cloudOpacity, 0.85);
  }

  return {
    preset,
    intensity,
    intensityFactor,
    precipRate,
    isFreezing,
    isThunderstorm,
    driftAngle,
    cloudOpacity,
    timeOfDayProgress
  };
}
