const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherPage.tsx', 'utf8');

// Add components
if (!code.includes('<SkyBackground')) {
  code = code.replace(
    /<div className="w-full h-full shrink-0 snap-center relative overflow-hidden">\s*<div className="absolute inset-0 bg-gradient-to-b from-black\/50 via-black\/20 to-black\/70 pointer-events-none -z-10" \/>/,
    '<div className="w-full h-full shrink-0 snap-center relative overflow-hidden">\n      <SkyBackground visualState={visualState} />\n      <WeatherCanvas visualState={visualState} />\n      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 pointer-events-none -z-10" />'
  );
  fs.writeFileSync('src/components/WeatherPage.tsx', code);
}
