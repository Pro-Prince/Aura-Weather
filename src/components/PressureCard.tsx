import React from 'react';
import { Gauge } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface PressureCardProps {
  pressureHpa: number;
}

export function PressureCard({ pressureHpa }: PressureCardProps) {
  let label = 'Average';
  if (pressureHpa < 1000) label = 'Low';
  else if (pressureHpa > 1020) label = 'High';

  const min = 970;
  const max = 1050;
  let percentage = ((pressureHpa - min) / (max - min)) * 100;
  percentage = Math.max(0, Math.min(100, percentage));
  
  // Semi-circle rotate from -90 to 90
  const angle = (percentage / 100) * 180 - 90;

  return (
    <GlassCard className="p-4 sm:p-6 flex flex-col justify-between min-h-[192px] relative">
      <div className="flex items-center space-x-1.5 mb-3">
        <Gauge className="w-[18px] h-[18px] text-slate-300" strokeWidth={1.5} />
        <span className="type-card-title text-[14px] font-medium text-white">Pressure</span>
      </div>

      <div className="flex-1 flex items-center justify-center w-full relative my-2">
        {/* Semi-circle Gauge */}
        <div className="relative w-24 h-12 overflow-hidden flex justify-center">
          <div className="absolute top-0 w-24 h-24 rounded-full border-[5px] border-white/10" />
          <div className="absolute top-0 w-24 h-24 rounded-full border-[5px] border-t-white/40 border-l-white/40 border-r-transparent border-b-transparent" style={{ transform: 'rotate(-45deg)' }} />
          
          {/* Needle */}
          <div 
            className="absolute bottom-0 left-1/2 w-[2px] h-[38px] bg-white origin-bottom transition-transform duration-1000 ease-out"
            style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
          >
             <div className="w-1.5 h-1.5 bg-white rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          </div>
          {/* Center pivot */}
          <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-200 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col mt-auto pt-2">
        <div className="flex items-baseline leading-none mb-1">
          <span className="type-stat-lg text-3xl text-white">{Math.round(pressureHpa)}</span>
          <span className="type-stat text-sm text-slate-400 ml-1.5">hPa</span>
        </div>
        <span className="type-body text-sm text-slate-300 leading-normal">{label}</span>
      </div>
    </GlassCard>
  );
}
