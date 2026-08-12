import React from 'react';
import { Wind } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface AQICardProps {
  data: any; // Air quality data
}

export function AQICard({ data }: AQICardProps) {
  if (!data) return null;

  const aqi = data.us_aqi ?? 0;
  
  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-green-400', progressColor: 'bg-green-400' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400', progressColor: 'bg-yellow-400' };
    if (aqi <= 150) return { label: 'Sensitive', color: 'text-orange-400', progressColor: 'bg-orange-400' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-400', progressColor: 'bg-red-400' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-400', progressColor: 'bg-purple-400' };
    return { label: 'Hazardous', color: 'text-rose-900', progressColor: 'bg-rose-900' };
  };

  const { label, color } = getAQICategory(aqi);
  
  // Calculate marker position
  const percentage = Math.min(100, (aqi / 300) * 100);
  const angleRad = Math.PI - (percentage / 100) * Math.PI;
  const cx = 100 + 80 * Math.cos(angleRad);
  const cy = 100 - 80 * Math.sin(angleRad);

  const pollutants = [
    { name: 'PM2.5', value: data.pm2_5, max: 50 },
    { name: 'PM10', value: data.pm10, max: 150 },
    { name: 'SO2', value: data.sulphur_dioxide, max: 100 },
    { name: 'CO', value: data.carbon_monoxide, max: 10000 }
  ];

  return (
    <GlassCard className="p-4 sm:p-6 w-full">
      <div className="flex items-center space-x-2 mb-4">
        <Wind className="w-5 h-5 text-slate-300" />
        <span className="text-sm font-medium text-slate-300">Air Quality</span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
        {/* Left: Gauge */}
        <div className="relative w-48 h-24 shrink-0">
          <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="aqiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="25%" stopColor="#facc15" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="75%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            {/* Background Arc */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" strokeLinecap="round" />
            {/* Colored Arc */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#aqiGrad)" strokeWidth="16" strokeLinecap="round" />
            
            {/* Marker */}
            <circle cx={cx} cy={cy} r="6" fill="white" className="drop-shadow-md" stroke="#333" strokeWidth="2" />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className="text-4xl font-bold text-white leading-none">{Math.round(aqi)}</span>
            <span className={`text-sm font-medium mt-1 ${color}`}>{label}</span>
          </div>
        </div>

        {/* Right: Pollutants 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1 w-full">
          {pollutants.map((p, i) => {
            const pVal = p.value ?? 0;
            const pPct = Math.min(100, (pVal / p.max) * 100);
            return (
              <div key={i} className="flex flex-col">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-medium text-slate-400">{p.name}</span>
                  <span className="text-sm font-bold text-slate-200">{Math.round(pVal)}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-300 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${pPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
