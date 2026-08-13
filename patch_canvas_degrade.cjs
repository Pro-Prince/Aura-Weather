const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherCanvas.tsx', 'utf8');

if (!code.includes('let slowFrames = 0;')) {
  // Add graceful degradation logic
  code = code.replace(
    'const render = (time: number, forceStatic = false) => {',
    'let slowFrames = 0;\n    let particleMultiplier = 1.0;\n    const render = (time: number, forceStatic = false) => {'
  );
  
  code = code.replace(
    'const delta = Math.min(dt, 0.1);',
    `const delta = Math.min(dt, 0.1);

      // Graceful degradation on throttled CPU
      if (dt > 0.05) {
        slowFrames++;
      } else if (dt < 0.033 && slowFrames > 0) {
        slowFrames = Math.max(0, slowFrames - 1);
      }
      if (slowFrames > 60 && particleMultiplier > 0.3) {
        particleMultiplier -= 0.2;
        slowFrames = 0;
      }`
  );

  code = code.replace(
    'if (currentPreset !== \'none\' && pOpacity > 0) {',
    'if (currentPreset !== \'none\' && pOpacity > 0) {\n          let drawnCount = 0;\n          const maxDraw = particlesRef.current.length * particleMultiplier;'
  );

  code = code.replace(
    'particlesRef.current.forEach(p => {',
    'particlesRef.current.forEach(p => {\n            if (drawnCount++ > maxDraw) return;'
  );

  fs.writeFileSync('src/components/WeatherCanvas.tsx', code);
}
