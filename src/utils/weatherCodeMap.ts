import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  Snowflake,
  CloudLightning,
  LucideIcon
} from 'lucide-react';

export function getWeatherCodeDetails(code: number): { label: string; Icon: LucideIcon } {
  if (code === 0) return { label: 'Clear', Icon: Sun };
  if (code === 1) return { label: 'Mainly Clear', Icon: Sun };
  if (code === 2) return { label: 'Partly Cloudy', Icon: CloudSun };
  if (code === 3) return { label: 'Overcast', Icon: Cloud };
  if (code === 45 || code === 48) return { label: 'Fog', Icon: CloudFog };
  if (code >= 51 && code <= 67) return { label: 'Rain', Icon: CloudRain };
  if (code >= 80 && code <= 82) return { label: 'Rain Showers', Icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: 'Snow', Icon: Snowflake };
  if (code === 85 || code === 86) return { label: 'Snow Showers', Icon: Snowflake };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', Icon: CloudLightning };
  
  return { label: 'Unknown', Icon: Sun };
}
