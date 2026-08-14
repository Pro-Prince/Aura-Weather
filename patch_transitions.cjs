const fs = require('fs');

function patchFile(file, replacements) {
  let code = fs.readFileSync(file, 'utf8');
  for (const [search, replace] of replacements) {
    code = code.replace(search, replace);
  }
  fs.writeFileSync(file, code);
}

patchFile('src/components/CityManagement.tsx', [
  [
    "import { motion, AnimatePresence, Reorder } from 'motion/react';\nimport { useTapScale } from '../utils/motion';",
    "import { motion, AnimatePresence, Reorder } from 'motion/react';\nimport { useTapScale, springTransition } from '../utils/motion';"
  ],
  [
    "transition={{ type: 'spring', stiffness: 300, damping: 30 }}",
    "transition={springTransition}"
  ]
]);

patchFile('src/components/WeatherPage.tsx', [
  [
    "import { useTapScale } from '../utils/motion';",
    "import { useTapScale, springTransition } from '../utils/motion';"
  ],
  [
    "transition: { type: \"spring\", stiffness: 300, damping: 24 }",
    "transition: springTransition"
  ]
]);

patchFile('src/App.tsx', [
  [
    "import { useTapScale } from './utils/motion';",
    "import { useTapScale, springTransition } from './utils/motion';"
  ],
  [
    "transition={{ type: 'spring', stiffness: 300, damping: 30 }}", // if exists
    "transition={springTransition}"
  ]
]);

