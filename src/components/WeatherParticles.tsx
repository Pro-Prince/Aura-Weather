import { useEffect, useRef } from 'react';

interface WeatherParticlesProps {
  code: number;
  isDay: boolean;
}

export function WeatherParticles({ code, isDay }: WeatherParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    // Determine particle type
    let type: 'rain' | 'snow' | 'clear' | 'none' = 'none';

    // 0, 1: Clear
    if (code === 0 || code === 1) type = 'clear';
    // Rain (51-67, 80-82)
    else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) type = 'rain';
    // Snow (71-77, 85-86)
    else if ((code >= 71 && code <= 77) || code === 85 || code === 86) type = 'snow';

    if (type === 'none') {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    const particles: any[] = [];
    let numParticles = 0;

    if (type === 'rain') numParticles = 80;
    if (type === 'snow') numParticles = 60;
    if (type === 'clear') numParticles = isDay ? 3 : 5;

    for (let i = 0; i < numParticles; i++) {
      if (type === 'rain') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 20 + 10,
          speedY: Math.random() * 12 + 8,
          speedX: Math.random() * 2 + 1,
        });
      } else if (type === 'snow') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 1,
          speedY: Math.random() * 1.5 + 0.5,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.01,
        });
      } else if (type === 'clear') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.6),
          radius: Math.random() * (width * 0.4) + (width * 0.2),
          opacity: Math.random() * 0.05 + 0.02,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.01 + 0.005,
        });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (type === 'rain') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        for (const p of particles) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * (p.length / p.speedY), p.y + p.length);
          
          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -p.length;
            p.x = Math.random() * width;
          }
        }
        ctx.stroke();
      } else if (type === 'snow') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        for (const p of particles) {
          const currentX = p.x + Math.sin(p.sway) * 20;
          ctx.moveTo(currentX + p.radius, p.y);
          ctx.arc(currentX, p.y, p.radius, 0, Math.PI * 2);

          p.y += p.speedY;
          p.sway += p.swaySpeed;

          if (p.y > height) {
            p.y = -p.radius;
            p.x = Math.random() * width;
          }
        }
        ctx.fill();
      } else if (type === 'clear') {
        for (const p of particles) {
          const currentOpacity = Math.max(0, p.opacity + Math.sin(p.pulse) * (p.opacity * 0.5));
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.pulse += p.pulseSpeed;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [code, isDay]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-15]"
    />
  );
}
