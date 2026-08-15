import React from 'react';
import { Gauge } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface PressureCardProps {
  pressureHpa: number;
}

export function PressureCard({ pressureHpa }: PressureCardProps) {
  const pressure = typeof pressureHpa === 'number' && !isNaN(pressureHpa) ? pressureHpa : 1013;

  let label = 'Average';
  if (pressure < 1000) label = 'Low';
  else if (pressure > 1022) label = 'High';

  const min = 960;
  const max = 1060;
  const percentage = Math.max(0, Math.min(100, ((pressure - min) / (max - min)) * 100));

  // Semicircle geometry calculations
  const cx = 70;
  const cy = 64;
  const radius = 48;
  const strokeWidth = 5;

  // Arc length for semicircle (radius * PI)
  const arcLength = Math.PI * radius;
  // Exact fill length matching the percentage along the curve
  const fillLength = (percentage / 100) * arcLength;

  // Exact coordinates of the indicator at the head of the curve
  const angleRad = Math.PI - (percentage / 100) * Math.PI;
  const indicatorX = cx + radius * Math.cos(angleRad);
  const indicatorY = cy - radius * Math.sin(angleRad);

  // Needle tip coordinate pointing directly to the curve marker
  const needleLength = radius - 10;
  const needleTipX = cx + needleLength * Math.cos(angleRad);
  const needleTipY = cy - needleLength * Math.sin(angleRad);

  // Arc path from left (0% / Low) to right (100% / High)
  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  return (
    <GlassCard className="p-4 sm:p-6 flex flex-col justify-between min-h-[192px] relative">
      <div className="flex items-center space-x-1.5 mb-2 z-10">
        <Gauge className="w-[18px] h-[18px] text-slate-300" strokeWidth={1.5} />
        <span className="type-card-title text-[14px] font-medium text-white">Pressure</span>
      </div>

      <div className="flex-1 flex items-center justify-center w-full relative my-1">
        {/* Precise SVG Gauge */}
        <div className="w-36 h-20 relative flex items-end justify-center">
          <svg viewBox="0 0 140 76" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="pressureGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>

            {/* Background reference track */}
            <path
              d={arcPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Subtle center baseline tick */}
            <line
              x1={cx}
              y1={cy - radius - 3}
              x2={cx}
              y2={cy - radius + 3}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1"
            />

            {/* Precisely filled progress arc */}
            <path
              d={arcPath}
              fill="none"
              stroke="url(#pressureGaugeGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${fillLength} ${arcLength}`}
              className="transition-all duration-700 ease-out"
            />

            {/* Needle indicator line pointing from center pivot to active value */}
            <line
              x1={cx}
              y1={cy}
              x2={needleTipX}
              y2={needleTipY}
              stroke="rgba(255, 255, 255, 0.75)"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />

            {/* Center Pivot */}
            <circle
              cx={cx}
              cy={cy}
              r="2.5"
              fill="#cbd5e1"
              stroke="#0f172a"
              strokeWidth="1"
            />

            {/* Head Marker Halo & Solid Dot sitting precisely on the curve */}
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r="6.5"
              fill="rgba(255, 255, 255, 0.25)"
              className="transition-all duration-700 ease-out pointer-events-none"
            />
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r="3.5"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.5"
              className="transition-all duration-700 ease-out shadow-sm"
            />

            {/* Range Labels */}
            <text
              x={cx - radius - 4}
              y={cy + 10}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(255, 255, 255, 0.45)"
              className="font-medium select-none"
            >
              Low
            </text>
            <text
              x={cx + radius + 4}
              y={cy + 10}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(255, 255, 255, 0.45)"
              className="font-medium select-none"
            >
              High
            </text>
          </svg>
        </div>
      </div>

      <div className="flex flex-col mt-auto pt-2 z-10">
        <div className="flex items-baseline leading-none mb-1">
          <span className="type-stat-lg text-3xl text-white font-numeric">{Math.round(pressure)}</span>
          <span className="type-stat text-sm text-slate-400 ml-1.5">hPa</span>
        </div>
        <span className="type-body text-sm text-slate-300 leading-normal">{label}</span>
      </div>
    </GlassCard>
  );
}

