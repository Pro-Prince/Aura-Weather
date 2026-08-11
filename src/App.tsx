/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bookmark, BookmarkCheck } from 'lucide-react';
import { WeatherPage } from './components/WeatherPage';
import { useGeolocation } from './hooks/useGeolocation';
import { useSavedCities } from './hooks/useSavedCities';
import { TempUnit } from './utils/convertTemp';
import { getBackgroundGradient } from './utils/getBackgroundGradient';
import { WeatherParticles } from './components/WeatherParticles';
import { InstallPrompt } from './components/InstallPrompt';
import { SearchOverlay, LocationData } from './components/SearchOverlay';

export default function App() {
  const geo = useGeolocation();
  const { savedCities, addCity, removeCity, isSaved } = useSavedCities();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unit, setUnit] = useState<TempUnit>('C');
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [temporaryCity, setTemporaryCity] = useState<LocationData | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [globalBg, setGlobalBg] = useState({ code: 0, isDay: true });

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

  const pages = [
    { id: 'geo', isGeo: true, location: { name: geo.isFallback ? 'London' : 'Current Location' } },
    ...savedCities.map(c => ({ id: c.name, isGeo: false, location: c }))
  ];

  if (temporaryCity && !isSaved(temporaryCity.name)) {
    pages.push({ id: temporaryCity.name, isGeo: false, location: temporaryCity });
  }

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleSelectLocation = (loc: LocationData) => {
    setIsSearchOpen(false);
    let targetIndex = pages.findIndex(p => p.id === loc.name);
    
    if (targetIndex !== -1) {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: targetIndex * scrollRef.current.clientWidth, behavior: 'smooth' });
      }
    } else {
      setTemporaryCity(loc);
      setTimeout(() => {
        if (scrollRef.current) {
          const newIdx = pages.length; // The new item will be at the end
          scrollRef.current.scrollTo({ left: newIdx * scrollRef.current.clientWidth, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const currentPage = pages[activeIndex];
  const isCurrentSaved = currentPage && !currentPage.isGeo && isSaved(currentPage.location.name!);

  const toggleSave = () => {
    if (!currentPage || currentPage.isGeo) return;
    const loc = currentPage.location as LocationData;
    if (isCurrentSaved) {
      removeCity(loc.name);
      setTemporaryCity(loc); // Keep it visible until swiped away
    } else {
      addCity(loc);
      if (temporaryCity?.name === loc.name) {
        setTemporaryCity(null);
      }
    }
  };

  const handleWeatherData = useCallback((index: number, data: any, isDay: boolean, code: number) => {
    if (activeIndex === index) {
      setGlobalBg(prev => (prev.code === code && prev.isDay === isDay ? prev : { code, isDay }));
    }
  }, [activeIndex]);

  const bgGradient = getBackgroundGradient(globalBg.code, globalBg.isDay);

  return (
    <div className="min-h-screen w-full flex flex-col text-slate-100 overflow-hidden relative">
      {/* Animated Dynamic Background */}
      <div className="fixed inset-0 bg-slate-950 -z-30" />
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

      <WeatherParticles code={globalBg.code} isDay={globalBg.isDay} />

      {/* Subtle glassmorphic decorative elements */}
      <div className="fixed top-1/4 -left-1/4 md:left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 -right-1/4 md:right-1/4 w-[28rem] h-[28rem] bg-black/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Fixed Header */}
      <header className="flex items-center justify-between p-4 sm:p-6 md:p-8 shrink-0 z-10 w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto">
        <h1 className="text-2xl font-light tracking-wide text-slate-50 drop-shadow-sm">
          Aura Weather
        </h1>
        <div className="flex items-center space-x-2 sm:space-x-3">
          {currentPage && !currentPage.isGeo && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSave}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              aria-label={isCurrentSaved ? "Remove city" : "Save this city"}
              title={isCurrentSaved ? "Remove city" : "Save this city"}
            >
              {isCurrentSaved ? (
                <BookmarkCheck className="w-5 h-5 text-sky-400" />
              ) : (
                <Bookmark className="w-5 h-5 text-slate-200" />
              )}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleUnit}
            aria-label={`Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-sm font-medium text-slate-200"
          >
            &deg;{unit}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search city"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <Search className="w-5 h-5 text-slate-200" />
          </motion.button>
        </div>
      </header>

      {/* Swipeable Pages */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar z-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {pages.map((page, index) => (
          <WeatherPage
            key={page.id}
            location={page.location as any}
            isGeo={page.isGeo}
            geoData={geo}
            unit={unit}
            isActive={activeIndex === index}
            onWeatherData={(data, isDay, code) => handleWeatherData(index, data, isDay, code)}
            onSearchClick={() => setIsSearchOpen(true)}
          />
        ))}
      </div>

      {/* Pagination Dots */}
      {pages.length > 1 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center space-x-2 z-20 pointer-events-none">
          {pages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      )}

      <InstallPrompt />

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelectLocation={handleSelectLocation}
        onSaveLocation={(loc) => {
          if (isSaved(loc.name)) {
            removeCity(loc.name);
          } else {
            addCity(loc);
          }
        }}
        isSaved={isSaved}
      />
    </div>
  );
}
