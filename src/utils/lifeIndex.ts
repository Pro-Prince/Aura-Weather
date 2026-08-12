export interface LifeIndexResult {
  category: string;
  label: string;
  score: number; // 0-4 for styling if needed, but mainly label is requested
}

export function computeOutdoorIndex(temp: number, wind: number, precipProb: number): LifeIndexResult {
  let label = 'Suitable';
  let score = 4;

  if (precipProb > 50 || wind > 40 || temp < -10 || temp > 35) {
    label = 'Unsuitable';
    score = 0;
  } else if (precipProb > 20 || wind > 25 || temp < 0 || temp > 30) {
    label = 'Fair';
    score = 2;
  } else if (temp > 15 && temp < 25 && wind < 15 && precipProb < 5) {
    label = 'Excellent';
    score = 4;
  } else {
    label = 'Good';
    score = 3;
  }

  return { category: 'Outdoor', label, score };
}

export function computeStargazingIndex(cloudCover: number): LifeIndexResult {
  // If cloud cover is high, stargazing is bad
  let label = 'Excellent';
  let score = 4;
  if (cloudCover > 80) {
    label = 'Unsuitable';
    score = 0;
  } else if (cloudCover > 50) {
    label = 'Poor';
    score = 1;
  } else if (cloudCover > 20) {
    label = 'Fair';
    score = 2;
  } else {
    label = 'Good';
    score = 3;
  }
  return { category: 'Stargazing', label, score };
}

export function computeFishingIndex(pressure: number, wind: number): LifeIndexResult {
  // Simple heuristic: very high wind is bad. High pressure is generally good for fishing.
  let label = 'Good';
  let score = 3;
  if (wind > 30) {
    label = 'Unsuitable';
    score = 0;
  } else if (wind > 20 || pressure < 1000) {
    label = 'Fair';
    score = 2;
  } else if (pressure > 1015 && wind < 15) {
    label = 'Excellent';
    score = 4;
  }
  return { category: 'Fishing', label, score };
}

export function computeSailingIndex(wind: number): LifeIndexResult {
  // Sailing needs some wind, but not too much
  let label = 'Suitable';
  let score = 3;
  if (wind < 5) {
    label = 'Poor (Too calm)';
    score = 1;
  } else if (wind > 40) {
    label = 'Unsuitable';
    score = 0;
  } else if (wind > 25) {
    label = 'Fair';
    score = 2;
  } else {
    label = 'Good';
    score = 4;
  }
  return { category: 'Sailing', label, score };
}

export function computeClothingIndex(feelsLike: number): LifeIndexResult {
  let label = 'Light jacket';
  let score = 3;
  if (feelsLike < 0) {
    label = 'Heavy coat';
    score = 0;
  } else if (feelsLike < 10) {
    label = 'Warm coat';
    score = 1;
  } else if (feelsLike < 18) {
    label = 'Jacket/Sweater';
    score = 2;
  } else if (feelsLike < 26) {
    label = 'T-shirt';
    score = 3;
  } else {
    label = 'Light clothing';
    score = 4;
  }
  return { category: 'Clothing', label, score };
}

export function computeMosquitoIndex(temp: number, humidity: number): LifeIndexResult {
  let label = 'Low';
  let score = 4;
  if (temp > 20 && humidity > 60) {
    label = 'High';
    score = 0;
  } else if (temp > 15 && humidity > 50) {
    label = 'Moderate';
    score = 2;
  } else if (temp < 10) {
    label = 'None';
    score = 4;
  }
  return { category: 'Mosquito', label, score };
}
