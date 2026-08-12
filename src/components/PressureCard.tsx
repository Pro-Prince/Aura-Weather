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
    <GlassCard className="p-4 flex flex-col justify-between h-[160px] relative overflow-hidden">
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-medium text-slate-300">Pressure</span>
        <Gauge className="w-5 h-5 text-slate-300" />
      </div>

      <div className="flex-1 flex items-center justify-center relative mt-4">
        {/* Semi-circle Gauge */}
        <div className="relative w-24 h-12 overflow-hidden flex justify-center">
          <div className="absolute top-0 w-24 h-24 rounded-full border-[6px] border-white/10" />
          <div className="absolute top-0 w-24 h-24 rounded-full border-[6px] border-t-white/30 border-l-white/30 border-r-transparent border-b-transparent" style={{ transform: 'rotate(-45deg)' }} />
          
          {/* Needle */}
          <div 
            className="absolute bottom-0 left-1/2 w-[2px] h-[40px] bg-white origin-bottom transition-transform duration-1000 ease-out"
            style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
          >
             <div className="w-1.5 h-1.5 bg-white rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          </div>
          {/* Center pivot */}
          <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-300 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col mt-auto">
        <div className="flex items-end leading-none mb-1">
          <span className="text-3xl font-bold text-white">{Math.round(pressureHpa)}</span>
          <span className="text-sm text-slate-300 ml-1 mb-0.5">hPa</span>
        </div>
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>
    </GlassCard>
  );
}
