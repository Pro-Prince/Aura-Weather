<p align="center">
# Aura Weather  <img src="public/weather_logo.png" alt="Aura Weather Logo" width="120" style="border-radius: 20px;" /> 
</p>


Aura Weather is a premium, ambient weather experience featuring dynamic atmospheric visual themes, hyper-accurate real-time weather forecasts, air quality index (AQI) tracking, UV radiation gauges, hourly/daily forecasts, and full offline-first PWA capabilities.

## 🌟 Key Features

- **Ambient Dynamic Backgrounds & Particle FX**: Real-time canvas particle systems for rain, snow, mist, and clear skies synced with day/night cycles.
- **Glassmorphic UI**: High-contrast, WCAG AA compliant glass cards with fluid micro-interactions powered by Motion.
- **Comprehensive Weather Metrics**:
  - Current temperature, feels like, humidity, wind speed, and weather condition badges.
  - Air Quality Index (US AQI) and UV Index status with color-coded safety indicators.
  - 24-Hour hourly forecast carousel with precipitation probabilities.
  - 7-Day daily forecast breakdown with min/max temperatures and condition icons.
- **Location & Search**: Automatic browser geolocation with instant city search autocomplete using Geocoding APIs.
- **PWA & Offline Shell**:
  - Offline app shell precaching via `vite-plugin-pwa` Service Worker.
  - Runtime Stale-While-Revalidate caching for weather & AQI API responses.
  - Custom glassmorphic install prompt banner.
- **Temperature Unit Switcher**: Instant metric (°C) and imperial (°F) toggle with persistent user preference storage.

## 🛠️ Tech Stack

- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Animation**: Motion (`motion/react`)
- **API Integration**: Open-Meteo Weather Forecast API, Air Quality API, Geocoding API
- **PWA**: `vite-plugin-pwa` with Workbox runtime caching
- **Build & Quality**: ESLint, TypeScript compiler

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

## 📱 Mobile & Desktop Optimized

Designed desktop-first with fluid mobile responsiveness down to 320px screens without overflow.
