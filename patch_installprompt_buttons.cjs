const fs = require('fs');
let code = fs.readFileSync('src/components/InstallPrompt.tsx', 'utf8');

code = code.replace(
  "import { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';",
  "import { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';\nimport { useTapScale } from '../utils/motion';"
);

code = code.replace(
  "export function InstallPrompt() {",
  "export function InstallPrompt() {\n  const tapScale = useTapScale();"
);

code = code.replace(/<button/g, '<motion.button whileTap={{ scale: tapScale }}');
code = code.replace(/<\/button>/g, '</motion.button>');

fs.writeFileSync('src/components/InstallPrompt.tsx', code);
