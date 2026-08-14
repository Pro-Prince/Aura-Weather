const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherPage.tsx', 'utf8');

const target = `<motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-4 space-y-3">
                  <motion.img
                    src="/weather_logo.png"
                    alt="Aura Weather"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl shadow-sky-500/20 border border-white/20"
                    animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.85, 1, 0.85] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    referrerPolicy="no-referrer"
                  />
                  <h2 className="text-xl font-light tracking-wide text-slate-100">Aura Weather</h2>
                </motion.div>`;

if (code.includes(target)) {
  code = code.replace(target, '');
  fs.writeFileSync('src/components/WeatherPage.tsx', code);
} else {
  console.log("Target not found!");
}
