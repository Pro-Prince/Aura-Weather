import React from 'react';
import { Eye } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface VisibilityCardProps {
  visibilityMeters: number;
}

export function VisibilityCard({ visibilityMeters }: VisibilityCardProps) {
  const km = visibilityMeters / 1000;
  let label = 'Normal';
  if (km < 2) label = 'Poor';
  else if (km >= 10) label = 'Good';

  return (
    <GlassCard className="p-4 flex flex-col justify-between h-[160px] relative overflow-hidden">
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-medium text-slate-300">Visibility</span>
        <Eye className="w-5 h-5 text-slate-300" />
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {/* Simple fan-shaped dot graphic */}
        <div className="w-16 h-12 relative flex items-end justify-center overflow-hidden mb-2">
            <div className="w-2 h-2 rounded-full bg-white absolute bottom-0 z-10 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <div className="w-8 h-8 border-[3px] border-t-white/30 border-l-white/30 border-r-white/30 border-b-transparent rounded-t-full absolute bottom-1" />
            <div className="w-14 h-14 border-[3px] border-dashed border-t-white/10 border-l-white/10 border-r-white/10 border-b-transparent rounded-t-full absolute bottom-1" />
        </div>
      </div>

      <div className="flex flex-col mt-auto">
        <div className="flex items-end leading-none mb-1">
          <span className="text-3xl font-bold text-white">{km.toFixed(1).replace(/\.0$/, '')}</span>
          <span className="text-sm text-slate-300 ml-1 mb-0.5">km</span>
        </div>
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>
    </GlassCard>
  );
}
