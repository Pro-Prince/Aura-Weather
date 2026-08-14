import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { HourlyForecast } from './HourlyForecast';
import { DailyForecast } from './DailyForecast';
import { TempUnit } from '../utils/convertTemp';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useTapScale } from '../utils/motion';

interface ForecastSectionProps {
  data: any;
  unit: TempUnit;
}

export function ForecastSection({ data, unit }: ForecastSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tapScale = useTapScale();

  return (
    // Compliance: Actionable control tier per /INTERACTION_GUIDELINES.md
    <GlassCard className="p-4 sm:p-6 flex flex-col space-y-4 sm:space-y-6 overflow-hidden transition-all duration-300">
      <HourlyForecast data={data} unit={unit} />
      
      <DailyForecast data={data} unit={unit} isExpanded={isExpanded} />
      
      <div className="pt-2 flex justify-center border-t border-white/10">
        {!isExpanded ? (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: tapScale }}
            onClick={() => setIsExpanded(true)}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-2 backdrop-blur-md transition-colors shadow-sm"
          >
            <span>View more</span>
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: tapScale }}
            onClick={() => setIsExpanded(false)}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-2 backdrop-blur-md transition-colors shadow-sm"
          >
            <span>Collapse</span>
            <ChevronUp className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </GlassCard>
  );
}

