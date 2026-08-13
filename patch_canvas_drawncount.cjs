const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherCanvas.tsx', 'utf8');

code = code.replace(
  'const redistributeParticles = () => {\n       particlesRef.current.forEach(p => {\n            if (drawnCount++ > maxDraw) return;\n         if (p.active) {',
  'const redistributeParticles = () => {\n       particlesRef.current.forEach(p => {\n         if (p.active) {'
);
fs.writeFileSync('src/components/WeatherCanvas.tsx', code);
