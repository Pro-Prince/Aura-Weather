const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

if (!code.includes('@media (prefers-reduced-motion: reduce)')) {
  code += `\n@media (prefers-reduced-motion: reduce) {
  .animate-cloud-slow, .animate-cloud-med, .animate-cloud-fast {
    animation: none !important;
    transform: translateX(50vw) !important;
  }
}\n`;
  fs.writeFileSync('src/index.css', code);
}
