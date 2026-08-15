import React from 'react';
import { Sun, Sunrise, Moon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { motion } from 'motion/react';

interface SunArcCardProps {
  data: any;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Calculates the exact coordinate along a customized parallel hill trajectory.
 * The hill features straight-sloping rising and falling legs with a smooth cubic Bezier rounded apex.
 * This matches the exact shape shown in the reference image.
 */
function getPointOnHill(p: number, isSun: boolean): Point {
  const p0 = isSun ? { x: 12, y: 105 } : { x: 48, y: 105 };
  const c1 = isSun ? { x: 55, y: 15 } : { x: 78, y: 58 };
  const c2 = isSun ? { x: 145, y: 15 } : { x: 122, y: 58 };
  const p1 = isSun ? { x: 188, y: 105 } : { x: 152, y: 105 };

  const t = p;
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * p1.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * p1.y
  };
}

function getSubPath(progress: number, isSun: boolean): string {
  const steps = 30;
  const points: Point[] = [];
  const clamped = Math.max(0, Math.min(1, progress));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * clamped;
    points.push(getPointOnHill(t, isSun));
  }
  return points.reduce((acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
}

export function SunArcCard({ data }: SunArcCardProps) {
  if (!data || !data.daily || !data.current) return null;

  const nowTimeStr = data.current.time;
  const dayPrefix = nowTimeStr.substring(0, 10);
  const dayIndex = data.daily.time.findIndex((t: string) => t.startsWith(dayPrefix));
  const idx = dayIndex >= 0 ? dayIndex : 0;

  const sunriseStr = data.daily?.sunrise?.[idx];
  const sunsetStr = data.daily?.sunset?.[idx];
  const moonriseStr = data.daily?.moonrise?.[idx];
  const moonsetStr = data.daily?.moonset?.[idx];
  
  const hasSunData = !!(sunriseStr && sunsetStr);

  const now = new Date(nowTimeStr).getTime();
  const sunrise = hasSunData ? new Date(sunriseStr).getTime() : now - 21600000;
  const sunset = hasSunData ? new Date(sunsetStr).getTime() : now + 21600000;

  let isDay = false;
  if (hasSunData) {
    isDay = now >= sunrise && now < sunset;
  } else {
    const isSummer = new Date().getMonth() > 4 && new Date().getMonth() < 8;
    isDay = isSummer; 
  }

  // Moon timestamps
  const fallbackMoonrise = now + 43200000;
  const fallbackMoonset = now + 86400000;
  let moonrise = moonriseStr ? new Date(moonriseStr).getTime() : fallbackMoonrise;
  let moonset = moonsetStr ? new Date(moonsetStr).getTime() : fallbackMoonset;

  if (moonset < moonrise) {
    const nextMoonsetStr = data.daily?.moonset?.[idx + 1];
    if (nextMoonsetStr) {
      moonset = new Date(nextMoonsetStr).getTime();
    } else {
      moonset += 86400000;
    }
  }

  // Format times (HH:MM)
  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const sunriseFormatted = hasSunData ? formatTime(sunriseStr) : 'No rise';
  const sunsetFormatted = hasSunData ? formatTime(sunsetStr) : 'No set';
  const moonriseFormatted = moonriseStr ? formatTime(moonriseStr) : '--:--';
  const moonsetFormatted = moonsetStr ? formatTime(moonsetStr) : '--:--';

  // Sun and Moon curve coordinates (single continuous smooth cubic Beziers with enhanced spacing)
  const sunPathD = `M 12 105 C 55 15, 145 15, 188 105`;
  const moonPathD = `M 48 105 C 78 58, 122 58, 152 105`;

  const sunProgress = hasSunData
    ? Math.max(0, Math.min(1, (now - sunrise) / (sunset - sunrise)))
    : (isDay ? 0.65 : 0.85);
  const sunPos = getPointOnHill(sunProgress, true);

  // Position Moon based on current moon rise/set times
  let moonProgress = 0.55; // default center-right placeholder if not available
  if (now >= moonrise && now <= moonset) {
    moonProgress = (now - moonrise) / (moonset - moonrise);
  } else if (now > moonset) {
    moonProgress = 0.9;
  } else {
    moonProgress = 0.3;
  }
  moonProgress = Math.max(0, Math.min(1, moonProgress));
  const moonPos = getPointOnHill(moonProgress, false);

  const sunSubPathD = getSubPath(sunProgress, true);
  const moonSubPathD = getSubPath(moonProgress, false);

  return (
    <GlassCard className="p-4 sm:p-5 w-full flex flex-col justify-between overflow-hidden">
      {/* Header with Title & Daylight / Night Badge */}
      <div className="flex items-center justify-between mb-1 z-10">
        <span className="type-card-title text-[15px] font-medium text-white tracking-tight">
          Sunrise & Sunset
        </span>
        <div>
          {isDay ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sun className="w-3 h-3 text-amber-400 animate-spin-slow" /> Daylight
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Moon className="w-3 h-3 text-indigo-300" /> Night
            </span>
          )}
        </div>
      </div>

      {/* Dual Hill Arch Graphic exactly like reference image */}
      <div className="relative w-full max-w-[340px] mx-auto h-32 sm:h-36 my-1">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          <defs>
            {/* Active Sun Gradient (Golden Yellow) */}
            <linearGradient id="sunHillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(251,146,60,0.5)" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>

            {/* Active Moon Gradient (Slate White) */}
            <linearGradient id="moonHillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(100,116,139,0.3)" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Sun Marker Filter (Outer Glow) */}
            <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Baseline */}
          <line
            x1="5"
            y1="105"
            x2="195"
            y2="105"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* 1. OUTER SUN HILL ARCH */}
          {/* Base stroke (thin, elegant dashboard guide) */}
          <path
            d={sunPathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Highlighted active yellow path exactly matching image */}
          <path
            d={sunSubPathD}
            fill="none"
            stroke="url(#sunHillGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* 2. INNER MOON HILL ARCH */}
          {/* Base stroke */}
          <path
            d={moonPathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Active stroke */}
          <path
            d={moonSubPathD}
            fill="none"
            stroke="url(#moonHillGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* SUN BADGE MARKER (Travelling Sun element sitting perfectly on the curve with layered premium glows) */}
          <g 
            transform={`translate(${sunPos.x}, ${sunPos.y})`} 
            className="pointer-events-none"
          >
            {/* Soft outer glow levels for an organic premium light emitter look */}
            <circle cx="0" cy="0" r="15" fill="#facc15" opacity="0.2" />
            <circle cx="0" cy="0" r="22" fill="#fb923c" opacity="0.08" />
            
            {/* Solid sharp Sun badge */}
            <circle
              cx="0"
              cy="0"
              r="9.5"
              fill="#fbbf24"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Sun Icon inside, centered perfectly */}
            <g transform="translate(-6.5, -6.5)">
              <Sun size={13} className="text-white fill-white" strokeWidth={2} />
            </g>
          </g>

          {/* MOON BADGE MARKER (Moon element on the inner arc sitting perfectly on the curve with layered premium glows) */}
          <g 
            transform={`translate(${moonPos.x}, ${moonPos.y})`} 
            className="pointer-events-none"
          >
            {/* Soft outer aura levels for premium dark night emitter look */}
            <circle cx="0" cy="0" r="12" fill="#818cf8" opacity="0.15" />
            <circle cx="0" cy="0" r="18" fill="#6366f1" opacity="0.06" />

            {/* Solid sharp Moon badge */}
            <circle
              cx="0"
              cy="0"
              r="8"
              fill="#1e293b"
              stroke="#e2e8f0"
              strokeWidth="1.2"
            />
            {/* Moon Icon inside, centered perfectly */}
            <g transform="translate(-5, -5)">
              <Moon size={10} className="text-slate-100 fill-slate-100" strokeWidth={1} />
            </g>
          </g>
        </svg>

        {!hasSunData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 mt-4">
            <span className="type-card-title text-xs text-amber-400">Polar latitude</span>
            <span className="type-caption text-[11px] text-slate-300">
              {isDay ? "Midnight sun (24h daylight)" : "Polar night (24h darkness)"}
            </span>
          </div>
        )}
      </div>

      {/* Structured Timing sub-panel identical to the uploaded image structure */}
      <div className="mt-3 pt-3.5 border-t border-white/10 grid grid-cols-2 gap-y-3">
        {/* Left Column: Sunrise & Moonrise */}
        <div className="flex flex-col space-y-3">
          <div>
            <span className="type-caption text-[12px] text-slate-400/90 font-normal">Sunrise</span>
            <div className="text-[15px] sm:text-[16px] font-medium text-white tracking-tight mt-0.5">
              {sunriseFormatted}
            </div>
          </div>
          <div>
            <span className="type-caption text-[12px] text-slate-400/90 font-normal">Moonrise</span>
            <div className="text-[15px] sm:text-[16px] font-medium text-white tracking-tight mt-0.5">
              {moonriseFormatted}
            </div>
          </div>
        </div>

        {/* Right Column: Sunset & Moonset */}
        <div className="flex flex-col items-end text-right space-y-3">
          <div>
            <span className="type-caption text-[12px] text-slate-400/90 font-normal">Sunset</span>
            <div className="text-[15px] sm:text-[16px] font-medium text-white tracking-tight mt-0.5">
              {sunsetFormatted}
            </div>
          </div>
          <div>
            <span className="type-caption text-[12px] text-slate-400/90 font-normal">Moonset</span>
            <div className="text-[15px] sm:text-[16px] font-medium text-white tracking-tight mt-0.5">
              {moonsetFormatted}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
