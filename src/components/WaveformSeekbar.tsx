import { MouseEvent, useMemo, useRef } from 'react';

interface WaveformSeekbarProps {
  trackId: string;
  currentTime: number;
  durationSeconds: number;
  isPlaying: boolean;
  accentHex: string;
  barCount?: number;
  heightClass?: string;
  onSeek: (seconds: number) => void;
}

// Deterministic pseudo-random waveform heights seeded by trackId
function buildWaveformBars(seed: string, count: number): number[] {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    hash ^= i * 374761393;
    hash = Math.imul(hash, 668265263);
    const norm = ((hash >>> 0) % 1000) / 1000;
    // Musical arch envelope so intro/outro taper naturally
    const arch = Math.sin(((i + 1) / (count + 1)) * Math.PI);
    const height = 0.24 + (0.28 + norm * 0.48) * (0.55 + arch * 0.45);
    bars.push(Math.min(1, Math.max(0.18, height)));
  }
  return bars;
}

export function WaveformSeekbar({
  trackId,
  currentTime,
  durationSeconds,
  isPlaying,
  accentHex,
  barCount = 48,
  heightClass = 'h-7',
  onSeek,
}: WaveformSeekbarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bars = useMemo(() => buildWaveformBars(trackId, barCount), [trackId, barCount]);

  const progressRatio =
    durationSeconds > 0 ? Math.min(1, Math.max(0, currentTime / durationSeconds)) : 0;
  const activeBarIndex = Math.floor(progressRatio * barCount);

  const handleSeekFromPointer = (clientX: number) => {
    const el = containerRef.current;
    if (!el || durationSeconds <= 0) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(1, rect.width)));
    onSeek(Math.round(ratio * durationSeconds));
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    handleSeekFromPointer(e.clientX);
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label="오디오 파형 재생 위치 조절"
      aria-valuemin={0}
      aria-valuemax={durationSeconds}
      aria-valuenow={currentTime}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          onSeek(Math.min(durationSeconds, currentTime + 5));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onSeek(Math.max(0, currentTime - 5));
        }
      }}
      className={`group/wave relative flex ${heightClass} w-full items-center gap-[2px] cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954] rounded`}
    >
      {bars.map((val, idx) => {
        const isPlayed = idx <= activeBarIndex;
        const isPlayhead = idx === activeBarIndex;
        const animatedScale = isPlayhead && isPlaying ? 1.15 : 1;

        return (
          <span
            key={idx}
            aria-hidden="true"
            className="flex-1 rounded-full transition-all duration-150 group-hover/wave:opacity-95"
            style={{
              height: `${Math.round(val * 100)}%`,
              transform: `scaleY(${animatedScale})`,
              backgroundColor: isPlayed ? accentHex : undefined,
              opacity: isPlayed ? (isPlayhead ? 1 : 0.88) : undefined,
            }}
          >
            {!isPlayed && (
              <span className="block h-full w-full rounded-full bg-zinc-300 dark:bg-white/20" />
            )}
          </span>
        );
      })}
    </div>
  );
}
