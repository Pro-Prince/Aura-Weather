const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove global imports and components
code = code.replace("import { WeatherCanvas } from './components/WeatherCanvas';\n", "");
code = code.replace("import { SkyBackground } from './components/SkyBackground';\n", "");
code = code.replace("<SkyBackground />\n      <WeatherCanvas />", "");

fs.writeFileSync('src/App.tsx', code);
