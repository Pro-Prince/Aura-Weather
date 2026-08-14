const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherPage.tsx', 'utf8');

// Imports
code = code.replace(
  "import { motion, AnimatePresence, useReducedMotion } from 'motion/react';",
  "import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'motion/react';\nimport { usePullToRefresh } from '../hooks/usePullToRefresh';\nimport { useTapScale } from '../utils/motion';"
);

// Hooks
code = code.replace(
  "  const prefersReducedMotion = useReducedMotion();",
  `  const prefersReducedMotion = useReducedMotion();
  const tapScale = useTapScale();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const skyY = useTransform(scrollY, [0, 800], [0, 200]);
  const { pullY, isRefreshing } = usePullToRefresh(scrollRef, retry);`
);

// Add tapScale to buttons
code = code.replace(/whileTap=\{\{ scale: 0\.95 \}\}/g, "whileTap={{ scale: tapScale }}");

// Update SkyBackground and add pull to refresh UI
code = code.replace(
  `<SkyBackground visualState={visualState} />
      <WeatherCanvas visualState={visualState} />`,
  `<motion.div style={{ y: skyY }} className="absolute inset-0 pointer-events-none">
        <SkyBackground visualState={visualState} />
      </motion.div>
      <WeatherCanvas visualState={visualState} />`
);

// Scrollable container updates
code = code.replace(
  `      {/* Scrollable Content */}
      <div className="w-full h-full overflow-y-auto px-4 sm:px-6 md:px-8 pb-8 pt-24 flex flex-col items-center hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>`,
  `      {/* Scrollable Content */}
      <div ref={scrollRef} className="w-full h-full overflow-y-auto px-4 sm:px-6 md:px-8 pb-8 pt-24 flex flex-col items-center hide-scrollbar z-10 relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehaviorY: 'contain' }}>
        
        <motion.div 
          className="absolute top-10 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center text-white/80"
          style={{ y: pullY, opacity: useTransform(pullY, [0, 50], [0, 1]) }}
        >
          <RefreshCw className={\`w-6 h-6 \${isRefreshing ? 'animate-spin' : ''}\`} />
        </motion.div>
`
);

// Content Wrapper for pull down effect
code = code.replace(
  `        <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl flex flex-col space-y-6">
          <AnimatePresence mode="wait">`,
  `        <motion.div 
            style={{ y: pullY }}
            className="w-full max-w-md md:max-w-xl lg:max-w-2xl flex flex-col space-y-6"
          >
          <AnimatePresence mode="wait">`
);

code = code.replace(
  `            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>`,
  `            ) : null}
          </motion.div>
        </AnimatePresence>
        </motion.div>
      </div>`
);

fs.writeFileSync('src/components/WeatherPage.tsx', code);
