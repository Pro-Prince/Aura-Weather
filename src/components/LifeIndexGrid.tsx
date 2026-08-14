import React from 'react';
import { Bike, Satellite, Fish, Sailboat, Pill, Bug } from 'lucide-react';
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
    { ...computeOutdoorIndex(temp, wind, precipProb), icon: Bike },
    { ...computeStargazingIndex(cloudCover), icon: Satellite },
    { ...computeFishingIndex(pressure, wind), icon: Fish },
    { ...computeSailingIndex(wind), icon: Sailboat },
    { ...computeClothingIndex(feelsLike), icon: Pill },
    { ...computeMosquitoIndex(temp, humidity), icon: Bug },
  ];

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {indices.map((item, idx) => {
          const Icon = item.icon;
          return (
            <GlassCard key={idx} className="p-3 sm:p-4 flex flex-col items-center justify-between min-h-[120px] sm:min-h-[140px] text-center relative group">
              <div className="flex flex-col items-center space-y-1.5 sm:space-y-2 mt-1 sm:mt-2">
                <Icon className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] text-white mx-auto" strokeWidth={2} />
                <span className="type-card-title text-[13px] sm:text-[14px] font-semibold text-white tracking-tight leading-tight">{item.category}</span>
              </div>
              <div className="pb-0.5 sm:pb-1 mt-auto pt-3 sm:pt-4">
                <span className="type-caption text-[12px] sm:text-[13px] font-medium text-slate-300">{item.label}</span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
