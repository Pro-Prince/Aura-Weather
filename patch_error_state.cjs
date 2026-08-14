const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherPage.tsx', 'utf8');

code = code.replace(
  ") : displayState.error ? (",
  ") : (displayState.error && !displayState.data) ? ("
);

fs.writeFileSync('src/components/WeatherPage.tsx', code);
