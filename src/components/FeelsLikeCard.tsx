import React from 'react';
import { Thermometer } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { convertTemp, TempUnit } from '../utils/convertTemp';
import { AnimatedTemp } from './AnimatedTemp';

interface FeelsLikeCardProps {
  currentApparentTempC: number;
  unit: TempUnit;
}

export function FeelsLikeCard({ currentApparentTempC, unit }: FeelsLikeCardProps) {
  const displayTemp = convertTemp(currentApparentTempC, unit);
  
  let label = 'Cold';
  if (currentApparentTempC >= 10 && currentApparentTempC < 20) label = 'Cool';
  else if (currentApparentTempC >= 20 && currentApparentTempC < 27) label = 'Warm';
  else if (currentApparentTempC >= 27) label = 'Hot';

  const min = -10;
  const max = 40;
  let percentage = ((currentApparentTempC - min) / (max - min)) * 100;
  percentage = Math.max(0, Math.min(100, percentage));

  return (
    <GlassCard className="p-4 sm:p-6 flex flex-col justify-between min-h-[192px] relative">
      <div className="flex items-center space-x-1.5 mb-3">
        <Thermometer className="w-[18px] h-[18px] text-slate-300" strokeWidth={1.5} />
        <span className="type-card-title text-[14px] font-medium text-white">Feels like</span>
      </div>

      <div className="w-full my-auto py-2 relative">
        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500" />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border border-slate-200"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>

      <div className="flex flex-col mt-auto pt-2">
        <div className="flex items-baseline leading-none mb-1">
          <span className="type-stat-lg text-3xl text-white">
            <AnimatedTemp value={displayTemp} />&deg;{unit}
          </span>
        </div>
        <span className="type-body text-sm text-slate-300 leading-normal">{label}</span>
      </div>
    </GlassCard>
  );
}
