const fs = require('fs');
let code = fs.readFileSync('src/components/CityManagement.tsx', 'utf8');

// Remove import
code = code.replace("import { getBackgroundImage } from '../utils/getBackgroundImage';\n", "");

// Remove logic 
code = code.replace(
  "  const bgImage = data ? getBackgroundImage(data.current?.weather_code ?? 0, data.current?.is_day ?? 1) : null;\n",
  ""
);

// Remove image tag
code = code.replace(
  /        \{bgImage && \([\s\S]*?        \)\}/,
  ""
);

fs.writeFileSync('src/components/CityManagement.tsx', code);
