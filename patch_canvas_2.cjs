const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherCanvas.tsx', 'utf8');

if (!code.includes('if (!isIntersecting) return;')) {
  code = code.replace(
    'const prefersReducedMotion = window.matchMedia(\'(prefers-reduced-motion: reduce)\').matches;',
    'if (!isIntersecting) return;\n\n    const prefersReducedMotion = window.matchMedia(\'(prefers-reduced-motion: reduce)\').matches;'
  );
  fs.writeFileSync('src/components/WeatherCanvas.tsx', code);
}
