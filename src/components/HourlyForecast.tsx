import React, { useRef, useState, useCallback, useEffect } from 'react';
import { getWeatherCodeDetails } from '../utils/weatherCodeMap';
import { convertTemp, TempUnit } from '../utils/convertTemp';
import { TempTrendChart } from './TempTrendChart';
import { Sunrise, Sunset } from 'lucide-react';

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
    } else if (sunsetStr) {
      next24Hours.push({
        time: sunsetStr,
        temp: hourly.temperature_2m[i],
        precip: 0,
        code: 'sunset',
        isCurrent: false,
        isEvent: true
      });
    } else {
      next24Hours.push({
        time: timeStr,
        temp: hourly.temperature_2m[i],
        precip: hourly.precipitation_probability[i] || 0,
        code: hourly.weather_code[i],
        isCurrent: i === startIndex,
        isEvent: false
      });
    }
  }

  const columnWidth = 64;
  const chartHeight = 80;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mouse Drag to Scroll State
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const dragDistance = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
    dragDistance.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag sensitivity
    dragDistance.current += Math.abs(walk);
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Prevent horizontal touch gestures inside the hourly forecast from propagating to page carousel
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current || e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(currentX - touchStartX.current);
    const deltaY = Math.abs(currentY - touchStartY.current);

    // If horizontal swipe is dominant and within the scrollable range, stop propagation to parent carousel
    if (deltaX > deltaY && deltaX > 5) {
      const container = scrollRef.current;
      const isAtLeft = container.scrollLeft <= 0;
      const isAtRight = container.scrollLeft + container.clientWidth >= container.scrollWidth - 2;
      const movingLeft = currentX < touchStartX.current;
      const movingRight = currentX > touchStartX.current;

      if ((movingLeft && !isAtRight) || (movingRight && !isAtLeft)) {
        e.stopPropagation();
      }
    }
  };

  return (
    <div 
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className={`w-full relative py-4 overflow-x-auto overflow-y-hidden hide-scrollbar snap-x snap-mandatory ${
        isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
      }`}
      style={{
        touchAction: 'pan-x',
        overscrollBehaviorX: 'contain',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <div 
        className="relative flex" 
        style={{ width: next24Hours.length * columnWidth, minHeight: 180 }}
      >
        {/* Trend Chart */}
        <TempTrendChart 
          data={next24Hours.map(h => ({ temp: convertTemp(h.temp, unit) }))} 
          columnWidth={columnWidth} 
          height={chartHeight} 
          resetKey={`${data.latitude}_${data.longitude}_${data.current?.time?.substring(0, 10)}`}
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
                className="flex flex-col items-center justify-start pointer-events-auto snap-start"
                style={{ width: columnWidth }}
              >
                {/* Precip info above icon */}
                <div className="h-4 mb-1 flex items-center justify-center">
                  {hour.precip > 0 && !hour.isEvent ? (
                    <span className="type-stat text-[10px] text-slate-300">{Math.round(hour.precip)}%</span>
                  ) : null}
                </div>

                <div className="mb-2">
                  {IconComponent && (
                    <IconComponent 
                      className={`w-5 h-5 ${hour.isEvent ? 'text-amber-400' : 'text-white drop-shadow-md'}`} 
                      strokeWidth={1.5} 
                    />
                  )}
                </div>

                {/* Sub-label under icon */}
                <div className="h-4 mb-2 flex items-center justify-center" />

                {hour.isCurrent ? (
                  <span className="type-body-medium text-xs text-white">
                    Now
                  </span>
                ) : (
                  <span className="type-stat text-xs text-slate-300">
                    {timeLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
