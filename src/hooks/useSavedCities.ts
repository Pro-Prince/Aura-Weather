import { useState, useEffect } from 'react';
import { LocationData } from '../components/SearchOverlay';

export function useSavedCities() {
  const [savedCities, setSavedCities] = useState<LocationData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('aura-saved-cities');
    if (saved) {
      try {
        setSavedCities(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved cities');
      }
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
