import { GlassCard } from './GlassCard';
import { Wind, Sun } from 'lucide-react';

interface AQIUVRowProps {
  data: any;
}

export function AQIUVRow({ data }: AQIUVRowProps) {
  if (!data || !data.current) return null;

  const aqi = data.air_quality?.us_aqi;
  const uvIndex = data.current.uv_index;

  // AQI logic
  let aqiLabel = 'Unknown';
  let aqiColor = 'bg-slate-500';
  let aqiPercent = 0;

  if (aqi !== undefined) {
    if (aqi <= 50) { aqiLabel = 'Good'; aqiColor = 'bg-green-400'; aqiPercent = (aqi / 300) * 100; }
    else if (aqi <= 100) { aqiLabel = 'Moderate'; aqiColor = 'bg-yellow-400'; aqiPercent = (aqi / 300) * 100; }
    else if (aqi <= 150) { aqiLabel = 'Unhealthy (Sens)'; aqiColor = 'bg-orange-400'; aqiPercent = (aqi / 300) * 100; }
    else if (aqi <= 200) { aqiLabel = 'Unhealthy'; aqiColor = 'bg-red-500'; aqiPercent = (aqi / 300) * 100; }
    else if (aqi <= 300) { aqiLabel = 'Very Unhealthy'; aqiColor = 'bg-purple-500'; aqiPercent = (aqi / 300) * 100; }
    else { aqiLabel = 'Hazardous'; aqiColor = 'bg-rose-900'; aqiPercent = 100; }
  }

  // UV logic
  let uvLabel = 'Unknown';
  if (uvIndex !== undefined) {
    if (uvIndex < 3) uvLabel = 'Low';
    else if (uvIndex < 6) uvLabel = 'Moderate';
    else if (uvIndex < 8) uvLabel = 'High';
    else if (uvIndex < 11) uvLabel = 'Very High';
    else uvLabel = 'Extreme';
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* AQI Card */}
      <GlassCard className="p-4 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-sm font-medium uppercase tracking-wider">Air Quality</span>
          <Wind className="w-4 h-4" />
        </div>
        
        {aqi !== undefined ? (
          <>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-semibold text-slate-50 tabular-nums leading-none">{Math.round(aqi)}</span>
            </div>
            
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-slate-200">{aqiLabel}</span>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${aqiColor} rounded-full transition-all duration-700`} 
                  style={{ width: `${Math.min(aqiPercent, 100)}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-400">Data unavailable</div>
        )}
      </GlassCard>

      {/* UV Card */}
      <GlassCard className="p-4 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-sm font-medium uppercase tracking-wider">UV Index</span>
          <Sun className="w-4 h-4" />
        </div>
        
        {uvIndex !== undefined ? (
          <>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-semibold text-slate-50 tabular-nums leading-none">{Math.round(uvIndex)}</span>
            </div>
            
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-slate-200">{uvLabel}</span>
              <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-yellow-400 to-purple-500 rounded-full relative">
                 {/* UV indicator dot */}
                 <div 
                   className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border border-slate-200 transition-all duration-700"
                   style={{ left: `calc(${Math.min((uvIndex / 11) * 100, 100)}% - 6px)` }}
                 />
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-400">Data unavailable</div>
        )}
      </GlassCard>
    </div>
  );
}
