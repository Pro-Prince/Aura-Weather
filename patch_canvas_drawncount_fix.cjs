const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherCanvas.tsx', 'utf8');

code = code.replace(
  'const maxDraw = particlesRef.current.length * particleMultiplier;\n          particlesRef.current.forEach(p => {\n            if (!p.active) return;',
  'const maxDraw = particlesRef.current.length * particleMultiplier;\n          particlesRef.current.forEach(p => {\n            if (drawnCount++ > maxDraw) return;\n            if (!p.active) return;'
);

fs.writeFileSync('src/components/WeatherCanvas.tsx', code);
