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
  baseSpeed: number;
  sliding: boolean;
  wobblePhase: number;
  trail: { x: number; y: number; r: number }[];
  isMicro?: boolean;
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

  // Physical glass edge frost / steam condensation blur masked so the center reading zone stays 100% sharp
  const frostedBlurStyle = useMemo(() => {
    const blurMap: Record<WeatherKey, string> = {
      rain: 'blur(6px)',
      snow: 'blur(8px)',
      cloudy: 'blur(6px)',
      clear: 'blur(1.5px)',
      dawn: 'blur(4px)',
    };
    const maskGradient =
      weather === 'snow'
        ? 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,1) 100%)'
        : weather === 'rain' || weather === 'cloudy'
        ? 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.38) 82%, rgba(0,0,0,0.95) 100%)'
        : 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.35) 90%, rgba(0,0,0,0.85) 100%)';

    return {
      backdropFilter: blurMap[weather],
      WebkitBackdropFilter: blurMap[weather],
      maskImage: maskGradient,
      WebkitMaskImage: maskGradient,
    };
  }, [weather]);

  // Atmospheric condensation & window-pane edge tint
  const edgeTintStyle = useMemo(() => {
    if (weather === 'rain') {
      return {
        background: isLight
          ? 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0) 56%, rgba(226, 232, 240, 0.28) 84%, rgba(148, 163, 184, 0.42) 100%)'
          : 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 56%, rgba(88, 28, 135, 0.16) 83%, rgba(15, 23, 42, 0.54) 100%)',
        boxShadow: isLight
          ? 'inset 0 0 70px rgba(79, 70, 229, 0.14), inset 0 0 0 1px rgba(255,255,255,0.45)'
          : 'inset 0 0 80px rgba(15, 23, 42, 0.65), inset 0 0 0 1px rgba(255,255,255,0.12)',
      };
    }
    if (weather === 'snow') {
      return {
        background: isLight
          ? 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0) 50%, rgba(224, 242, 254, 0.46) 80%, rgba(255, 255, 255, 0.78) 100%)'
          : 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 52%, rgba(186, 230, 253, 0.16) 82%, rgba(224, 242, 254, 0.36) 100%)',
        boxShadow: isLight
          ? 'inset 0 0 90px rgba(186, 230, 253, 0.65), inset 0 0 0 1px rgba(255,255,255,0.7)'
          : 'inset 0 0 95px rgba(186, 230, 253, 0.24), inset 0 0 0 1px rgba(224,242,254,0.22)',
      };
    }
    if (weather === 'cloudy') {
      return {
        background: isLight
          ? 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0) 56%, rgba(226, 232, 240, 0.35) 84%, rgba(148, 163, 184, 0.48) 100%)'
          : 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 56%, rgba(100, 116, 139, 0.20) 84%, rgba(30, 41, 59, 0.46) 100%)',
        boxShadow: isLight
          ? 'inset 0 0 65px rgba(148, 163, 184, 0.28), inset 0 0 0 1px rgba(255,255,255,0.45)'
          : 'inset 0 0 75px rgba(15, 23, 42, 0.55), inset 0 0 0 1px rgba(255,255,255,0.10)',
      };
    }
    if (weather === 'clear') {
      return {
        background: isLight
          ? 'radial-gradient(circle at 92% 6%, rgba(253, 224, 71, 0.24) 0%, rgba(29, 185, 84, 0.08) 32%, rgba(0,0,0,0) 64%)'
          : 'radial-gradient(circle at 92% 6%, rgba(29, 185, 84, 0.20) 0%, rgba(250, 204, 21, 0.10) 30%, rgba(0,0,0,0) 62%)',
        boxShadow: isLight
          ? 'inset 0 0 40px rgba(254, 240, 138, 0.18), inset 0 0 0 1px rgba(255,255,255,0.5)'
          : 'inset 0 0 50px rgba(29, 185, 84, 0.12), inset 0 0 0 1px rgba(255,255,255,0.12)',
      };
    }
    return {
      background: isLight
        ? 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(109, 40, 217, 0.12) 86%, rgba(67, 56, 202, 0.24) 100%)'
        : 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 56%, rgba(88, 28, 135, 0.18) 85%, rgba(9, 9, 18, 0.56) 100%)',
      boxShadow: isLight
        ? 'inset 0 0 65px rgba(109, 40, 217, 0.15), inset 0 0 0 1px rgba(255,255,255,0.35)'
        : 'inset 0 0 80px rgba(15, 10, 35, 0.65), inset 0 0 0 1px rgba(192,132,252,0.16)',
    };
  }, [weather, isLight]);

  // Diagonal window glass specular reflection sheen
  const glassReflectionStyle = useMemo(() => {
    const sheenAlpha =
      weather === 'clear'
        ? isLight
          ? 0.24
          : 0.11
        : isLight
        ? 0.14
        : 0.065;
    return {
      background: `linear-gradient(122deg, rgba(255,255,255,0) 14%, rgba(255,255,255,${sheenAlpha}) 22%, rgba(255,255,255,0) 27%, rgba(255,255,255,0) 58%, rgba(255,255,255,${sheenAlpha * 0.65}) 63%, rgba(255,255,255,0) 68%)`,
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

    // Frame droplets along outer window margins while keeping central reading area clear
    const randomPerimeterPoint = (bandRatioX: number, bandRatioY: number) => {
      const bandX = Math.max(42, width * bandRatioX);
      const bandY = Math.max(36, height * bandRatioY);
      const zone = Math.random();
      if (zone < 0.36) {
        return { x: Math.random() * bandX, y: Math.random() * height };
      }
      if (zone < 0.72) {
        return { x: width - Math.random() * bandX, y: Math.random() * height };
      }
      if (zone < 0.86) {
        return { x: Math.random() * width, y: Math.random() * bandY };
      }
      return { x: Math.random() * width, y: height - Math.random() * bandY };
    };

    const createRainDroplets = (): GlassDroplet[] => {
      const isMobile = width < 640;
      const bandX = isMobile ? 0.14 : 0.19;
      const bandY = isMobile ? 0.12 : 0.15;
      const largeCount = isMobile ? 48 : 92;
      const microCount = isMobile ? 75 : 150;

      const list: GlassDroplet[] = [];

      // Prominent glass beads + active sliding rivulets
      for (let i = 0; i < largeCount; i++) {
        const pt = randomPerimeterPoint(bandX, bandY);
        const isSlider = i % 5 === 0;
        const speed = isSlider ? 0.45 + Math.random() * 0.75 : 0;
        list.push({
          x: pt.x,
          y: pt.y,
          r: isSlider ? 4.4 + Math.random() * 3.8 : 2.2 + Math.random() * 4.2,
          vy: speed,
          baseSpeed: speed,
          sliding: isSlider,
          wobblePhase: Math.random() * Math.PI * 2,
          trail: [],
        });
      }

      // Fine misty condensation beads hugging the edges
      for (let i = 0; i < microCount; i++) {
        const pt = randomPerimeterPoint(bandX * 0.9, bandY * 0.9);
        list.push({
          x: pt.x,
          y: pt.y,
          r: 0.9 + Math.random() * 1.4,
          vy: 0,
          baseSpeed: 0,
          sliding: false,
          wobblePhase: 0,
          trail: [],
          isMicro: true,
        });
      }

      return list;
    };

    const createCondensationMist = (): GlassDroplet[] => {
      const isMobile = width < 640;
      const count = isMobile ? 70 : 140;
      return Array.from({ length: count }, () => {
        const pt = randomPerimeterPoint(isMobile ? 0.14 : 0.18, isMobile ? 0.11 : 0.14);
        return {
          x: pt.x,
          y: pt.y,
          r: 1.0 + Math.random() * 2.2,
          vy: 0,
          baseSpeed: 0,
          sliding: false,
          wobblePhase: 0,
          trail: [],
          isMicro: true,
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
      const maxLen = Math.min(width, height) * 0.25;

      cornerOrigins.forEach((corner) => {
        for (let i = 0; i < 9; i++) {
          const offsetAngle = corner.baseAngle + (i - 4) * 0.19;
          branches.push({
            x: corner.x,
            y: corner.y,
            angle: offsetAngle,
            len: maxLen * (0.58 + ((i * 17) % 10) * 0.048),
            depth: 3,
          });
        }
      });

      // Side-edge frost needles creeping in along left/right glass borders
      const sideCount = Math.max(6, Math.floor(height / 140));
      for (let i = 1; i < sideCount; i++) {
        const yPos = (i / sideCount) * height;
        const sideLen = Math.min(width, height) * 0.095;
        branches.push({ x: 0, y: yPos, angle: (i % 2 === 0 ? 0.25 : -0.25), len: sideLen, depth: 2 });
        branches.push({ x: width, y: yPos, angle: Math.PI + (i % 2 === 0 ? -0.25 : 0.25), len: sideLen, depth: 2 });
      }
      return branches;
    };

    let droplets =
      weather === 'rain' ? createRainDroplets() : createCondensationMist();
    let frostBranches = buildCornerFrost();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      droplets =
        weather === 'rain' ? createRainDroplets() : createCondensationMist();
      frostBranches = buildCornerFrost();
      drawStaticOrFrame();
    };
    window.addEventListener('resize', handleResize);

    // Draw a realistic refracting water droplet on glass
    const drawGlassDroplet = (d: GlassDroplet) => {
      // Wet water rivulet trail behind sliding droplet
      if (d.trail.length > 1) {
        for (let i = 1; i < d.trail.length; i++) {
          const prev = d.trail[i - 1];
          const curr = d.trail[i];
          const progress = i / d.trail.length;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.strokeStyle = isLight
            ? `rgba(71, 85, 105, ${0.24 * progress})`
            : `rgba(226, 232, 240, ${0.28 * progress})`;
          ctx.lineWidth = Math.max(1, d.r * 0.45 * progress);
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      if (d.isMicro) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? 'rgba(255, 255, 255, 0.55)'
          : 'rgba(226, 232, 240, 0.24)';
        ctx.fill();
        ctx.strokeStyle = isLight
          ? 'rgba(100, 116, 139, 0.28)'
          : 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
        return;
      }

      // Outer refraction rim shadow (gives 3D lens bulge on glass)
      ctx.beginPath();
      ctx.arc(d.x, d.y + 0.6, d.r + 0.6, 0, Math.PI * 2);
      ctx.fillStyle = isLight
        ? 'rgba(30, 41, 59, 0.18)'
        : 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // Translucent droplet dome gradient (bright caustic at bottom, darker upper refraction)
      const grad = ctx.createRadialGradient(
        d.x,
        d.y + d.r * 0.28,
        d.r * 0.1,
        d.x,
        d.y,
        d.r
      );
      if (isLight) {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
        grad.addColorStop(0.55, 'rgba(224, 231, 255, 0.36)');
        grad.addColorStop(0.88, 'rgba(71, 85, 105, 0.28)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.65)');
      } else {
        grad.addColorStop(0, 'rgba(216, 180, 254, 0.42)');
        grad.addColorStop(0.52, 'rgba(139, 92, 246, 0.16)');
        grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.22)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.46)');
      }

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Thin crisp droplet glass rim
      ctx.strokeStyle = isLight
        ? 'rgba(255, 255, 255, 0.72)'
        : 'rgba(255, 255, 255, 0.34)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Sharp upper-left specular glint
      ctx.beginPath();
      ctx.arc(
        d.x - d.r * 0.34,
        d.y - d.r * 0.34,
        Math.max(0.8, d.r * 0.25),
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fill();
    };

    const drawFrostSegment = (
      x: number,
      y: number,
      angle: number,
      len: number,
      depth: number
    ) => {
      if (depth < 0 || len < 5) return;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isLight
        ? `rgba(14, 165, 233, ${0.22 + depth * 0.08})`
        : `rgba(224, 242, 254, ${0.20 + depth * 0.09})`;
      ctx.lineWidth = 0.75 + depth * 0.38;
      ctx.stroke();

      const midX = x + Math.cos(angle) * (len * 0.56);
      const midY = y + Math.sin(angle) * (len * 0.56);
      drawFrostSegment(midX, midY, angle + 0.52, len * 0.54, depth - 1);
      drawFrostSegment(midX, midY, angle - 0.52, len * 0.54, depth - 1);
    };

    const drawStaticOrFrame = () => {
      ctx.clearRect(0, 0, width, height);
      if (weather === 'rain') {
        droplets.forEach(drawGlassDroplet);
      } else if (weather === 'snow') {
        frostBranches.forEach((b) =>
          drawFrostSegment(b.x, b.y, b.angle, b.len, b.depth)
        );
        // Subtle frosted ice grains along corners
        droplets.slice(0, 80).forEach(drawGlassDroplet);
      } else if (weather === 'cloudy' || weather === 'dawn') {
        droplets.forEach(drawGlassDroplet);
      }
    };

    if (prefersReduced || weather !== 'rain') {
      drawStaticOrFrame();
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // Live raindrop sliding physics on the glass window
    let tick = 0;
    const renderRainGlass = () => {
      tick += 0.025;
      ctx.clearRect(0, 0, width, height);

      const isMobile = width < 640;
      const bandX = isMobile ? 0.14 : 0.19;
      const bandY = isMobile ? 0.12 : 0.15;

      for (const d of droplets) {
        if (d.sliding) {
          // Stick-slip realistic raindrop gravity trickle down glass
          const pulse = Math.sin(tick * 1.3 + d.wobblePhase);
          const stepY = pulse > -0.35 ? d.baseSpeed * (0.7 + Math.max(0, pulse) * 1.1) : d.baseSpeed * 0.12;
          d.y += stepY;
          d.x += Math.sin(tick * 1.9 + d.wobblePhase) * 0.24;
          d.trail.push({ x: d.x, y: d.y, r: d.r });
          if (d.trail.length > 28) d.trail.shift();

          if (d.y > height + 16) {
            const pt = randomPerimeterPoint(bandX, bandY);
            d.x = pt.x;
            d.y = -10;
            d.trail = [];
          }
        }
        drawGlassDroplet(d);
      }

      animId = window.requestAnimationFrame(renderRainGlass);
    };

    animId = window.requestAnimationFrame(renderRainGlass);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [weather, isLight]);

  // Subtle foreground parallax on pointer movement for multi-layer depth
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const handleMove = (e: PointerEvent) => {
      const dx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * -10;
      const dy = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * -8;
      canvas.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(1.02)`;
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
    >
      {/* Frosted / steamed glass refraction along the viewport perimeter */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={frostedBlurStyle}
      />

      {/* Condensation mist / icy frost vignette + subtle glass rim bevel */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={edgeTintStyle}
      />

      {/* Diagonal window glass surface reflection sheen */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={glassReflectionStyle}
      />

      {/* Glass raindrops, condensation dew, and frost ice-fern crystals */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full transition-transform duration-300 ease-out"
      />
    </div>
  );
}
