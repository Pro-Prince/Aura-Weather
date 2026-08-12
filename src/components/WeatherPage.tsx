import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { MapPinOff, RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CurrentWeather } from './CurrentWeather';
import { ForecastSection } from './ForecastSection';
import { AQICard } from './AQICard';
import { SunArcCard } from './SunArcCard';
import { Nowcast } from './Nowcast';
import { AlertBanner } from './AlertBanner';
import { FeelsLikeCard } from './FeelsLikeCard';
import { WindCard } from './WindCard';
import { HumidityCard } from './HumidityCard';
import { UVCard } from './UVCard';
import { VisibilityCard } from './VisibilityCard';
import { PressureCard } from './PressureCard';
import { LifeIndexGrid } from './LifeIndexGrid';
import { useWeather } from '../hooks/useWeather';
import { TempUnit } from '../utils/convertTemp';
import { getBackgroundImage } from '../utils/getBackgroundImage';
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

  const bgImage = displayState.data ? getBackgroundImage(displayState.data.current?.weather_code ?? 0, displayState.data.current?.is_day ?? 1) : null;

  return (
    <div className="w-full h-full shrink-0 snap-center relative overflow-hidden">
      {/* Dynamic Background for this page */}
      {bgImage && (
        <img 
          src={bgImage}
          alt="Weather Background"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover -z-20" 
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 pointer-events-none -z-10" />

      {/* Scrollable Content */}
      <div className="w-full h-full overflow-y-auto px-4 sm:px-6 md:px-8 pb-8 pt-24 flex flex-col items-center hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-4 space-y-3">
                  <motion.img
                    src="/logo/weather_logo.png"
                    alt="Aura Weather"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl shadow-sky-500/20 border border-white/20"
                    animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.85, 1, 0.85] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    referrerPolicy="no-referrer"
                  />
                  <h2 className="text-xl font-light tracking-wide text-slate-100">Aura Weather</h2>
                </motion.div>
                <motion.div variants={itemVariants}><HeroSkeleton /></motion.div>
                <motion.div variants={itemVariants}><AQIUVSkeleton /></motion.div>
                <motion.div variants={itemVariants}><HourlySkeleton /></motion.div>
                <motion.div variants={itemVariants}><DailySkeleton /></motion.div>
              </>
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <CurrentWeather data={displayState.data} unit={unit} />
                </motion.div>
                {showAlert && alertMessage && eventId && (
                  <motion.div variants={itemVariants} className="flex justify-center -mt-4 mb-4 z-10">
                    <AlertBanner message={alertMessage} onDismiss={() => setDismissedEventId(eventId)} />
                  </motion.div>
                )}
                <motion.div variants={itemVariants}>
                  <Nowcast data={displayState.data} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <AQICard data={displayState.data.air_quality} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SunArcCard data={displayState.data} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <ForecastSection data={displayState.data} unit={unit} />
                </motion.div>
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                  <FeelsLikeCard 
                    currentApparentTempC={displayState.data.current?.apparent_temperature ?? 0} 
                    unit={unit} 
                  />
                  <WindCard 
                    windSpeedKmH={displayState.data.current?.wind_speed_10m ?? 0} 
                    windDirectionDeg={displayState.data.current?.wind_direction_10m ?? 0} 
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                  <HumidityCard 
                    humidity={displayState.data.current?.relative_humidity_2m ?? 0} 
                  />
                  <UVCard 
                    uvIndex={displayState.data.current?.uv_index ?? 0} 
                  />
                  <VisibilityCard 
                    visibilityMeters={displayState.data.current?.visibility ?? 0} 
                  />
                  <PressureCard 
                    pressureHpa={displayState.data.current?.surface_pressure ?? 1013} 
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <LifeIndexGrid data={displayState.data} />
                </motion.div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
