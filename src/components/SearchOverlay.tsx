import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, MapPin, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { GlassCard } from './GlassCard';

export interface LocationData {
  lat: number;
  lon: number;
  name: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationData) => void;
  onSaveLocation: (location: LocationData) => void;
  isSaved: (name: string) => boolean;
}

interface SearchResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export function SearchOverlay({ isOpen, onClose, onSelectLocation, onSaveLocation, isSaved }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<LocationData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('aura-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches');
      }
    }
  }, []);

  const saveRecentSearch = (location: LocationData) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.name !== location.name);
      const updated = [location, ...filtered].slice(0, 5);
      localStorage.setItem('aura-recent-searches', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=5`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError('Failed to search locations. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations(debouncedQuery);
  }, [debouncedQuery]);

  const handleSelect = (lat: number, lon: number, name: string) => {
    const location = { lat, lon, name };
    saveRecentSearch(location);
    onSelectLocation(location);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <GlassCard className="p-4 flex flex-col space-y-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search for a city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} aria-label="Close search" className="absolute right-3 p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-slate-400 hover:text-slate-200" />
            </motion.button>
          </div>

          <div className="flex flex-col">
            {loading && (
              <div className="flex flex-col items-center justify-center py-6 text-slate-400 space-y-2">
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            )}
            
            {error && (
              <div className="flex flex-col items-center justify-center py-6">
                <span className="text-red-400 text-sm mb-3 text-center">{error}</span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => fetchLocations(debouncedQuery)} className="text-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors text-slate-200 font-medium">Try Again</motion.button>
              </div>
            )}
            
            {!loading && !error && debouncedQuery && results.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-3 opacity-50" />
                <p className="text-slate-300 font-medium">No city found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your search</p>
              </div>
            )}

            {!loading && !error && !debouncedQuery && recentSearches.length > 0 && (
              <div className="py-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 block">Recent Searches</span>
                <div className="flex flex-wrap gap-2 px-1">
                  {recentSearches.map((loc, i) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={i}
                      onClick={() => handleSelect(loc.lat, loc.lon, loc.name)}
                      className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-sm text-slate-200 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{loc.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <ul className="flex flex-col space-y-1">
                {results.map((result) => {
                  const saved = isSaved(result.name);
                  return (
                  <li key={result.id} className="flex items-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(result.latitude, result.longitude, result.name)}
                      className="flex-1 flex items-center text-left p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <MapPin className="w-4 h-4 mr-3 text-slate-400 shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-slate-200 truncate">{result.name}</span>
                        <span className="text-xs text-slate-400 truncate">
                          {[result.admin1, result.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveLocation({ lat: result.latitude, lon: result.longitude, name: result.name });
                      }}
                      className="p-3 mr-1 hover:bg-white/10 rounded-full transition-colors"
                      aria-label={saved ? "Remove city" : "Save this city"}
                      title={saved ? "Remove city" : "Save this city"}
                    >
                      {saved ? (
                        <BookmarkCheck className="w-5 h-5 text-sky-400" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-slate-400 hover:text-slate-200" />
                      )}
                    </motion.button>
                  </li>
                )})}
              </ul>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

