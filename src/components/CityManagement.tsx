import React, { useState, useEffect } from 'react';
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
  isOpen = false
}: { 
  location: LocationData, 
  isGeo: boolean, 
  unit: TempUnit, 
  onClick: () => void,
  isEditMode?: boolean,
  isSelected?: boolean,
  onToggleSelect?: () => void,
  dragControls?: any,
  isOpen?: boolean
}) {
  const { data, loading } = useWeather(location, !isOpen);
  
  const rawTemp = data?.current?.temperature_2m;
  const rawMin = data?.daily?.temperature_2m_min?.[0];
  const rawMax = data?.daily?.temperature_2m_max?.[0];

  const temp = rawTemp !== undefined ? Math.round(convertTemp(rawTemp, unit)) : '--';
  const minTemp = rawMin !== undefined ? Math.round(convertTemp(rawMin, unit)) : '--';
  const maxTemp = rawMax !== undefined ? Math.round(convertTemp(rawMax, unit)) : '--';
  const codeDetails = data ? getWeatherCodeDetails(data.current?.weather_code ?? 0) : null;

  return (
    <div className="relative group w-full mb-4">
      <motion.div
        whileHover={!isEditMode ? { scale: 1.02 } : {}}
        whileTap={!isEditMode ? { scale: 0.98 } : {}}
        onClick={() => {
          if (isEditMode) {
            if (!isGeo && onToggleSelect) onToggleSelect();
          } else {
            onClick();
          }
        }}
        className={`w-full relative h-32 rounded-2xl overflow-hidden flex items-center justify-between text-left shadow-xl border border-white/10 app-card-hover ${isEditMode && !isGeo ? 'pl-16 pr-14' : 'px-6'}`}
      >
        <div className="absolute inset-0 bg-slate-900 -z-20" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/70 -z-10" />
        
        {isEditMode && !isGeo && (
           <div 
             className="absolute left-4 z-20 cursor-pointer p-2"
           >
             {isSelected ? <CheckSquare className="w-6 h-6 text-sky-400" strokeWidth={1.5} /> : <Square className="w-6 h-6 text-slate-400" strokeWidth={1.5} />}
           </div>
        )}

        <div className="flex flex-col z-10 h-full justify-center">
          <div className="flex items-center space-x-2">
            <span className="type-city-title text-2xl text-white drop-shadow-md">{location.name}</span>
            {isGeo && <MapPin className="w-5 h-5 text-white drop-shadow-md" strokeWidth={1.5} />}
          </div>
          <div>
            <p className="type-body-medium text-slate-200 text-base drop-shadow">{codeDetails?.label || 'Loading...'}</p>
            <p className="type-body text-slate-300 text-sm drop-shadow">
              H:<span className="font-numeric font-medium">{maxTemp}</span>&deg; L:<span className="font-numeric font-medium">{minTemp}</span>&deg;
            </p>
          </div>
        </div>
        
        <div className="z-10 type-stat-lg text-6xl text-white drop-shadow-lg">
          {temp}&deg;
        </div>

        {isEditMode && !isGeo && dragControls && (
           <div 
             className="absolute right-2 z-20 text-slate-400 cursor-grab active:cursor-grabbing p-2"
             onPointerDown={(e) => dragControls.start(e)}
           >
             <GripVertical className="w-6 h-6" strokeWidth={1.5} />
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
  popularDomestic = POPULAR_DOMESTIC 
}: CityManagementProps) {
  const tapScale = useTapScale();
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
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
      setQuery('');
      setResults([]);
      setIsEditMode(false);
      setSelectedCities(new Set());
    }
  }, [isOpen]);

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
      } catch (err) {
        console.error('CityManagement search error:', err);
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
    if (!isSaved(name) && name !== currentLocation.name) {
      onSaveLocation(loc);
    }
    onSelectLocation(loc);
    setIsSearchMode(false);
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
    if (selectedCities.size === localSavedCities.length) {
      setSelectedCities(new Set());
    } else {
      setSelectedCities(new Set(localSavedCities.map(c => c.name)));
    }
  };

  const handleDelete = () => {
    if (selectedCities.size > 0) {
      removeCities(Array.from(selectedCities));
      setSelectedCities(new Set());
      setIsEditMode(false);
    }
  };

  const handleReorder = (newOrder: LocationData[]) => {
    setLocalSavedCities(newOrder);
    reorderCities(newOrder);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black text-slate-100 flex flex-col">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        
        {/* Header */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <motion.button whileTap={{ scale: tapScale }} onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-6 h-6 text-white" strokeWidth={1.5} />
              </motion.button>
              <h2 className="type-city-title text-2xl ml-2">City management</h2>
            </div>
            {!isSearchMode && savedCities.length > 0 && (
              <motion.button whileTap={{ scale: tapScale }} 
                onClick={() => {
                  setIsEditMode(!isEditMode);
                  setSelectedCities(new Set());
                }} 
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {isEditMode ? <Check className="w-6 h-6 text-sky-400" strokeWidth={1.5} /> : <Edit2 className="w-6 h-6 text-slate-300" strokeWidth={1.5} />}
              </motion.button>
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
                  }} 
                  className="absolute right-4 text-slate-400 hover:text-white type-body-medium text-sm"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          )}

          {isEditMode && localSavedCities.length > 0 && (
            <div className="flex items-center justify-between mt-2 px-2">
              <motion.button whileTap={{ scale: tapScale }} onClick={toggleSelectAll} className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                {selectedCities.size === localSavedCities.length ? <CheckSquare className="w-5 h-5 text-sky-400" strokeWidth={1.5} /> : <Square className="w-5 h-5 text-slate-400" strokeWidth={1.5} />}
                <span className="type-body-medium text-sm">Select all</span>
              </motion.button>
              <span className="type-caption text-sm text-slate-400">{selectedCities.size} selected</span>
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
                onClick={() => {
                  if (!isEditMode) {
                    onSelectLocation(currentLocation);
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
                <div className="flex flex-col space-y-2 mt-4">
                  {loading && <div className="text-slate-400 text-center py-4">Searching...</div>}
                  {!loading && results.length === 0 && <div className="text-slate-400 text-center py-4">No results found</div>}
                  {results.map(res => (
                    <motion.button whileTap={{ scale: tapScale }}
                      key={res.id}
                      onClick={() => handleSelect(res.latitude, res.longitude, res.name)}
                      className="flex flex-col text-left p-4 rounded-2xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                    >
                      <span className="text-lg font-medium text-white">{res.name}</span>
                      <span className="text-sm text-slate-400">{[res.admin1, res.country].filter(Boolean).join(', ')}</span>
                    </motion.button>
                  ))}
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
