const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherCanvas.tsx', 'utf8');

code = code.replace(
  "// Randomize initial Y position so they don't all start at the top\n      particlesRef.current[i].y = Math.random() * logicalHeight;",
  "// Randomize initial positions so they don't all start at the edge\n      particlesRef.current[i].y = Math.random() * logicalHeight;\n      if (preset === 'fog') particlesRef.current[i].x = Math.random() * logicalWidth;"
);

fs.writeFileSync('src/components/WeatherCanvas.tsx', code);
