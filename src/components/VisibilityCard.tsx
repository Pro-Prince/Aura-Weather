import React from 'react';
import { Eye } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface VisibilityCardProps {
  visibilityMeters: number;
}

export function VisibilityCard({ visibilityMeters }: VisibilityCardProps) {
  const km = Math.max(0, visibilityMeters / 1000);
  
  let label = 'Normal';
  if (km < 2) label = 'Poor';
  else if (km >= 10) label = 'Excellent';
  else if (km >= 5) label = 'Good';

  // Normalize visibility range (0 to 15km+) for the visual fan radius
  const maxRadius = 42;
  const minRadius = 14;
  const normalizedRadius = minRadius + Math.min(km / 15, 1.0) * (maxRadius - minRadius);

  // Field of view half-angle: 40 degrees (total 80 degree sweep)
  const angleRad = (40 * Math.PI) / 180;
  const sinA = Math.sin(angleRad);
  const cosA = Math.cos(angleRad);

  const apexX = 60;
  const apexY = 50;

  // Max reference cone coordinates
  const refLeftX = apexX - maxRadius * sinA;
  const refLeftY = apexY - maxRadius * cosA;
  const refRightX = apexX + maxRadius * sinA;
  const refRightY = apexY - maxRadius * cosA;

  // Active visibility cone coordinates
  const activeLeftX = apexX - normalizedRadius * sinA;
  const activeLeftY = apexY - normalizedRadius * cosA;
  const activeRightX = apexX + normalizedRadius * sinA;
  const activeRightY = apexY - normalizedRadius * cosA;

  return (
    <GlassCard className="p-4 sm:p-6 flex flex-col justify-between min-h-[192px] relative">
      <div className="flex items-center space-x-1.5 mb-3 z-10">
        <Eye className="w-[18px] h-[18px] text-slate-300" strokeWidth={1.5} />
        <span className="type-card-title text-[14px] font-medium text-white">Visibility</span>
      </div>

      <div className="flex-1 flex items-center justify-center relative my-2">
        {/* Dynamic fan-shaped radar wedge graphic */}
        <div className="w-28 h-14 relative flex items-end justify-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 120 54">
            <defs>
              <linearGradient id="visFullGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.04)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0.18)" />
              </linearGradient>
              <linearGradient id="visActiveGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.2)" />
                <stop offset="100%" stopColor="rgba(186, 230, 253, 0.65)" />
              </linearGradient>
            </defs>

            {/* Background reference cone */}
            <path
              d={`M ${apexX},${apexY} L ${refLeftX},${refLeftY} A ${maxRadius},${maxRadius} 0 0,1 ${refRightX},${refRightY} Z`}
              fill="url(#visFullGradient)"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />

            {/* Intermediate range ring arc */}
            <path
              d={`M ${apexX - 25 * sinA},${apexY - 25 * cosA} A 25,25 0 0,1 ${apexX + 25 * sinA},${apexY - 25 * cosA}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />

            {/* Active Visibility Fan-Shaped Wedge */}
            <path
              d={`M ${apexX},${apexY} L ${activeLeftX},${activeLeftY} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${activeRightX},${activeRightY} Z`}
              fill="url(#visActiveGradient)"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="1.5"
              className="transition-all duration-700 ease-out"
            />

            {/* Center beam line */}
            <line
              x1={apexX}
              y1={apexY}
              x2={apexX}
              y2={apexY - normalizedRadius}
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1"
              strokeDasharray="2,2"
              className="transition-all duration-700 ease-out"
            />

            {/* Observer apex point */}
            <circle
              cx={apexX}
              cy={apexY}
              r="3.5"
              fill="#ffffff"
              className="shadow-md"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col mt-auto z-10 pt-2">
        <div className="flex items-baseline leading-none mb-1">
          <span className="type-stat-lg text-3xl text-white">{km.toFixed(1)}</span>
          <span className="type-stat text-sm text-slate-400 ml-1.5">km</span>
        </div>
        <span className="type-body text-sm text-slate-300 leading-normal">{label}</span>
      </div>
    </GlassCard>
  );
}
