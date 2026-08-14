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
    if (aqi <= 50) return { label: 'Good', color: 'text-emerald-400', progressColor: 'bg-emerald-400' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-amber-300', progressColor: 'bg-amber-300' };
    if (aqi <= 150) return { label: 'Sensitive', color: 'text-orange-400', progressColor: 'bg-orange-400' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'text-rose-400', progressColor: 'bg-rose-400' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-400', progressColor: 'bg-purple-400' };
    return { label: 'Hazardous', color: 'text-rose-900', progressColor: 'bg-rose-900' };
  };

  const { label, color } = getAQICategory(aqi);
  
  // Calculate marker position on semicircle arc
  const percentage = Math.min(100, Math.max(0, (aqi / 300) * 100));
  const angleRad = Math.PI - (percentage / 100) * Math.PI;
  const radius = 86;
  const centerX = 100;
  const centerY = 106;
  const cx = centerX + radius * Math.cos(angleRad);
  const cy = centerY - radius * Math.sin(angleRad);

  // Pollutant definitions with healthy/max thresholds calibrated to EPA/WHO standards
  const pollutants = [
    { 
      name: 'PM2.5', 
      value: data.pm2_5 ?? 0, 
      max: 60, // 0-12: Good, 12-35: Moderate, 35-55: Unhealthy
      getBarColor: (v: number) => {
        if (v <= 12) return 'bg-emerald-400';
        if (v <= 35.4) return 'bg-amber-300';
        if (v <= 55.4) return 'bg-orange-400';
        return 'bg-rose-400';
      }
    },
    { 
      name: 'PM10', 
      value: data.pm10 ?? 0, 
      max: 120, // 0-54: Good, 54-154: Moderate
      getBarColor: (v: number) => {
        if (v <= 54) return 'bg-emerald-400';
        if (v <= 154) return 'bg-amber-300';
        if (v <= 254) return 'bg-orange-400';
        return 'bg-rose-400';
      }
    },
    { 
      name: 'SO2', 
      value: data.sulphur_dioxide ?? 0, 
      max: 60, 
      getBarColor: (v: number) => {
        if (v <= 35) return 'bg-emerald-400';
        if (v <= 75) return 'bg-amber-300';
        return 'bg-rose-400';
      }
    },
    { 
      name: 'CO', 
      value: data.carbon_monoxide ?? 0, 
      max: 600, // Ambient clean baseline is 100-300 µg/m³
      getBarColor: (v: number) => {
        if (v <= 400) return 'bg-emerald-400';
        if (v <= 1000) return 'bg-amber-300';
        if (v <= 2000) return 'bg-orange-400';
        return 'bg-rose-400';
      }
    }
  ];

  return (
    <GlassCard className="p-4 sm:p-6 w-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-1.5">
          <Wind className="w-[18px] h-[18px] text-slate-300" strokeWidth={1.5} />
          <span className="type-card-title text-[14px] font-medium text-white">Air quality</span>
        </div>
        <span className="type-caption text-[11px] text-slate-400 font-medium">US AQI</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        {/* Left: AQI Gauge */}
        <div className="relative w-48 sm:w-52 h-28 shrink-0 flex items-end justify-center">
          <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="aqiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="25%" stopColor="#fcd34d" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="75%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            {/* Background Arc */}
            <path d="M 14 106 A 86 86 0 0 1 186 106" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
            {/* Colored Arc */}
            <path d="M 14 106 A 86 86 0 0 1 186 106" fill="none" stroke="url(#aqiGrad)" strokeWidth="12" strokeLinecap="round" />
            
            {/* Indicator Marker */}
            <circle cx={cx} cy={cy} r="5.5" fill="white" className="drop-shadow-lg" stroke="#0f172a" strokeWidth="2.5" />
          </svg>
          
          <div className="absolute inset-x-0 bottom-2 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="type-stat-lg text-4xl text-white font-numeric font-bold leading-none tracking-tight drop-shadow-sm">{Math.round(aqi)}</span>
            <span className={`type-body-medium text-xs font-semibold mt-1.5 tracking-wide ${color}`}>{label}</span>
          </div>
        </div>

        {/* Right: Pollutants 2x2 Grid with individual proportional scaling */}
        <div className="grid grid-cols-2 gap-3 flex-1 w-full">
          {pollutants.map((p, i) => {
            const pVal = Number(p.value);
            const pPct = Math.min(100, Math.max(8, (pVal / p.max) * 100));
            const barColor = p.getBarColor(pVal);

            return (
              <div key={i} className="flex flex-col justify-between bg-white/[0.04] p-3 rounded-xl border border-white/5 shadow-inner">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="type-card-title text-xs text-slate-300 font-medium">{p.name}</span>
                  <div className="flex items-baseline space-x-1 text-right">
                    <span className="type-stat text-sm font-semibold font-numeric text-slate-100">{Math.round(pVal)}</span>
                    <span className="type-caption text-[10px] text-slate-400">µg/m³</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`} 
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
