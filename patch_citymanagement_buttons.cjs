const fs = require('fs');
let code = fs.readFileSync('src/components/CityManagement.tsx', 'utf8');

// The hook useTapScale was added in the previous patch, if it succeeded.
code = code.replace(/<button/g, '<motion.button whileTap={{ scale: tapScale }}');
code = code.replace(/<\/button>/g, '</motion.button>');

fs.writeFileSync('src/components/CityManagement.tsx', code);
