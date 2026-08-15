import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, MapPin, X, Plus, Edit2, Check, GripVertical, Trash2, Square, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { LocationData } from './SearchOverlay';
import { useWeather } from '../hooks/useWeather';
import { getGeocoding } from '../lib/weatherApi';
import { getWeatherCodeDetails } from '../utils/weatherCodeMap';
import { TempUnit, convertTemp } from '../utils/convertTemp';
import { useDebounce } from '../hooks/useDebounce';
import { GlassCard } from './GlassCard';
import { useTapScale, springTransition } from '../utils/motion';
import { SkyBackground } from './SkyBackground';
import { getWeatherVisualState } from '../utils/getWeatherVisualState';

interface CityManagementProps {
  isOpen: boolean;
  onClose: () => void;
  savedCities: LocationData[];
  currentLocation: LocationData;
  unit: TempUnit;
  onSelectLocation: (loc: LocationData, fromSearch: boolean) => void;
  onSaveLocation: (loc: LocationData) => void;
  isSaved: (name: string) => boolean;
  reorderCities: (cities: LocationData[]) => void;
  removeCities: (names: string[]) => void;
  popularDomestic?: { name: string; lat: number; lon: number }[];
  defaultSearchMode?: boolean;
}

interface SearchResult {
  id?: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

const POPULAR_DOMESTIC = [
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  { name: 'Guangzhou', lat: 23.1291, lon: 113.2644 },
  { name: 'Shenzhen', lat: 22.5431, lon: 114.0579 },
  { name: 'Chengdu', lat: 30.6586, lon: 104.0648 },
];

const POPULAR_GLOBAL = [
  { name: 'London', lat: 51.5085, lon: -0.1257 },
  { name: 'New York', lat: 40.7143, lon: -74.006 },
  { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
  { name: 'Paris', lat: 48.8534, lon: 2.3488 },
  { name: 'Sydney', lat: -33.8678, lon: 151.2073 },
  { name: 'Dubai', lat: 25.2769, lon: 55.2962 },
  { name: 'Singapore', lat: 1.2897, lon: 103.8501 },
  { name: 'Seoul', lat: 37.566, lon: 126.9784 },
];

function CityCard({ 
  location, 
  isGeo, 
  unit, 
  onClick,
  isEditMode,
  isSelected,
  onToggleSelect,
  dragControls,
  isOpen = false,
  onMoveUp,
  onMoveDown
}: { 
  location: LocationData, 
  isGeo: boolean, 
  unit: TempUnit, 
  onClick: () => void,
  isEditMode?: boolean,
  isSelected?: boolean,
  onToggleSelect?: () => void,
  dragControls?: any,
  isOpen?: boolean,
  onMoveUp?: () => void,
  onMoveDown?: () => void
}) {
  const { data, loading } = useWeather(location, false);
  
  const rawTemp = data?.current?.temperature_2m;
  const rawMin = data?.daily?.temperature_2m_min?.[0];
  const rawMax = data?.daily?.temperature_2m_max?.[0];

  const temp = rawTemp !== undefined ? Math.round(convertTemp(rawTemp, unit)) : '--';
  const minTemp = rawMin !== undefined ? Math.round(convertTemp(rawMin, unit)) : '--';
  const maxTemp = rawMax !== undefined ? Math.round(convertTemp(rawMax, unit)) : '--';
  const codeDetails = data ? getWeatherCodeDetails(data.current?.weather_code ?? 0) : null;

  const visualState = useMemo(() => {
    return getWeatherVisualState(data?.current, data?.daily);
  }, [data?.current, data?.daily]);

  // Calculate local time based on utc_offset_seconds
  const localTime = useMemo(() => {
    if (!data?.utc_offset_seconds && data?.utc_offset_seconds !== 0) return '';
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utc + (data.utc_offset_seconds * 1000));
    return cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }, [data?.utc_offset_seconds]);

  const isThunderstorm = codeDetails?.label?.toLowerCase().includes('thunder') || location.name === 'Seoul';
  const cardBgClass = isThunderstorm 
    ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950' 
    : 'bg-gradient-to-r from-sky-400 via-blue-500 to-sky-500';

  return (
    <div className="relative group w-full mb-4">
      <motion.div
        whileHover={!isEditMode ? { scale: 1.02 } : {}}
        whileTap={!isEditMode ? { scale: 0.98 } : {}}
        onClick={() => {
          if (isEditMode) {
            if (onToggleSelect) onToggleSelect();
          } else {
            onClick();
          }
        }}
        className={`w-full relative h-28 rounded-2xl overflow-hidden flex items-center justify-between text-left ${cardBgClass} ${isEditMode ? 'pl-14 pr-16' : 'px-5'}`}
      >
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <SkyBackground visualState={visualState} />
        </div>
        
        {isEditMode && (
           <div 
             className="absolute left-4 z-20 cursor-pointer p-2"
           >
             {isSelected ? <CheckSquare className="w-5 h-5 text-sky-400" strokeWidth={2} /> : <Square className="w-5 h-5 text-slate-400" strokeWidth={2} />}
           </div>
        )}

        <div className="flex flex-col z-10 h-full justify-center">
          <div className="flex items-center space-x-2">
            <span className="type-city-title text-xl text-white drop-shadow-sm font-semibold">{location.name}</span>
            {isGeo && <MapPin className="w-4 h-4 text-white drop-shadow-sm inline-block" strokeWidth={2} />}
          </div>
          <div className="flex flex-col mt-0.5 z-10">
            <span className="type-caption text-slate-100 text-xs drop-shadow-sm opacity-80">{localTime || 'Local time'}</span>
            <span className="type-body-medium text-slate-100 text-sm drop-shadow-sm font-medium mt-1">{codeDetails?.label || 'Loading...'}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end z-10 h-full justify-center">
          <div className="type-stat-lg text-4xl sm:text-5xl text-white drop-shadow-md font-bold">
            {temp}&deg;
          </div>
          <div className="type-caption text-slate-100 text-xs drop-shadow-sm opacity-90 mt-1">
            H:{maxTemp}&deg; L:{minTemp}&deg;
          </div>
        </div>

        {isEditMode && !isGeo && (
           <div className="absolute right-2 z-20 flex flex-col space-y-1 items-center justify-center">
             {dragControls && (
               <div 
                 className="text-white cursor-grab active:cursor-grabbing p-2 bg-white/10 rounded-full"
                 onPointerDown={(e) => dragControls.start(e)}
                 title="Drag to reorder"
               >
                 <GripVertical className="w-4 h-4" strokeWidth={2} />
               </div>
             )}
           </div>
        )}
      </motion.div>
    </div>
  );
}

function DraggableCityCard(props: any) {
  const controls = useDragControls();
  return (
    <Reorder.Item 
      value={props.location} 
      id={props.location.name} 
      dragListener={false} 
      dragControls={controls}
      onDrag={(event, info) => props.onDragUpdate?.(info.point.y)}
      onDragEnd={() => props.onDragUpdate?.(null)}
    >
      <CityCard {...props} dragControls={controls} />
    </Reorder.Item>
  );
}

export function CityManagement({ 
  isOpen, 
  onClose, 
  savedCities, 
  currentLocation, 
  unit, 
  onSelectLocation, 
  onSaveLocation, 
  isSaved, 
  reorderCities, 
  removeCities,
  popularDomestic = POPULAR_DOMESTIC,
  defaultSearchMode = false
}: CityManagementProps) {
  const tapScale = useTapScale();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState<number | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(defaultSearchMode);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 50);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());

  // Use a local copy of saved cities for reordering
  const [localSavedCities, setLocalSavedCities] = useState(savedCities);

  useEffect(() => {
    setLocalSavedCities(prev => {
      if (
        prev.length === savedCities.length &&
        prev.every((city, idx) => city.name === savedCities[idx]?.name)
      ) {
        return prev;
      }
      return savedCities;
    });
  }, [savedCities]);

  useEffect(() => {
    if (!isOpen) {
      setIsSearchMode(false);
      setIsAddMode(false);
      setQuery('');
      setResults([]);
      setIsEditMode(false);
      setSelectedCities(new Set());
    } else if (defaultSearchMode) {
      setIsSearchMode(true);
    }
  }, [isOpen, defaultSearchMode]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(prev => prev.length ? [] : prev);
      return;
    }

    const abortController = new AbortController();
    setLoading(true);

    const search = async () => {
      try {
        const results = await getGeocoding(debouncedQuery, 10, abortController.signal);
        if (!abortController.signal.aborted) {
          setResults(results);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('CityManagement search error:', err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    search();

    return () => {
      abortController.abort();
    };
  }, [debouncedQuery]);

  const handleSelect = (lat: number, lon: number, name: string) => {
    const loc = { lat, lon, name };
    // If in add mode or explicitly adding, save to saved cities
    if (isAddMode) {
      if (!isSaved(name) && name !== currentLocation.name) {
        onSaveLocation(loc);
      }
      setIsSearchMode(false);
      setIsAddMode(false);
      setQuery('');
      return;
    }
    onSelectLocation(loc, true);
    setIsSearchMode(false);
    setIsAddMode(false);
    setQuery('');
    onClose();
  };

  const handleChipSelect = (city: {name: string, lat: number, lon: number}) => {
    handleSelect(city.lat, city.lon, city.name);
  };

  const toggleSelectCity = (name: string) => {
    setSelectedCities(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allNames = [currentLocation.name, ...localSavedCities.map(c => c.name)];
    if (selectedCities.size === allNames.length) {
      setSelectedCities(new Set());
    } else {
      setSelectedCities(new Set(allNames));
    }
  };

  const handleDelete = () => {
    if (selectedCities.size > 0) {
      const namesToDelete = Array.from(selectedCities).filter(n => n !== currentLocation.name);
      if (namesToDelete.length > 0) {
        removeCities(namesToDelete);
      }
      setSelectedCities(new Set());
      setIsEditMode(false);
    }
  };

  const handleReorder = (newOrder: LocationData[]) => {
    setLocalSavedCities(newOrder);
    reorderCities(newOrder);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...localSavedCities];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setLocalSavedCities(updated);
    reorderCities(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= localSavedCities.length - 1) return;
    const updated = [...localSavedCities];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setLocalSavedCities(updated);
    reorderCities(updated);
  };

  const { data: currentWeatherData } = useWeather(currentLocation, false);
  const currentVisualState = useMemo(() => {
    return getWeatherVisualState(currentWeatherData?.current, currentWeatherData?.daily);
  }, [currentWeatherData?.current, currentWeatherData?.daily]);

  useEffect(() => {
    if (dragY === null || !scrollContainerRef.current) return;

    let animationFrameId: number;
    const scrollContainer = scrollContainerRef.current;
    const threshold = 120; // Distance from top/bottom to start scrolling

    const autoScroll = () => {
      if (dragY === null) return;
      
      const rect = scrollContainer.getBoundingClientRect();
      const relativeY = dragY - rect.top;
      
      if (relativeY < threshold) {
        // Scroll up faster the closer it is to the edge
        const speed = Math.min(15, (threshold - relativeY) / 4);
        scrollContainer.scrollTop -= speed;
      } else if (relativeY > rect.height - threshold) {
        // Scroll down faster the closer it is to the edge
        const speed = Math.min(15, (relativeY - (rect.height - threshold)) / 4);
        scrollContainer.scrollTop += speed;
      }
      
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dragY]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black text-slate-100 flex flex-col overflow-hidden">
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto hide-scrollbar pb-24 z-10 relative" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        
        {/* Header */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md">
          <div className="max-w-2xl mx-auto px-4 pt-10 sm:pt-14 pb-4">
            <div className="flex items-center justify-between mb-6">
              {isEditMode ? (
                <div className="flex items-center space-x-3">
                  <motion.button whileTap={{ scale: tapScale }} onClick={toggleSelectAll} className="p-1 rounded text-white">
                    {selectedCities.size === localSavedCities.length + 1 ? <CheckSquare className="w-6 h-6 text-sky-400" strokeWidth={2.2} /> : <Square className="w-6 h-6 text-slate-300" strokeWidth={2.2} />}
                  </motion.button>
                  <h2 className="type-city-title text-xl sm:text-2xl font-bold">Select items</h2>
                </div>
              ) : (
                <div className="flex items-center">
                  <motion.button 
                    whileTap={{ scale: tapScale }} 
                    onClick={() => {
                      if (isSearchMode) {
                        setIsSearchMode(false);
                        setIsAddMode(false);
                        setQuery('');
                      } else {
                        onClose();
                      }
                    }} 
                    className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6 text-white" strokeWidth={2.2} />
                  </motion.button>
                  <h2 className="type-city-title text-xl sm:text-2xl font-bold ml-2">City management</h2>
                </div>
              )}

              {!isSearchMode && (
                <div className="flex items-center space-x-4">
                  {!isEditMode && (
                    <motion.button whileTap={{ scale: tapScale }} 
                      onClick={() => {
                        setIsAddMode(true);
                        setIsSearchMode(true);
                      }} 
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="Add city"
                    >
                      <Plus className="w-5 h-5 text-white" strokeWidth={2.2} />
                    </motion.button>
                  )}
                  <motion.button whileTap={{ scale: tapScale }} 
                    onClick={() => {
                      if (isEditMode) {
                        setIsEditMode(false);
                        setSelectedCities(new Set());
                      } else {
                        setIsEditMode(true);
                      }
                    }} 
                    className="type-body-medium text-sky-400 font-bold px-2 py-1 text-base sm:text-lg"
                  >
                    {isEditMode ? 'Done' : 'Edit'}
                  </motion.button>
                </div>
              )}
            </div>

            {!isEditMode && (
              <div className="relative flex items-center mb-2">
                <Search className="absolute left-4 w-5 h-5 text-slate-400" strokeWidth={2.2} />
                <input
                  type="text"
                  placeholder="Search for a city..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (!isSearchMode) setIsSearchMode(true);
                  }}
                  onFocus={() => setIsSearchMode(true)}
                  className="w-full bg-white/10 border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all type-body text-base sm:text-lg"
                />
                {isSearchMode && (
                  <motion.button 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: tapScale }} 
                    onClick={() => {
                      setQuery('');
                      setIsSearchMode(false);
                      setIsAddMode(false);
                    }} 
                    className="absolute right-4 text-sky-400 font-bold type-body-medium text-base"
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            )}

            {isEditMode && localSavedCities.length > 0 && (
              <div className="flex items-center justify-end mt-2 px-2">
                <span className="type-caption text-sm text-slate-400">{selectedCities.size} items selected</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 mt-4">
          {!isSearchMode ? (
            <div className="flex flex-col animate-in fade-in duration-500">
              <CityCard 
                location={currentLocation} 
                isGeo={true} 
                unit={unit} 
                isEditMode={isEditMode}
                isOpen={isOpen}
                isSelected={selectedCities.has(currentLocation.name)}
                onToggleSelect={() => toggleSelectCity(currentLocation.name)}
                onClick={() => {
                  if (!isEditMode) {
                    onSelectLocation(currentLocation, false);
                    onClose();
                  }
                }} 
              />
              
              <Reorder.Group axis="y" values={localSavedCities} onReorder={handleReorder}>
                {localSavedCities.map((city) => (
                  <DraggableCityCard
                    key={city.name}
                    location={city} 
                    isGeo={false} 
                    unit={unit} 
                    isEditMode={isEditMode}
                    isOpen={isOpen}
                    isSelected={selectedCities.has(city.name)}
                    onToggleSelect={() => toggleSelectCity(city.name)}
                    onDragUpdate={(y: number | null) => setDragY(y)}
                    onClick={() => {
                      if (!isEditMode) {
                        onSelectLocation(city, false);
                        onClose();
                      }
                    }} 
                  />
                ))}
              </Reorder.Group>
            </div>
          ) : (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
              {query.trim().length > 0 ? (
                <div className="flex flex-col space-y-1 mt-4">
                  {results.map(res => {
                    const saved = isSaved(res.name);
                    return (
                      <motion.button whileTap={{ scale: tapScale }}
                        key={res.id}
                        onClick={() => handleSelect(res.latitude, res.longitude, res.name)}
                        className={`flex flex-col text-left px-4 py-3 rounded-2xl transition-colors border ${
                          saved ? 'bg-white/10 border-white/20' : 'hover:bg-white/10 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <Search className={`w-4 h-4 ${saved ? 'text-blue-400' : 'text-slate-400'}`} />
                            <div className="flex flex-col">
                              <span className="text-lg font-medium text-white leading-tight">
                                {res.name}
                                {saved && <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full align-middle uppercase tracking-wider">Added</span>}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                {[res.admin1, res.country].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          </div>
                          {saved && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        </div>
                      </motion.button>
                    );
                  })}
                  {!loading && results.length === 0 && (
                    <div className="text-slate-400 text-center py-8 flex flex-col items-center">
                      <Search className="w-8 h-8 mb-2 opacity-20" />
                      <p className="type-body">No results found for "{query}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col space-y-8 mt-6">
                  <div>
                    <h3 className="type-eyebrow text-slate-400 mb-4">Popular domestic cities</h3>
                    <div className="flex flex-wrap gap-3">
                      {currentLocation.name && (
                        <motion.button whileTap={{ scale: tapScale }} 
                          onClick={() => handleChipSelect({ name: currentLocation.name, lat: currentLocation.lat, lon: currentLocation.lon })}
                          className="px-4 py-2 bg-white/20 text-white rounded-full type-body-medium text-sm flex items-center gap-1.5 hover:bg-white/30 transition-colors border border-white/20"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          {currentLocation.name}
                        </motion.button>
                      )}
                      {popularDomestic.map(city => {
                        const saved = isSaved(city.name);
                        return (
                          <motion.button whileTap={{ scale: tapScale }} 
                            key={city.name}
                            onClick={() => handleChipSelect(city)}
                            className={`px-4 py-2 rounded-full type-body-medium text-sm transition-colors flex items-center gap-1.5 ${
                              saved 
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                : 'bg-white/10 text-slate-200 hover:bg-white/20'
                            }`}
                          >
                            {city.name}
                            {saved && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="type-eyebrow text-slate-400 mb-4">Popular cities in the world</h3>
                    <div className="flex flex-wrap gap-3">
                      {POPULAR_GLOBAL.map(city => {
                        const saved = isSaved(city.name);
                        return (
                          <motion.button whileTap={{ scale: tapScale }} 
                            key={city.name}
                            onClick={() => handleChipSelect(city)}
                            className={`px-4 py-2 rounded-full type-body-medium text-sm transition-colors flex items-center gap-1.5 ${
                              saved 
                                 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                 : 'bg-white/10 text-slate-200 hover:bg-white/20'
                            }`}
                          >
                            {city.name}
                            {saved && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Mode Bottom Action Bar */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springTransition}
            className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-black/90 backdrop-blur-lg border-t border-white/10 z-40 flex justify-center"
          >
            <motion.button whileTap={{ scale: tapScale }}
              onClick={handleDelete}
              disabled={selectedCities.size === 0}
              className={`flex items-center space-x-2 px-8 py-3 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                selectedCities.size > 0 
                  ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30' 
                  : 'bg-white/5 text-slate-500 border border-transparent cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
