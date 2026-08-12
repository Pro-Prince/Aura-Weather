import React from 'react';
import { Droplets } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface HumidityCardProps {
  humidity: number;
}

export function HumidityCard({ humidity }: HumidityCardProps) {
  let label = 'Comfortable';
  if (humidity < 30) label = 'Dry';
  else if (humidity > 60) label = 'Damp';

  return (
    <GlassCard className="p-4 flex flex-col justify-between h-[160px] relative overflow-hidden">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-slate-300">Humidity</span>
        <Droplets className="w-5 h-5 text-slate-300" />
      </div>

      <div className="flex flex-col mt-auto">
        <div className="flex items-start leading-none mb-1">
          <span className="text-4xl font-bold text-white">{Math.round(humidity)}</span>
          <span className="text-lg text-white ml-0.5 mt-1">%</span>
        </div>
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>
    </GlassCard>
  );
}
