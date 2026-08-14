import { ReactNode } from 'react';
import { getWeatherCodeDetails } from '../utils/weatherCodeMap';
import { convertTemp, TempUnit } from '../utils/convertTemp';
import { AnimatedTemp } from './AnimatedTemp';

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

      {/* Giant Hero Temperature */}
      <div 
        onClick={onToggleUnit}
        title="Tap to toggle °C / °F"
        className={`flex justify-center items-start mt-8 ${onToggleUnit ? 'cursor-pointer select-none group' : ''}`}
      >
        <span className="type-hero text-8xl sm:text-9xl text-white drop-shadow-xl transition-transform group-active:scale-95 duration-200">
          <AnimatedTemp value={temp} />
        </span>
        <span className="font-sans font-medium text-4xl sm:text-5xl text-white/90 drop-shadow-lg mt-4 ml-1">
          &deg;{unit}
        </span>
      </div>
    </div>
  );
}
