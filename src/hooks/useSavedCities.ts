import { useState, useCallback } from 'react';
import { LocationData } from '../components/SearchOverlay';

/**
 * PRODUCTION-READY PERSISTENCE CONFIGURATION
 * User data isolation is maintained naturally by the browser's Same-Origin Policy,
 * ensuring that data stored in localStorage for this domain is only accessible 
 * within this specific browser profile on this device.
 */
const STORAGE_KEY = 'weather_app_saved_cities';

/**
 * Persistence Utility: Safely serializes and saves city data to localStorage.
 * Handles Storage Quota exceptions gracefully.
 */
const saveCitiesToStorage = (cities: LocationData[]): boolean => {
  try {
    const serializedData = JSON.stringify(cities);
    localStorage.setItem(STORAGE_KEY, serializedData);
    return true;
  } catch (error) {
    // Handle Storage Quota Exceeded or other storage-related exceptions
    if (error instanceof DOMException && 
       (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.error('Persistence failed: Local storage quota exceeded.');
    } else {
      console.error('Persistence failed: An unexpected storage error occurred.', error);
    }
    return false;
  }
};

/**
 * State Initialization Strategy:
 * Safely retrieves and parses stored data with robust error fallback.
 */
const getInitialCities = (): LocationData[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return []; // Graceful fallback to empty state

    const parsedData = JSON.parse(storedData);
    
    // Validate schema: Must be an array of objects
    if (Array.isArray(parsedData)) {
      return parsedData;
    }
    
    console.warn('Persistence: Found corrupted data format, resetting to empty.');
    return [];
  } catch (error) {
    console.error('Persistence Initialization Error: Corrupted JSON data.', error);
    return []; // Fallback to empty state on parsing failure
  }
};

/**
 * Custom Hook: useSavedCities
 * Manages the reactive state of saved cities and synchronizes it with local device storage.
 */
export function useSavedCities() {
  const [savedCities, setSavedCities] = useState<LocationData[]>(getInitialCities);

  /**
   * ADD handler: Trims input, checks for duplicates, and persists changes.
   */
  const addCity = useCallback((city: LocationData) => {
    setSavedCities(prev => {
      // Clean input: Trim city name to prevent whitespace-only duplicates
      const cleanName = city.name.trim();
      
      // Edge-Case: Protection against duplicate entries (case-insensitive check)
      const isDuplicate = prev.some(c => c.name.trim().toLowerCase() === cleanName.toLowerCase());
      
      if (isDuplicate) {
        console.warn(`Persistence: City "${cleanName}" is already in your saved list.`);
        return prev;
      }

      const updatedCity = { ...city, name: cleanName };
      const nextState = [...prev, updatedCity];
      
      // Immediate persistence side-effect
      saveCitiesToStorage(nextState);
      return nextState;
    });
  }, []);

  /**
   * REMOVE handler: Filters state and updates storage immediately.
   */
  const removeCity = useCallback((name: string) => {
    setSavedCities(prev => {
      const nextState = prev.filter(c => c.name.trim().toLowerCase() !== name.trim().toLowerCase());
      saveCitiesToStorage(nextState);
      return nextState;
    });
  }, []);

  /**
   * BATCH REMOVE handler: Efficiently removes multiple cities at once.
   */
  const removeCities = useCallback((names: string[]) => {
    setSavedCities(prev => {
      const lowerNames = names.map(n => n.trim().toLowerCase());
      const nextState = prev.filter(c => !lowerNames.includes(c.name.trim().toLowerCase()));
      saveCitiesToStorage(nextState);
      return nextState;
    });
  }, []);

  /**
   * REORDER handler: Updates state with a pre-sorted list and persists.
   */
  const reorderCities = useCallback((newCities: LocationData[]) => {
    setSavedCities(newCities);
    saveCitiesToStorage(newCities);
  }, []);

  /**
   * READ handler: Reactive check if a city is already persisted.
   */
  const isSaved = useCallback((name: string) => {
    return savedCities.some(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
  }, [savedCities]);

  return { 
    savedCities, 
    addCity, 
    removeCity, 
    removeCities, 
    reorderCities, 
    isSaved 
  };
}
