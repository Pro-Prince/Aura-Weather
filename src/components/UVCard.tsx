import React from 'react';
import { Sun } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface UVCardProps {
  uvIndex: number;
}

export function UVCard({ uvIndex }: UVCardProps) {
  let riskWord = 'Weakest';
  if (uvIndex >= 3 && uvIndex < 6) riskWord = 'Moderate';
  else if (uvIndex >= 6 && uvIndex < 8) riskWord = 'High';
  else if (uvIndex >= 8 && uvIndex < 11) riskWord = 'Very High';
  else if (uvIndex >= 11) riskWord = 'Extreme';

  const min = 0;
  const max = 11;
  let percentage = ((uvIndex - min) / (max - min)) * 100;
  percentage = Math.max(0, Math.min(100, percentage));

  return (
    <GlassCard className="p-4 flex flex-col justify-between h-[160px] relative overflow-hidden">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-slate-300">UV Index</span>
        <Sun className="w-5 h-5 text-slate-300" />
      </div>

      <div className="w-full mt-auto mb-2 relative">
        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-purple-500" />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border border-slate-200"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>

      <div className="flex flex-col mt-2">
        <div className="flex items-end leading-none mb-1 space-x-1">
          <span className="text-3xl font-bold text-white">{Math.round(uvIndex)}</span>
          <span className="text-sm font-medium text-slate-300 mb-0.5">Level</span>
        </div>
        <span className="text-sm font-medium text-slate-400">{riskWord}</span>
      </div>
    </GlassCard>
  );
}
