const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { TempUnit } from './utils/convertTemp';",
  "import { TempUnit } from './utils/convertTemp';\nimport { useOverscroll } from './hooks/useOverscroll';\nimport { useTapScale } from './utils/motion';"
);

// Add useTapScale and useOverscroll
code = code.replace(
  "  const scrollRef = useRef<HTMLDivElement>(null);",
  "  const scrollRef = useRef<HTMLDivElement>(null);\n  const tapScale = useTapScale();\n  const overscrollX = useOverscroll(scrollRef);"
);

// Change whileTap to use tapScale
code = code.replace(/whileTap=\{\{ scale: 0\.95 \}\}/g, "whileTap={{ scale: tapScale }}");

// Update the scrollable div to be a motion.div
code = code.replace(
  `<div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar z-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >`,
  `<motion.div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar z-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', x: overscrollX }}
      >`
);

code = code.replace(
  `        ))}
      </div>`,
  `        ))}
      </motion.div>`
);

fs.writeFileSync('src/App.tsx', code);
