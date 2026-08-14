import React from 'react';
import { getWeatherCodeDetails } from '../utils/weatherCodeMap';
import { convertTemp, TempUnit } from '../utils/convertTemp';

interface DailyForecastProps {
  data: any;
  unit: TempUnit;
  isExpanded?: boolean;
}

export function DailyForecast({ data, unit, isExpanded = true }: DailyForecastProps) {
  if (!data || !data.daily) return null;
  const { daily } = data;
  
  // PDF shows a max of around 15 days, let's limit to what we have or 3 if collapsed.
  const daysToShow = isExpanded ? daily.time.length : 3;
  const visibleDays = daily.time.slice(0, daysToShow);

  const getDayLabel = (dateStr: string, index: number) => {
    // If index 0 is today:
    // Actually the API usually returns today as index 0.
    // Wait, let's look at the PDF. It has "Yesterday", "Today", "Tomorrow".
    // Open-Meteo can return yesterday if past_days is set, but we might just have today as index 0.
    // Let's assume index 0 is Today if not using past_days.
    // To be safe, compare with actual today's date.
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    // adjust for timezone offset to match local day
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    date.setHours(0,0,0,0);
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDate = (dateStr: string) => {
    // "2023-10-25" -> "10/25"
    const parts = dateStr.split('-');
    return `${parts[1]}/${parts[2]}`;
  };

  return (
    <div className="flex flex-col w-full px-2 sm:px-4 pb-2 sm:pb-4 transition-all duration-300">
      {visibleDays.map((timeStr: string, idx: number) => {
        const dateFormatted = formatDate(timeStr);
        const dayLabel = getDayLabel(timeStr, idx);
        
        const code = daily.weather_code[idx];
        const min = Math.round(convertTemp(daily.temperature_2m_min[idx], unit));
        const max = Math.round(convertTemp(daily.temperature_2m_max[idx], unit));
        const precip = Math.round(daily.precipitation_probability_max?.[idx] || 0);
        const { Icon } = getWeatherCodeDetails(code);

        return (
          <div key={idx} className="flex items-center justify-between py-3 px-2 rounded-xl app-row-hover">
            <div className="flex items-center space-x-3 w-32">
              <span className="type-stat text-sm text-slate-400 w-10">{dateFormatted}</span>
              <span className="type-card-title text-sm text-slate-200">{dayLabel}</span>
            </div>
            
            <div className="flex items-center space-x-2 flex-1 justify-center">
              <Icon className="w-5 h-5 text-white drop-shadow-sm" strokeWidth={1.5} />
              {precip > 0 ? (
                <span className="type-stat text-xs text-slate-300 w-8">{precip}%</span>
              ) : (
                <span className="w-8" />
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3 w-20">
              <span className="type-stat text-sm text-slate-400">{min}&deg;</span>
              <span className="type-stat text-sm text-white">{max}&deg;</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
