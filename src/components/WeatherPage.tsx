import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { MapPinOff, RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CurrentWeather } from './CurrentWeather';
import { HourlyForecast } from './HourlyForecast';
import { DayStrip } from './DayStrip';
import { DailyForecast } from './DailyForecast';
import { AQIUVRow } from './AQIUVRow';
import { Nowcast } from './Nowcast';
import { AlertBanner } from './AlertBanner';
import { useWeather } from '../hooks/useWeather';
import { TempUnit } from '../utils/convertTemp';
import { HeroSkeleton, AQIUVSkeleton, HourlySkeleton, DailySkeleton } from './SkeletonLoaders';

interface WeatherPageProps {
  key?: React.Key;
  location: { lat?: number; lon?: number; name: string };
  isGeo?: boolean;
  geoData?: any;
  unit: TempUnit;
  isActive: boolean;
  onWeatherData: (data: any, isDay: boolean, weatherCode: number) => void;
  onSearchClick: () => void;
}

export function WeatherPage({
  location,
  isGeo,
  geoData,
  unit,
  isActive,
  onWeatherData,
  onSearchClick
}: WeatherPageProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (isActive) setHasLoadedOnce(true);
  }, [isActive]);

  const activeCoordinates = isGeo ? geoData.coordinates : { lat: location.lat!, lon: location.lon! };
  const locationName = location.name;

  const { data, loading: weatherLoading, error: weatherError, retry } = useWeather(
    activeCoordinates,
    !hasLoadedOnce && !isActive
  );

  const isLoading = (isGeo && geoData.loading) || weatherLoading;
  const isGeoDenied = isGeo && !geoData.loading && !geoData.coordinates && geoData.isFallback;
  const error = weatherError || (isGeo && !geoData.isFallback && geoData.error ? geoData.error : null);

  const [displayState, setDisplayState] = useState<{
    data: any | null;
    name: string;
    error: string | null;
    isGeoDenied: boolean;
  }>({ data: null, name: '', error: null, isGeoDenied: false });

  useEffect(() => {
    if (!weatherLoading || !activeCoordinates) {
      setDisplayState({
        data,
        name: locationName,
        error,
        isGeoDenied
      });
    }
  }, [weatherLoading, data, locationName, error, isGeoDenied, activeCoordinates]);

  useEffect(() => {
    if (isActive && displayState.data && displayState.data.current && displayState.data.daily) {
      const nowTimeStr = displayState.data.current.time;
      const dayPrefix = nowTimeStr.substring(0, 10);
      const dayIndex = displayState.data.daily.time.findIndex((t: string) => t.startsWith(dayPrefix));
      const idx = dayIndex >= 0 ? dayIndex : 0;
      
      const now = new Date(nowTimeStr).getTime();
      const sunrise = new Date(displayState.data.daily.sunrise[idx]).getTime();
      const sunset = new Date(displayState.data.daily.sunset[idx]).getTime();
      const isDay = now >= sunrise && now <= sunset;
      const weatherCode = displayState.data.current.weather_code ?? 0;
      
      onWeatherData(displayState.data, isDay, weatherCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, displayState.data]);

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const [dismissedEventId, setDismissedEventId] = useState<string | null>(null);

  let alertMessage: string | null = null;
  let eventId: string | null = null;

  if (displayState.data?.minutely_15?.precipitation && displayState.data.current?.time) {
    const timeArr = displayState.data.minutely_15.time;
    const precipArr = displayState.data.minutely_15.precipitation;
    const currentTime = displayState.data.current.time;
    
    let currentIndex = timeArr.indexOf(currentTime);
    if (currentIndex === -1 && currentTime) {
      currentIndex = timeArr.findIndex((t: string) => t >= currentTime);
    }

    if (currentIndex !== -1 && currentIndex + 2 < precipArr.length) {
      const nowPrecip = precipArr[currentIndex];
      const next15Precip = precipArr[currentIndex + 1];
      const next30Precip = precipArr[currentIndex + 2];

      if (nowPrecip === 0) {
        if (next15Precip > 0) {
          alertMessage = "Rain expected in ~15 minutes";
          eventId = timeArr[currentIndex + 1];
        } else if (next30Precip > 0) {
          alertMessage = "Rain expected in ~30 minutes";
          eventId = timeArr[currentIndex + 2];
        }
      }
    }
  }

  const showAlert = alertMessage && eventId && eventId !== dismissedEventId;

  return (
    <div className="w-full shrink-0 snap-center px-4 sm:px-6 md:px-8 pb-8 flex flex-col items-center">
      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl flex flex-col space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayState.name || 'loading'}
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
                    onClick={onSearchClick}
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
                {showAlert && alertMessage && eventId && (
                  <motion.div variants={itemVariants}>
                    <AlertBanner message={alertMessage} onDismiss={() => setDismissedEventId(eventId)} />
                  </motion.div>
                )}
                <motion.div variants={itemVariants}>
                  <CurrentWeather data={displayState.data} locationName={displayState.name} unit={unit} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Nowcast data={displayState.data} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <AQIUVRow data={displayState.data} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <DayStrip data={displayState.data} unit={unit} />
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
    </div>
  );
}
