import React from 'react';
import { Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface SunArcCardProps {
  data: any;
}

// Ellipse math for smoother dome arc
function getEllipsePoint(cx: number, cy: number, rx: number, ry: number, p: number) {
  // progress p goes from 0 to 1. Angle goes from PI (left) to 0 (right).
  const angle = Math.PI * (1 - p);
  const x = cx + rx * Math.cos(angle);
  const y = cy - ry * Math.sin(angle);
  return { x, y };
}

export function SunArcCard({ data }: SunArcCardProps) {
  if (!data || !data.daily || !data.current) return null;

  const nowTimeStr = data.current.time;
  const dayPrefix = nowTimeStr.substring(0, 10);
  const dayIndex = data.daily.time.findIndex((t: string) => t.startsWith(dayPrefix));
  const idx = dayIndex >= 0 ? dayIndex : 0;

  const sunriseStr = data.daily?.sunrise?.[idx];
  const sunsetStr = data.daily?.sunset?.[idx];
  let moonriseStr = data.daily?.moonrise?.[idx];
  let moonsetStr = data.daily?.moonset?.[idx];
  
  const hasSunData = !!(sunriseStr && sunsetStr);

  const now = new Date(nowTimeStr).getTime();
  const sunrise = hasSunData ? new Date(sunriseStr).getTime() : now - 21600000;
  const sunset = hasSunData ? new Date(sunsetStr).getTime() : now + 21600000;

  let isDay = false;
  if (hasSunData) {
    isDay = now >= sunrise && now < sunset;
  } else {
    // Basic fallback for polar day/night estimation
    const isSummer = new Date().getMonth() > 4 && new Date().getMonth() < 8;
    isDay = isSummer; 
  }

  // Handle missing moon data (API sometimes omits if it doesn't rise/set that day)
  const fallbackMoonrise = now + 43200000;
  const fallbackMoonset = now + 86400000;
  let moonrise = moonriseStr ? new Date(moonriseStr).getTime() : fallbackMoonrise;
  let moonset = moonsetStr ? new Date(moonsetStr).getTime() : fallbackMoonset;

  // Handle case where moonset happens earlier in the day than moonrise
  // by using the next day's moonset to form a proper continuous night window
  if (moonset < moonrise) {
    const nextMoonsetStr = data.daily?.moonset?.[idx + 1];
    if (nextMoonsetStr) {
      moonset = new Date(nextMoonsetStr).getTime();
    } else {
      moonset += 86400000;
    }
  }

  // Format times (HH:MM)
  const formatTime = (isoString: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const sunriseFormatted = hasSunData ? formatTime(sunriseStr) : 'No rise';
  const sunsetFormatted = hasSunData ? formatTime(sunsetStr) : 'No set';

  // 24-hour cycle arc mapping
  const startOfDay = new Date(dayPrefix + 'T00:00:00').getTime();
  const arcProgress = Math.max(0, Math.min(1, (now - startOfDay) / 86400000));

  const xStart = 15;
  const xEnd = 185;
  const width = xEnd - xStart;
  const rx = width / 2;
  const ry = Math.min(95, width * 0.45); 
  const cx = (xStart + xEnd) / 2;

  const arcPathD = `M ${xStart} 105 A ${rx} ${ry} 0 0 1 ${xEnd} 105`;
  const markerPos = getEllipsePoint(cx, 105, rx, ry, arcProgress);
  
  // Calculate where the gradient should stop relative to the bounding box X (0 to 100%)
  const gradientStopX = ((markerPos.x - xStart) / width) * 100;

  return (
    <GlassCard className="p-4 sm:p-6 w-full flex flex-col justify-between">
      <div className="flex items-center space-x-1.5 mb-3 z-10">
        <Sunrise className="w-[18px] h-[18px] text-slate-300" strokeWidth={1.5} />
        <span className="type-card-title text-[14px] font-medium text-white">Sunrise & sunset</span>
      </div>

      {/* 24h Arc graphic */}
      <div className="relative w-full max-w-[340px] mx-auto h-32 sm:h-36 mt-2">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="arcActiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset={`${gradientStopX}%`} stopColor="#facc15" />
              <stop offset={`${gradientStopX}%`} stopColor="transparent" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Baseline */}
          <line x1="5" y1="105" x2="195" y2="105" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" />

          {/* Inactive / Background Arc (Muted Gray) */}
          <path
            d={arcPathD}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Active / Elapsed Portion of the Arc */}
          <path
            d={arcPathD}
            fill="none"
            stroke="url(#arcActiveGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Single Marker Badge */}
          {isDay ? (
            <foreignObject x={markerPos.x - 14} y={markerPos.y - 14} width="28" height="28" className="overflow-visible pointer-events-none">
              <div className="w-7 h-7 rounded-full bg-amber-500 border-[2.5px] border-white flex items-center justify-center drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                <Sun className="w-[16px] h-[16px] text-white fill-white" strokeWidth={2} />
              </div>
            </foreignObject>
          ) : (
            <foreignObject x={markerPos.x - 12} y={markerPos.y - 12} width="24" height="24" className="overflow-visible pointer-events-none">
              <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-300 flex items-center justify-center drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                <Moon className="w-[14px] h-[14px] text-slate-100 fill-slate-100" strokeWidth={1} />
              </div>
            </foreignObject>
          )}
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

      <div className="flex justify-between mt-auto px-1">
        <div className="flex flex-col items-start space-y-0.5">
          <span className="type-caption text-[13px] text-slate-400">Sunrise</span>
          <span className="type-stat text-[17px] font-medium text-white mb-2">{sunriseFormatted}</span>
          <span className="type-caption text-[13px] text-slate-400 mt-2">Moonrise</span>
          <span className="type-stat text-[17px] font-medium text-white">{formatTime(moonriseStr)}</span>
        </div>
        <div className="flex flex-col items-end space-y-0.5 text-right">
          <span className="type-caption text-[13px] text-slate-400">Sunset</span>
          <span className="type-stat text-[17px] font-medium text-white mb-2">{sunsetFormatted}</span>
          <span className="type-caption text-[13px] text-slate-400 mt-2">Moonset</span>
          <span className="type-stat text-[17px] font-medium text-white">{formatTime(moonsetStr)}</span>
        </div>
      </div>
    </GlassCard>
  );
}
