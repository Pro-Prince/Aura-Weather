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
    <GlassCard className="p-4 sm:p-6 flex flex-col justify-between min-h-[192px] relative">
      <div className="flex items-center space-x-1.5 mb-3">
        <Sun className="w-[18px] h-[18px] text-slate-300" strokeWidth={1.5} />
        <span className="type-card-title text-[14px] font-medium text-white">UV index</span>
      </div>

      <div className="w-full my-auto py-2 relative">
        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-purple-500" />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border border-slate-200"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>

      <div className="flex flex-col mt-auto pt-2">
        <div className="flex items-baseline leading-none mb-1">
          <span className="type-stat-lg text-3xl text-white">{Math.round(uvIndex)}</span>
        </div>
        <span className="type-body text-sm text-slate-300 leading-normal">{riskWord}</span>
      </div>
    </GlassCard>
  );
}
