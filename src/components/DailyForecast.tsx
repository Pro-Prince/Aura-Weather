import { GlassCard } from './GlassCard';
import { getWeatherCodeDetails } from '../utils/weatherCodeMap';
import { Droplets } from 'lucide-react';
import { convertTemp, TempUnit } from '../utils/convertTemp';
import { AnimatedTemp } from './AnimatedTemp';

interface DailyForecastProps {
  data: any;
  unit: TempUnit;
}

export function DailyForecast({ data, unit }: DailyForecastProps) {
  if (!data || !data.daily) return null;

  const { daily } = data;
  
  // Calculate overall min and max for the week to scale the bars
  const weekMin = Math.min(...daily.temperature_2m_min);
  const weekMax = Math.max(...daily.temperature_2m_max);
  const tempRange = weekMax - weekMin;

  return (
    <div className="space-y-3 pb-8">
      <h2 className="text-sm font-medium text-slate-300 px-1 uppercase tracking-wider">7-Day Forecast</h2>
      <GlassCard className="p-4 flex flex-col">
        {daily.time.map((timeStr: string, idx: number) => {
          const date = new Date(timeStr);
          // Use UTC to avoid timezone shifts since Open-Meteo returns 'YYYY-MM-DD' which parses as UTC midnight
          // Alternatively, parse parts directly.
          const isToday = idx === 0;
          const dayLabel = isToday 
            ? 'Today' 
            : date.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' });
          
          const code = daily.weather_code[idx];
          const rawMin = daily.temperature_2m_min[idx];
          const rawMax = daily.temperature_2m_max[idx];
          const min = convertTemp(rawMin, unit);
          const max = convertTemp(rawMax, unit);
          const precip = daily.precipitation_probability_max?.[idx] || 0;
          const { Icon } = getWeatherCodeDetails(code);

          // Calculate bar dimensions based on raw celsius so bar width doesn't jump
          const leftPercent = ((rawMin - weekMin) / tempRange) * 100;
          const widthPercent = ((rawMax - rawMin) / tempRange) * 100;

          return (
            <div key={idx} className="flex items-center justify-between w-full py-3 border-b border-white/5 last:border-0 last:pb-0 first:pt-0">
              <div className="w-12 text-sm font-medium text-slate-200">
                {dayLabel}
              </div>
              
              <div className="flex items-center space-x-2 w-16">
                <Icon className="w-5 h-5 text-slate-100" strokeWidth={1.5} />
                {precip > 0 ? (
                  <span className="text-[10px] font-semibold text-blue-300 flex items-center">
                    {precip}%
                  </span>
                ) : (
                  <span className="w-6" /> // spacer
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 flex-1 ml-4">
                <span className="text-sm font-medium text-slate-300 tabular-nums w-6 text-right">
                  <AnimatedTemp value={min} />&deg;
                </span>
                
                <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-white/5 relative overflow-hidden">
                  <div 
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-indigo-400 to-amber-300 opacity-80"
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                  />
                </div>
                
                <span className="text-sm font-semibold text-slate-100 tabular-nums w-6 text-right">
                  <AnimatedTemp value={max} />&deg;
                </span>
              </div>
            </div>
          );
        })}
      </GlassCard>
    </div>
  );
}
