import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion, useTransform } from 'motion/react';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useTapScale, springTransition } from '../utils/motion';
import { MapPinOff, RefreshCw, MapPin, ListPlus, Thermometer } from 'lucide-react';
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
import { WeatherCanvas } from './WeatherCanvas';
import { SkyBackground } from './SkyBackground';
import { BackgroundErrorBoundary } from './BackgroundErrorBoundary';
import { getWeatherVisualState } from '../utils/getWeatherVisualState';

interface WeatherPageProps {
  key?: React.Key;
  location: { lat?: number; lon?: number; name: string };
  isGeo?: boolean;
  geoData?: any;
  unit: TempUnit;
  isActive: boolean;
  onSearchClick: () => void;
  onToggleUnit?: () => void;
}

export function WeatherPage({
  location,
  isGeo,
  geoData,
  unit,
  isActive,
  onSearchClick,
  onToggleUnit
}: WeatherPageProps) {
  const prefersReducedMotion = useReducedMotion();
  const tapScale = useTapScale();
  const scrollRef = useRef<HTMLDivElement>(null);

  const lat = isGeo ? geoData?.coordinates?.lat : location?.lat;
  const lon = isGeo ? geoData?.coordinates?.lon : location?.lon;
  const displayName = location?.name || 'Current Location';

  const activeCoordinates = useMemo(() => {
    if (lat !== undefined && lon !== undefined && lat !== null && lon !== null && !isNaN(Number(lat)) && !isNaN(Number(lon))) {
      return { name: displayName, lat: Number(lat), lon: Number(lon) };
    }
    return null;
  }, [lat, lon, displayName]);

  const { data, loading: weatherLoading, error: weatherError, retry, isCached } = useWeather(
    activeCoordinates,
    false // Always allow fetching on mount so data is preloaded
  );

  const [localTime, setLocalTime] = useState<string>('');

  useEffect(() => {
    if (isGeo) {
      setLocalTime('');
      return;
    }

    const updateTime = () => {
      let timeStr = '';
      if (data?.timezone) {
        try {
          timeStr = new Date().toLocaleTimeString([], {
            timeZone: data.timezone,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
        } catch (e) {
          // ignore invalid timezone
        }
      }

      if (!timeStr && data?.utc_offset_seconds !== undefined) {
        try {
          const utcOffsetSeconds = data.utc_offset_seconds;
          const now = new Date();
          const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
          const cityDate = new Date(utcMs + (utcOffsetSeconds * 1000));
          timeStr = cityDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
        } catch (e) {}
      }

      if (!timeStr && location?.lon !== undefined) {
        try {
          const offsetHours = Math.round(location.lon / 15);
          const now = new Date();
          const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
          const cityDate = new Date(utcMs + (offsetHours * 3600000));
          timeStr = cityDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
        } catch (e) {}
      }

      if (!timeStr) {
        timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      }

      setLocalTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [isGeo, data?.timezone, data?.utc_offset_seconds, location?.lon]);

  const { pullY, isRefreshing } = usePullToRefresh(scrollRef, retry);

  const isGeoLoading = Boolean(isGeo && geoData?.loading);
  const isGeoDenied = Boolean(isGeo && !geoData?.loading && !geoData?.coordinates && geoData?.isFallback);
  const isLoading = isGeoLoading || (weatherLoading && !data);
  const error = weatherError || (isGeo && !geoData?.isFallback && geoData?.error ? geoData.error : null);

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 15 },
    visible: { opacity: 1, y: 0, transition: springTransition },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const [dismissedEventId, setDismissedEventId] = useState<string | null>(null);

  let alertMessage: string | null = null;
  let eventId: string | null = null;

  if (data?.minutely_15?.precipitation && data.current?.time) {
    const timeArr = data.minutely_15.time;
    const precipArr = data.minutely_15.precipitation;
    const currentTime = data.current.time;
    
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

  const visualState = useMemo(() => {
    return getWeatherVisualState(data?.current, data?.daily);
  }, [data?.current, data?.daily]);

  return (
    <div className="w-full h-full shrink-0 snap-center relative overflow-hidden">
      {/* Dynamic Visual Sky & Canvas (Completely static / fixed in viewport background) */}
      <BackgroundErrorBoundary>
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <SkyBackground visualState={visualState} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 pointer-events-none z-[1]" />
          <WeatherCanvas visualState={visualState} />
        </div>
      </BackgroundErrorBoundary>

      {/* Scrollable Content Container */}
      <div 
        ref={scrollRef} 
        className="w-full h-full overflow-y-auto px-4 sm:px-6 md:px-8 pb-12 pt-4 flex flex-col items-center hide-scrollbar z-10 relative" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehaviorY: 'contain' }}
      >
        {/* Pull to refresh spinner */}
        <motion.div 
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center text-white/80"
          style={{ y: pullY, opacity: useTransform(pullY, [0, 50], [0, 1]) }}
        >
          <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
        </motion.div>

        <motion.div 
          style={{ y: pullY }}
          className="w-full max-w-md md:max-w-xl lg:max-w-2xl flex flex-col space-y-8"
        >
          {/* Page Header in normal document flow - rendered exactly once per page, scrolls naturally */}
          <header className="w-full py-3 sm:py-5 flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="type-city-title text-2xl sm:text-3xl text-white drop-shadow-md flex items-center gap-2">
                {displayName}
                {isGeo && <MapPin className="w-5 h-5 text-white" strokeWidth={1.5} />}
              </h1>
              {!isGeo && localTime && (
                <span className="type-caption text-xs text-slate-200 font-medium drop-shadow-sm mt-0.5 font-numeric">
                  Local time: {localTime}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: tapScale }}
                onClick={onSearchClick}
                aria-label="Manage Cities"
                className="p-2 rounded-full hover:bg-black/20 transition-colors"
              >
                <ListPlus className="w-6 h-6 text-white drop-shadow-md" strokeWidth={1.5} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: tapScale }}
                onClick={onToggleUnit}
                aria-label="Toggle Temperature Unit"
                className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium text-sm drop-shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Thermometer className="w-4 h-4" strokeWidth={1.5} />
                <span>°{unit}</span>
              </motion.button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={displayName}
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
              className="flex flex-col space-y-8"
            >
              {isGeoDenied ? (
                <motion.div variants={itemVariants}>
                  <GlassCard className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
                      <MapPinOff className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h2 className="type-section-header text-xl text-slate-100">Location access denied</h2>
                    <p className="type-body text-slate-300 text-sm">We need your location to show local weather.</p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: tapScale }}
                      onClick={onSearchClick}
                      className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-medium text-slate-100 border border-white/10 shadow-sm type-body-medium"
                    >
                      Search a city instead
                    </motion.button>
                  </GlassCard>
                </motion.div>
              ) : (error && !data) ? (
                <motion.div variants={itemVariants}>
                  <GlassCard className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
                      <RefreshCw className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h2 className="type-section-header text-xl text-slate-100">Connection failed</h2>
                    <p className="type-body text-slate-300 text-sm">{error}</p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: tapScale }}
                      onClick={retry}
                      className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-medium text-slate-100 border border-white/10 shadow-sm type-body-medium"
                    >
                      Try again
                    </motion.button>
                  </GlassCard>
                </motion.div>
              ) : (!data && isLoading) ? (
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                  <GlassCard className="p-8 w-full flex flex-col items-center justify-center space-y-6 text-center">
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [0.95, 1.05, 0.95]
                      }}
                      transition={{ 
                        rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                        scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                      }}
                      className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-sky-400 shadow-lg border border-white/10"
                    >
                      <RefreshCw className="w-8 h-8 animate-spin text-sky-400" strokeWidth={1.5} />
                    </motion.div>
                    <div className="space-y-2">
                      <h2 className="type-section-header text-xl text-slate-100 tracking-wide">Retrieving weather</h2>
                      <p className="type-body text-slate-400 text-sm">Fetching real-time forecast for {displayName}...</p>
                    </div>
                    <div className="w-full max-w-xs space-y-3 pt-4">
                      <div className="h-4 bg-white/5 rounded-full animate-pulse w-3/4 mx-auto" />
                      <div className="h-3 bg-white/5 rounded-full animate-pulse w-1/2 mx-auto" />
                    </div>
                  </GlassCard>
                </motion.div>
              ) : data ? (
                <div className="flex flex-col space-y-8">
                  {isCached && !weatherLoading && (
                    <motion.div variants={itemVariants} className="flex justify-center -mb-4 z-10">
                      <div className="flex items-center space-x-2 bg-amber-500/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-500/30 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="type-caption text-xs font-semibold text-amber-200">
                          Showing last known data (Offline)
                        </span>
                      </div>
                    </motion.div>
                  )}
                  <motion.div variants={itemVariants}>
                    <CurrentWeather data={data} unit={unit} onToggleUnit={onToggleUnit} />
                  </motion.div>
                  {showAlert && alertMessage && eventId && (
                    <motion.div variants={itemVariants} className="flex justify-center -mt-4 mb-4 z-10">
                      <AlertBanner message={alertMessage} onDismiss={() => setDismissedEventId(eventId)} />
                    </motion.div>
                  )}
                  <motion.div variants={itemVariants}>
                    <Nowcast data={data} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <AQICard data={data.air_quality} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <SunArcCard data={data} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <ForecastSection data={data} unit={unit} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                    <FeelsLikeCard 
                      currentApparentTempC={data.current?.apparent_temperature ?? 0} 
                      unit={unit} 
                    />
                    <WindCard 
                      windSpeedKmH={data.current?.wind_speed_10m ?? 0} 
                      windDirectionDeg={data.current?.wind_direction_10m ?? 0} 
                    />
                    <HumidityCard 
                      humidity={data.current?.relative_humidity_2m ?? 0} 
                    />
                    <UVCard 
                      uvIndex={data.current?.uv_index ?? 0} 
                    />
                    <VisibilityCard 
                      visibilityMeters={data.current?.visibility ?? 0} 
                    />
                    <PressureCard 
                      pressureHpa={data.current?.surface_pressure ?? 1013} 
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <LifeIndexGrid data={data} />
                  </motion.div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
