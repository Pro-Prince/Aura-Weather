import React from 'react';
import { Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface SunArcCardProps {
  data: any;
}

export function SunArcCard({ data }: SunArcCardProps) {
  if (!data || !data.daily || !data.current) return null;

  const nowTimeStr = data.current.time;
  const dayPrefix = nowTimeStr.substring(0, 10);
  const dayIndex = data.daily.time.findIndex((t: string) => t.startsWith(dayPrefix));
  const idx = dayIndex >= 0 ? dayIndex : 0;

  const sunriseStr = data.daily.sunrise[idx];
  const sunsetStr = data.daily.sunset[idx];
  
  if (!sunriseStr || !sunsetStr) return null;

  const now = new Date(nowTimeStr).getTime();
  const sunrise = new Date(sunriseStr).getTime();
  const sunset = new Date(sunsetStr).getTime();

  let percentage = 0;
  let isDay = false;

  if (now > sunrise && now < sunset) {
    percentage = (now - sunrise) / (sunset - sunrise);
    isDay = true;
  } else if (now >= sunset) {
    percentage = 1;
  }

  // Format times (HH:MM AM/PM)
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const sunriseFormatted = formatTime(sunriseStr);
  const sunsetFormatted = formatTime(sunsetStr);

  const angleRad = Math.PI - percentage * Math.PI;
  const cx = 100 + 80 * Math.cos(angleRad);
  const cy = 100 - 80 * Math.sin(angleRad);
  
  // Calculate dash array to show elapsed vs remaining path
  const r = 80;
  const totalLength = Math.PI * r;
  const elapsedLength = percentage * totalLength;

  const moonriseStr = data.daily.moonrise?.[idx];
  const moonsetStr = data.daily.moonset?.[idx];
  
  const hasMoonData = moonriseStr && moonsetStr;

  return (
    <GlassCard className="p-4 sm:p-6 w-full flex flex-col justify-between">
      <div className="flex items-center space-x-2 mb-6">
        <Sun className="w-5 h-5 text-slate-300" />
        <span className="text-sm font-medium text-slate-300">Sun & Moon</span>
      </div>

      {/* Arc graphic */}
      <div className="relative w-full max-w-[280px] mx-auto h-32">
        <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb923c" /> {/* orange */}
              <stop offset="50%" stopColor="#facc15" /> {/* yellow */}
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
          
          {/* Base muted path */}
          <path 
            d="M 20 100 A 80 80 0 0 1 180 100" 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeDasharray="4 6"
          />
          
          {/* Elapsed path */}
          <path 
            d="M 20 100 A 80 80 0 0 1 180 100" 
            fill="none" 
            stroke="url(#sunGrad)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeDasharray={`${elapsedLength} ${totalLength}`}
          />
          
          {/* Sun/Moon Marker */}
          {isDay ? (
            <circle cx={cx} cy={cy} r="6" fill="#facc15" className="drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          ) : (
             <circle cx={percentage === 0 ? 20 : 180} cy="100" r="5" fill="#94a3b8" />
          )}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* Sunrise Column */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1.5 text-slate-300 mb-1">
            <Sunrise className="w-4 h-4" />
            <span className="text-xs font-medium">Sunrise</span>
          </div>
          <span className="text-lg font-semibold text-white">{sunriseFormatted}</span>
        </div>
        {/* Sunset Column */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1.5 text-slate-300 mb-1">
            <Sunset className="w-4 h-4" />
            <span className="text-xs font-medium">Sunset</span>
          </div>
          <span className="text-lg font-semibold text-white">{sunsetFormatted}</span>
        </div>
      </div>

      {hasMoonData && (
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
              <Moon className="w-4 h-4" />
              <span className="text-xs font-medium">Moonrise</span>
            </div>
            <span className="text-sm font-semibold text-slate-200">{formatTime(moonriseStr)}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
              <Moon className="w-4 h-4" />
              <span className="text-xs font-medium">Moonset</span>
            </div>
            <span className="text-sm font-semibold text-slate-200">{formatTime(moonsetStr)}</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
