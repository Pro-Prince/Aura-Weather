import React from 'react';
import { Wind } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getBeaufortDescription, getBeaufortForce, getWindDirection } from '../utils/wind';

interface WindCardProps {
  windSpeedKmH: number;
  windDirectionDeg: number;
}

// 72 precision tick marks around the dial (every 5 degrees)
const COMPASS_TICKS = Array.from({ length: 72 }, (_, i) => {
  const angle = i * 5;
  // Clear ample space around cardinal labels N (0°), E (90°), S (180°), W (270°)
  if (
    angle >= 346 ||
    angle <= 14 ||
    (angle >= 76 && angle <= 104) ||
    (angle >= 166 && angle <= 194) ||
    (angle >= 256 && angle <= 284)
  ) {
    return null;
  }
  const isMajor = angle % 30 === 0;
  const isSemi = angle % 15 === 0 && !isMajor;
  const rad = (angle * Math.PI) / 180;
  const r1 = isMajor ? 36 : isSemi ? 38 : 40;
  const r2 = 44;
  return {
    key: i,
    x1: 50 + r1 * Math.sin(rad),
    y1: 50 - r1 * Math.cos(rad),
    x2: 50 + r2 * Math.sin(rad),
    y2: 50 - r2 * Math.cos(rad),
    opacity: isMajor ? 0.7 : isSemi ? 0.4 : 0.22,
    strokeWidth: isMajor ? 1.4 : isSemi ? 1.0 : 0.75,
  };
}).filter(Boolean);

export function WindCard({ windSpeedKmH, windDirectionDeg }: WindCardProps) {
  const speed = Math.round(typeof windSpeedKmH === 'number' && !isNaN(windSpeedKmH) ? windSpeedKmH : 0);
  const dirDeg = typeof windDirectionDeg === 'number' && !isNaN(windDirectionDeg) ? windDirectionDeg : 0;
  const dirLabel = getWindDirection(dirDeg);
  const force = getBeaufortForce(speed);
  const description = getBeaufortDescription(force);

  return (
    <GlassCard className="p-4 sm:p-6 flex flex-col justify-between min-h-[192px] relative overflow-hidden group">
      {/* Ambient background glow accent */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center space-x-1.5 mb-3 z-10">
        <Wind className="w-[18px] h-[18px] text-slate-300 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
        <span className="type-card-title text-[14px] font-medium text-white tracking-tight">Wind</span>
      </div>

      {/* Middle Illustration - Sharp Modern Instrument Compass Dial */}
      <div className="flex-1 flex items-center justify-center w-full relative my-1.5">
        <div className="w-[104px] h-[104px] relative flex items-center justify-center">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full overflow-visible"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
          >
            <defs>
              {/* Dial Face Crisp Radial Gradient */}
              <radialGradient id="compassFaceGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.04)" />
                <stop offset="70%" stopColor="rgba(15, 23, 42, 0.25)" />
                <stop offset="100%" stopColor="rgba(2, 6, 23, 0.5)" />
              </radialGradient>
            </defs>

            {/* Outer Dial Face Surface */}
            <circle
              cx="50"
              cy="50"
              r="45.5"
              fill="url(#compassFaceGrad)"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />

            {/* Inner Concentric Guide Ring */}
            <circle
              cx="50"
              cy="50"
              r="25.5"
              fill="none"
              stroke="rgba(255, 255, 255, 0.09)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />

            {/* Compass Graduation Ticks */}
            {COMPASS_TICKS.map((tick) =>
              tick ? (
                <line
                  key={tick.key}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke={`rgba(255, 255, 255, ${tick.opacity})`}
                  strokeWidth={tick.strokeWidth}
                  strokeLinecap="square"
                />
              ) : null
            )}

            {/* Cardinal Direction Points - Clear of pointer orbit */}
            <text
              x="50"
              y="14"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="9"
              fontWeight="700"
              fill="#ffffff"
              className="select-none font-sans"
            >
              N
            </text>
            <text
              x="86"
              y="50"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="8.5"
              fontWeight="600"
              fill="rgba(255, 255, 255, 0.7)"
              className="select-none font-sans"
            >
              E
            </text>
            <text
              x="50"
              y="86"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="8.5"
              fontWeight="600"
              fill="rgba(255, 255, 255, 0.7)"
              className="select-none font-sans"
            >
              S
            </text>
            <text
              x="14"
              y="50"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="8.5"
              fontWeight="600"
              fill="rgba(255, 255, 255, 0.7)"
              className="select-none font-sans"
            >
              W
            </text>

            {/* Sharp Rotating Wind Vector Indicator (Contained inside inner arena, never overlaps letters/ticks) */}
            <g
              style={{
                transform: `rotate(${dirDeg}deg)`,
                transformOrigin: '50px 50px',
              }}
              className="transition-transform duration-700 ease-out"
            >
              {/* Origin Stem & Circular Pin (Wind Source Direction) */}
              <line
                x1="50"
                y1="42"
                x2="50"
                y2="31"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="29"
                r="3.2"
                fill="#ffffff"
                stroke="#090d16"
                strokeWidth="1"
              />

              {/* Flow Stem & Arrowhead (Wind Trajectory Direction) */}
              <line
                x1="50"
                y1="58"
                x2="50"
                y2="66"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 46.2 65.5 L 50 74 L 53.8 65.5 L 50 67 Z"
                fill="#ffffff"
                stroke="#090d16"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
            </g>

            {/* Center Pivot Point Hub */}
            <circle
              cx="50"
              cy="50"
              r="4"
              fill="#090d16"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="50"
              r="1.8"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>

      {/* Bottom Information */}
      <div className="flex flex-col mt-auto pt-2 z-10">
        <div className="flex items-baseline leading-none mb-1">
          <span className="type-stat-lg text-3xl sm:text-[32px] text-white font-numeric tracking-tight">{speed}</span>
          <span className="type-stat text-sm text-slate-400 font-medium ml-1.5">km/h</span>
        </div>
        <span className="type-body text-sm text-slate-300 leading-normal font-normal">
          {dirLabel} · {description}
        </span>
      </div>
    </GlassCard>
  );
}

