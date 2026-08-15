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
    <GlassCard className="p-4 sm:p-6 flex flex-col justify-between min-h-[192px] relative">
      <div className="flex items-center space-x-1.5 mb-3">
        <Wind className="w-[18px] h-[18px] text-slate-300" strokeWidth={1.5} />
        <span className="type-card-title text-[14px] font-medium text-white">Wind</span>
      </div>

      <div className="flex-1 flex items-center justify-center w-full relative my-2">
        <div className="w-20 h-20 rounded-full border border-dashed border-white/20 relative flex items-center justify-center">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium font-sans">N</span>
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium font-sans">S</span>
          <span className="absolute -right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium font-sans">E</span>
          <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium font-sans">W</span>

          <div className="flex flex-col items-center">
            <span className="type-caption font-medium font-numeric text-slate-200">Force {force}</span>
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

      <div className="flex flex-col mt-auto pt-2">
        <div className="flex items-baseline leading-none mb-1">
          <span className="type-stat-lg text-3xl text-white">{Math.round(windSpeedKmH)}</span>
          <span className="type-stat text-sm text-slate-400 ml-1.5">km/h</span>
        </div>
        <span className="type-body text-sm text-slate-300 leading-normal">{dirLabel}</span>
      </div>
    </GlassCard>
  );
}
