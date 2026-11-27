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
  layer: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export function WeatherAtmosphereCanvas({
  weather,
  isPlaying,
  themeMode,
}: WeatherAtmosphereCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.35 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      pointerRef.current = {
        x: e.clientX / Math.max(1, window.innerWidth),
        y: e.clientY / Math.max(1, window.innerHeight),
      };
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

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
      rain: 130,
      snow: 95,
      clear: 40,
      cloudy: 22,
      dawn: 75,
    };

    const createParticle = (w: WeatherKey): Particle => {
      const layer = Math.random();
      if (w === 'rain') {
        return {
          x: Math.random() * (width + 120),
          y: Math.random() * height,
          vx: -1.8 - layer * 1.2,
          vy: 9 + layer * 8,
          size: 16 + layer * 22,
          alpha: 0.22 + layer * 0.28,
          phase: Math.random() * Math.PI * 2,
          layer,
        };
      }
      if (w === 'snow') {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 0.7 + layer * 1.6,
          size: 1.8 + layer * 3.8,
          alpha: 0.28 + layer * 0.45,
          phase: Math.random() * Math.PI * 2,
          layer,
        };
      }
      if (w === 'cloudy') {
        return {
          x: Math.random() * width,
          y: Math.random() * height * 0.75,
          vx: 0.25 + layer * 0.45,
          vy: 0,
          size: 150 + layer * 220,
          alpha: 0.06 + layer * 0.06,
          phase: Math.random() * Math.PI * 2,
          layer,
        };
      }
      if (w === 'clear') {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.3 - layer * 0.4,
          size: 3 + layer * 6,
          alpha: 0.18 + layer * 0.28,
          phase: Math.random() * Math.PI * 2,
          layer,
        };
      }
      return {
        x: Math.random() * width,
        y: Math.random() * height * 0.85,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.08 - layer * 0.15,
        size: 1.2 + layer * 2.4,
        alpha: 0.25 + layer * 0.55,
        phase: Math.random() * Math.PI * 2,
        layer,
      };
    };

    const particles: Particle[] = Array.from({ length: countMap[weather] }, () =>
      createParticle(weather)
    );
    const ripples: Ripple[] = [];

    const isLight = themeMode === 'light';
    let tick = 0;

    const drawSkyGradient = () => {
      const skyMap: Record<WeatherKey, [string, string]> = isLight
        ? {
            clear: ['rgba(29, 185, 84, 0.16)', 'rgba(251, 191, 36, 0.10)'],
            rain: ['rgba(99, 102, 241, 0.16)', 'rgba(138, 43, 226, 0.12)'],
            cloudy: ['rgba(100, 116, 139, 0.18)', 'rgba(148, 163, 184, 0.08)'],
            snow: ['rgba(59, 130, 246, 0.15)', 'rgba(186, 230, 253, 0.14)'],
            dawn: ['rgba(109, 40, 217, 0.16)', 'rgba(59, 130, 246, 0.10)'],
          }
        : {
            clear: ['rgba(29, 185, 84, 0.18)', 'rgba(245, 158, 11, 0.08)'],
            rain: ['rgba(138, 43, 226, 0.20)', 'rgba(59, 130, 246, 0.10)'],
            cloudy: ['rgba(100, 116, 139, 0.16)', 'rgba(51, 65, 85, 0.08)'],
            snow: ['rgba(147, 197, 253, 0.16)', 'rgba(56, 189, 248, 0.07)'],
            dawn: ['rgba(168, 85, 247, 0.22)', 'rgba(79, 70, 229, 0.12)'],
          };

      const [c1, c2] = skyMap[weather];
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;

      const grad1 = ctx.createRadialGradient(
        width * (0.72 + (px - 0.5) * 0.08),
        height * (0.18 + (py - 0.5) * 0.08),
        30,
        width * 0.72,
        height * 0.18,
        Math.max(width, height) * 0.65
      );
      grad1.addColorStop(0, c1);
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(
        width * 0.2,
        height * 0.75,
        20,
        width * 0.2,
        height * 0.75,
        Math.max(width, height) * 0.55
      );
      grad2.addColorStop(0, c2);
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);
    };

    const drawClearSunbeams = () => {
      const originX = width * 0.85;
      const originY = -height * 0.08;
      ctx.save();
      for (let i = 0; i < 6; i++) {
        const angle = 2.05 + i * 0.16 + Math.sin(tick * 0.4 + i) * 0.04;
        const beamLen = Math.max(width, height) * 1.1;
        const spread = 0.065;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(
          originX + Math.cos(angle - spread) * beamLen,
          originY + Math.sin(angle - spread) * beamLen
        );
        ctx.lineTo(
          originX + Math.cos(angle + spread) * beamLen,
          originY + Math.sin(angle + spread) * beamLen
        );
        ctx.closePath();

        const beamGrad = ctx.createLinearGradient(
          originX,
          originY,
          originX + Math.cos(angle) * beamLen * 0.7,
          originY + Math.sin(angle) * beamLen * 0.7
        );
        beamGrad.addColorStop(
          0,
          isLight ? 'rgba(250, 204, 21, 0.14)' : 'rgba(29, 185, 84, 0.09)'
        );
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fill();
      }
      ctx.restore();
    };

    const drawDawnAurora = () => {
      ctx.save();
      for (let band = 0; band < 2; band++) {
        ctx.beginPath();
        const baseY = height * (0.26 + band * 0.14);
        ctx.moveTo(0, baseY);
        for (let x = 0; x <= width; x += 36) {
          const wave =
            Math.sin(x * 0.0035 + tick * (0.55 + band * 0.2) + band) * 42 +
            Math.cos(x * 0.002 - tick * 0.4) * 26;
          ctx.lineTo(x, baseY + wave);
        }
        ctx.strokeStyle =
          band === 0
            ? isLight
              ? 'rgba(124, 58, 237, 0.14)'
              : 'rgba(192, 132, 252, 0.14)'
            : isLight
            ? 'rgba(59, 130, 246, 0.12)'
            : 'rgba(129, 140, 248, 0.12)';
        ctx.lineWidth = 44;
        ctx.lineCap = 'round';
        ctx.filter = 'blur(18px)';
        ctx.stroke();
      }
      ctx.filter = 'none';
      ctx.restore();
    };

    const drawCloudWaves = () => {
      ctx.save();
      for (let row = 0; row < 2; row++) {
        ctx.beginPath();
        const baseY = height * (0.22 + row * 0.28);
        ctx.moveTo(0, height);
        ctx.lineTo(0, baseY);
        for (let x = 0; x <= width; x += 40) {
          const y =
            baseY +
            Math.sin(x * 0.004 + tick * (0.35 + row * 0.15)) * 28 +
            Math.cos(x * 0.007 - tick * 0.25) * 16;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = isLight
          ? `rgba(100, 116, 139, ${0.06 - row * 0.015})`
          : `rgba(148, 163, 184, ${0.045 - row * 0.012})`;
        ctx.fill();
      }
      ctx.restore();
    };

    const drawAudioRibbon = () => {
      if (!isPlaying) return;
      const ribbonColorMap: Record<WeatherKey, string> = {
        clear: isLight ? 'rgba(22, 163, 74, 0.25)' : 'rgba(29, 185, 84, 0.28)',
        rain: isLight ? 'rgba(124, 58, 237, 0.25)' : 'rgba(168, 85, 247, 0.30)',
        cloudy: isLight ? 'rgba(37, 99, 235, 0.22)' : 'rgba(96, 165, 250, 0.28)',
        snow: isLight ? 'rgba(59, 130, 246, 0.22)' : 'rgba(147, 197, 253, 0.28)',
        dawn: isLight ? 'rgba(124, 58, 237, 0.24)' : 'rgba(192, 132, 252, 0.30)',
      };

      ctx.save();
      for (let line = 0; line < 2; line++) {
        ctx.beginPath();
        const baseY = height - 92 - line * 14;
        for (let x = 0; x <= width; x += 18) {
          const amp = (14 + line * 6) * (0.7 + 0.3 * Math.sin(tick * 1.7 + line));
          const y =
            baseY +
            Math.sin(x * 0.012 + tick * (2.4 + line * 0.7)) * amp +
            Math.cos(x * 0.025 - tick * 1.9) * (amp * 0.45);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = ribbonColorMap[weather];
        ctx.lineWidth = line === 0 ? 2 : 1.2;
        ctx.stroke();
      }
      ctx.restore();
    };

    const render = () => {
      tick += isPlaying ? 0.032 : 0.016;
      ctx.clearRect(0, 0, width, height);

      drawSkyGradient();

      if (weather === 'clear') drawClearSunbeams();
      if (weather === 'dawn') drawDawnAurora();
      if (weather === 'cloudy') drawCloudWaves();

      const windOffset = (pointerRef.current.x - 0.5) * 1.8;

      for (const p of particles) {
        if (weather === 'rain') {
          p.x += p.vx + windOffset;
          p.y += p.vy;
          if (p.y > height - 76) {
            if (Math.random() < 0.28 && ripples.length < 28) {
              ripples.push({
                x: p.x,
                y: height - 76 - Math.random() * 24,
                radius: 2,
                maxRadius: 16 + p.layer * 18,
                alpha: 0.45,
              });
            }
            p.y = -25;
            p.x = Math.random() * (width + 140);
          }
          if (p.x < -30) p.x = width + 20;

          ctx.beginPath();
          ctx.strokeStyle = isLight
            ? `rgba(109, 40, 217, ${p.alpha})`
            : `rgba(167, 139, 250, ${p.alpha})`;
          ctx.lineWidth = 1 + p.layer * 0.8;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 3.5, p.y + p.size);
          ctx.stroke();
        } else if (weather === 'snow') {
          p.x += p.vx + windOffset * 0.6 + Math.sin(tick + p.phase) * 0.45;
          p.y += p.vy;
          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.fillStyle = isLight
            ? `rgba(59, 130, 246, ${p.alpha * 0.72})`
            : `rgba(224, 242, 254, ${p.alpha})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (weather === 'cloudy') {
          p.x += p.vx + windOffset * 0.2;
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
          p.x += p.vx + Math.cos(tick * 0.8 + p.phase) * 0.25;
          p.y += p.vy;
          if (p.y < -15) {
            p.y = height + 15;
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
            p.y = height * 0.85;
            p.x = Math.random() * width;
          }
          const twinkle = 0.45 + 0.55 * Math.sin(tick * 2.2 + p.phase);
          ctx.beginPath();
          ctx.fillStyle = isLight
            ? `rgba(124, 58, 237, ${p.alpha * twinkle * 0.85})`
            : `rgba(216, 180, 254, ${p.alpha * twinkle})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw expanding raindrop ripples at bottom
      if (weather === 'rain') {
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.radius += 0.65;
          r.alpha *= 0.94;
          if (r.radius >= r.maxRadius || r.alpha < 0.03) {
            ripples.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
          ctx.strokeStyle = isLight
            ? `rgba(109, 40, 217, ${r.alpha})`
            : `rgba(192, 132, 252, ${r.alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else {
        ripples.length = 0;
      }

      drawAudioRibbon();

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
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
