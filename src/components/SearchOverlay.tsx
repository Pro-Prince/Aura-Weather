import { useState, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { GlassCard } from './GlassCard';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: { lat: number; lon: number; name: string }) => void;
}

interface SearchResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export function SearchOverlay({ isOpen, onClose, onSelectLocation }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err.message || 'Failed to search locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations(debouncedQuery);
  }, [debouncedQuery]);

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
            <button onClick={onClose} className="absolute right-3 p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-slate-400 hover:text-slate-200" />
            </button>
          </div>

          <div className="flex flex-col">
            {loading && <div className="text-center text-sm text-slate-400 py-4">Searching...</div>}
            
            {error && (
              <div className="text-center text-sm py-4">
                <span className="text-red-400 block mb-2">{error}</span>
                <button onClick={() => fetchLocations(debouncedQuery)} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">Retry</button>
              </div>
            )}
            
            {!loading && !error && debouncedQuery && results.length === 0 && (
              <div className="text-center text-sm text-slate-400 py-4">No city found</div>
            )}

            {!loading && !error && results.length > 0 && (
              <ul className="flex flex-col space-y-1">
                {results.map((result) => (
                  <li key={result.id}>
                    <button
                      onClick={() => {
                        onSelectLocation({ lat: result.latitude, lon: result.longitude, name: result.name });
                        onClose();
                      }}
                      className="w-full flex items-center text-left p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <MapPin className="w-4 h-4 mr-3 text-slate-400 shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-slate-200 truncate">{result.name}</span>
                        <span className="text-xs text-slate-400 truncate">
                          {[result.admin1, result.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
