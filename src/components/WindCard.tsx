import React from 'react';
import { Wind } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getBeaufortForce, getWindDirection } from '../utils/wind';

interface WindCardProps {
  windSpeedKmH: number;
  windDirectionDeg: number;
}

export function WindCard({ windSpeedKmH, windDirectionDeg }: WindCardProps) {
  const dirLabel = getWindDirection(windDirectionDeg);
  const force = getBeaufortForce(windSpeedKmH);

  return (
    <GlassCard className="p-4 flex flex-col h-[160px] relative overflow-hidden">
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-medium text-slate-300">{dirLabel}</span>
        <Wind className="w-5 h-5 text-slate-300" />
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-dashed border-white/20 relative flex items-center justify-center">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium">N</span>
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium">S</span>
          <span className="absolute -right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">E</span>
          <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">W</span>

          <div className="flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-200">Force {force}</span>
          </div>

          <div 
            className="absolute inset-0 transition-transform duration-1000 ease-out"
            style={{ transform: `rotate(${windDirectionDeg}deg)` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 flex flex-col items-center">
              <div className="w-2 h-2 bg-white rotate-45 transform origin-center shadow-[0_0_8px_rgba(255,255,255,0.5)] border border-white" />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
