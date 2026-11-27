import { useEffect, useRef } from 'react';
import { ambientEngine } from '../utils/audioPreview';

interface VinylSpectrumRingProps {
  isPlaying: boolean;
  accentHex: string;
  themeMode: 'light' | 'dark';
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean, 16);
  if (Number.isNaN(num)) return { r: 29, g: 185, b: 84 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function VinylSpectrumRing({
  isPlaying,
  accentHex,
  themeMode,
}: VinylSpectrumRingProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smoothedRef = useRef<number[]>(new Array(64).fill(0));
  const rotationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { r, g, b } = hexToRgb(accentHex);
    const isLight = themeMode === 'light';
    const barCount = 64;

    let animId = 0;
    let cssSize = 0;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssSize = Math.max(120, Math.round(rect.width));
      canvas.width = cssSize * dpr;
      canvas.height = cssSize * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);

    const drawFrame = (now: number) => {
      ctx.clearRect(0, 0, cssSize, cssSize);

      const cx = cssSize / 2;
      const cy = cssSize / 2;
      // Since the canvas uses -inset-6 around the LP disc, the LP rim sits ~79% of half-width
      const lpRimRadius = cssSize * 0.398;
      const maxBarLen = cssSize * 0.088;

      const spectrum = isPlaying ? ambientEngine.getSpectrumData(barCount, now) : null;

      let totalEnergy = 0;
      const smoothed = smoothedRef.current;

      for (let i = 0; i < barCount; i++) {
        const target = spectrum ? spectrum[i] : 0;
        smoothed[i] = prefersReduced
          ? target * 0.65
          : smoothed[i] * 0.72 + target * 0.28;
        totalEnergy += smoothed[i];
      }

      const avgEnergy = totalEnergy / barCount;

      // Subtle outer beat aura behind the vinyl rim
      if (avgEnergy > 0.015) {
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy,
          lpRimRadius * 0.96,
          cx,
          cy,
          lpRimRadius + maxBarLen * (0.9 + avgEnergy * 0.6)
        );
        auraGrad.addColorStop(
          0,
          `rgba(${r}, ${g}, ${b}, ${isLight ? 0.18 * avgEnergy : 0.28 * avgEnergy})`
        );
        auraGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, lpRimRadius + maxBarLen * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Faint inner reference orbit ring hugging the LP edge
      ctx.beginPath();
      ctx.arc(cx, cy, lpRimRadius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = isPlaying
        ? `rgba(${r}, ${g}, ${b}, ${isLight ? 0.38 : 0.45})`
        : isLight
        ? 'rgba(24, 24, 27, 0.10)'
        : 'rgba(255, 255, 255, 0.10)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rotate the spectrum ring slowly in sync with the vinyl spin
      if (isPlaying && !prefersReduced) {
        rotationRef.current += 0.0045;
      }

      // Draw radial spectrum bars around the LP circumference
      ctx.lineCap = 'round';
      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2 + rotationRef.current;
        const amp = smoothed[i];
        const barLen = 2 + amp * maxBarLen;

        const x1 = cx + Math.cos(angle) * (lpRimRadius + 4);
        const y1 = cy + Math.sin(angle) * (lpRimRadius + 4);
        const x2 = cx + Math.cos(angle) * (lpRimRadius + 4 + barLen);
        const y2 = cy + Math.sin(angle) * (lpRimRadius + 4 + barLen);

        const alpha = isPlaying
          ? (isLight ? 0.35 : 0.42) + amp * (isLight ? 0.55 : 0.58)
          : 0.14;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha)})`;
        ctx.lineWidth = Math.max(1.75, cssSize * 0.0085);
        ctx.stroke();
      }

      // Secondary delicate dotted harmonic ring reacting to beat energy
      if (avgEnergy > 0.02) {
        const outerOrbit = lpRimRadius + 6 + maxBarLen * (0.45 + avgEnergy * 0.35);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-rotationRef.current * 1.4);
        ctx.beginPath();
        ctx.setLineDash([2, 8]);
        ctx.arc(0, 0, outerOrbit, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${isLight ? 0.28 * avgEnergy : 0.36 * avgEnergy})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // Stop looping once decayed cleanly while paused
      const hasResidual = smoothed.some((v) => v > 0.005);
      if ((isPlaying || hasResidual) && !prefersReduced) {
        animId = window.requestAnimationFrame(drawFrame);
      }
    };

    animId = window.requestAnimationFrame(drawFrame);

    return () => {
      window.cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [isPlaying, accentHex, themeMode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute -inset-6 sm:-inset-7 h-[calc(100%+3rem)] w-[calc(100%+3rem)] sm:h-[calc(100%+3.5rem)] sm:w-[calc(100%+3.5rem)]"
    />
  );
}
