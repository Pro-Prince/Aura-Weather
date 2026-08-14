const sunriseStr = "2026-08-14T05:44";
const sunsetStr = "2026-08-14T20:25";
const moonriseStr = "2026-08-14T07:52";
const moonsetStr = "2026-08-14T20:58";

const nowTimeStr = "2026-08-14T12:00";
const now = new Date(nowTimeStr).getTime();

const sunrise = new Date(sunriseStr).getTime();
const sunset = new Date(sunsetStr).getTime();
const moonrise = new Date(moonriseStr).getTime();
const moonset = new Date(moonsetStr).getTime();

const tMin = Math.min(sunrise, moonrise);
const tMax = Math.max(sunset, moonset);
const timeSpan = tMax - tMin || 86400000;
const paddedMin = tMin - timeSpan * 0.05;
const paddedMax = tMax + timeSpan * 0.05;
const paddedSpan = paddedMax - paddedMin;

const toX = (t) => {
  return 15 + ((t - paddedMin) / paddedSpan) * 170;
};

const xSunStart = toX(sunrise);
const xSunEnd = toX(sunset);
const xSunPeak = (xSunStart + xSunEnd) / 2;

const xMoonStart = toX(moonrise);
const xMoonEnd = toX(moonset);
const xMoonPeak = (xMoonStart + xMoonEnd) / 2;

console.log('Sun', { start: xSunStart, peak: xSunPeak, end: xSunEnd });
console.log('Moon', { start: xMoonStart, peak: xMoonPeak, end: xMoonEnd });
