const fs = require('fs');
let code = fs.readFileSync('src/components/CityManagement.tsx', 'utf8');

// Imports
code = code.replace(
  "import { motion, AnimatePresence, Reorder } from 'motion/react';",
  "import { motion, AnimatePresence, Reorder } from 'motion/react';\nimport { useTapScale } from '../utils/motion';"
);

// Hook
code = code.replace(
  "export function CityManagement({",
  "export function CityManagement({\n  isOpen,\n  onClose,\n  savedCities,\n  currentLocation,\n  unit,\n  onSelectLocation,\n  reorderCities,\n  removeCities,\n  onSaveLocation,\n  isSaved\n}: CityManagementProps) {\n  const tapScale = useTapScale();"
);

// We need to match the previous export exactly
code = code.replace(
  "export function CityManagement({\n  isOpen,\n  onClose,\n  savedCities,\n  currentLocation,\n  unit,\n  onSelectLocation,\n  reorderCities,\n  removeCities,\n  onSaveLocation,\n  isSaved\n}: CityManagementProps) {\n  const tapScale = useTapScale();\n  isOpen,\n  onClose,\n  savedCities,\n  currentLocation,\n  unit,\n  onSelectLocation,\n  reorderCities,\n  removeCities,\n  onSaveLocation,\n  isSaved\n}: CityManagementProps) {",
  "export function CityManagement({\n  isOpen,\n  onClose,\n  savedCities,\n  currentLocation,\n  unit,\n  onSelectLocation,\n  reorderCities,\n  removeCities,\n  onSaveLocation,\n  isSaved\n}: CityManagementProps) {\n  const tapScale = useTapScale();"
);

// I should just use regex to insert the hook safely.
