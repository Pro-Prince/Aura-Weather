const sharp = require('sharp');
const fs = require('fs');

const svgCode = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0f172a"/>
  <!-- Circle background for maskable -->
  <circle cx="256" cy="256" r="216" fill="#1e293b"/>
  <!-- Sun and cloud icon stylized -->
  <path d="M256 128 V96 M256 416 V384 M128 256 H96 M416 256 H384 M165.5 165.5 L142.8 142.8 M346.5 346.5 L369.2 369.2 M165.5 346.5 L142.8 369.2 M346.5 165.5 L369.2 142.8" stroke="#38bdf8" stroke-width="24" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="64" fill="#38bdf8"/>
  <path d="M200 320 Q200 280 240 280 Q245 230 290 230 Q335 230 340 280 Q380 280 380 320 Z" fill="#e2e8f0"/>
</svg>
`;

async function generate() {
  const buf = Buffer.from(svgCode);
  
  await sharp(buf)
    .resize(192, 192)
    .png()
    .toFile('public/icon-192x192.png');
    
  await sharp(buf)
    .resize(512, 512)
    .png()
    .toFile('public/icon-512x512.png');

  await sharp(buf)
    .resize(512, 512)
    .png()
    .toFile('public/icon-maskable-512x512.png');
    
  console.log('Icons generated');
}

generate().catch(console.error);
