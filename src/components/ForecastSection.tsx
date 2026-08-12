import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { HourlyForecast } from './HourlyForecast';
import { DailyForecast } from './DailyForecast';
import { TempUnit } from '../utils/convertTemp';

interface ForecastSectionProps {
  data: any;
  unit: TempUnit;
}

export function ForecastSection({ data, unit }: ForecastSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <GlassCard className="flex flex-col overflow-hidden transition-all duration-300">
      <HourlyForecast data={data} unit={unit} />
      
      <DailyForecast data={data} unit={unit} isExpanded={isExpanded} />
      
      {!isExpanded ? (
        <button 
          onClick={() => setIsExpanded(true)}
          className="w-full py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5"
        >
          View more
        </button>
      ) : (
        <button 
          onClick={() => setIsExpanded(false)}
          className="w-full py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5"
        >
          Collapse
        </button>
      )}
    </GlassCard>
  );
}
