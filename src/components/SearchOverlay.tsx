import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTapScale } from '../utils/motion';
import { Search, X, MapPin, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { GlassCard } from './GlassCard';

import { getGeocoding } from '../lib/weatherApi';

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
  id?: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export function SearchOverlay({ isOpen, onClose, onSelectLocation, onSaveLocation, isSaved }: SearchOverlayProps) {
  const tapScale = useTapScale();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 50);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<LocationData[]>([]);
  const [retryCount, setRetryCount] = useState(0);

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

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(prev => prev.length ? [] : prev);
      setError(null);
      return;
    }

    const abortController = new AbortController();
    setLoading(true);
    setError(null);

    const search = async () => {
      try {
        const res = await getGeocoding(debouncedQuery, 5, abortController.signal);
        if (!abortController.signal.aborted) {
          setResults(res);
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }
        setError('Failed to search locations. Please check your connection.');
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
  }, [debouncedQuery, retryCount]);

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
        <GlassCard className="p-4 sm:p-6 flex flex-col space-y-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-slate-400" strokeWidth={1.5} />
            <input
              type="text"
              autoFocus
              placeholder="Search for a city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all type-body"
            />
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: tapScale }} onClick={onClose} aria-label="Close search" className="absolute right-3 p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-slate-400 hover:text-slate-200" strokeWidth={1.5} />
            </motion.button>
          </div>

          <div className="flex flex-col">
            {loading && (
              <div className="flex flex-col items-center justify-center py-6 text-slate-400 space-y-2">
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span className="type-caption text-sm">Searching...</span>
              </div>
            )}
            
            {error && (
              <div className="flex flex-col items-center justify-center py-6">
                <span className="text-red-400 text-sm mb-3 text-center type-body">{error}</span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: tapScale }} onClick={() => setRetryCount(c => c + 1)} className="type-body-medium text-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors text-slate-200">Try again</motion.button>
              </div>
            )}
            
            {!loading && !error && debouncedQuery && results.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-6 h-6 text-slate-500 mx-auto mb-3 opacity-50" strokeWidth={1.5} />
                <p className="type-body-medium text-slate-300">No city found</p>
                <p className="type-caption text-slate-400 text-sm mt-1">Try adjusting your search</p>
              </div>
            )}

            {!loading && !error && !debouncedQuery && recentSearches.length > 0 && (
              <div className="py-2">
                <span className="type-eyebrow text-slate-400 px-2 mb-2 block">Recent searches</span>
                <div className="flex flex-wrap gap-2 px-1">
                  {recentSearches.map((loc, i) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: tapScale }}
                      key={i}
                      onClick={() => handleSelect(loc.lat, loc.lon, loc.name)}
                      className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 type-body-medium text-sm text-slate-200 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
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
                      whileTap={{ scale: tapScale }}
                      onClick={() => handleSelect(result.latitude, result.longitude, result.name)}
                      className="flex-1 flex items-center text-left p-3 rounded-xl hover:bg-white/5 transition-colors app-row-hover"
                    >
                      <MapPin className="w-4 h-4 mr-3 text-slate-400 shrink-0" strokeWidth={1.5} />
                      <div className="flex flex-col overflow-hidden">
                        <span className="type-body-medium text-sm text-slate-200 truncate">{result.name}</span>
                        <span className="type-caption text-xs text-slate-400 truncate">
                          {[result.admin1, result.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: tapScale }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveLocation({ lat: result.latitude, lon: result.longitude, name: result.name });
                      }}
                      className="p-3 mr-1 hover:bg-white/10 rounded-full transition-colors"
                      aria-label={saved ? "Remove city" : "Save this city"}
                      title={saved ? "Remove city" : "Save this city"}
                    >
                      {saved ? (
                        <BookmarkCheck className="w-5 h-5 text-sky-400" strokeWidth={1.5} />
                      ) : (
                        <Bookmark className="w-5 h-5 text-slate-400 hover:text-slate-200" strokeWidth={1.5} />
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

