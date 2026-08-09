/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Search, MapPinOff, RefreshCw } from 'lucide-react';
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
import { HeroSkeleton, AQIUVSkeleton, HourlySkeleton, DailySkeleton } from './components/SkeletonLoaders';
import { InstallPrompt } from './components/InstallPrompt';

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const geo = useGeolocation();
  const [manualLocation, setManualLocation] = useState<{lat: number; lon: number; name: string} | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unit, setUnit] = useState<TempUnit>('C');

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

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

  const { data, loading: weatherLoading, error: weatherError, retry } = useWeather(activeCoordinates);

  const isLoading = (!manualLocation && geo.loading) || weatherLoading;
  const isGeoDenied = !manualLocation && !geo.loading && !geo.coordinates && geo.isFallback;
  const error = weatherError || (!manualLocation && !geo.isFallback && geo.error ? geo.error : null);

  const [displayState, setDisplayState] = useState<{
    data: any | null;
    name: string;
    error: string | null;
    isGeoDenied: boolean;
  }>({ data: null, name: '', error: null, isGeoDenied: false });

  useEffect(() => {
    // We only update display when loading finishes OR when there are no active coordinates (e.g. geo denied) to allow cross-fading
    if (!weatherLoading || !activeCoordinates) {
      setDisplayState({
        data,
        name: locationName,
        error,
        isGeoDenied
      });
    }
  }, [weatherLoading, data, locationName, error, isGeoDenied, activeCoordinates]);

  let isDay = true;
  let weatherCode = 0; // Default to clear

  if (displayState.data && displayState.data.current && displayState.data.daily) {
    const nowTimeStr = displayState.data.current.time;
    const dayPrefix = nowTimeStr.substring(0, 10);
    const dayIndex = displayState.data.daily.time.findIndex((t: string) => t.startsWith(dayPrefix));
    const idx = dayIndex >= 0 ? dayIndex : 0;
    
    const now = new Date(nowTimeStr).getTime();
    const sunrise = new Date(displayState.data.daily.sunrise[idx]).getTime();
    const sunset = new Date(displayState.data.daily.sunset[idx]).getTime();
    isDay = now >= sunrise && now <= sunset;
    weatherCode = displayState.data.current.weather_code ?? 0;
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
        <div className="relative z-10 w-full max-w-md md:max-w-xl lg:max-w-2xl flex flex-col space-y-6">
          {/* Header */}
          <header className="flex items-center justify-between py-2">
            <h1 className="text-2xl font-light tracking-wide text-slate-50 drop-shadow-sm">
              Aura Weather
            </h1>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleUnit}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-sm font-medium text-slate-200"
              >
                &deg;{unit}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                <Search className="w-5 h-5 text-slate-200" />
              </motion.button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={displayState.name || 'loading'} // triggers animation when location changes
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                },
                exit: {
                  opacity: 0,
                  transition: { duration: 0.2 }
                }
              }}
              className={`flex flex-col space-y-6 transition-opacity duration-300 ${weatherLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
            >
              {displayState.isGeoDenied ? (
                <motion.div variants={itemVariants}>
                  <GlassCard className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
                      <MapPinOff className="w-8 h-8 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-medium text-slate-100">Location Access Denied</h2>
                    <p className="text-slate-300 text-sm">We need your location to show local weather.</p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsSearchOpen(true)}
                      className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-medium text-slate-100 border border-white/10 shadow-sm"
                    >
                      Search a city instead
                    </motion.button>
                  </GlassCard>
                </motion.div>
              ) : displayState.error ? (
                <motion.div variants={itemVariants}>
                  <GlassCard className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
                      <RefreshCw className="w-8 h-8 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-medium text-slate-100">Connection Failed</h2>
                    <p className="text-slate-300 text-sm">{displayState.error}</p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={retry}
                      className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-medium text-slate-100 border border-white/10 shadow-sm"
                    >
                      Try Again
                    </motion.button>
                  </GlassCard>
                </motion.div>
              ) : !displayState.data ? (
                <>
                  <motion.div variants={itemVariants}><HeroSkeleton /></motion.div>
                  <motion.div variants={itemVariants}><AQIUVSkeleton /></motion.div>
                  <motion.div variants={itemVariants}><HourlySkeleton /></motion.div>
                  <motion.div variants={itemVariants}><DailySkeleton /></motion.div>
                </>
              ) : (
                <>
                  <motion.div variants={itemVariants}>
                    <CurrentWeather data={displayState.data} locationName={displayState.name} unit={unit} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <AQIUVRow data={displayState.data} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <HourlyForecast data={displayState.data} unit={unit} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <DailyForecast data={displayState.data} unit={unit} />
                  </motion.div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      <InstallPrompt />

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelectLocation={setManualLocation} 
      />
    </div>
  );
}
