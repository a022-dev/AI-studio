import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { WEATHER_THEMES } from '../data/curationData';
import { WeatherKey } from '../types/music';

interface WeatherWipeTransitionProps {
  weather: WeatherKey;
}

export function WeatherWipeTransition({ weather }: WeatherWipeTransitionProps) {
  const prevWeatherRef = useRef<WeatherKey>(weather);
  const [wipeKey, setWipeKey] = useState<string | null>(null);
  const [wipeColor, setWipeColor] = useState<string>(WEATHER_THEMES[weather].accentHex);

  useEffect(() => {
    if (prevWeatherRef.current === weather) return;
    prevWeatherRef.current = weather;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    setWipeColor(WEATHER_THEMES[weather].accentHex);
    const id = `${weather}-${Date.now()}`;
    setWipeKey(id);

    const timer = window.setTimeout(() => {
      setWipeKey((curr) => (curr === id ? null : curr));
    }, 640);

    return () => window.clearTimeout(timer);
  }, [weather]);

  return (
    <AnimatePresence>
      {wipeKey && (
        <motion.div
          key={wipeKey}
          aria-hidden="true"
          initial={{ clipPath: 'circle(0% at 86% 14%)', opacity: 0.34 }}
          animate={{ clipPath: 'circle(155% at 86% 14%)', opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-0 z-30"
          style={{
            background: `radial-gradient(circle at 86% 14%, ${wipeColor}55 0%, ${wipeColor}22 42%, transparent 72%)`,
          }}
        />
      )}
    </AnimatePresence>
  );
}
