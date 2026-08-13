const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherPage.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { TempUnit } from '../utils/convertTemp';",
  "import { TempUnit } from '../utils/convertTemp';\nimport { WeatherCanvas } from './WeatherCanvas';\nimport { SkyBackground } from './SkyBackground';\nimport { getWeatherVisualState } from '../utils/getWeatherVisualState';"
);

// Get visual state
code = code.replace(
  "  const showAlert = alertMessage && eventId && eventId !== dismissedEventId;",
  "  const showAlert = alertMessage && eventId && eventId !== dismissedEventId;\n\n  const visualState = React.useMemo(() => getWeatherVisualState(displayState.data?.current, displayState.data?.daily), [displayState.data?.current, displayState.data?.daily]);"
);

// Add components
code = code.replace(
  '<div className="w-full h-full shrink-0 snap-center relative overflow-hidden">\n      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 pointer-events-none -z-10" />',
  '<div className="w-full h-full shrink-0 snap-center relative overflow-hidden">\n      <SkyBackground visualState={visualState} />\n      <WeatherCanvas visualState={visualState} />\n      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 pointer-events-none -z-10" />'
);

fs.writeFileSync('src/components/WeatherPage.tsx', code);
