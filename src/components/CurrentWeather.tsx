import { ReactNode } from 'react';
import { getWeatherCodeDetails } from '../utils/weatherCodeMap';
import { convertTemp, TempUnit } from '../utils/convertTemp';
import { AnimatedTemp } from './AnimatedTemp';

interface CurrentWeatherProps {
  data: any;
  unit: TempUnit;
}

export function CurrentWeather({ data, unit }: CurrentWeatherProps) {
  if (!data || !data.current) return null;

  const { current, daily, air_quality } = data;
  
  const rawTemp = current.current?.temperature_2m ?? current.temperature_2m;
  const rawFeelsLike = current.current?.apparent_temperature ?? current.apparent_temperature;
  const rawMin = daily?.temperature_2m_min?.[0] ?? rawTemp;
  const rawMax = daily?.temperature_2m_max?.[0] ?? rawTemp;
  
  const temp = convertTemp(rawTemp, unit);
  const feelsLike = convertTemp(rawFeelsLike, unit);
  const minTemp = convertTemp(rawMin, unit);
  const maxTemp = convertTemp(rawMax, unit);

  const codeDetails = getWeatherCodeDetails(current.current?.weather_code ?? current.weather_code);
  
  const pm25 = air_quality?.pm2_5;

  return (
    <div className="flex flex-col w-full relative pt-2">
      {/* PM 2.5 Badge - Left Aligned */}
      {pm25 !== undefined && (
        <div className="absolute top-0 left-0 flex items-center space-x-2">
          <div className="flex flex-col items-center justify-center text-[10px] font-bold text-slate-200 leading-none">
            <span>PM</span>
            <span>2.5</span>
          </div>
          <span className="text-xl font-bold text-white leading-none">{Math.round(pm25)}</span>
        </div>
      )}

      <div className="flex flex-col items-center text-center mt-12 sm:mt-16 space-y-2">
        {/* Condition Label */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-wide text-white drop-shadow-md">
          {codeDetails.label}
        </h2>
        
        {/* Hi / Lo / Feels Like */}
        <p className="text-sm sm:text-base text-slate-200 font-medium drop-shadow-sm flex items-center space-x-2">
          <span>{minTemp} ~ {maxTemp}&deg;{unit}</span>
          <span>Feels like {feelsLike}&deg;{unit}</span>
        </p>
      </div>

      {/* Giant Temperature */}
      <div className="flex justify-center items-start mt-6 mb-4">
        <span className="text-[10rem] sm:text-[12rem] font-medium tabular-nums tracking-tighter text-white drop-shadow-xl leading-none">
          <AnimatedTemp value={temp} />
        </span>
        <span className="text-4xl sm:text-5xl font-medium text-white drop-shadow-lg mt-8 sm:mt-10">
          &deg;{unit}
        </span>
      </div>
    </div>
  );
}
