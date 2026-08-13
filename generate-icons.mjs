import sharp from 'sharp';
import fs from 'fs';

async function generate() {
  const logoPath = fs.existsSync('weather_logo.png') ? 'weather_logo.png' : 'public/logo/weather_logo.png';
  if (!fs.existsSync(logoPath)) {
    console.error('Logo file not found');
    return;
  }
  
  await sharp(logoPath).resize(192, 192).png().toFile('public/icon-192x192.png');
  await sharp(logoPath).resize(512, 512).png().toFile('public/icon-512x512.png');
  await sharp(logoPath).resize(512, 512).png().toFile('public/icon-maskable-512x512.png');
  await sharp(logoPath).resize(16, 16).png().toFile('public/favicon-16x16.png');
  await sharp(logoPath).resize(32, 32).png().toFile('public/favicon-32x32.png');
  await sharp(logoPath).resize(64, 64).png().toFile('public/favicon.ico');
    
  console.log('Icons generated from weather_logo.png');
}

generate().catch(console.error);
