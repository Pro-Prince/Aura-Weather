/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { WeatherPage } from './components/WeatherPage';
import { useGeolocation } from './hooks/useGeolocation';
import { useSavedCities } from './hooks/useSavedCities';
import { TempUnit } from './utils/convertTemp';
import { InstallPrompt } from './components/InstallPrompt';
import { CityManagement } from './components/CityManagement';
import { LocationData } from './components/SearchOverlay';
import { WeatherProvider } from './context/WeatherContext';

const POPULAR_DOMESTIC_MAPPING: Record<string, { name: string; lat: number; lon: number }[]> = {
  US: [
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
    { name: 'Houston', lat: 29.7604, lon: -95.3698 },
    { name: 'Miami', lat: 25.7617, lon: -80.1918 }
  ],
  GB: [
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Birmingham', lat: 52.4862, lon: -1.8904 },
    { name: 'Manchester', lat: 53.4808, lon: -2.2426 },
    { name: 'Edinburgh', lat: 55.9533, lon: -3.1883 },
    { name: 'Glasgow', lat: 55.8642, lon: -4.2518 }
  ],
  CA: [
    { name: 'Toronto', lat: 43.6532, lon: -79.3832 },
    { name: 'Montreal', lat: 45.5017, lon: -73.5673 },
    { name: 'Vancouver', lat: 49.2827, lon: -123.1207 },
    { name: 'Calgary', lat: 51.0447, lon: -114.0719 },
    { name: 'Ottawa', lat: 45.4215, lon: -75.6972 }
  ],
  AU: [
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
    { name: 'Melbourne', lat: -37.8136, lon: 144.9631 },
    { name: 'Brisbane', lat: -27.4698, lon: 153.0251 },
    { name: 'Perth', lat: -31.9505, lon: 115.8605 },
    { name: 'Adelaide', lat: -34.9285, lon: 138.6007 }
  ],
  IN: [
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707 }
  ],
  DE: [
    { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
    { name: 'Munich', lat: 48.1351, lon: 11.5820 },
    { name: 'Hamburg', lat: 53.5511, lon: 9.9937 },
    { name: 'Frankfurt', lat: 50.1109, lon: 8.6821 },
    { name: 'Cologne', lat: 50.9375, lon: 6.9603 }
  ],
  FR: [
    { name: 'Paris', lat: 48.8566, lon: 2.3522 },
    { name: 'Marseille', lat: 43.2965, lon: 5.3698 },
    { name: 'Lyon', lat: 45.7640, lon: 4.8357 },
    { name: 'Toulouse', lat: 43.6047, lon: 1.4442 },
    { name: 'Nice', lat: 43.7102, lon: 7.2620 }
  ],
  JP: [
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Osaka', lat: 34.6937, lon: 135.5023 },
    { name: 'Kyoto', lat: 35.0116, lon: 135.7681 },
    { name: 'Yokohama', lat: 35.4437, lon: 139.6380 },
    { name: 'Sapporo', lat: 43.0621, lon: 141.3544 }
  ],
  CN: [
    { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
    { name: 'Shanghai', lat: 31.2304, lon: 121.4737 },
    { name: 'Guangzhou', lat: 23.1291, lon: 113.2644 },
    { name: 'Shenzhen', lat: 22.5431, lon: 114.0579 },
    { name: 'Chengdu', lat: 30.6586, lon: 104.0648 }
  ],
  BR: [
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
    { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
    { name: 'Brasília', lat: -15.7938, lon: -47.8828 },
    { name: 'Salvador', lat: -12.9714, lon: -38.5014 },
    { name: 'Fortaleza', lat: -3.7319, lon: -38.5267 }
  ]
};

function inferCountryCodeFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return 'US';
    if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles') || tz.includes('Denver') || tz.includes('Phoenix')) return 'US';
    if (tz.includes('London') || tz.includes('Belfast') || tz.includes('Europe/Dublin')) return 'GB';
    if (tz.includes('Kolkata')) return 'IN';
    if (tz.includes('Paris') || tz.includes('Brussels') || tz.includes('Madrid')) return 'FR';
    if (tz.includes('Berlin') || tz.includes('Rome') || tz.includes('Amsterdam') || tz.includes('Zurich') || tz.includes('Vienna')) return 'DE';
    if (tz.includes('Tokyo')) return 'JP';
    if (tz.includes('Shanghai') || tz.includes('Urumqi') || tz.includes('Hong_Kong') || tz.includes('Taipei')) return 'CN';
    if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal') || tz.includes('Edmonton') || tz.includes('Winnipeg')) return 'CA';
    if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane') || tz.includes('Perth') || tz.includes('Adelaide')) return 'AU';
    if (tz.includes('Sao_Paulo') || tz.includes('Rio') || tz.includes('Brasilia') || tz.includes('Fortaleza')) return 'BR';
    if (tz.includes('Europe/')) return 'DE';
  } catch (e) {}
  return 'US';
}

export default function App() {
  return (
    <WeatherProvider>
      <AppContent />
    </WeatherProvider>
  );
}

function AppContent() {
  const geo = useGeolocation();
  const { savedCities, addCity, removeCities, reorderCities, isSaved } = useSavedCities();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchDefaultMode, setSearchDefaultMode] = useState(false);
  const [isFromSearch, setIsFromSearch] = useState(false);
  const [unit, setUnit] = useState<TempUnit>('C');
  const [countryCode, setCountryCode] = useState(() => inferCountryCodeFromTimezone());
  const [currentCityName, setCurrentCityName] = useState<string>('');
  
  const [activeCityId, setActiveCityId] = useState<string>('geo');
  const [temporaryCity, setTemporaryCity] = useState<LocationData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('aura-temp-unit');
    if (saved === 'C' || saved === 'F') {
      setUnit(saved);
    }
  }, []);

  const lat = geo.coordinates?.lat;
  const lon = geo.coordinates?.lon;

  useEffect(() => {
    if (lat === undefined || lon === undefined || isNaN(Number(lat)) || isNaN(Number(lon))) return;
    const fetchLocationInfo = async () => {
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        if (res.ok) {
          const data = await res.json();
          if (data.city || data.locality || data.principalSubdivision) {
            setCurrentCityName(data.city || data.locality || data.principalSubdivision);
          }
          if (data.countryCode) {
            setCountryCode(prev => prev === data.countryCode.toUpperCase() ? prev : data.countryCode.toUpperCase());
          }
        }
      } catch (e) {
        console.warn('Reverse geocoding failed:', e);
      }
    };
    fetchLocationInfo();
  }, [lat, lon]);

  const geoCoords = useMemo(() => {
    if (lat !== undefined && lon !== undefined && lat !== null && lon !== null && !isNaN(Number(lat)) && !isNaN(Number(lon))) {
      return { lat: Number(lat), lon: Number(lon) };
    }
    try {
      const lastWeather = localStorage.getItem('aura-last-weather');
      if (lastWeather) {
        const parsed = JSON.parse(lastWeather);
        if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
          return { lat: parsed.latitude, lon: parsed.longitude };
        }
      }
    } catch (e) {}
    // Default to London coordinates
    return { lat: 51.5074, lon: -0.1278 };
  }, [lat, lon]);

  const currentGeoLocation: LocationData = useMemo(() => ({
    name: geo.isFallback ? 'London' : (currentCityName || 'Current Location'),
    lat: geoCoords.lat,
    lon: geoCoords.lon,
    isGeo: true,
  }), [geo.isFallback, currentCityName, geoCoords.lat, geoCoords.lon]);

  const toggleUnit = () => {
    setUnit(prev => {
      const next = prev === 'C' ? 'F' : 'C';
      localStorage.setItem('aura-temp-unit', next);
      return next;
    });
  };

  const handleSelectLocation = useCallback((loc: LocationData, fromSearch: boolean) => {
    setIsSearchOpen(false);
    setIsFromSearch(fromSearch);
    setSearchDefaultMode(fromSearch);
    
    if (loc.isGeo || (loc.lat === geoCoords.lat && loc.lon === geoCoords.lon && !loc.name)) {
      setActiveCityId('geo');
      setTemporaryCity(null);
    } else if (isSaved(loc.name)) {
      setActiveCityId(loc.name);
      setTemporaryCity(null);
    } else {
      setTemporaryCity(loc);
      setActiveCityId(loc.name);
    }
  }, [geoCoords.lat, geoCoords.lon, isSaved]);

  const activeLocation = useMemo(() => {
    if (activeCityId === 'geo') {
      return currentGeoLocation;
    }
    if (temporaryCity && temporaryCity.name === activeCityId) {
      return { ...temporaryCity, isGeo: false };
    }
    const saved = savedCities.find(c => c.name === activeCityId);
    if (saved) {
      return { ...saved, isGeo: false };
    }
    return currentGeoLocation;
  }, [activeCityId, currentGeoLocation, temporaryCity, savedCities]);

  const isCurrentGeo = activeLocation.isGeo ?? (activeCityId === 'geo');
  const showAddBtn = Boolean(temporaryCity && temporaryCity.name === activeLocation.name && !isSaved(temporaryCity.name));
  const popularDomestic = POPULAR_DOMESTIC_MAPPING[countryCode] || POPULAR_DOMESTIC_MAPPING['US'];

  return (
    <div className="h-screen w-full flex flex-col text-slate-100 overflow-hidden relative bg-slate-950">
      {/* Single View Weather Page - No horizontal swipe */}
      <WeatherPage
        key={activeLocation.name + (isCurrentGeo ? '_geo' : '')}
        location={activeLocation}
        isGeo={isCurrentGeo}
        geoData={geo}
        unit={unit}
        isActive={true}
        onSearchClick={() => {
          setSearchDefaultMode(false);
          setIsSearchOpen(true);
        }}
        onToggleUnit={toggleUnit}
        showAddButton={showAddBtn}
        showBackButton={isFromSearch}
        onSaveLocation={() => {
          if (temporaryCity) {
            const cityToSave = { ...temporaryCity };
            addCity(cityToSave);
            setTemporaryCity(null);
            setActiveCityId(cityToSave.name);
          }
        }}
        onBackToSearch={() => {
          setTemporaryCity(null);
          setIsFromSearch(false);
          setIsSearchOpen(true);
        }}
      />

      <InstallPrompt />

      <CityManagement 
        isOpen={isSearchOpen} 
        onClose={() => {
          setIsSearchOpen(false);
          setSearchDefaultMode(false);
        }}
        savedCities={savedCities}
        currentLocation={currentGeoLocation}
        unit={unit}
        onSelectLocation={handleSelectLocation}
        reorderCities={reorderCities}
        removeCities={(names) => {
          removeCities(names);
          if (names.includes(activeCityId)) {
            setActiveCityId('geo');
          }
        }}
        onSaveLocation={(loc) => {
          if (!isSaved(loc.name)) {
            addCity(loc);
          }
        }}
        isSaved={isSaved}
        popularDomestic={popularDomestic}
        defaultSearchMode={searchDefaultMode}
      />
    </div>
  );
}
