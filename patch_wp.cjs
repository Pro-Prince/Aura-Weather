const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherPage.tsx', 'utf8');

// Remove import
code = code.replace("import { getBackgroundImage } from '../utils/getBackgroundImage';\n", "");

// Remove logic 
code = code.replace(
  "  const bgImage = displayState.data ? getBackgroundImage(displayState.data.current?.weather_code ?? 0, displayState.data.current?.is_day ?? 1) : null;\n",
  ""
);

// Remove image tag
code = code.replace(
  /      \{\/\* Dynamic Background for this page \*\/\}\n      \{bgImage && \([\s\S]*?      \)\}/,
  ""
);

fs.writeFileSync('src/components/WeatherPage.tsx', code);
