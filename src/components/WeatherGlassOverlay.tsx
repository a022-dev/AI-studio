import { useEffect, useMemo, useRef } from 'react';
import { WeatherKey } from '../types/music';

interface WeatherGlassOverlayProps {
  weather: WeatherKey;
  themeMode: 'light' | 'dark';
}

interface GlassDroplet {
  x: number;
  y: number;
  r: number;
  vy: number;
  sliding: boolean;
  wobblePhase: number;
  trail: { x: number; y: number }[];
}

interface FrostBranch {
  x: number;
  y: number;
  angle: number;
  len: number;
  depth: number;
}

export function WeatherGlassOverlay({
  weather,
  themeMode,
}: WeatherGlassOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isLight = themeMode === 'light';

  // Edge-only CSS glass vignette keeping the central reading zone 100% clear
  const edgeVignetteStyle = useMemo(() => {
    if (weather === 'rain') {
      return {
        background: isLight
          ? 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 64%, rgba(99, 102, 241, 0.08) 88%, rgba(79, 70, 229, 0.16) 100%)'
          : 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 64%, rgba(88, 28, 135, 0.14) 88%, rgba(15, 23, 42, 0.42) 100%)',
      };
    }
    if (weather === 'snow') {
      return {
        background: isLight
          ? 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0) 60%, rgba(186, 230, 253, 0.24) 86%, rgba(224, 242, 254, 0.52) 100%)'
          : 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(147, 197, 253, 0.10) 85%, rgba(224, 242, 254, 0.22) 100%)',
      };
    }
    if (weather === 'cloudy') {
      return {
        background: isLight
          ? 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 65%, rgba(148, 163, 184, 0.12) 90%, rgba(100, 116, 139, 0.20) 100%)'
          : 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 65%, rgba(71, 85, 105, 0.14) 90%, rgba(15, 23, 42, 0.34) 100%)',
      };
    }
    if (weather === 'clear') {
      return {
        background: isLight
          ? 'radial-gradient(circle at 96% 4%, rgba(253, 224, 71, 0.18) 0%, rgba(29, 185, 84, 0.06) 28%, rgba(0,0,0,0) 62%)'
          : 'radial-gradient(circle at 96% 4%, rgba(29, 185, 84, 0.16) 0%, rgba(250, 204, 21, 0.07) 26%, rgba(0,0,0,0) 60%)',
      };
    }
    return {
      background: isLight
        ? 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 65%, rgba(109, 40, 217, 0.08) 90%, rgba(67, 56, 202, 0.16) 100%)'
        : 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 62%, rgba(88, 28, 135, 0.14) 88%, rgba(12, 10, 28, 0.42) 100%)',
    };
  }, [weather, isLight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId = 0;

    // Pick a point strictly along the outer viewport frame (window border)
    const randomPerimeterPoint = (bandRatio = 0.13) => {
      const bandX = Math.max(32, width * bandRatio);
      const bandY = Math.max(28, height * bandRatio);
      const zone = Math.random();
      if (zone < 0.38) {
        return { x: Math.random() * bandX, y: Math.random() * height };
      }
      if (zone < 0.76) {
        return { x: width - Math.random() * bandX, y: Math.random() * height };
      }
      if (zone < 0.90) {
        return { x: Math.random() * width, y: Math.random() * bandY };
      }
      return { x: Math.random() * width, y: height - Math.random() * bandY };
    };

    const createRainDroplets = (): GlassDroplet[] => {
      const count = width < 640 ? 34 : 58;
      return Array.from({ length: count }, (_, idx) => {
        const pt = randomPerimeterPoint(width < 640 ? 0.11 : 0.13);
        const isLarge = idx % 6 === 0;
        return {
          x: pt.x,
          y: pt.y,
          r: isLarge ? 3.2 + Math.random() * 2.6 : 1.3 + Math.random() * 1.9,
          vy: isLarge ? 0.35 + Math.random() * 0.55 : 0,
          sliding: isLarge,
          wobblePhase: Math.random() * Math.PI * 2,
          trail: [],
        };
      });
    };

    const buildCornerFrost = (): FrostBranch[] => {
      const branches: FrostBranch[] = [];
      const cornerOrigins = [
        { x: 0, y: 0, baseAngle: Math.PI * 0.25 },
        { x: width, y: 0, baseAngle: Math.PI * 0.75 },
        { x: 0, y: height, baseAngle: -Math.PI * 0.25 },
        { x: width, y: height, baseAngle: -Math.PI * 0.75 },
      ];
      const maxLen = Math.min(width, height) * 0.16;

      cornerOrigins.forEach((corner) => {
        for (let i = 0; i < 6; i++) {
          const offsetAngle = corner.baseAngle + (i - 2.5) * 0.22;
          branches.push({
            x: corner.x,
            y: corner.y,
            angle: offsetAngle,
            len: maxLen * (0.55 + ((i * 17) % 10) * 0.045),
            depth: 2,
          });
        }
      });
      return branches;
    };

    let droplets = createRainDroplets();
    let frostBranches = buildCornerFrost();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      droplets = createRainDroplets();
      frostBranches = buildCornerFrost();
      if (prefersReduced) {
        drawStatic();
      }
    };
    window.addEventListener('resize', handleResize);

    const drawDroplet = (d: GlassDroplet) => {
      // Wet trail behind sliding glass droplets
      if (d.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(d.trail[0].x, d.trail[0].y);
        for (let i = 1; i < d.trail.length; i++) {
          ctx.lineTo(d.trail[i].x, d.trail[i].y);
        }
        ctx.strokeStyle = isLight
          ? 'rgba(109, 40, 217, 0.16)'
          : 'rgba(216, 180, 254, 0.16)';
        ctx.lineWidth = Math.max(1, d.r * 0.42);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Translucent glass water bead
      const grad = ctx.createRadialGradient(
        d.x - d.r * 0.3,
        d.y - d.r * 0.3,
        0.2,
        d.x,
        d.y,
        d.r
      );
      if (isLight) {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(0.55, 'rgba(196, 181, 253, 0.28)');
        grad.addColorStop(1, 'rgba(109, 40, 217, 0.36)');
      } else {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        grad.addColorStop(0.55, 'rgba(167, 139, 250, 0.18)');
        grad.addColorStop(1, 'rgba(192, 132, 252, 0.32)');
      }

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Tiny specular highlight dot on droplet upper-left
      ctx.beginPath();
      ctx.arc(d.x - d.r * 0.32, d.y - d.r * 0.32, Math.max(0.6, d.r * 0.24), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.fill();
    };

    const drawFrostSegment = (
      x: number,
      y: number,
      angle: number,
      len: number,
      depth: number
    ) => {
      if (depth < 0 || len < 6) return;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isLight
        ? `rgba(56, 189, 248, ${0.18 + depth * 0.08})`
        : `rgba(224, 242, 254, ${0.14 + depth * 0.09})`;
      ctx.lineWidth = 0.7 + depth * 0.35;
      ctx.stroke();

      const midX = x + Math.cos(angle) * (len * 0.58);
      const midY = y + Math.sin(angle) * (len * 0.58);
      drawFrostSegment(midX, midY, angle + 0.55, len * 0.52, depth - 1);
      drawFrostSegment(midX, midY, angle - 0.55, len * 0.52, depth - 1);
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      if (weather === 'rain') {
        droplets.forEach(drawDroplet);
      } else if (weather === 'snow') {
        frostBranches.forEach((b) =>
          drawFrostSegment(b.x, b.y, b.angle, b.len, b.depth)
        );
      }
    };

    if (prefersReduced || (weather !== 'rain' && weather !== 'snow')) {
      drawStatic();
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    if (weather === 'snow') {
      // Static corner frost filigree + subtle breathing opacity via CSS vignette
      drawStatic();
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // Rain droplet glass simulation along viewport perimeter
    let tick = 0;
    const renderRainGlass = () => {
      tick += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (const d of droplets) {
        if (d.sliding) {
          d.y += d.vy + Math.max(0, Math.sin(tick + d.wobblePhase) * 0.25);
          d.x += Math.sin(tick * 1.4 + d.wobblePhase) * 0.14;
          d.trail.push({ x: d.x, y: d.y });
          if (d.trail.length > 18) d.trail.shift();

          if (d.y > height + 12) {
            const pt = randomPerimeterPoint(width < 640 ? 0.10 : 0.12);
            d.x = pt.x;
            d.y = -8;
            d.trail = [];
          }
        }
        drawDroplet(d);
      }

      animId = window.requestAnimationFrame(renderRainGlass);
    };

    animId = window.requestAnimationFrame(renderRainGlass);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [weather, isLight]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
    >
      {/* Perimeter atmospheric glass condensation / frost vignette */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={edgeVignetteStyle}
      />

      {/* Perimeter raindrops (rain) or corner frost crystals (snow) */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
