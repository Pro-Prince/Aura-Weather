import { GlassCard } from './GlassCard';
import { getWeatherCodeDetails } from '../utils/weatherCodeMap';
import { Droplets } from 'lucide-react';
import { convertTemp, TempUnit } from '../utils/convertTemp';
import { AnimatedTemp } from './AnimatedTemp';

interface HourlyForecastProps {
  data: any;
  unit: TempUnit;
}

export function HourlyForecast({ data, unit }: HourlyForecastProps) {
  if (!data || !data.hourly || !data.current) return null;

  const { hourly, current } = data;
  const currentTimeString = current.time; 
  const currentHourPrefix = currentTimeString.substring(0, 13); // e.g., "2023-10-25T14"

  let startIndex = hourly.time.findIndex((t: string) => t.startsWith(currentHourPrefix));
  if (startIndex === -1) {
    startIndex = 0;
  }

  const next24Hours = [];
  for (let i = startIndex; i < startIndex + 24 && i < hourly.time.length; i++) {
    next24Hours.push({
      time: hourly.time[i],
      temp: hourly.temperature_2m[i],
      precip: hourly.precipitation_probability[i],
      code: hourly.weather_code[i],
      isCurrent: i === startIndex,
    });
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-slate-300 px-1 uppercase tracking-wider">Hourly</h2>
      <div className="flex space-x-3 overflow-x-auto pb-4 pt-1 snap-x hide-scrollbar">
        {next24Hours.map((hour, idx) => {
          const hourNum = parseInt(hour.time.substring(11, 13), 10);
          const ampm = hourNum >= 12 ? 'PM' : 'AM';
          const displayHour = hourNum % 12 || 12;
          const timeLabel = hour.isCurrent ? 'Now' : `${displayHour} ${ampm}`;

          const { Icon } = getWeatherCodeDetails(hour.code);

          return (
            <GlassCard 
              key={idx} 
              className={`min-w-[80px] p-4 flex flex-col items-center justify-between space-y-3 snap-start shrink-0 transition-colors ${
                hour.isCurrent ? 'bg-white/20 border-white/40 shadow-md' : ''
              }`}
            >
              <span className="text-sm font-medium text-slate-200">{timeLabel}</span>
              <Icon className="w-8 h-8 text-slate-100" strokeWidth={1.5} />
              <span className="text-lg font-semibold tabular-nums text-slate-50 leading-none">
                <AnimatedTemp value={convertTemp(hour.temp, unit)} />&deg;
              </span>
              {hour.precip > 0 ? (
                <div className="flex items-center space-x-1 text-blue-300 h-4">
                  <Droplets className="w-3 h-3 shrink-0" />
                  <span className="text-xs font-semibold">{hour.precip}%</span>
                </div>
              ) : (
                <div className="h-4" /> 
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
