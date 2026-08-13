import React from 'react';
import { VisualState } from '../utils/getWeatherVisualState';

const SKY_COLORS = {
  night: { top: [15, 23, 42], bottom: [30, 41, 59] }, 
  dawn: { top: [59, 47, 91], bottom: [255, 126, 95] }, 
  day: { top: [59, 130, 246], bottom: [135, 206, 235] }, 
  dusk: { top: [44, 62, 80], bottom: [253, 116, 108] }, 
};

const interpolateColor = (color1: number[], color2: number[], factor: number) => {
  return color1.map((c, i) => Math.round(c + (color2[i] - c) * factor));
};

export function SkyBackground({ visualState }: { visualState: VisualState }) {
  const { timeOfDayProgress, cloudOpacity } = visualState;
  
  const progress = timeOfDayProgress;

  let topColor, bottomColor;
  if (progress < 0.25) {
     const f = progress / 0.25;
     topColor = interpolateColor(SKY_COLORS.night.top, SKY_COLORS.dawn.top, f);
     bottomColor = interpolateColor(SKY_COLORS.night.bottom, SKY_COLORS.dawn.bottom, f);
  } else if (progress < 0.5) {
     const f = (progress - 0.25) / 0.25;
     topColor = interpolateColor(SKY_COLORS.dawn.top, SKY_COLORS.day.top, f);
     bottomColor = interpolateColor(SKY_COLORS.dawn.bottom, SKY_COLORS.day.bottom, f);
  } else if (progress < 0.75) {
     const f = (progress - 0.5) / 0.25;
     topColor = interpolateColor(SKY_COLORS.day.top, SKY_COLORS.dusk.top, f);
     bottomColor = interpolateColor(SKY_COLORS.day.bottom, SKY_COLORS.dusk.bottom, f);
  } else {
     const f = (progress - 0.75) / 0.25;
     topColor = interpolateColor(SKY_COLORS.dusk.top, SKY_COLORS.night.top, f);
     bottomColor = interpolateColor(SKY_COLORS.dusk.bottom, SKY_COLORS.night.bottom, f);
  }

  const backgroundStyle = {
    background: `linear-gradient(to bottom, rgb(${topColor.join(',')}), rgb(${bottomColor.join(',')}))`,
    transition: 'background 2s ease-in-out'
  };

  const isDay = progress >= 0.25 && progress <= 0.75;
  
  let arcProgress = 0;
  if (isDay) {
    arcProgress = (progress - 0.25) / 0.5; 
  } else {
    if (progress > 0.75) {
      arcProgress = (progress - 0.75) / 0.5; 
    } else {
      arcProgress = 0.5 + (progress / 0.5); 
    }
  }

  const x = arcProgress * 100; 
  const y = 90 - (Math.sin(arcProgress * Math.PI) * 70); 

  const glowColor = isDay ? 'rgba(255, 235, 160, 0.8)' : 'rgba(200, 220, 255, 0.4)';
  const bodyColor = isDay ? 'rgba(255, 255, 255, 1)' : 'rgba(230, 240, 255, 0.9)';
  const scale = isDay ? 1 : 0.7;

  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{ zIndex: -10, ...backgroundStyle }}
    >
      {/* Sun/Moon Container */}
      <div 
        className="absolute transition-all duration-2000 ease-in-out"
        style={{
          left: 0, top: 0,
          transform: `translate(calc(${x}vw - 50%), ${y}vh) scale(${scale})`,
          opacity: Math.sin(arcProgress * Math.PI) * 0.8 + 0.2, 
        }}
      >
         <div 
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-2000 ease-in-out blur-3xl"
           style={{
             width: '240px', height: '240px',
             background: glowColor
           }}
         />
         <div 
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-2000 ease-in-out"
           style={{
             width: '100px', height: '100px',
             background: bodyColor,
             boxShadow: `0 0 20px 5px ${glowColor}`
           }}
         />
      </div>

      {/* Clouds Layer */}
      <div 
        className="absolute inset-0 transition-opacity duration-2000 ease-in-out"
        style={{ opacity: cloudOpacity }}
      >
        <div className="absolute top-[10%] left-0 w-[50vw] h-[20vh] bg-white/40 blur-3xl rounded-full animate-cloud-slow" />
        <div className="absolute top-[30%] left-0 w-[60vw] h-[25vh] bg-white/30 blur-3xl rounded-full animate-cloud-med" style={{ animationDelay: '-15s' }} />
        <div className="absolute top-[15%] left-0 w-[40vw] h-[15vh] bg-white/50 blur-2xl rounded-full animate-cloud-fast" style={{ animationDelay: '-32s' }} />
        
        <div className="absolute top-[5%] left-0 w-[45vw] h-[20vh] bg-white/30 blur-3xl rounded-full animate-cloud-slow" style={{ animationDelay: '-40s' }} />
        <div className="absolute top-[25%] left-0 w-[55vw] h-[22vh] bg-white/40 blur-3xl rounded-full animate-cloud-med" style={{ animationDelay: '-5s' }} />
      </div>
    </div>
  );
}
