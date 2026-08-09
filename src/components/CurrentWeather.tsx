import { ReactNode } from 'react';
import { getWeatherCodeDetails } from '../utils/weatherCodeMap';
import { Thermometer, Droplets, Wind, Sun, ArrowUp, ArrowDown } from 'lucide-react';
import { convertTemp, TempUnit } from '../utils/convertTemp';
import { AnimatedTemp } from './AnimatedTemp';

interface CurrentWeatherProps {
  data: any;
  locationName: string;
  unit: TempUnit;
}

export function CurrentWeather({ data, locationName, unit }: CurrentWeatherProps) {
  if (!data || !data.current) return null;

  const { current } = data;
  const rawTemp = current.current?.temperature_2m ?? current.temperature_2m;
  const rawFeelsLike = current.current?.apparent_temperature ?? current.apparent_temperature;
  
  const temp = convertTemp(rawTemp, unit);
  const feelsLike = convertTemp(rawFeelsLike, unit);

  // Check if delta is significant (>= 3 degrees in current unit)
  const tempDiff = feelsLike - temp;
  const showDelta = Math.abs(tempDiff) >= 3;

  const humidity = current.current?.relative_humidity_2m ?? current.relative_humidity_2m;
  const windSpeed = current.current?.wind_speed_10m ?? current.wind_speed_10m;
  const uvIndex = current.current?.uv_index ?? current.uv_index;
  const codeDetails = getWeatherCodeDetails(current.current?.weather_code ?? current.weather_code);
  const WeatherIcon = codeDetails.Icon;

  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const dateStr = new Date().toLocaleDateString(undefined, dateOptions);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full">
      <div className="flex flex-col items-center text-center space-y-1">
        <h2 className="text-xl font-medium tracking-wide text-slate-100">
          {locationName}
        </h2>
        <p className="text-sm text-slate-300 font-light">{dateStr}</p>
      </div>

      <div className="flex flex-col items-center justify-center pt-2 pb-4">
        <div className="flex items-center justify-center space-x-6">
          <WeatherIcon className="w-16 h-16 sm:w-20 sm:h-20 text-slate-100 drop-shadow-md" strokeWidth={1.5} />
          <div className="flex flex-col relative">
             <span className="text-7xl sm:text-8xl font-semibold tabular-nums tracking-tighter text-slate-50 drop-shadow-lg leading-none flex items-start">
                <span><AnimatedTemp value={temp} />&deg;</span>
                {showDelta && (
                  <span className="flex items-center text-sm font-medium bg-white/20 px-1.5 py-0.5 rounded-full ml-2 mt-1 text-slate-200">
                    {tempDiff > 0 ? <ArrowUp className="w-3 h-3 mr-0.5" /> : <ArrowDown className="w-3 h-3 mr-0.5" />}
                    <AnimatedTemp value={Math.abs(tempDiff)} />&deg;
                  </span>
                )}
             </span>
             <span className="text-lg font-medium text-slate-300 tracking-wide mt-2">
                {codeDetails.label}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full border-t border-white/10 pt-6">
        <StatChip icon={Thermometer} label="Feels Like" value={<><AnimatedTemp value={feelsLike} />&deg;</>} />
        <StatChip icon={Droplets} label="Humidity" value={`${humidity}%`} />
        <StatChip icon={Wind} label="Wind" value={`${windSpeed} km/h`} />
        <StatChip icon={Sun} label="UV Index" value={uvIndex} />
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value }: { icon: any; label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center space-x-1 mb-1.5 text-slate-300">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <span className="text-sm font-medium text-slate-100">{value}</span>
    </div>
  );
}
