import { motion } from 'motion/react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  accentHex: string;
  barCount?: number;
  heightClass?: string;
}

const BAR_PATTERNS = [0.45, 0.85, 0.6, 1, 0.55, 0.9, 0.4, 0.75, 0.95, 0.5, 0.8, 0.65];

export function AudioVisualizer({
  isPlaying,
  accentHex,
  barCount = 12,
  heightClass = 'h-7',
}: AudioVisualizerProps) {
  const bars = Array.from({ length: barCount }, (_, idx) => idx);

  return (
    <div
      className={`flex items-end gap-[3px] ${heightClass}`}
      aria-hidden="true"
    >
      {bars.map((idx) => {
        const peak = BAR_PATTERNS[idx % BAR_PATTERNS.length];
        return (
          <motion.span
            key={idx}
            className="w-[3px] origin-bottom rounded-full"
            style={{
              height: '100%',
              backgroundColor: accentHex,
              opacity: isPlaying ? 0.9 : 0.35,
            }}
            animate={
              isPlaying
                ? {
                    scaleY: [0.22, peak, 0.32, Math.min(1, peak * 0.9), 0.25],
                  }
                : { scaleY: 0.2 }
            }
            transition={
              isPlaying
                ? {
                    duration: 0.85 + (idx % 4) * 0.18,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: idx * 0.06,
                  }
                : { duration: 0.25 }
            }
          />
        );
      })}
    </div>
  );
}
