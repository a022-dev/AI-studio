import { useEffect, useRef } from 'react';
import { WeatherKey } from '../types/music';

interface WeatherAtmosphereCanvasProps {
  weather: WeatherKey;
  isPlaying: boolean;
  themeMode: 'light' | 'dark';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

export function WeatherAtmosphereCanvas({
  weather,
  isPlaying,
  themeMode,
}: WeatherAtmosphereCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const countMap: Record<WeatherKey, number> = {
      rain: 95,
      snow: 65,
      clear: 28,
      cloudy: 18,
      dawn: 45,
    };

    const createParticle = (w: WeatherKey): Particle => {
      if (w === 'rain') {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: -1.4,
          vy: 7.5 + Math.random() * 5,
          size: 12 + Math.random() * 14,
          alpha: 0.14 + Math.random() * 0.22,
          phase: Math.random() * Math.PI * 2,
        };
      }
      if (w === 'snow') {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: 0.7 + Math.random() * 1.1,
          size: 1.8 + Math.random() * 2.8,
          alpha: 0.2 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
        };
      }
      if (w === 'cloudy') {
        return {
          x: Math.random() * width,
          y: Math.random() * height * 0.7,
          vx: 0.25 + Math.random() * 0.35,
          vy: 0,
          size: 140 + Math.random() * 180,
          alpha: 0.03 + Math.random() * 0.035,
          phase: Math.random() * Math.PI * 2,
        };
      }
      if (w === 'clear') {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -0.25 - Math.random() * 0.3,
          size: 2.2 + Math.random() * 4,
          alpha: 0.14 + Math.random() * 0.24,
          phase: Math.random() * Math.PI * 2,
        };
      }
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.15 - Math.random() * 0.2,
        size: 1.4 + Math.random() * 2.4,
        alpha: 0.16 + Math.random() * 0.34,
        phase: Math.random() * Math.PI * 2,
      };
    };

    const particles: Particle[] = Array.from({ length: countMap[weather] }, () =>
      createParticle(weather)
    );

    const isLight = themeMode === 'light';
    let tick = 0;

    const render = () => {
      tick += isPlaying ? 0.03 : 0.015;
      ctx.clearRect(0, 0, width, height);

      const glowColors: Record<WeatherKey, string> = isLight
        ? {
            clear: 'rgba(29, 185, 84, 0.11)',
            rain: 'rgba(138, 43, 226, 0.09)',
            cloudy: 'rgba(59, 130, 246, 0.08)',
            snow: 'rgba(96, 165, 250, 0.10)',
            dawn: 'rgba(124, 58, 237, 0.09)',
          }
        : {
            clear: 'rgba(29, 185, 84, 0.09)',
            rain: 'rgba(138, 43, 226, 0.11)',
            cloudy: 'rgba(96, 165, 250, 0.08)',
            snow: 'rgba(147, 197, 253, 0.09)',
            dawn: 'rgba(168, 85, 247, 0.12)',
          };

      const grad = ctx.createRadialGradient(
        width * 0.78,
        height * 0.18,
        20,
        width * 0.78,
        height * 0.18,
        Math.max(width, height) * 0.55
      );
      grad.addColorStop(0, glowColors[weather]);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      for (const p of particles) {
        if (weather === 'rain') {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * (width + 100);
          }
          if (p.x < -20) p.x = width + 10;

          ctx.beginPath();
          ctx.strokeStyle = isLight
            ? `rgba(109, 40, 217, ${p.alpha})`
            : `rgba(167, 139, 250, ${p.alpha})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2.5, p.y + p.size);
          ctx.stroke();
        } else if (weather === 'snow') {
          p.x += p.vx + Math.sin(tick + p.phase) * 0.35;
          p.y += p.vy;
          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.fillStyle = isLight
            ? `rgba(59, 130, 246, ${p.alpha * 0.7})`
            : `rgba(224, 242, 254, ${p.alpha})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (weather === 'cloudy') {
          p.x += p.vx;
          if (p.x - p.size > width) p.x = -p.size;
          const mistGrad = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, p.size);
          mistGrad.addColorStop(
            0,
            isLight ? `rgba(100, 116, 139, ${p.alpha})` : `rgba(148, 163, 184, ${p.alpha})`
          );
          mistGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
          ctx.fillStyle = mistGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (weather === 'clear') {
          p.x += p.vx + Math.cos(tick * 0.8 + p.phase) * 0.18;
          p.y += p.vy;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          const pulse = 0.7 + 0.3 * Math.sin(tick * 1.5 + p.phase);
          ctx.beginPath();
          ctx.fillStyle = isLight
            ? `rgba(22, 163, 74, ${p.alpha * pulse})`
            : `rgba(29, 185, 84, ${p.alpha * pulse})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          const twinkle = 0.5 + 0.5 * Math.sin(tick * 2 + p.phase);
          ctx.beginPath();
          ctx.fillStyle = isLight
            ? `rgba(124, 58, 237, ${p.alpha * twinkle * 0.8})`
            : `rgba(192, 132, 252, ${p.alpha * twinkle})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId = window.requestAnimationFrame(render);
    };

    animationId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [weather, isPlaying, themeMode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-90"
    />
  );
}
