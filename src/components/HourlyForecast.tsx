import React, { useRef, useState, useEffect } from 'react';
import { getWeatherCodeDetails } from '../utils/weatherCodeMap';
import { convertTemp, TempUnit } from '../utils/convertTemp';
import { TempTrendChart } from './TempTrendChart';
import { Droplets, Sunrise, Sunset, Wind } from 'lucide-react';

interface HourlyForecastProps {
  data: any;
  unit: TempUnit;
}

export function HourlyForecast({ data, unit }: HourlyForecastProps) {
  if (!data || !data.hourly || !data.current || !data.daily) return null;

  const { hourly, current, daily } = data;
  const currentTimeString = current.time;
  const currentHourPrefix = currentTimeString.substring(0, 13);
  
  let startIndex = hourly.time.findIndex((t: string) => t.startsWith(currentHourPrefix));
  if (startIndex === -1) startIndex = 0;

  const next24Hours = [];
  let sunEventInserted = false;

  for (let i = startIndex; i < startIndex + 24 && i < hourly.time.length; i++) {
    const timeStr = hourly.time[i];
    const hourPrefix = timeStr.substring(0, 13);

    const sunriseStr = daily.sunrise?.find((s: string) => s.startsWith(hourPrefix));
    const sunsetStr = daily.sunset?.find((s: string) => s.startsWith(hourPrefix));

    if (sunriseStr) {
      next24Hours.push({
        time: sunriseStr,
        temp: hourly.temperature_2m[i],
        precip: 0,
        code: 'sunrise',
        isCurrent: false,
        isEvent: true
      });
      sunEventInserted = true;
    } else if (sunsetStr) {
      next24Hours.push({
        time: sunsetStr,
        temp: hourly.temperature_2m[i],
        precip: 0,
        code: 'sunset',
        isCurrent: false,
        isEvent: true
      });
      sunEventInserted = true;
    } else {
      next24Hours.push({
        time: timeStr,
        temp: hourly.temperature_2m[i],
        precip: hourly.precipitation_probability[i],
        code: hourly.weather_code[i],
        isCurrent: i === startIndex,
        isEvent: false
      });
    }
  }

  // We need column width to map SVG properly. Let's say 64px width per column.
  const columnWidth = 64;
  const chartHeight = 80; // height of the line chart
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full relative py-4 hide-scrollbar overflow-x-auto overflow-y-hidden" ref={scrollRef}>
      <div className="relative flex" style={{ width: next24Hours.length * columnWidth, minHeight: 180 }}>
        
        {/* Trend Chart */}
        <TempTrendChart 
          data={next24Hours.map(h => ({ temp: convertTemp(h.temp, unit) }))} 
          columnWidth={columnWidth} 
          height={chartHeight} 
        />

        {/* Hourly items (Icons & Labels) */}
        <div className="absolute top-[80px] left-0 right-0 flex pointer-events-none">
          {next24Hours.map((hour, idx) => {
            let timeLabel = '';
            let IconComponent: React.ElementType | null = null;

            if (hour.isEvent) {
              const hm = hour.time.split('T')[1];
              timeLabel = hm;
              IconComponent = hour.code === 'sunrise' ? Sunrise : Sunset;
            } else if (hour.isCurrent) {
              timeLabel = 'Now';
              IconComponent = getWeatherCodeDetails(hour.code as number).Icon;
            } else {
              const hm = hour.time.split('T')[1];
              timeLabel = hm;
              IconComponent = getWeatherCodeDetails(hour.code as number).Icon;
            }

            return (
              <div 
                key={idx} 
                className="flex flex-col items-center justify-start pointer-events-auto"
                style={{ width: columnWidth }}
              >
                {/* Precip / Wind info could go above icon */}
                <div className="h-4 mb-1 flex items-center justify-center">
                  {hour.precip > 0 && !hour.isEvent ? (
                    <span className="text-[10px] font-semibold text-slate-300">{hour.precip}%</span>
                  ) : null}
                </div>

                <div className="mb-2">
                  {IconComponent && <IconComponent className={`w-6 h-6 ${hour.isEvent ? 'text-amber-400' : 'text-white drop-shadow-md'}`} />}
                </div>

                {/* Sub-label under icon (like wind force) - PDF shows this optionally */}
                <div className="h-4 mb-2 flex items-center justify-center">
                  {/* Assuming we might want to put SW Force 2 here, but skip for now to match exactly */}
                </div>

                <span className={`text-xs ${hour.isCurrent ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                  {timeLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
