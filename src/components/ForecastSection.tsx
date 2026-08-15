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
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: tapScale }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-6 py-2.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-semibold flex items-center gap-2 backdrop-blur-xl shadow-lg transition-all duration-300 cursor-pointer"
        >
          <span>{isExpanded ? 'Collapse' : 'View more'}</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>
    </GlassCard>
  );
}

