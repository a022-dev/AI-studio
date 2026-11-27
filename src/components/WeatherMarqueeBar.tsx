import { AnimatePresence, motion } from 'motion/react';
import { WEATHER_THEMES } from '../data/curationData';
import { WeatherKey } from '../types/music';

interface WeatherMarqueeBarProps {
  weather: WeatherKey;
  bpmRange: string;
}

export function WeatherMarqueeBar({ weather, bpmRange }: WeatherMarqueeBarProps) {
  const theme = WEATHER_THEMES[weather];
  const quotes = theme.editorialQuotes;

  return (
    <section
      aria-label="날씨 에디토리얼 문구"
      className="group relative -mx-4 overflow-hidden border-y border-zinc-200/90 bg-white/65 py-3.5 backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#18181B]/75 sm:-mx-6 lg:-mx-8"
    >
      {/* Subtle left/right edge fade masks for magazine ticker polish */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#F7F6F2] to-transparent dark:from-[#121212] sm:w-16"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#F7F6F2] to-transparent dark:from-[#121212] sm:w-16"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={weather}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.28 }}
        >
          {/* Reduced-motion fallback: static centered editorial quote */}
          <div className="hidden motion-reduce:flex items-center justify-center gap-3 px-6 text-center text-xs sm:text-sm">
            <span className={`font-mono text-[11px] font-semibold uppercase tracking-wider ${theme.accentTextClass}`}>
              {theme.englishLabel}
            </span>
            <span className="text-zinc-300 dark:text-zinc-600" aria-hidden="true">—</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {quotes[0]}
            </span>
          </div>

          {/* Continuous seamless two-copy marquee */}
          <div className="animate-editorial-marquee motion-reduce:hidden">
            {[0, 1].map((copyIndex) => (
              <div
                key={copyIndex}
                aria-hidden={copyIndex === 1}
                className="flex shrink-0 items-center gap-7 pr-7 text-xs sm:text-sm"
              >
                {quotes.map((quote, idx) => (
                  <div key={`${copyIndex}-${idx}`} className="flex items-center gap-7 whitespace-nowrap">
                    <span className={`font-mono text-[11px] font-semibold uppercase tracking-wider ${theme.accentTextClass}`}>
                      {theme.label} · {bpmRange}
                    </span>
                    <span className="font-display font-medium tracking-tight text-zinc-800 dark:text-zinc-200">
                      {quote}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-600" aria-hidden="true">
                      /
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
