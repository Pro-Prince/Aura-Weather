const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!code.includes("import { WeatherCanvas }")) {
  code = code.replace(
    "import { CityManagement } from './components/CityManagement';",
    "import { CityManagement } from './components/CityManagement';\nimport { WeatherCanvas } from './components/WeatherCanvas';"
  );
}

// Add component inside main container
if (!code.includes("<WeatherCanvas />")) {
  code = code.replace(
    '<div className="h-screen w-full flex flex-col text-slate-100 overflow-hidden relative bg-black">',
    '<div className="h-screen w-full flex flex-col text-slate-100 overflow-hidden relative bg-black">\n      <WeatherCanvas />'
  );
}

fs.writeFileSync('src/App.tsx', code);
