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
    <GlassCard className="p-4 sm:p-6 flex flex-col justify-between min-h-[192px] relative">
      <div className="flex items-center space-x-1.5 mb-3">
        <Droplets className="w-[18px] h-[18px] text-slate-300" strokeWidth={1.5} />
        <span className="type-card-title text-[14px] font-medium text-white">Humidity</span>
      </div>

      <div className="flex-1 flex items-center justify-center relative my-2">
        {/* Subtle decorative visual moisture level bar */}
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-sky-400/50 to-sky-400 transition-all duration-700" 
            style={{ width: `${Math.min(100, Math.max(0, humidity))}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col mt-auto pt-2">
        <div className="flex items-baseline leading-none mb-1">
          <span className="type-stat-lg text-3xl text-white">{Math.round(humidity)}%</span>
        </div>
        <span className="type-body text-sm text-slate-300 leading-normal">{label}</span>
      </div>
    </GlassCard>
  );
}
