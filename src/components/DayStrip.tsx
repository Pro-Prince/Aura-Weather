import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { getWeatherCodeDetails } from '../utils/weatherCodeMap';
import { convertTemp } from '../utils/convertTemp';

interface DayStripProps {
  data: any;
  unit: 'C' | 'F';
}

export function DayStrip({ data, unit }: DayStripProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stripRef.current && !stripRef.current.contains(e.target as Node)) {
        setActiveIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  if (!data?.hourly || !data?.daily || !data?.current) return null;

  const { time, temperature_2m, precipitation_probability, weather_code } = data.hourly;
  
  // Find start of current day (00:00) using the first time returned by the API
  const firstDayPrefix = time[0].split('T')[0];
  let startIndex = time.findIndex((t: string) => t.startsWith(`${firstDayPrefix}T00:00`));
  if (startIndex === -1) startIndex = 0; // Fallback to 0 if we can't find it exactly

  const hours = 24;
  const todayTimes = time.slice(startIndex, startIndex + hours);
  const todayTemps = temperature_2m.slice(startIndex, startIndex + hours);
  const todayPrecip = precipitation_probability.slice(startIndex, startIndex + hours);
  const todayCodes = weather_code.slice(startIndex, startIndex + hours);

  const minTemp = data.daily.temperature_2m_min[0];
  const maxTemp = data.daily.temperature_2m_max[0];

  // Safely find the current hour index by matching the API's current time
  const currentTimeString = data.current?.time; // e.g. "2026-08-11T14:15"
  let currentIndex = -1;
  if (currentTimeString) {
    const currentHourPrefix = currentTimeString.slice(0, 13) + ':00'; // Round down to hour, "2026-08-11T14:00"
    currentIndex = todayTimes.indexOf(currentHourPrefix);
  }

  // Fallback to local system time if current hour index isn't found
  if (currentIndex === -1) {
    const now = new Date();
    const localHourStr = `${firstDayPrefix}T${now.getHours().toString().padStart(2, '0')}:00`;
    currentIndex = todayTimes.indexOf(localHourStr);
  }

  const getColor = (temp: number) => {
    const range = maxTemp - minTemp;
    const percentage = range === 0 ? 0.5 : Math.max(0, Math.min(1, (temp - minTemp) / range));
    // 240 (blue/cool) to 30 (orange/warm)
    const hue = 240 - (percentage * 210);
    return `hsl(${hue}, 80%, 55%)`;
  };

  const formatHour = (isoString: string) => {
    const hourStr = isoString.split('T')[1].split(':')[0];
    const h = parseInt(hourStr, 10);
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  return (
    <GlassCard className="p-4 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-100">Day Overview</h3>
        <span className="text-xs text-slate-400">00:00 - 23:59</span>
      </div>

      <div 
        ref={stripRef}
        className="relative w-full h-10 rounded-lg flex overflow-visible cursor-pointer bg-black/20"
      >
        {todayTimes.map((t: string, i: number) => {
          const rawTemp = todayTemps[i];
          const displayTemp = unit === 'C' ? Math.round(rawTemp) : Math.round(convertTemp(rawTemp, 'F'));
          const precip = todayPrecip[i];
          const code = todayCodes[i];
          const isCurrent = i === currentIndex;
          const hasPrecip = precip > 40;
          const { Icon, label } = getWeatherCodeDetails(code);
          
          // Determine tooltip placement so it doesn't overflow screen edges
          const isLeftEdge = i < 4;
          const isRightEdge = i > 19;
          
          let tooltipOrigin = 'left-1/2 -translate-x-1/2';
          let caretOrigin = 'left-1/2 -translate-x-1/2';
          
          if (isLeftEdge) {
            tooltipOrigin = 'left-0';
            caretOrigin = 'left-2 translate-x-0';
          } else if (isRightEdge) {
            tooltipOrigin = 'right-0';
            caretOrigin = 'right-2 translate-x-0';
          }

          return (
            <div
              key={t}
              className="flex-1 h-full relative transition-opacity hover:opacity-80 group first:rounded-l-lg last:rounded-r-lg"
              style={{
                backgroundColor: getColor(rawTemp),
                backgroundImage: hasPrecip 
                  ? 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)'
                  : 'none'
              }}
              onClick={() => setActiveIndex(activeIndex === i ? null : i)}
            >
              {/* Current Hour Marker */}
              {isCurrent && (
                <div className="absolute top-[-2px] bottom-[-2px] left-1/2 -translate-x-1/2 w-[2px] bg-white shadow-[0_0_6px_rgba(0,0,0,0.8)] z-10" />
              )}

              {/* Tooltip */}
              <AnimatePresence>
                {activeIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute bottom-full mb-3 ${tooltipOrigin} w-max bg-slate-800/95 backdrop-blur-md text-white text-xs py-2 px-3 rounded-xl shadow-xl z-50 flex items-center gap-3 border border-white/10`}
                  >
                    <span className="text-sky-300 font-medium">{formatHour(t)}</span>
                    <div className="w-px h-4 bg-white/20" />
                    <span className="font-semibold text-sm">{displayTemp}°</span>
                    <div className="w-px h-4 bg-white/20" />
                    <span className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-slate-200" />
                      {hasPrecip && <span className="text-blue-300 font-medium ml-0.5">{precip}%</span>}
                    </span>
                    
                    {/* Caret */}
                    <div className={`absolute top-full ${caretOrigin} border-[6px] border-transparent border-t-slate-800/95 drop-shadow-sm`} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
