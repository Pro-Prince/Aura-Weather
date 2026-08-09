/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { AQIUVRow } from './components/AQIUVRow';
import { SearchOverlay } from './components/SearchOverlay';
import { useGeolocation } from './hooks/useGeolocation';
import { useWeather } from './hooks/useWeather';
import { TempUnit } from './utils/convertTemp';
import { getBackgroundGradient } from './utils/getBackgroundGradient';
import { WeatherParticles } from './components/WeatherParticles';

export default function App() {
  const geo = useGeolocation();
  const [manualLocation, setManualLocation] = useState<{lat: number; lon: number; name: string} | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unit, setUnit] = useState<TempUnit>('C');

  useEffect(() => {
    const saved = localStorage.getItem('aura-temp-unit');
    if (saved === 'C' || saved === 'F') {
      setUnit(saved);
    }
  }, []);

  const toggleUnit = () => {
    setUnit(prev => {
      const next = prev === 'C' ? 'F' : 'C';
      localStorage.setItem('aura-temp-unit', next);
      return next;
    });
  };

  const activeCoordinates = manualLocation 
    ? { lat: manualLocation.lat, lon: manualLocation.lon } 
    : geo.coordinates;
  
  const locationName = manualLocation 
    ? manualLocation.name 
    : (geo.isFallback ? 'London' : 'Current Location');

  const { data, loading: weatherLoading, error: weatherError } = useWeather(activeCoordinates);

  const isLoading = (!manualLocation && geo.loading) || weatherLoading;
  const error = weatherError || (!manualLocation && !geo.isFallback && geo.error ? geo.error : null);

  let isDay = true;
  let weatherCode = 0; // Default to clear

  if (data && data.current && data.daily) {
    const nowTimeStr = data.current.time;
    const dayPrefix = nowTimeStr.substring(0, 10);
    const dayIndex = data.daily.time.findIndex((t: string) => t.startsWith(dayPrefix));
    const idx = dayIndex >= 0 ? dayIndex : 0;
    
    const now = new Date(nowTimeStr).getTime();
    const sunrise = new Date(data.daily.sunrise[idx]).getTime();
    const sunset = new Date(data.daily.sunset[idx]).getTime();
    isDay = now >= sunrise && now <= sunset;
    weatherCode = data.current.weather_code ?? 0;
  }

  const bgGradient = getBackgroundGradient(weatherCode, isDay);

  return (
    <div className="min-h-screen w-full flex justify-center text-slate-100 overflow-x-hidden relative p-4 sm:p-6 md:p-8">
      {/* Animated Dynamic Background */}
      <div className="fixed inset-0 bg-slate-950 -z-30" /> {/* Base fallback */}
      <AnimatePresence>
        <motion.div
          key={bgGradient}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className={`fixed inset-0 bg-gradient-to-br ${bgGradient} -z-20`}
        />
      </AnimatePresence>

      <WeatherParticles code={weatherCode} isDay={isDay} />

      {/* Subtle glassmorphic decorative elements */}
      <div className="fixed top-1/4 -left-1/4 md:left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 -right-1/4 md:right-1/4 w-[28rem] h-[28rem] bg-black/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-md flex flex-col space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <h1 className="text-2xl font-light tracking-wide text-slate-50 drop-shadow-sm">
            Aura Weather
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleUnit}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-sm font-medium text-slate-200"
            >
              &deg;{unit}
            </button>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <Search className="w-5 h-5 text-slate-200" />
            </button>
          </div>
        </header>

        {/* Current Conditions Hero */}
        <GlassCard className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          {isLoading ? (
            <div className="text-slate-300">Loading...</div>
          ) : error ? (
            <div className="text-red-400">Error: {error}</div>
          ) : (
            <CurrentWeather data={data} locationName={locationName} unit={unit} />
          )}
        </GlassCard>

        {/* AQI & UV Row */}
        {!isLoading && !error && data && (
          <AQIUVRow data={data} />
        )}

        {/* Hourly Forecast */}
        {isLoading || !data ? (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-slate-300 px-1 uppercase tracking-wider">Hourly</h2>
            <div className="flex space-x-3 overflow-x-auto pb-4 pt-1 snap-x hide-scrollbar">
              {[...Array(6)].map((_, i) => (
                <GlassCard key={i} className="min-w-[80px] p-4 flex flex-col items-center space-y-3 snap-start shrink-0">
                  <div className="w-8 h-4 rounded bg-white/10 animate-pulse" />
                  <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                  <div className="w-8 h-4 rounded bg-white/10 animate-pulse" />
                </GlassCard>
              ))}
            </div>
          </div>
        ) : error ? null : (
          <HourlyForecast data={data} unit={unit} />
        )}

        {/* 7-Day Forecast */}
        {isLoading || !data ? (
          <div className="space-y-3 pb-8">
            <h2 className="text-sm font-medium text-slate-300 px-1 uppercase tracking-wider">7-Day Forecast</h2>
            <GlassCard className="p-4 flex flex-col space-y-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-center justify-between w-full">
                  <div className="w-12 h-5 rounded bg-white/10 animate-pulse" />
                  <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
                  <div className="flex space-x-2">
                    <div className="w-8 h-5 rounded bg-white/10 animate-pulse" />
                    <div className="w-8 h-5 rounded bg-white/10 animate-pulse" />
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        ) : error ? null : (
          <DailyForecast data={data} unit={unit} />
        )}
      </div>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelectLocation={setManualLocation} 
      />
    </div>
  );
}
