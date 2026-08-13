const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!code.includes("import { SkyBackground }")) {
  code = code.replace(
    "import { WeatherCanvas } from './components/WeatherCanvas';",
    "import { WeatherCanvas } from './components/WeatherCanvas';\nimport { SkyBackground } from './components/SkyBackground';"
  );
}

// Add component inside main container
if (!code.includes("<SkyBackground />")) {
  code = code.replace(
    '<WeatherCanvas />',
    '<SkyBackground />\n      <WeatherCanvas />'
  );
}

// Remove black background from the main container so we can see the sky
code = code.replace(
  'className="h-screen w-full flex flex-col text-slate-100 overflow-hidden relative bg-black"',
  'className="h-screen w-full flex flex-col text-slate-100 overflow-hidden relative bg-transparent"'
);

fs.writeFileSync('src/App.tsx', code);
