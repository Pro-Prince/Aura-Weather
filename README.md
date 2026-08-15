<div align="center">

# Aura Weather
### A glassmorphic weather app that costs nothing to run.

![Status](https://img.shields.io/badge/status-live-22C55E?style=flat-square)
![Demo](https://img.shields.io/badge/demo-aura--weather--sync.vercel.app-6366F1?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite-22D3EE?style=flat-square)
![Backend](https://img.shields.io/badge/backend-none%20%C2%B7%20client--only-525252?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-F59E0B?style=flat-square)

**[→ View Live](https://aura-weather-sync.vercel.app/)**

</div>

---

## Overview

Aura Weather is a browser-based weather app built to feel like a premium native product while running entirely for free. Instead of routing through a backend, an API key, or a subscription tier, it fetches live global weather data directly from the client, wraps it in a frosted-glass interface, and installs straight to a phone's home screen like a native app — no Play Store, no App Store, no server bill. A weather-reactive background shifts gradient and motion based on real conditions and each location's actual sunrise and sunset time, not a static template.

---

## Live Demo

🔗 **[aura-weather-sync.vercel.app](https://aura-weather-sync.vercel.app/)**

> Grant location access for instant local weather, or search any city worldwide. Installable to your home screen as a full PWA.

---

## Features

- **Current Conditions Hero** — large temperature display, live condition icon, feels-like temperature, humidity, wind, and UV index at a glance
- **City Search and Geolocation** — instant weather on load via browser geolocation, with debounced global city search and graceful fallback if location is denied
- **Hourly and 7-Day Forecast** — a scrollable 24-hour strip and a full 7-day outlook with high-low ranges visualized against the week's range
- **Air Quality and UV Insight** — live AQI with a color-coded risk gauge and a plain-language UV risk label, pulled from the same free API as the core forecast
- **Weather-Reactive Background** — gradient and animated particles (rain, snow, drifting light) shift based on real conditions and real day/night state
- **Unit Toggle and Persistence** — one-tap Celsius/Fahrenheit switch, saved locally and restored on return visits
- **Installable Progressive Web App** — custom install prompt, offline-capable app shell, opens full-screen from the home screen with no browser chrome

---

## Tech Stack

| Technology | Role |
|---|---|
| React | Frontend framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Open-Meteo Forecast API | Current, hourly, and daily weather |
| Open-Meteo Geocoding API | City search |
| Open-Meteo Air Quality API | AQI and pollutant data |
| Browser Geolocation API | Location detection |
| vite-plugin-pwa | Manifest generation and service worker |
| Vercel | Deployment |

---

## Architecture

- Fully client-side by design — no backend, no API key, no server cost at any scale, using Open-Meteo's free keyless weather API
- Day and night state is calculated from each location's actual sunrise and sunset time returned by the API, not a fixed clock assumption
- A lightweight particle layer is restricted to transform and opacity animations only, keeping frame rate stable on mid-range mobile hardware
- vite-plugin-pwa handles manifest generation and a service worker with stale-while-revalidate caching for weather data and a precached app shell for offline access
- Unit preference and recent searches persist via browser localStorage, restored automatically on the next visit

---

## Challenges Solved

**1. Zero-cost architecture at any scale**
Weather apps that use a backend introduce ongoing cost and complexity for something that does not need either. Built a fully client-side architecture using a free, keyless weather API, removing infrastructure cost entirely regardless of traffic.

**2. Glassmorphic contrast over dynamic backgrounds**
Glassmorphic interfaces frequently fail basic text contrast once placed over a busy or bright background. Every glass surface was checked against its brightest possible background state and adjusted for opacity and text weight until it met accessibility contrast standards.

**3. Accurate day/night state**
Most weather apps assume day and night based on a fixed clock window, producing an inaccurate background at dawn and dusk. Day and night state is calculated from each location's actual sunrise and sunset time returned by the API.

**4. Mobile performance with animated weather effects**
Animated weather effects often tank performance on mobile devices. A lightweight particle layer restricted to transform and opacity animations only keeps frame rate stable on mid-range hardware.

**5. Native-app experience without app store overhead**
Native app installation requires app store fees, review delays, and platform-specific builds. Built a fully installable Progressive Web App with a custom install prompt, offline shell, and standalone launch — none of the native app overhead.

---

## Author

**Prince Patel** — AI-Powered Product Developer

- 🌐 Portfolio: [prince-patel-portfolio.vercel.app](https://prince-patel-portfolio.vercel.app)
- 🐙 GitHub: [github.com/Pro-Prince](https://github.com/Pro-Prince)
- 𝕏 X: [@Pro_Prince_1](https://x.com/Pro_Prince_1)
- 💼 LinkedIn: [linkedin.com/in/prince-patel476](https://www.linkedin.com/in/prince-patel476/)

---

## License

This project is licensed under the MIT License.
