import React, { useEffect, useRef, useState } from 'react';
import { VisualState, WeatherPreset } from '../utils/getWeatherVisualState';

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

const MAX_PARTICLES = 350;

/**
 * Calculates initial device particle budget multiplier based on
 * available hardware concurrency (CPU cores) and device memory (GB).
 */
function getInitialHardwareBudget(): number {
  try {
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    const memory = typeof navigator !== 'undefined' && 'deviceMemory' in navigator 
      ? (navigator as any).deviceMemory || 4 
      : 4;

    if (cores <= 2 || memory <= 2) {
      return 0.45; // Low-spec mobile/embedded devices
    } else if (cores <= 4 || memory <= 4) {
      return 0.75; // Mid-tier devices
    }
    return 1.0; // High-tier devices
  } catch {
    return 0.75;
  }
}

export function WeatherCanvas({ visualState }: { visualState: VisualState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Object pool for particles
  const particlesRef = useRef<Particle[]>([]);
  const activePresetRef = useRef<WeatherPreset>('none');
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [hasCanvasError, setHasCanvasError] = useState(false);

  // Performance auto-degradation multiplier (persisted across preset switches)
  const performanceMultiplierRef = useRef<number>(getInitialHardwareBudget());

  useEffect(() => {
    try {
      const observer = new IntersectionObserver(([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      }, { threshold: 0 });
      if (canvasRef.current) observer.observe(canvasRef.current);
      return () => observer.disconnect();
    } catch {
      // If IntersectionObserver is unavailable, remain visible
      setIsIntersecting(true);
    }
  }, []);

  // Initialize fixed particle pool
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
    if (hasCanvasError) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) {
        setHasCanvasError(true);
        return;
      }
    } catch (err) {
      console.warn('Canvas 2D context creation failed, degrading to static sky:', err);
      setHasCanvasError(true);
      return;
    }

    if (!isIntersecting) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number | null = null;
    let lastTime = performance.now();
    let logicalWidth = window.innerWidth;
    let logicalHeight = window.innerHeight;

    const { intensityFactor, isFreezing } = visualState;

    const spawnParticle = (p: Particle, preset: WeatherPreset) => {
      p.active = true;
      if (preset === 'drizzle' || preset === 'freezing_drizzle') {
        p.x = Math.random() * logicalWidth * 1.2 - logicalWidth * 0.1;
        p.y = -10 - Math.random() * 50;
        p.vx = (visualState.driftAngle * 400) + (Math.random() * 30 - 15);
        p.vy = (180 + Math.random() * 120) * (0.8 + intensityFactor * 0.35);
        p.size = 0.65 + Math.random() * 0.65;
        p.opacity = (0.25 + Math.random() * 0.25) * (0.7 + intensityFactor * 0.3);
      } else if (preset === 'rain' || preset === 'freezing_rain') {
        p.x = Math.random() * logicalWidth * 1.5 - logicalWidth * 0.25; 
        p.y = -20 - Math.random() * 100;
        p.vx = (visualState.driftAngle * 1000) + (Math.random() * 50 - 25); 
        p.vy = (850 + Math.random() * 450) * (0.75 + intensityFactor * 0.35);
        p.size = (1.0 + Math.random() * 1.3) * (0.8 + intensityFactor * 0.25);
        p.opacity = (0.35 + Math.random() * 0.35) * (0.7 + intensityFactor * 0.3);
      } else if (preset === 'thunderstorm') {
        p.x = Math.random() * logicalWidth * 1.6 - logicalWidth * 0.3; 
        p.y = -30 - Math.random() * 120;
        p.vx = (visualState.driftAngle * 1200) + (Math.random() * 70 - 35); 
        p.vy = 1200 + Math.random() * 600;
        p.size = 1.5 + Math.random() * 1.5;
        p.opacity = 0.45 + Math.random() * 0.4;
      } else if (preset === 'snow') {
        p.x = Math.random() * logicalWidth;
        p.y = -20 - Math.random() * 100;
        p.vx = (visualState.driftAngle * 200);
        p.vy = (45 + Math.random() * 85) * (0.8 + intensityFactor * 0.3);
        p.size = 2.0 + Math.random() * 3.0;
        p.opacity = 0.45 + Math.random() * 0.45;
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

    const getBaseTargetCount = (preset: WeatherPreset) => {
       if (preset === 'none') return 0;
       if (preset === 'fog') return Math.round(14 + intensityFactor * 16);
       if (preset === 'drizzle' || preset === 'freezing_drizzle') {
         return Math.min(240, Math.round(110 * intensityFactor));
       }
       if (preset === 'rain' || preset === 'freezing_rain') {
         return Math.min(260, Math.round(130 * intensityFactor));
       }
       if (preset === 'thunderstorm') return 260;
       if (preset === 'snow') {
         return Math.min(200, Math.round(85 * intensityFactor));
       }
       return 0;
    };

    // Clean teardown of prior preset to prevent 2 presets running simultaneously
    const resetParticlePoolForPreset = (newPreset: WeatherPreset) => {
      activePresetRef.current = newPreset;
      particlesRef.current.forEach(p => { p.active = false; });

      if (newPreset === 'none') return;

      const baseCount = getBaseTargetCount(newPreset);
      const effectiveCount = Math.max(8, Math.round(baseCount * performanceMultiplierRef.current));

      for (let i = 0; i < effectiveCount && i < particlesRef.current.length; i++) {
        spawnParticle(particlesRef.current[i], newPreset);
        particlesRef.current[i].y = Math.random() * logicalHeight;
        if (newPreset === 'fog') {
          particlesRef.current[i].x = Math.random() * logicalWidth;
        }
      }
    };

    // Always reset clean when preset changes
    if (activePresetRef.current !== visualState.preset) {
      resetParticlePoolForPreset(visualState.preset);
    }

    const resize = () => {
      try {
        const dpr = window.devicePixelRatio || 1;
        logicalWidth = window.innerWidth;
        logicalHeight = window.innerHeight;
        
        canvas.width = logicalWidth * dpr;
        canvas.height = logicalHeight * dpr;
        canvas.style.width = `${logicalWidth}px`;
        canvas.style.height = `${logicalHeight}px`;
        
        ctx!.scale(dpr, dpr);
        
        particlesRef.current.forEach(p => {
          if (p.active) {
            p.x = Math.random() * logicalWidth;
            p.y = Math.random() * logicalHeight;
          }
        });
        
        if (prefersReducedMotion) {
          render(performance.now(), true);
        }
      } catch (err) {
        console.warn('Canvas resize error:', err);
      }
    };
    
    resize();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 150);
    };

    window.addEventListener('resize', handleResize);

    // Frame-time monitoring state
    let continuousLagDuration = 0;
    const LAG_FRAME_THRESHOLD_MS = 25.0; // ~40 FPS
    const MIN_PERF_MULTIPLIER = 0.20; // Sensible floor (at least 20% particles)
    const rollingFrameDeltas: number[] = [];
    const ROLLING_WINDOW = 20;

    const render = (time: number, forceStatic = false) => {
      try {
        const dt = (time - lastTime) / 1000;
        const frameTimeMs = time - lastTime;
        lastTime = time;

        const delta = Math.min(dt, 0.1);

        // Real-time Frame-Time Monitoring & Dynamic Auto-Degradation
        if (!forceStatic && lastTime > 0 && frameTimeMs > 0 && frameTimeMs < 500) {
          rollingFrameDeltas.push(frameTimeMs);
          if (rollingFrameDeltas.length > ROLLING_WINDOW) {
            rollingFrameDeltas.shift();
          }

          const avgFrameTime = rollingFrameDeltas.reduce((a, b) => a + b, 0) / rollingFrameDeltas.length;

          if (avgFrameTime > LAG_FRAME_THRESHOLD_MS) {
            continuousLagDuration += frameTimeMs;
            // If rolling average under 40fps for > 2000ms continuously:
            if (continuousLagDuration >= 2000) {
              continuousLagDuration = 0; // reset lag timer
              if (performanceMultiplierRef.current > MIN_PERF_MULTIPLIER) {
                // Step down particle count by 25%
                performanceMultiplierRef.current = Math.max(
                  MIN_PERF_MULTIPLIER, 
                  performanceMultiplierRef.current * 0.75
                );
                
                // Immediately prune active particle count to new budget
                const baseCount = getBaseTargetCount(activePresetRef.current);
                const newTargetCount = Math.max(8, Math.round(baseCount * performanceMultiplierRef.current));
                
                let activeCount = 0;
                particlesRef.current.forEach(p => {
                  if (p.active) {
                    activeCount++;
                    if (activeCount > newTargetCount) {
                      p.active = false;
                    }
                  }
                });
              }
            }
          } else {
            // Smoothly decay lag accumulator when running smoothly
            continuousLagDuration = Math.max(0, continuousLagDuration - frameTimeMs * 0.5);
          }
        }

        ctx!.clearRect(0, 0, logicalWidth, logicalHeight);
        
        const currentPreset = activePresetRef.current;

        if (currentPreset !== 'none') {
          for (let i = 0; i < particlesRef.current.length; i++) {
            const p = particlesRef.current[i];
            if (!p.active) continue;

            if (!forceStatic) {
              p.x += p.vx * delta;
              p.y += p.vy * delta;
              
              if (currentPreset === 'snow') {
                p.phase += delta;
                p.x += Math.sin(p.phase) * 20 * delta;
              }
              
              if (currentPreset === 'drizzle' || currentPreset === 'freezing_drizzle' || currentPreset === 'rain' || currentPreset === 'freezing_rain' || currentPreset === 'thunderstorm' || currentPreset === 'snow') {
                if (p.y > logicalHeight + 20) {
                  spawnParticle(p, currentPreset);
                }
              } else if (currentPreset === 'fog') {
                if (p.x > logicalWidth + 200) {
                  spawnParticle(p, currentPreset);
                }
              }
            }

            ctx!.beginPath();
            if (currentPreset === 'drizzle' || currentPreset === 'freezing_drizzle') {
              const color = isFreezing
                ? `rgba(215, 242, 255, ${p.opacity})`
                : `rgba(255, 255, 255, ${p.opacity})`;
              ctx!.fillStyle = color;
              ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx!.fill();
            } else if (currentPreset === 'rain' || currentPreset === 'freezing_rain' || currentPreset === 'thunderstorm') {
              const color = isFreezing
                ? `rgba(210, 238, 255, ${p.opacity})`
                : `rgba(255, 255, 255, ${p.opacity})`;
              ctx!.strokeStyle = color;
              ctx!.lineWidth = p.size;
              ctx!.moveTo(p.x, p.y);
              ctx!.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045);
              ctx!.stroke();
            } else if (currentPreset === 'snow') {
              ctx!.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
              ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx!.fill();
            } else if (currentPreset === 'fog') {
              const gradient = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
              gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
              gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
              ctx!.fillStyle = gradient;
              ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx!.fill();
            }
          }
        }

        if (!forceStatic) {
          animationFrameId = requestAnimationFrame(render);
        }
      } catch (loopError) {
        console.error('Particle render loop caught error, stopping animation cleanly:', loopError);
        if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
        setHasCanvasError(true);
      }
    };

    if (prefersReducedMotion) {
      render(performance.now(), true);
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      try {
        ctx?.clearRect(0, 0, logicalWidth, logicalHeight);
      } catch {
        // ignore
      }
    };
  }, [visualState.preset, visualState.intensityFactor, visualState.isFreezing, visualState.driftAngle, isIntersecting, hasCanvasError]);

  if (hasCanvasError) {
    return null; // Gracefully degrade to static SVG sky gradient with zero particles
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
}
