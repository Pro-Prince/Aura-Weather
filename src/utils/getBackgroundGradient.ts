export function getBackgroundGradient(code: number, isDay: boolean): string {
  // 0, 1: Clear
  if (code === 0 || code === 1) {
    return isDay 
      ? 'from-sky-500 to-blue-600' 
      : 'from-slate-900 to-indigo-950';
  }
  // 2, 3: Cloudy
  if (code === 2 || code === 3) {
    return isDay
      ? 'from-slate-500 to-slate-600'
      : 'from-slate-800 to-slate-900';
  }
  // Rain (51-67, 80-82)
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return isDay
      ? 'from-slate-600 to-blue-800'
      : 'from-slate-800 to-blue-950';
  }
  // Snow (71-77, 85-86)
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return isDay
      ? 'from-slate-400 to-slate-500'
      : 'from-slate-700 to-slate-800';
  }
  // Fog/Storm (45-48, 95-99)
  if ((code >= 45 && code <= 48) || (code >= 95 && code <= 99)) {
    return isDay
      ? 'from-slate-600 to-zinc-700'
      : 'from-slate-800 to-zinc-900';
  }

  // Default fallback
  return 'from-slate-800 to-slate-900';
}
