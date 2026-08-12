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
    <GlassCard className="p-4 flex flex-col justify-between h-[160px] relative overflow-hidden">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-slate-300">Feels like</span>
        <Thermometer className="w-5 h-5 text-slate-300" />
      </div>

      <div className="w-full mt-auto mb-2 relative">
        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500" />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border border-slate-200"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>

      <div className="flex flex-col mt-2">
        <div className="flex items-start leading-none mb-1">
          <span className="text-3xl font-bold text-white"><AnimatedTemp value={displayTemp} /></span>
          <span className="text-sm text-white ml-1 mt-1">&deg;{unit}</span>
        </div>
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>
    </GlassCard>
  );
}
