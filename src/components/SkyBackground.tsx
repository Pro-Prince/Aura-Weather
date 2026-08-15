import React, { useState, useEffect, useRef } from 'react';
import { VisualState } from '../utils/getWeatherVisualState';
import { useAppReducedMotion } from '../utils/motion';

const SKY_COLORS = {
  night: { top: [15, 23, 42], bottom: [30, 41, 59] }, 
  dawn: { top: [59, 47, 91], bottom: [255, 126, 95] }, 
  day: { top: [59, 130, 246], bottom: [135, 206, 235] }, 
  dusk: { top: [44, 62, 80], bottom: [253, 116, 108] }, 
};

// Storm specific deeper, saturated palettes
const STORM_COLORS = {
  night: { top: [10, 14, 24], bottom: [18, 24, 40] },
  day: { top: [24, 34, 52], bottom: [38, 50, 70] }
};

const interpolateColor = (color1: number[], color2: number[], factor: number) => {
  return color1.map((c, i) => Math.round(c + (color2[i] - c) * factor));
};

export function SkyBackground({ visualState }: { visualState: VisualState }) {
  const { timeOfDayProgress, cloudOpacity, preset, isFreezing, isThunderstorm } = visualState;
  const prefersReducedMotion = useAppReducedMotion();
  
  // Lightning flash state for thunderstorm
  const [flashOpacity, setFlashOpacity] = useState(0);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashAnimFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Photosensitivity requirement: Never flash if user prefers reduced motion or not thunderstorm
    if (prefersReducedMotion || !isThunderstorm) {
      setFlashOpacity(0);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (flashAnimFrameRef.current) cancelAnimationFrame(flashAnimFrameRef.current);
      return;
    }

    let isMounted = true;

    const triggerLightning = () => {
      if (!isMounted) return;

      const startTime = performance.now();
      const fadeInDuration = 150; // ms
      const holdDuration = 80;   // ms
      const fadeOutDuration = 370; // ms
      const totalDuration = fadeInDuration + holdDuration + fadeOutDuration; // 600ms total smooth fade
      const maxPeak = 0.38 + Math.random() * 0.15; // Soft illumination (never harsh pure white)

      const animateFlash = (currentTime: number) => {
        if (!isMounted) return;
        const elapsed = currentTime - startTime;

        if (elapsed < fadeInDuration) {
          // Smooth sinusoidal ease-in
          const progress = elapsed / fadeInDuration;
          const currentOpacity = Math.sin((progress * Math.PI) / 2) * maxPeak;
          setFlashOpacity(currentOpacity);
          flashAnimFrameRef.current = requestAnimationFrame(animateFlash);
        } else if (elapsed < fadeInDuration + holdDuration) {
          setFlashOpacity(maxPeak);
          flashAnimFrameRef.current = requestAnimationFrame(animateFlash);
        } else if (elapsed < totalDuration) {
          // Smooth sinusoidal ease-out
          const progress = (elapsed - fadeInDuration - holdDuration) / fadeOutDuration;
          const currentOpacity = (1 - Math.sin((progress * Math.PI) / 2)) * maxPeak;
          setFlashOpacity(Math.max(0, currentOpacity));
          flashAnimFrameRef.current = requestAnimationFrame(animateFlash);
        } else {
          setFlashOpacity(0);
          scheduleNextFlash();
        }
      };

      flashAnimFrameRef.current = requestAnimationFrame(animateFlash);
    };

    const scheduleNextFlash = () => {
      // Random interval between 8 and 20 seconds (8000ms - 20000ms)
      const nextDelay = 8000 + Math.random() * 12000;
      flashTimeoutRef.current = setTimeout(triggerLightning, nextDelay);
    };

    // Initial delay before first flash
    const initialDelay = 5000 + Math.random() * 6000;
    flashTimeoutRef.current = setTimeout(triggerLightning, initialDelay);

    return () => {
      isMounted = false;
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (flashAnimFrameRef.current) cancelAnimationFrame(flashAnimFrameRef.current);
    };
  }, [isThunderstorm, prefersReducedMotion]);

  const progress = timeOfDayProgress;

  let topColor: number[], bottomColor: number[];
  if (isThunderstorm) {
    const isDay = progress >= 0.25 && progress <= 0.75;
    const factor = isDay ? 1 : 0;
    topColor = interpolateColor(STORM_COLORS.night.top, STORM_COLORS.day.top, factor);
    bottomColor = interpolateColor(STORM_COLORS.night.bottom, STORM_COLORS.day.bottom, factor);
  } else {
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
  }

  const backgroundStyle = {
    background: `linear-gradient(to bottom, rgb(${topColor.join(',')}), rgb(${bottomColor.join(',')}))`,
    transition: 'background 2s ease-in-out',
    pointerEvents: 'none' as const
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

  // Reduced celestial visibility in overcast, storm, or heavy precipitation
  const celestialOpacity = isThunderstorm 
    ? 0 
    : Math.max(0, (Math.sin(arcProgress * Math.PI) * 0.8 + 0.2) * (1 - cloudOpacity * 0.85));

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden" 
      style={backgroundStyle}
    >
      {/* Sun/Moon Container */}
      <div 
        className="absolute transition-all duration-2000 ease-in-out"
        style={{
          left: 0, top: 0,
          transform: `translate(calc(${x}vw - 50%), ${y}vh) scale(${scale})`,
          opacity: celestialOpacity, 
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
        <div className={`absolute top-[10%] left-0 w-[50vw] h-[20vh] ${isThunderstorm ? 'bg-slate-900/60' : 'bg-white/40'} blur-3xl rounded-full animate-cloud-slow`} />
        <div className={`absolute top-[30%] left-0 w-[60vw] h-[25vh] ${isThunderstorm ? 'bg-slate-800/50' : 'bg-white/30'} blur-3xl rounded-full animate-cloud-med`} style={{ animationDelay: '-15s' }} />
        <div className={`absolute top-[15%] left-0 w-[40vw] h-[15vh] ${isThunderstorm ? 'bg-slate-900/70' : 'bg-white/50'} blur-2xl rounded-full animate-cloud-fast`} style={{ animationDelay: '-32s' }} />
        
        <div className={`absolute top-[5%] left-0 w-[45vw] h-[20vh] ${isThunderstorm ? 'bg-slate-800/60' : 'bg-white/30'} blur-3xl rounded-full animate-cloud-slow`} style={{ animationDelay: '-40s' }} />
        <div className={`absolute top-[25%] left-0 w-[55vw] h-[22vh] ${isThunderstorm ? 'bg-slate-900/50' : 'bg-white/40'} blur-3xl rounded-full animate-cloud-med`} style={{ animationDelay: '-5s' }} />
      </div>

      {/* Freezing glaze desaturating icy overlay */}
      {isFreezing && (
        <div 
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cyan-950/20 backdrop-saturate-75"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(180, 230, 255, 0.15), rgba(140, 200, 240, 0.08) 60%, rgba(100, 160, 210, 0.12) 100%)'
          }}
        />
      )}

      {/* Lightning Flash Effect (Soft-edged diffuse whole-sky brightening, disabled in reduced-motion) */}
      {!prefersReducedMotion && isThunderstorm && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            opacity: flashOpacity,
            background: 'radial-gradient(ellipse at 50% 20%, rgba(220, 235, 255, 0.8), rgba(180, 205, 245, 0.45) 50%, rgba(140, 170, 220, 0.2) 100%)',
            mixBlendMode: 'screen',
            transition: 'opacity 0.05s linear'
          }}
        />
      )}
    </div>
  );
}
