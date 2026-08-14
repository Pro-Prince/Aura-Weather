const fs = require('fs');
let code = fs.readFileSync('src/components/SearchOverlay.tsx', 'utf8');

code = code.replace(
  "import { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';",
  "import { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';\nimport { useTapScale } from '../utils/motion';"
);

code = code.replace(
  "export function SearchOverlay({ isOpen, onClose, onSelectLocation, onSaveLocation, isSaved }: SearchOverlayProps) {",
  "export function SearchOverlay({ isOpen, onClose, onSelectLocation, onSaveLocation, isSaved }: SearchOverlayProps) {\n  const tapScale = useTapScale();"
);

code = code.replace(/whileTap=\{\{ scale: [0-9.]+ \}\}/g, "whileTap={{ scale: tapScale }}");

fs.writeFileSync('src/components/SearchOverlay.tsx', code);
