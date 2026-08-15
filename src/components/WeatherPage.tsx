import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useTransform } from 'motion/react';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useTapScale, springTransition, useAppReducedMotion } from '../utils/motion';
import { MapPinOff, RefreshCw, MapPin, ListPlus, Thermometer, ChevronLeft } from 'lucide-react';
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
import defaultWeather from '../utils/defaultWeather.json';

interface WeatherPageProps {
  key?: React.Key;
  location: { lat?: number; lon?: number; name: string };
  isGeo?: boolean;
  geoData?: any;
  unit: TempUnit;
  isActive?: boolean;
  onSearchClick: () => void;
  onToggleUnit?: () => void;
  showAddButton?: boolean;
  showBackButton?: boolean;
  onSaveLocation?: () => void;
  onBackToSearch?: () => void;
}

export function WeatherPage({
  location,
  isGeo,
  geoData,
  unit,
  isActive = true,
  onSearchClick,
  onToggleUnit,
  showAddButton,
  showBackButton,
  onSaveLocation,
  onBackToSearch
}: WeatherPageProps) {
  const prefersReducedMotion = useAppReducedMotion();
  const tapScale = useTapScale();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(`[REDUCED MOTION DEBUG]
      - useAppReducedMotion(): ${prefersReducedMotion}
      - matchMedia('(prefers-reduced-motion: reduce)').matches: ${window.matchMedia('(prefers-reduced-motion: reduce)').matches}
    `);
  }, [prefersReducedMotion]);

  const lat = isGeo ? (geoData?.coordinates?.lat ?? location?.lat) : location?.lat;
  const lon = isGeo ? (geoData?.coordinates?.lon ?? location?.lon) : location?.lon;
  const displayName = location?.name || '';

  const [geoCityName, setGeoCityName] = useState<string>('');

  useEffect(() => {
    if (!isGeo || lat === undefined || lon === undefined || isNaN(Number(lat)) || isNaN(Number(lon))) {
      return;
    }
    let isMounted = true;
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
      .then(res => res.ok ? res.json() : null)
      .then(geoRes => {
        if (!isMounted || !geoRes) return;
        const name = geoRes.city || geoRes.locality || geoRes.principalSubdivision;
        if (name) {
          setGeoCityName(name);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [isGeo, lat, lon]);

  const headerCityName = isGeo && geoCityName ? geoCityName : displayName;

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

  const activeData = data || (defaultWeather as any);

  const [localTime, setLocalTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      let timeStr = '';
      if (activeData?.timezone) {
        try {
          timeStr = new Date().toLocaleTimeString([], {
            timeZone: activeData.timezone,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
        } catch (e) {
          // ignore invalid timezone
        }
      }

      if (!timeStr && activeData?.utc_offset_seconds !== undefined) {
        try {
          const utcOffsetSeconds = activeData.utc_offset_seconds;
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
  }, [activeData?.timezone, activeData?.utc_offset_seconds, location?.lon]);

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

  if (activeData?.minutely_15?.precipitation && activeData.current?.time) {
    const timeArr = activeData.minutely_15.time;
    const precipArr = activeData.minutely_15.precipitation;
    const currentTime = activeData.current.time;
    
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
    return getWeatherVisualState(activeData?.current, activeData?.daily);
  }, [activeData?.current, activeData?.daily]);

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
        className="w-full h-full overflow-y-auto px-4 sm:px-6 md:px-8 pb-0 pt-4 flex flex-col items-center hide-scrollbar z-10 relative" 
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
          <header className="w-full py-4 sm:py-6 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              {showBackButton && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: tapScale }}
                  onClick={onBackToSearch}
                  className="p-2 -ml-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                </motion.button>
              )}
              <div className="flex flex-col min-w-0">
                <h1 className="type-city-title text-xl sm:text-2xl md:text-3xl text-white drop-shadow-md flex items-center gap-1.5 sm:gap-2 truncate">
                  <span className="truncate leading-tight">{headerCityName}</span>
                  {isGeo && <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 shrink-0" strokeWidth={2} />}
                </h1>
                {localTime && (
                  <span className="type-caption text-[10px] sm:text-xs text-white/70 font-medium drop-shadow-sm font-numeric">
                    Local time: {localTime}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              {showAddButton && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: tapScale }}
                  onClick={onSaveLocation}
                  className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/30 flex items-center gap-1.5 sm:gap-2 transition-all h-9 sm:h-10"
                >
                  <ListPlus className="w-4 h-4" strokeWidth={2.5} />
                  <span>Add</span>
                </motion.button>
              )}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: tapScale }}
                onClick={onSearchClick}
                aria-label="Manage Cities"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ListPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: tapScale }}
                onClick={onToggleUnit}
                aria-label="Toggle Temperature Unit"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-sm transition-colors"
              >
                °{unit}
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
              ) : activeData ? (
                <motion.div className="flex flex-col space-y-8">
                  <motion.div variants={itemVariants}>
                    <CurrentWeather data={activeData} unit={unit} onToggleUnit={onToggleUnit} />
                  </motion.div>
                  {showAlert && alertMessage && eventId && (
                    <motion.div variants={itemVariants} className="flex justify-center -mt-4 mb-4 z-10">
                      <AlertBanner message={alertMessage} onDismiss={() => setDismissedEventId(eventId)} />
                    </motion.div>
                  )}
                  <motion.div variants={itemVariants}>
                    <Nowcast data={activeData} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <AQICard data={activeData.air_quality} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <SunArcCard data={activeData} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <ForecastSection data={activeData} unit={unit} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                    <FeelsLikeCard 
                      currentApparentTempC={activeData.current?.apparent_temperature ?? 0} 
                      unit={unit} 
                    />
                    <WindCard 
                      windSpeedKmH={activeData.current?.wind_speed_10m ?? 0} 
                      windDirectionDeg={activeData.current?.wind_direction_10m ?? 0} 
                    />
                    <HumidityCard 
                      humidity={activeData.current?.relative_humidity_2m ?? 0} 
                    />
                    <UVCard 
                      uvIndex={activeData.current?.uv_index ?? 0} 
                    />
                    <VisibilityCard 
                      visibilityMeters={activeData.current?.visibility ?? 0} 
                    />
                    <PressureCard 
                      pressureHpa={activeData.current?.surface_pressure ?? 1013} 
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <LifeIndexGrid data={activeData} />
                  </motion.div>
                </motion.div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Clean bottom breathing space */}
          <div className="w-full pt-4 pb-8" aria-hidden="true" />
        </motion.div>
      </div>
    </div>
  );
}
