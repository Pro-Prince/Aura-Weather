export function getBackgroundImage(code: number, isDay: boolean): string {
  // Map WMO weather codes to our background images
  // 0: Clear sky
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  // 45, 48: Fog and depositing rime fog
  // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
  // 56, 57: Freezing Drizzle: Light and dense intensity
  // 61, 63, 65: Rain: Slight, moderate and heavy intensity
  // 66, 67: Freezing Rain: Light and heavy intensity
  // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
  // 77: Snow grains
  // 80, 81, 82: Rain showers: Slight, moderate, and violent
  // 85, 86: Snow showers slight and heavy
  // 95: Thunderstorm: Slight or moderate
  // 96, 99: Thunderstorm with slight and heavy hail

  let imageName = '';

  if (code === 0 || code === 1) {
    imageName = isDay ? 'bg_clear_day' : 'bg_clear_night';
  } else if (code === 2 || code === 3) {
    imageName = isDay ? 'bg_cloudy_day' : 'bg_cloudy_night';
  } else if (code === 45 || code === 48) {
    imageName = 'bg_fog';
  } else if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99)
  ) {
    imageName = 'bg_rain';
  } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    imageName = 'bg_snow';
  } else {
    // Fallback
    imageName = isDay ? 'bg_clear_day' : 'bg_clear_night';
  }

  return `/backgrounds/${imageName}.webp`;
}
