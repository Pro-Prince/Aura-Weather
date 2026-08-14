const fs = require('fs');
console.log(fs.readFileSync('src/components/WeatherPage.tsx', 'utf8').substring(6500, 7500));
