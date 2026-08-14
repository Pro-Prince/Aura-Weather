import { GlassCard } from './GlassCard';
import { motion, AnimatePresence } from 'motion/react';

interface NowcastProps {
  data: any;
}

export function Nowcast({ data }: NowcastProps) {
  if (!data) return null;

  const minutely = data?.minutely_15;
  const time = minutely?.time || [];
  const precipitation = minutely?.precipitation || [];
  const currentTime = data.current?.time;
  
  let currentIndex = -1;
  if (time.length > 0 && currentTime) {
    currentIndex = time.indexOf(currentTime);
    if (currentIndex === -1) {
      currentIndex = time.findIndex((t: string) => t >= currentTime);
    }
  }

  let segments: number[] = [0, 0, 0, 0, 0, 0];
  if (currentIndex !== -1 && precipitation.length >= currentIndex + 6) {
    segments = precipitation.slice(currentIndex, currentIndex + 6);
  } else if (precipitation.length >= 6) {
    segments = precipitation.slice(0, 6);
  } else {
    // If no minutely precipitation data is returned by the station, derive from current precipitation
    const currentP = Number(data.current?.precipitation ?? 0);
    segments = [currentP, currentP, 0, 0, 0, 0];
  }

  const isRainingNow = segments[0] > 0;
  let message = '';

  if (isRainingNow) {
    const stopIndex = segments.findIndex(p => p === 0);
    if (stopIndex !== -1) {
      message = `Rain ending in ~${stopIndex * 15} minutes`;
    } else {
      message = 'Rain continuing for the next 90 minutes';
    }
  } else {
    const startIndex = segments.findIndex(p => p > 0);
    if (startIndex !== -1) {
      message = `Rain starting in ~${startIndex * 15} minutes`;
    } else {
      message = 'No rain expected in the next hour';
    }
  }

  const hasPrecipitation = segments.some(p => p > 0);

  // Dynamic continuous color style based on individual segment intensity
  const getIntensityColor = (precip: number) => {
    if (precip <= 0) {
      return 'rgba(255, 255, 255, 0.08)';
    }
    if (precip <= 0.5) {
      return 'rgba(56, 189, 248, 0.5)'; // Light rain (Sky Blue 50%)
    }
    if (precip <= 1.5) {
      return 'rgba(14, 165, 233, 0.75)'; // Moderate rain (Sky Blue 75%)
    }
    if (precip <= 3.0) {
      return 'rgba(2, 132, 199, 0.9)'; // Heavy rain (Sky Blue 90%)
    }
    return 'rgba(37, 99, 235, 1.0)'; // Torrential rain (Blue 100%)
  };

  const labels = ['Now', '+15m', '+30m', '+45m', '+60m', '+75m'];

  return (
    <motion.div layout transition={{ duration: 0.3, ease: 'easeInOut' }}>
      <GlassCard className={`flex flex-col transition-all duration-300 ${hasPrecipitation ? 'p-5 space-y-3' : 'px-4 py-3'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-0">
          <h3 className="type-card-title text-xs text-slate-300">{message}</h3>
          <span className="type-eyebrow text-[10px] text-slate-400">60-minute nowcast</span>
        </div>

        <AnimatePresence initial={false}>
          {hasPrecipitation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col space-y-4 overflow-hidden pt-1"
            >
              {/* 6 Segments Strip */}
              <div className="flex w-full h-8 rounded-lg overflow-hidden gap-1 bg-white/5 p-1">
                {segments.map((precip, i) => (
                  <div
                    key={i}
                    className="flex-1 h-full rounded-sm transition-colors duration-500"
                    style={{ backgroundColor: getIntensityColor(precip) }}
                    title={`${labels[i]}: ${precip > 0 ? precip.toFixed(1) + 'mm' : 'Dry'}`}
                  />
                ))}
              </div>
              
              {/* 6 Time Labels */}
              <div className="flex w-full gap-1 px-1">
                {labels.map((label, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 text-center type-caption font-numeric text-xs whitespace-nowrap ${
                      i === 0 ? 'text-slate-200 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}
