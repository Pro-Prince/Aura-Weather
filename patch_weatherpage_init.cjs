const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherPage.tsx', 'utf8');

// We need to initialize displayState with the initial data from useWeather!
// But useWeather is called right before useState.
// Let's modify the useState initialization to use the data returned by useWeather!

code = code.replace(
  `  const [displayState, setDisplayState] = useState<{
    data: any | null;
    name: string;
    error: string | null;
    isGeoDenied: boolean;
  }>({ data: null, name: '', error: null, isGeoDenied: false });`,
  `  const [displayState, setDisplayState] = useState<{
    data: any | null;
    name: string;
    error: string | null;
    isGeoDenied: boolean;
  }>({ data, name: locationName, error, isGeoDenied });`
);

// We also want displayState to update if data changes. Wait, we want it to update IMMEDIATELY on first mount even if loading is true?
// The problem is that if we initialize it with `data` (which is already default/cached from useWeather), it will render instantly!
// And if we want to cross-fade when NEW data arrives, the useEffect will handle it when `!weatherLoading` becomes true!

fs.writeFileSync('src/components/WeatherPage.tsx', code);
