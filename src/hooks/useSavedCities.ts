import { useState, useEffect } from 'react';
import { LocationData } from '../components/SearchOverlay';

const DEFAULT_CITIES: LocationData[] = [
  { name: 'Raysan', lat: 23.235, lon: 72.645 },
  { name: 'Chikhli', lat: 20.756, lon: 73.067 },
  { name: 'Seoul', lat: 37.5665, lon: 126.9780 }
];

export function useSavedCities() {
  const [savedCities, setSavedCities] = useState<LocationData[]>(() => {
    const saved = localStorage.getItem('aura-saved-cities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved cities');
      }
    }
    return DEFAULT_CITIES;
  });

  useEffect(() => {
    const saved = localStorage.getItem('aura-saved-cities');
    if (!saved) {
      localStorage.setItem('aura-saved-cities', JSON.stringify(DEFAULT_CITIES));
    }
  }, []);

  const addCity = (city: LocationData) => {
    setSavedCities(prev => {
      if (prev.some(c => c.name === city.name)) return prev;
      const updated = [...prev, city];
      localStorage.setItem('aura-saved-cities', JSON.stringify(updated));
      return updated;
    });
  };

  const removeCity = (name: string) => {
    setSavedCities(prev => {
      const updated = prev.filter(c => c.name !== name);
      localStorage.setItem('aura-saved-cities', JSON.stringify(updated));
      return updated;
    });
  };

  const removeCities = (names: string[]) => {
    setSavedCities(prev => {
      const updated = prev.filter(c => !names.includes(c.name));
      localStorage.setItem('aura-saved-cities', JSON.stringify(updated));
      return updated;
    });
  };

  const reorderCities = (newCities: LocationData[]) => {
    setSavedCities(newCities);
    localStorage.setItem('aura-saved-cities', JSON.stringify(newCities));
  };

  const isSaved = (name: string) => savedCities.some(c => c.name === name);

  return { savedCities, addCity, removeCity, removeCities, reorderCities, isSaved };
}
