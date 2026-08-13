import React, { useEffect, useRef, useState } from 'react';
import { VisualState } from '../utils/getWeatherVisualState';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phase: number;
  active: boolean;
}

const MAX_PARTICLES = 300;

export function WeatherCanvas({ visualState }: { visualState: VisualState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Object pool for particles
  const particlesRef = useRef<Particle[]>([]);
  // We use refs to keep track of the current preset and transition without restarting the entire pool
  const activePresetRef = useRef<VisualState['preset']>('none');
  const globalOpacityRef = useRef(0);
  const transitionTargetRef = useRef(1);
  const [isIntersecting, setIsIntersecting] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, { threshold: 0 });
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < MAX_PARTICLES; i++) {
        particlesRef.current.push({
          x: 0, y: 0, vx: 0, vy: 0, size: 0, opacity: 0, phase: 0, active: false
        });
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isIntersecting) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let lastTime = performance.now();
    let logicalWidth = window.innerWidth;
    let logicalHeight = window.innerHeight;

    const spawnParticle = (p: Particle, preset: VisualState['preset']) => {
      p.active = true;
      if (preset === 'rain') {
        p.x = Math.random() * logicalWidth * 1.5 - logicalWidth * 0.25; 
        p.y = -20 - Math.random() * 100;
        p.vx = (visualState.driftAngle * 1000) + (Math.random() * 50 - 25); 
        p.vy = 1000 + Math.random() * 500;
        p.size = 1 + Math.random() * 1.5;
        p.opacity = 0.4 + Math.random() * 0.4;
      } else if (preset === 'snow') {
        p.x = Math.random() * logicalWidth;
        p.y = -20 - Math.random() * 100;
        p.vx = (visualState.driftAngle * 200);
        p.vy = 50 + Math.random() * 100;
        p.size = 2 + Math.random() * 3;
        p.opacity = 0.5 + Math.random() * 0.5;
        p.phase = Math.random() * Math.PI * 2;
      } else if (preset === 'fog') {
        p.x = -200 - Math.random() * 200; 
        p.y = Math.random() * logicalHeight;
        p.vx = 20 + Math.random() * 40;
        p.vy = -5 + Math.random() * 10;
        p.size = 100 + Math.random() * 200;
        p.opacity = 0.02 + Math.random() * 0.05;
      } else {
        p.active = false;
      }
    };

    const getTargetCount = (preset: VisualState['preset'], intensity: VisualState['intensity']) => {
       if (preset === 'none') return 0;
       if (preset === 'fog') return intensity === 'high' ? 40 : intensity === 'medium' ? 25 : 15;
       if (preset === 'rain') return intensity === 'high' ? 250 : intensity === 'medium' ? 150 : 80;
       if (preset === 'snow') return intensity === 'high' ? 200 : intensity === 'medium' ? 100 : 50;
       return 0;
    }

    const redistributeParticles = () => {
       particlesRef.current.forEach(p => {
         if (p.active) {
            p.x = Math.random() * logicalWidth;
            p.y = Math.random() * logicalHeight;
         }
       });
    };

    // If preset changed, fade out old one first
    if (activePresetRef.current !== visualState.preset && activePresetRef.current !== 'none') {
        transitionTargetRef.current = 0; // Fade out
    } else if (activePresetRef.current === 'none' && visualState.preset !== 'none') {
        // Just start new one
        activePresetRef.current = visualState.preset;
        transitionTargetRef.current = 1;
        globalOpacityRef.current = 0;
        
        const count = getTargetCount(visualState.preset, visualState.intensity);
        particlesRef.current.forEach(p => p.active = false);
        for (let i = 0; i < count; i++) {
          spawnParticle(particlesRef.current[i], visualState.preset);
          particlesRef.current[i].y = Math.random() * logicalHeight;
          if (visualState.preset === 'fog') particlesRef.current[i].x = Math.random() * logicalWidth;
        }
    } else if (activePresetRef.current === visualState.preset) {
        // Adjust count if intensity changed, but smoothly if possible (just add/remove active flags)
        const count = getTargetCount(visualState.preset, visualState.intensity);
        let currentActive = particlesRef.current.filter(p => p.active).length;
        
        if (currentActive < count) {
            for (let i = 0; i < particlesRef.current.length && currentActive < count; i++) {
                if (!particlesRef.current[i].active) {
                    spawnParticle(particlesRef.current[i], visualState.preset);
                    particlesRef.current[i].y = Math.random() * logicalHeight;
                    currentActive++;
                }
            }
        } else if (currentActive > count) {
             let removed = 0;
             for (let i = particlesRef.current.length - 1; i >= 0 && removed < (currentActive - count); i--) {
                if (particlesRef.current[i].active) {
                    particlesRef.current[i].active = false;
                    removed++;
                }
             }
        }
        transitionTargetRef.current = 1;
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      logicalWidth = window.innerWidth;
      logicalHeight = window.innerHeight;
      
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
      
      ctx.scale(dpr, dpr);
      
      redistributeParticles();
      
      if (prefersReducedMotion) {
         render(performance.now(), true);
      }
    };
    
    resize();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 150);
    };

    window.addEventListener('resize', handleResize);

    let slowFrames = 0;
    let particleMultiplier = 1.0;
    const render = (time: number, forceStatic = false) => {
      const dt = forceStatic ? 0 : (time - lastTime) / 1000;
      lastTime = time;

      const delta = Math.min(dt, 0.1);

      // Graceful degradation on throttled CPU
      if (dt > 0.05) {
        slowFrames++;
      } else if (dt < 0.033 && slowFrames > 0) {
        slowFrames = Math.max(0, slowFrames - 1);
      }
      if (slowFrames > 60 && particleMultiplier > 0.3) {
        particleMultiplier -= 0.2;
        slowFrames = 0;
      }

      // Handle crossfade logic
      if (globalOpacityRef.current < transitionTargetRef.current) {
          globalOpacityRef.current = Math.min(globalOpacityRef.current + delta * 1.5, transitionTargetRef.current);
      } else if (globalOpacityRef.current > transitionTargetRef.current) {
          globalOpacityRef.current = Math.max(globalOpacityRef.current - delta * 1.5, transitionTargetRef.current);
      }

      // If fully faded out, switch preset
      if (globalOpacityRef.current === 0 && transitionTargetRef.current === 0 && activePresetRef.current !== visualState.preset) {
          activePresetRef.current = visualState.preset;
          if (visualState.preset !== 'none') {
             transitionTargetRef.current = 1;
             const count = getTargetCount(visualState.preset, visualState.intensity);
             particlesRef.current.forEach(p => p.active = false);
             for (let i = 0; i < count; i++) {
               spawnParticle(particlesRef.current[i], visualState.preset);
               particlesRef.current[i].y = Math.random() * logicalHeight;
               if (visualState.preset === 'fog') particlesRef.current[i].x = Math.random() * logicalWidth;
             }
          }
      }

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
      
      const pOpacity = globalOpacityRef.current;
      const currentPreset = activePresetRef.current;

      if (currentPreset !== 'none' && pOpacity > 0) {
          let drawnCount = 0;
          const maxDraw = particlesRef.current.length * particleMultiplier;
          particlesRef.current.forEach(p => {
            if (drawnCount++ > maxDraw) return;
            if (!p.active) return;

            if (!forceStatic) {
              p.x += p.vx * delta;
              p.y += p.vy * delta;
              
              if (currentPreset === 'snow') {
                 p.phase += delta;
                 p.x += Math.sin(p.phase) * 20 * delta;
              }
              
              if (currentPreset === 'rain' || currentPreset === 'snow') {
                 if (p.y > logicalHeight + 20) {
                   spawnParticle(p, currentPreset);
                 }
              } else if (currentPreset === 'fog') {
                 if (p.x > logicalWidth + 200) {
                   spawnParticle(p, currentPreset);
                 }
              }
            }

            ctx.beginPath();
            if (currentPreset === 'rain') {
              ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * pOpacity})`;
              ctx.lineWidth = p.size;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
              ctx.stroke();
            } else if (currentPreset === 'snow') {
              ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * pOpacity})`;
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            } else if (currentPreset === 'fog') {
               const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
               gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity * pOpacity})`);
               gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
               ctx.fillStyle = gradient;
               ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
               ctx.fill();
            }
          });
      }

      if (!forceStatic) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      render(performance.now(), true);
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    };
  }, [visualState.preset, visualState.intensity, visualState.driftAngle, isIntersecting]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 0,
      }}
    />
  );
}
