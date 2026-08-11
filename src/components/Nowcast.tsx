import { GlassCard } from './GlassCard';

interface NowcastProps {
  data: any;
}

export function Nowcast({ data }: NowcastProps) {
  if (!data?.minutely_15?.precipitation || data.minutely_15.precipitation.length === 0) {
    return null;
  }

  const { time, precipitation } = data.minutely_15;
  const currentTime = data.current?.time;
  
  // Find the current 15-minute block using the current.time which is in the exact same format
  let currentIndex = time.indexOf(currentTime);
  
  // If exact match fails for some reason, fallback to first time in the future
  if (currentIndex === -1 && currentTime) {
    currentIndex = time.findIndex((t: string) => t >= currentTime);
  }
  
  // If we couldn't find a valid time or don't have enough data ahead
  if (currentIndex === -1 || currentIndex + 6 > precipitation.length) {
    return null;
  }

  const segments = precipitation.slice(currentIndex, currentIndex + 6) as number[];
  const next60Mins = segments.slice(0, 4);
  const next90Mins = segments;

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

  // To make it look like a smooth strip, we can render 6 segments joined together
  const getIntensityColor = (precip: number) => {
    if (precip === 0) return 'bg-white/5';
    if (precip < 0.5) return 'bg-sky-400/40';
    if (precip < 2.5) return 'bg-sky-400/70';
    return 'bg-sky-400';
  };

  return (
    <GlassCard className="p-4 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-100">{message}</h3>
      </div>
      
      <div className="flex w-full h-8 rounded-lg overflow-hidden gap-[1px] bg-white/5 p-[1px]">
        {segments.map((precip, i) => (
          <div
            key={i}
            className={`flex-1 h-full rounded-sm transition-colors ${getIntensityColor(precip)}`}
            title={`+${i * 15}m: ${precip}mm`}
          />
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-slate-400 px-1">
        <span>Now</span>
        <span>+45m</span>
        <span>+90m</span>
      </div>
    </GlassCard>
  );
}
