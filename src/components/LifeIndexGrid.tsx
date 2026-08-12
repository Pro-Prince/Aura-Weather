import React from 'react';
import { Compass, Stars, Fish, Sailboat, Shirt, Bug } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { 
  computeOutdoorIndex, 
  computeStargazingIndex, 
  computeFishingIndex, 
  computeSailingIndex, 
  computeClothingIndex, 
  computeMosquitoIndex 
} from '../utils/lifeIndex';

interface LifeIndexGridProps {
  data: any;
}

export function LifeIndexGrid({ data }: LifeIndexGridProps) {
  if (!data || !data.current || !data.hourly) return null;

  // We need some current hour precipitation prob for outdoor index
  const nowTimeStr = data.current.time;
  const currentHourPrefix = nowTimeStr.substring(0, 13);
  let precipProb = 0;
  if (data.hourly && data.hourly.time && data.hourly.precipitation_probability) {
    const idx = data.hourly.time.findIndex((t: string) => t.startsWith(currentHourPrefix));
    if (idx !== -1) precipProb = data.hourly.precipitation_probability[idx];
  }

  const temp = data.current.temperature_2m ?? 0;
  const wind = data.current.wind_speed_10m ?? 0;
  const cloudCover = data.current.cloud_cover ?? 0;
  const pressure = data.current.surface_pressure ?? 1013;
  const feelsLike = data.current.apparent_temperature ?? temp;
  const humidity = data.current.relative_humidity_2m ?? 50;

  const indices = [
    { ...computeOutdoorIndex(temp, wind, precipProb), icon: Compass },
    { ...computeStargazingIndex(cloudCover), icon: Stars },
    { ...computeFishingIndex(pressure, wind), icon: Fish },
    { ...computeSailingIndex(wind), icon: Sailboat },
    { ...computeClothingIndex(feelsLike), icon: Shirt },
    { ...computeMosquitoIndex(temp, humidity), icon: Bug },
  ];

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {indices.map((item, idx) => {
          const Icon = item.icon;
          return (
            <GlassCard key={idx} className="p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-300">{item.category}</span>
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 flex items-end">
                <span className="text-base font-semibold text-white leading-tight">{item.label}</span>
              </div>
            </GlassCard>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-400 mt-2 opacity-60">
        Computed based on current weather conditions.
      </p>
    </div>
  );
}
