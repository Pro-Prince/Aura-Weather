export interface VisualState {
  preset: 'rain' | 'snow' | 'fog' | 'none';
  intensity: 'low' | 'medium' | 'high';
  driftAngle: number;
  cloudOpacity: number;
  timeOfDayProgress: number;
}

export function getWeatherVisualState(
  current: any,
  daily: any
): VisualState {
  if (!current || !daily) {
    return { preset: 'none', intensity: 'low', driftAngle: 0, cloudOpacity: 0, timeOfDayProgress: 0.5 };
  }

  const { weather_code, cloud_cover, precipitation, wind_speed_10m, wind_direction_10m, time, is_day } = current;
  const sunriseStr = daily.sunrise?.[0];
  const sunsetStr = daily.sunset?.[0];

  let timeOfDayProgress = is_day ? 0.5 : 0.0;
  
  if (time && sunriseStr && sunsetStr) {
     const now = new Date(time).getTime();
     const sunrise = new Date(sunriseStr).getTime();
     const sunset = new Date(sunsetStr).getTime();
     
     const dawnStart = sunrise - 45 * 60000;
     const dawnEnd = sunrise + 45 * 60000;
     const duskStart = sunset - 45 * 60000;
     const duskEnd = sunset + 45 * 60000;
     
     if (now < dawnStart) {
         timeOfDayProgress = 0.0;
     } else if (now >= dawnStart && now <= dawnEnd) {
         timeOfDayProgress = 0.0 + ((now - dawnStart) / (90 * 60000)) * 0.5;
     } else if (now > dawnEnd && now < duskStart) {
         timeOfDayProgress = 0.5;
     } else if (now >= duskStart && now <= duskEnd) {
         timeOfDayProgress = 0.5 + ((now - duskStart) / (90 * 60000)) * 0.5;
     } else {
         timeOfDayProgress = 1.0; 
     }
  }

  let preset: 'rain' | 'snow' | 'fog' | 'none' = 'none';
  
  if (weather_code !== undefined && weather_code !== null) {
      if ([45, 48].includes(weather_code)) {
        preset = 'fog';
      } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weather_code)) {
        preset = 'rain';
      } else if ([71, 73, 75, 77, 85, 86].includes(weather_code)) {
        preset = 'snow';
      }
  }

  let intensity: 'low' | 'medium' | 'high' = 'low';
  if (precipitation > 5) {
    intensity = 'high';
  } else if (precipitation > 1) {
    intensity = 'medium';
  }

  let driftAngle = 0;
  if (wind_speed_10m > 0 && wind_direction_10m !== undefined) {
     const windRad = (wind_direction_10m * Math.PI) / 180;
     driftAngle = Math.sin(windRad) * Math.min(1, wind_speed_10m / 20); 
  }

  const cloudOpacity = Math.max(0, Math.min(1, (cloud_cover || 0) / 100));

  return {
    preset,
    intensity,
    driftAngle,
    cloudOpacity,
    timeOfDayProgress
  };
}
