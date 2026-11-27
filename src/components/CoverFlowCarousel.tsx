import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { WEATHER_THEMES } from '../data/curationData';
import { Playlist } from '../types/music';
import { AudioVisualizer } from './AudioVisualizer';

interface CoverFlowCarouselProps {
  playlists: Playlist[];
  activePlaylistId: string;
  isPlaying: boolean;
  onPlayPlaylist: (playlist: Playlist) => void;
  onOpenPlaylistDetail: (playlist: Playlist) => void;
}

export function CoverFlowCarousel({
  playlists,
  activePlaylistId,
  isPlaying,
  onPlayPlaylist,
  onOpenPlaylistDetail,
}: CoverFlowCarouselProps) {
  const [centerIndex, setCenterIndex] = useState(0);
  const total = playlists.length;

  const goPrev = () => setCenterIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setCenterIndex((prev) => (prev + 1) % total);

  // Compute shortest circular signed offset so carousel wraps seamlessly
  const getOffset = (idx: number) => {
    let diff = idx - centerIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  const activeCard = playlists[centerIndex] ?? playlists[0];
  const activeTheme = WEATHER_THEMES[activeCard.weather];
  const isCardPlaying = isPlaying && activePlaylistId === activeCard.id;

  return (
    <div className="space-y-6">
      {/* 3D Perspective Cover Flow Stage */}
      <div
        className="relative flex h-[360px] sm:h-[400px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/55 px-4 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#161618]/65"
        style={{ perspective: '1200px' }}
      >
        {/* Ambient Backlight Glow from center active cover */}
        <img
          src={activeCard.coverUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute h-72 w-72 rounded-full object-cover opacity-30 blur-3xl transition-all duration-500 dark:opacity-35"
        />

        {/* Left / Right Controls */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="이전 앨범"
          className="absolute left-3 sm:left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-white/90 text-zinc-800 shadow-md transition-transform hover:scale-105 dark:border-white/15 dark:bg-[#222226]/90 dark:text-white cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label="다음 앨범"
          className="absolute right-3 sm:right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-white/90 text-zinc-800 shadow-md transition-transform hover:scale-105 dark:border-white/15 dark:bg-[#222226]/90 dark:text-white cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* 3D Cards */}
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {playlists.map((playlist, idx) => {
            const offset = getOffset(idx);
            const absOffset = Math.abs(offset);
            if (absOffset > 2) return null;

            const isCenter = offset === 0;
            const cardTheme = WEATHER_THEMES[playlist.weather];
            const cardPlaying = isPlaying && activePlaylistId === playlist.id;

            const translateX = offset * 175;
            const translateZ = isCenter ? 40 : -absOffset * 110;
            const rotateY = offset === 0 ? 0 : offset > 0 ? -36 : 36;
            const scale = isCenter ? 1 : 0.84 - absOffset * 0.08;
            const opacity = isCenter ? 1 : absOffset === 1 ? 0.78 : 0.45;
            const zIndex = 30 - absOffset * 10;

            return (
              <motion.article
                key={playlist.id}
                onClick={() => {
                  if (isCenter) {
                    onOpenPlaylistDetail(playlist);
                  } else {
                    setCenterIndex(idx);
                  }
                }}
                animate={{
                  x: translateX,
                  z: translateZ,
                  rotateY,
                  scale,
                  opacity,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                style={{ zIndex, transformStyle: 'preserve-3d' }}
                className={`absolute w-[230px] sm:w-[270px] cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-2xl dark:bg-[#1E1E1E] ${
                  isCenter
                    ? 'border-zinc-300 dark:border-white/25'
                    : 'border-zinc-200/80 dark:border-white/10'
                }`}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-200 dark:bg-[#27272A]">
                  <img
                    src={playlist.coverUrl}
                    alt={`${playlist.title} 앨범 커버`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  {/* Holographic glass reflection overlay */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-35"
                    style={{
                      background:
                        'linear-gradient(125deg, rgba(255,255,255,0.28) 0%, transparent 38%, rgba(255,255,255,0.08) 65%, transparent 100%)',
                    }}
                  />

                  {isCenter && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayPlaylist(playlist);
                      }}
                      aria-label={`${playlist.title} 바로 재생`}
                      className="absolute right-3 bottom-3 flex h-11 w-11 items-center justify-center rounded-full text-black shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: cardTheme.accentHex }}
                    >
                      {cardPlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                      ) : (
                        <Play className="h-4 w-4 fill-current translate-x-[1px]" />
                      )}
                    </button>
                  )}
                </div>

                <div className="p-3.5 sm:p-4">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className={`font-semibold ${cardTheme.accentTextClass}`}>
                      {cardTheme.label}
                    </span>
                    {cardPlaying && (
                      <AudioVisualizer
                        isPlaying={true}
                        accentHex={cardTheme.accentHex}
                        barCount={4}
                        heightClass="h-3"
                      />
                    )}
                  </div>
                  <h3 className="mt-1 truncate font-display text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                    {playlist.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {playlist.genre} · {playlist.bpmRange}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Active Centered Album Editorial Details & Selector Dots */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200/80 bg-white/75 p-4 backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#1E1E1E]/75 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className={`font-semibold ${activeTheme.accentTextClass}`}>
              {activeTheme.label} · {activeCard.curator}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {activeCard.tracks.length}곡 · {activeCard.totalDuration}
            </span>
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-1">
            {activeCard.description}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onPlayPlaylist(activeCard)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-black cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: activeTheme.accentHex }}
          >
            {isCardPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>바로 듣기</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenPlaylistDetail(activeCard)}
            className="inline-flex min-h-[40px] items-center rounded-lg border border-zinc-300 px-3.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap"
          >
            트랙리스트 보기
          </button>
        </div>
      </div>
    </div>
  );
}
