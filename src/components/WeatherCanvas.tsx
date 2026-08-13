import React, { useEffect, useRef, useState, useCallback } from 'react';

type Preset = 'rain' | 'snow' | 'fog';

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

export function WeatherCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preset, setPreset] = useState<Preset>('rain');
  
  // Object pool for particles
  const particlesRef = useRef<Particle[]>([]);
  
  const cyclePreset = () => {
    setPreset(p => p === 'rain' ? 'snow' : (p === 'snow' ? 'fog' : 'rain'));
  };

  useEffect(() => {
    // Initialize pool once
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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let lastTime = performance.now();
    let logicalWidth = window.innerWidth;
    let logicalHeight = window.innerHeight;

    const spawnParticle = (p: Particle) => {
      p.active = true;
      if (preset === 'rain') {
        p.x = Math.random() * logicalWidth * 1.2 - logicalWidth * 0.1; // Spawn slightly out of bounds to account for angle
        p.y = -20 - Math.random() * 100;
        p.vx = 200 + Math.random() * 100; // pixels per second
        p.vy = 1000 + Math.random() * 500;
        p.size = 1 + Math.random() * 1.5;
        p.opacity = 0.4 + Math.random() * 0.4;
      } else if (preset === 'snow') {
        p.x = Math.random() * logicalWidth;
        p.y = -20 - Math.random() * 100;
        p.vx = 0;
        p.vy = 50 + Math.random() * 100;
        p.size = 2 + Math.random() * 3;
        p.opacity = 0.5 + Math.random() * 0.5;
        p.phase = Math.random() * Math.PI * 2;
      } else if (preset === 'fog') {
        p.x = -200 - Math.random() * 200; // Start from left
        p.y = Math.random() * logicalHeight;
        p.vx = 20 + Math.random() * 40;
        p.vy = -5 + Math.random() * 10;
        p.size = 100 + Math.random() * 200;
        p.opacity = 0.02 + Math.random() * 0.05;
      }
    };

    const redistributeParticles = () => {
       particlesRef.current.forEach(p => {
         if (p.active) {
            p.x = Math.random() * logicalWidth;
            p.y = Math.random() * logicalHeight;
         }
       });
    };

    // Initialize/Reset particles for current preset
    particlesRef.current.forEach(p => {
      p.active = false;
    });
    
    let activeCount = preset === 'fog' ? 30 : (preset === 'rain' ? 200 : 150);
    for (let i = 0; i < activeCount; i++) {
      spawnParticle(particlesRef.current[i]);
      // Randomize initial positions so they don't all start at the edge
      particlesRef.current[i].y = Math.random() * logicalHeight;
      if (preset === 'fog') particlesRef.current[i].x = Math.random() * logicalWidth;
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
      
      // If reduced motion, re-render the static frame on resize
      if (prefersReducedMotion) {
         render(performance.now(), true);
      }
    };
    
    // Initial resize
    resize();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 150);
    };

    window.addEventListener('resize', handleResize);

    const render = (time: number, forceStatic = false) => {
      const dt = forceStatic ? 0 : (time - lastTime) / 1000;
      lastTime = time;

      // Cap delta time to prevent huge jumps if tab was inactive
      const delta = Math.min(dt, 0.1);

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      particlesRef.current.forEach(p => {
        if (!p.active) return;

        if (!forceStatic) {
          // Update position
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          
          if (preset === 'snow') {
             p.phase += delta;
             p.x += Math.sin(p.phase) * 20 * delta;
          }
          
          // Recycle if out of bounds
          if (preset === 'rain' || preset === 'snow') {
             if (p.y > logicalHeight + 20) {
               spawnParticle(p);
             }
          } else if (preset === 'fog') {
             if (p.x > logicalWidth + 200) {
               spawnParticle(p);
             }
          }
        }

        // Draw
        ctx.beginPath();
        if (preset === 'rain') {
          ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.lineWidth = p.size;
          ctx.moveTo(p.x, p.y);
          // Draw streak based on velocity
          ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
          ctx.stroke();
        } else if (preset === 'snow') {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (preset === 'fog') {
           // Radial gradient for soft fog blobs
           const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
           gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
           gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
           ctx.fillStyle = gradient;
           ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
           ctx.fill();
        }
      });

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
      // Clear canvas on unmount to prevent lingering visual artifacts
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    };
  }, [preset]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <button
        onClick={cyclePreset}
        className="fixed bottom-20 right-4 z-50 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10 shadow-lg backdrop-blur"
        style={{ pointerEvents: 'auto' }}
      >
        Test Preset: {preset}
      </button>
    </>
  );
}
