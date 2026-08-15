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
  onSelectLocation: (loc: LocationData) => void;
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
        className={`w-full relative h-32 rounded-2xl overflow-hidden flex items-center justify-between text-left shadow-xl ${cardBgClass} ${isEditMode ? 'pl-16 pr-20' : 'px-6'}`}
      >
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <SkyBackground visualState={visualState} />
          <div className="absolute inset-0 bg-black/30 pointer-events-none z-[1]" />
        </div>
        
        {isEditMode && (
           <div 
             className="absolute left-4 z-20 cursor-pointer p-2"
           >
             {isSelected ? <CheckSquare className="w-6 h-6 text-sky-400" strokeWidth={1.5} /> : <Square className="w-6 h-6 text-slate-400" strokeWidth={1.5} />}
           </div>
        )}

        <div className="flex flex-col z-10 h-full justify-center">
          <div className="flex items-center space-x-2">
            <span className="type-city-title text-2xl text-white drop-shadow-md">{location.name}</span>
            {isGeo && <MapPin className="w-5 h-5 text-white drop-shadow-md inline-block" strokeWidth={1.5} />}
          </div>
          <div className="flex items-center space-x-2 mt-1 z-10">
            <span className="type-body-medium text-slate-100 text-sm drop-shadow">{codeDetails?.label || 'Loading...'}</span>
            <span className="type-body text-slate-200 text-sm drop-shadow">
              {minTemp} ~ {maxTemp}&deg;{unit === 'C' ? 'C' : 'F'}
            </span>
          </div>
        </div>
        
        <div className="z-10 type-stat-lg text-5xl sm:text-6xl text-white drop-shadow-lg font-medium">
          {temp}&deg;{unit === 'C' ? 'C' : 'F'}
        </div>

        {isEditMode && !isGeo && (
           <div className="absolute right-2 z-20 flex flex-col space-y-1 items-center justify-center">
             {onMoveUp && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                 className="p-1 bg-black/40 hover:bg-black/60 rounded text-white"
                 title="Move up"
               >
                 ▲
               </button>
             )}
             {dragControls && (
               <div 
                 className="text-slate-300 cursor-grab active:cursor-grabbing p-1"
                 onPointerDown={(e) => dragControls.start(e)}
                 title="Drag to reorder"
               >
                 <GripVertical className="w-5 h-5" strokeWidth={1.5} />
               </div>
             )}
             {onMoveDown && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                 className="p-1 bg-black/40 hover:bg-black/60 rounded text-white"
                 title="Move down"
               >
                 ▼
               </button>
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
    <Reorder.Item value={props.location} id={props.location.name} dragListener={false} dragControls={controls}>
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
    }
    onSelectLocation(loc);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black text-slate-100 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24 z-10 relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        
        {/* Header */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-6">
            {isEditMode ? (
              <div className="flex items-center space-x-3">
                <motion.button whileTap={{ scale: tapScale }} onClick={toggleSelectAll} className="p-1 rounded text-white">
                  {selectedCities.size === localSavedCities.length + 1 ? <CheckSquare className="w-6 h-6 text-sky-400" strokeWidth={1.5} /> : <Square className="w-6 h-6 text-slate-300" strokeWidth={1.5} />}
                </motion.button>
                <h2 className="type-city-title text-2xl">Select items</h2>
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
                  <ArrowLeft className="w-6 h-6 text-white" strokeWidth={1.5} />
                </motion.button>
                <h2 className="type-city-title text-2xl ml-2">City management</h2>
              </div>
            )}

            {!isSearchMode && (
              <div className="flex items-center space-x-2">
                {!isEditMode && (
                  <motion.button whileTap={{ scale: tapScale }} 
                    onClick={() => {
                      setIsAddMode(true);
                      setIsSearchMode(true);
                    }} 
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="Add city"
                  >
                    <Plus className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
                  </motion.button>
                )}
                <motion.button whileTap={{ scale: tapScale }} 
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    setSelectedCities(new Set());
                  }} 
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  {isEditMode ? <Check className="w-6 h-6 text-sky-400" strokeWidth={1.5} /> : <Edit2 className="w-6 h-6 text-slate-300" strokeWidth={1.5} />}
                </motion.button>
              </div>
            )}
          </div>

          {!isEditMode && (
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search for a city..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!isSearchMode) setIsSearchMode(true);
                }}
                onFocus={() => setIsSearchMode(true)}
                className="w-full bg-white/10 border-none rounded-full py-3.5 pl-12 pr-12 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all type-body text-lg"
              />
              {isSearchMode && (
                <motion.button whileTap={{ scale: tapScale }} 
                  onClick={() => {
                    setQuery('');
                    setIsSearchMode(false);
                    setIsAddMode(false);
                  }} 
                  className="absolute right-4 text-slate-400 hover:text-white type-body-medium text-sm"
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

        {/* Content */}
        <div className="px-4 mt-2">
          {!isSearchMode ? (
            <div className="flex flex-col">
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
                    onSelectLocation(currentLocation);
                    onClose();
                  }
                }} 
              />
              
              <Reorder.Group axis="y" values={localSavedCities} onReorder={handleReorder}>
                {localSavedCities.map((city, index) => (
                  <DraggableCityCard
                    key={city.name}
                    location={city} 
                    isGeo={false} 
                    unit={unit} 
                    isEditMode={isEditMode}
                    isOpen={isOpen}
                    isSelected={selectedCities.has(city.name)}
                    onToggleSelect={() => toggleSelectCity(city.name)}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onClick={() => {
                      if (!isEditMode) {
                        onSelectLocation(city);
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
                  {results.map(res => (
                    <motion.button whileTap={{ scale: tapScale }}
                      key={res.id}
                      onClick={() => handleSelect(res.latitude, res.longitude, res.name)}
                      className="flex flex-col text-left px-4 py-3 rounded-xl hover:bg-white/10 transition-colors border border-transparent"
                    >
                      <div className="flex items-center space-x-3">
                        <Search className="w-4 h-4 text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-lg font-medium text-white leading-tight">{res.name}</span>
                          <span className="text-xs text-slate-400 font-medium">
                            {[res.admin1, res.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
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
                      <motion.button whileTap={{ scale: tapScale }} 
                        onClick={() => handleChipSelect({ name: currentLocation.name || 'Current Location', lat: currentLocation.lat, lon: currentLocation.lon })}
                        className="px-4 py-2 bg-white/20 text-white rounded-full type-body-medium text-sm flex items-center gap-1.5 hover:bg-white/30 transition-colors border border-white/20"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        {currentLocation.name || 'Current Location'}
                      </motion.button>
                      {popularDomestic.map(city => (
                        <motion.button whileTap={{ scale: tapScale }} 
                          key={city.name}
                          onClick={() => handleChipSelect(city)}
                          className="px-4 py-2 bg-white/10 text-slate-200 rounded-full type-body-medium text-sm hover:bg-white/20 transition-colors"
                        >
                          {city.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="type-eyebrow text-slate-400 mb-4">Popular cities in the world</h3>
                    <div className="flex flex-wrap gap-3">
                      {POPULAR_GLOBAL.map(city => (
                        <motion.button whileTap={{ scale: tapScale }} 
                          key={city.name}
                          onClick={() => handleChipSelect(city)}
                          className="px-4 py-2 bg-white/10 text-slate-200 rounded-full type-body-medium text-sm hover:bg-white/20 transition-colors"
                        >
                          {city.name}
                        </motion.button>
                      ))}
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
