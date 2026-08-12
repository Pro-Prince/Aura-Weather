export function getBeaufortForce(speedKmH: number): number {
  if (speedKmH < 1) return 0;
  if (speedKmH <= 5) return 1;
  if (speedKmH <= 11) return 2;
  if (speedKmH <= 19) return 3;
  if (speedKmH <= 28) return 4;
  if (speedKmH <= 38) return 5;
  if (speedKmH <= 49) return 6;
  if (speedKmH <= 61) return 7;
  if (speedKmH <= 74) return 8;
  if (speedKmH <= 88) return 9;
  if (speedKmH <= 102) return 10;
  if (speedKmH <= 117) return 11;
  return 12;
}

export function getWindDirection(degrees: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round((degrees % 360) / 22.5);
  return dirs[index % 16];
}
