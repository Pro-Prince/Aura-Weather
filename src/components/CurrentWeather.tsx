import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { getWeatherCodeDetails } from '../utils/weatherCodeMap';
import { convertTemp, TempUnit } from '../utils/convertTemp';
import { AnimatedTemp } from './AnimatedTemp';
import { useAppReducedMotion } from '../utils/motion';

interface CurrentWeatherProps {
  data: any;
  unit: TempUnit;
  onToggleUnit?: () => void;
}

export function CurrentWeather({ data, unit, onToggleUnit }: CurrentWeatherProps) {
  if (!data || !data.current) return null;

  const { current, daily, air_quality } = data;
  
  const rawTemp = current.current?.temperature_2m ?? current.temperature_2m;
  const rawFeelsLike = current.current?.apparent_temperature ?? current.apparent_temperature;
  const rawMin = daily?.temperature_2m_min?.[0] ?? rawTemp;
  const rawMax = daily?.temperature_2m_max?.[0] ?? rawTemp;
  
  const temp = Math.round(convertTemp(rawTemp, unit));
  const feelsLike = Math.round(convertTemp(rawFeelsLike, unit));
  const minTemp = Math.round(convertTemp(rawMin, unit));
  const maxTemp = Math.round(convertTemp(rawMax, unit));

  const codeDetails = getWeatherCodeDetails(current.current?.weather_code ?? current.weather_code);

  const lat = data.latitude ?? 0;
  const lon = data.longitude ?? 0;
  const cityKey = `${lat},${lon}`;

  const prevCityKeyRef = useRef<string | null>(null);
  const prevRawTempRef = useRef<number | null>(null);
  const prevDataRef = useRef<any>(null);
  const controls = useAnimation();

  const prefersReducedMotion = useAppReducedMotion();

  useEffect(() => {
    if (prevCityKeyRef.current === cityKey) {
      // Trigger whenever data reference changes while on the same city (i.e. on completed pull-to-refresh / refetch)
      if (prevDataRef.current !== null && prevDataRef.current !== data) {
        console.log(`[CurrentWeather] Refresh completed! Previous Raw Temp: ${prevRawTempRef.current ?? 'N/A'}, New Raw Temp: ${rawTemp}`);
        
        // Trigger subtle, premium visual update pulse!
        controls.start({
          scale: prefersReducedMotion ? [1, 1, 1] : [1, 1.03, 1],
          opacity: [1, 0.45, 0.85, 1],
          transition: {
            duration: 0.45,
            ease: "easeInOut"
          }
        });
      }
    }
    prevCityKeyRef.current = cityKey;
    prevRawTempRef.current = rawTemp;
    prevDataRef.current = data;
  }, [cityKey, data, rawTemp, controls, prefersReducedMotion]);

  return (
    <div className="flex flex-col w-full relative py-12">

      <div className="flex flex-col items-center text-center space-y-2">
        {/* Weather Condition Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-lg mb-2">
          <codeDetails.Icon className="w-6 h-6 text-white drop-shadow-sm" strokeWidth={1.5} />
        </div>

        {/* Condition Label */}
        <h2 className="type-section-header text-2xl sm:text-3xl text-white drop-shadow-md">
          {codeDetails.label}
        </h2>
        
        {/* Hi / Lo / Feels Like */}
        <p className="type-body text-slate-300 drop-shadow-sm flex items-center space-x-2">
          <span className="font-numeric font-medium text-slate-200">{minTemp}&deg; ~ {maxTemp}&deg;{unit}</span>
          <span className="opacity-40">&bull;</span>
          <span>Feels like <span className="font-numeric font-medium text-slate-200">{feelsLike}&deg;{unit}</span></span>
        </p>
      </div>

      {/* Giant Hero Temperature with visual pulse animation */}
      <div 
        onClick={onToggleUnit}
        title="Tap to toggle °C / °F"
        className={`flex justify-center items-start mt-8 ${onToggleUnit ? 'cursor-pointer select-none group' : ''}`}
      >
        <motion.div 
          animate={controls}
          className="flex items-start inline-flex origin-center"
        >
          <span className="type-hero text-8xl sm:text-9xl text-white drop-shadow-xl inline-block">
            <AnimatedTemp value={temp} />
          </span>
          <span className="font-sans font-medium text-4xl sm:text-5xl text-white/90 drop-shadow-lg mt-4 ml-1">
            &deg;{unit}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
