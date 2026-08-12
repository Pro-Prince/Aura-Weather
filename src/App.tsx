/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bookmark, BookmarkCheck, ListPlus, MoreVertical, MapPin } from 'lucide-react';
import { WeatherPage } from './components/WeatherPage';
import { useGeolocation } from './hooks/useGeolocation';
import { useSavedCities } from './hooks/useSavedCities';
import { TempUnit } from './utils/convertTemp';
import { InstallPrompt } from './components/InstallPrompt';
import { CityManagement } from './components/CityManagement';
import { LocationData } from './components/SearchOverlay';

export default function App() {
  const geo = useGeolocation();
  const { savedCities, addCity, removeCity, removeCities, reorderCities, isSaved } = useSavedCities();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unit, setUnit] = useState<TempUnit>('C');
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [temporaryCity, setTemporaryCity] = useState<LocationData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="h-screen w-full flex flex-col text-slate-100 overflow-hidden relative bg-black">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 p-4 sm:p-6 md:p-8 z-30 w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-white drop-shadow-md flex items-center gap-2">
              {currentPage?.location?.name || 'Loading...'}
              {currentPage?.isGeo && <MapPin className="w-5 h-5 text-white" />}
            </h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(true)}
              aria-label="Manage Cities"
              className="p-2 rounded-full hover:bg-black/20 transition-colors"
            >
              <ListPlus className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="More Options"
              className="p-2 rounded-full hover:bg-black/20 transition-colors"
            >
              <MoreVertical className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Swipeable Pages */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar z-10"
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
            onWeatherData={() => {}}
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
              className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-2 bg-white' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      )}

      <InstallPrompt />

      <CityManagement 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        savedCities={savedCities}
        currentLocation={pages[0].location as LocationData}
        unit={unit}
        onSelectLocation={handleSelectLocation}
        reorderCities={reorderCities}
        removeCities={removeCities}
        onSaveLocation={(loc) => {
          if (!isSaved(loc.name)) {
            addCity(loc);
          }
        }}
        isSaved={isSaved}
      />
    </div>
  );
}
