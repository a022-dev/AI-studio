import {
  ExternalLink,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { WEATHER_THEMES } from '../data/curationData';
import { Playlist, Track } from '../types/music';
import { VinylSpectrumRing } from './VinylSpectrumRing';
import { WaveformSeekbar } from './WaveformSeekbar';

interface NowPlayingModalProps {
  isOpen: boolean;
  playlist: Playlist;
  track: Track;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  themeMode: 'light' | 'dark';
  onClose: () => void;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onToggleMute: () => void;
  onSelectTrack: (playlist: Playlist, track: Track) => void;
}

function formatSeconds(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function NowPlayingModal({
  isOpen,
  playlist,
  track,
  isPlaying,
  isMuted,
  currentTime,
  themeMode,
  onClose,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onToggleMute,
  onSelectTrack,
}: NowPlayingModalProps) {
  const theme = WEATHER_THEMES[playlist.weather];
  const trackIdx = Math.max(
    0,
    playlist.tracks.findIndex((t) => t.id === track.id)
  );
  const quote = theme.editorialQuotes[trackIdx % theme.editorialQuotes.length];

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="turntable-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#F7F6F2] text-zinc-900 dark:bg-[#0D0D10] dark:text-white"
        >
          {/* Ambient Mesh Backdrop extracted from current album cover */}
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
            <img
              src={playlist.coverUrl}
              alt=""
              className="h-full w-full scale-125 object-cover opacity-25 blur-3xl dark:opacity-35"
            />
            <motion.div
              animate={{
                x: [0, 36, -24, 0],
                y: [0, -28, 22, 0],
                scale: [1, 1.12, 0.96, 1],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-24 -left-24 h-[480px] w-[480px] rounded-full opacity-25 blur-3xl dark:opacity-30"
              style={{ backgroundColor: theme.accentHex }}
            />
            <motion.div
              animate={{
                x: [0, -32, 28, 0],
                y: [0, 30, -20, 0],
                scale: [1, 0.94, 1.1, 1],
              }}
              transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-32 -right-24 h-[520px] w-[520px] rounded-full opacity-20 blur-3xl dark:opacity-25"
              style={{ backgroundColor: theme.accentHex }}
            />
            <div className="absolute inset-0 bg-[#F7F6F2]/75 dark:bg-[#0B0B0E]/70 backdrop-blur-2xl" />
          </div>

          {/* Top Bar */}
          <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <span className={`font-semibold ${theme.accentTextClass}`}>
                턴테이블 몰입 모드
              </span>
              <span aria-hidden="true">·</span>
              <span>{theme.label}</span>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span className="hidden sm:inline font-mono tabular-nums">{track.bpm} BPM</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="턴테이블 모드 닫기"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300/80 bg-white/70 text-zinc-700 transition-colors hover:bg-white hover:text-black dark:border-white/15 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/15 dark:hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Main Turntable Stage */}
          <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-10 px-4 pb-10 pt-2 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
            {/* Left: Interactive Vinyl Platter + Articulated Tonearm */}
            <div className="flex items-center justify-center lg:col-span-6">
              <div className="relative flex aspect-square w-full max-w-[340px] sm:max-w-[430px] items-center justify-center rounded-3xl border border-zinc-200/90 bg-white/70 p-6 sm:p-9 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#16161A]/80">
                {/* Turntable Metallic Platter Base */}
                <div className="relative aspect-square w-full rounded-full flex items-center justify-center">
                  {/* Audio-reactive outer spectrum ring */}
                  <VinylSpectrumRing
                    isPlaying={isPlaying}
                    accentHex={theme.accentHex}
                    themeMode={themeMode}
                  />

                  {/* Spinning Grooved Vinyl Record */}
                  <div
                    onClick={onTogglePlay}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onTogglePlay();
                      }
                    }}
                    aria-label={isPlaying ? '일시정지' : '재생'}
                    className={`relative h-full w-full cursor-pointer overflow-hidden rounded-full border-4 border-zinc-800/80 shadow-[0_24px_60px_rgba(0,0,0,0.55)] ${
                      isPlaying ? 'animate-[spin_4.5s_linear_infinite]' : ''
                    }`}
                    style={{
                      background:
                        'repeating-radial-gradient(circle at center, #27272a 0px, #27272a 2px, #0b0b0e 3px, #0b0b0e 6px)',
                    }}
                  >
                    {/* Glossy vinyl reflection */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          'conic-gradient(from 45deg, rgba(255,255,255,0.22) 0deg, transparent 55deg, rgba(255,255,255,0.06) 140deg, rgba(255,255,255,0.25) 215deg, transparent 285deg, rgba(255,255,255,0.12) 360deg)',
                      }}
                    />

                    {/* Center Album Artwork Disc Label */}
                    <div className="absolute inset-0 m-auto h-[42%] w-[42%] overflow-hidden rounded-full border-4 border-[#121212] shadow-lg">
                      <img
                        src={playlist.coverUrl}
                        alt={`${playlist.title} 커버`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      <span
                        className="absolute inset-0 m-auto h-4 w-4 rounded-full border-2 border-white/60 bg-[#121212]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Articulated Metallic Tonearm (rotates smoothly onto vinyl when playing) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-4 right-4 sm:top-6 sm:right-6 z-20"
                >
                  {/* Tonearm Pivot Base */}
                  <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-zinc-400/70 bg-gradient-to-br from-zinc-200 to-zinc-400 shadow-lg dark:border-white/25 dark:from-zinc-600 dark:to-zinc-800 flex items-center justify-center">
                    <span className="h-4 w-4 rounded-full bg-zinc-700 dark:bg-zinc-900 border border-white/30" />

                    {/* Rotating Arm Shaft + Cartridge */}
                    <motion.div
                      animate={{ rotate: isPlaying ? 26 : -6 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                      style={{ transformOrigin: '50% 18px' }}
                      className="absolute top-[6px] left-1/2 -translate-x-1/2 flex flex-col items-center"
                    >
                      {/* Counterweight */}
                      <div className="h-3.5 w-4 rounded-sm bg-zinc-500 dark:bg-zinc-400 shadow" />
                      {/* Arm tube */}
                      <div className="h-36 sm:h-48 w-1.5 rounded-full bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 shadow-md dark:from-zinc-300 dark:via-zinc-500 dark:to-zinc-600" />
                      {/* Angled Headshell / Stylus */}
                      <div className="relative -mt-1 rotate-[18deg] flex flex-col items-center">
                        <div className="h-5 w-3 rounded-sm bg-zinc-800 dark:bg-zinc-950 border border-white/25 shadow-md" />
                        <span
                          className="h-1.5 w-1 rounded-b-full"
                          style={{ backgroundColor: isPlaying ? theme.accentHex : '#a1a1aa' }}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Track Metadata, Editorial Quote, Waveform Seekbar & Controls */}
            <div className="flex flex-col justify-between space-y-6 lg:col-span-6">
              <div className="space-y-3">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {playlist.title}
                </p>
                <h2
                  id="turntable-modal-title"
                  className="font-display text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
                >
                  {track.title}
                </h2>
                <p className="text-base font-medium text-zinc-600 dark:text-zinc-300">
                  {track.artist}
                  <span className="mx-2 text-zinc-400 dark:text-zinc-600" aria-hidden="true">·</span>
                  <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                    {track.album}
                  </span>
                </p>

                <blockquote className="border-l-2 pl-4 pt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300" style={{ borderColor: theme.accentHex }}>
                  “{quote}”
                </blockquote>
              </div>

              {/* Waveform Seekbar */}
              <div className="space-y-2 rounded-2xl border border-zinc-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                <WaveformSeekbar
                  trackId={track.id}
                  currentTime={currentTime}
                  durationSeconds={track.durationSeconds}
                  isPlaying={isPlaying}
                  accentHex={theme.accentHex}
                  barCount={54}
                  heightClass="h-10"
                  onSeek={onSeek}
                />
                <div className="flex items-center justify-between font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                  <span>{formatSeconds(currentTime)}</span>
                  <span>{track.duration}</span>
                </div>
              </div>

              {/* Primary Playback Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onPrev}
                    aria-label="이전 곡"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 bg-white/75 text-zinc-700 transition-colors hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/15 cursor-pointer"
                  >
                    <SkipBack className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={onTogglePlay}
                    aria-label={isPlaying ? '일시정지' : '재생'}
                    className="flex h-14 w-14 items-center justify-center rounded-full text-black shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: theme.accentHex }}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 fill-current" />
                    ) : (
                      <Play className="h-6 w-6 fill-current translate-x-[1px]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onNext}
                    aria-label="다음 곡"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 bg-white/75 text-zinc-700 transition-colors hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/15 cursor-pointer"
                  >
                    <SkipForward className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={onToggleMute}
                    aria-label={isMuted ? '소리 켜기' : '음소거'}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-white/75 text-zinc-700 transition-colors hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/15 cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={playlist.spotifySearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-zinc-300 bg-white/75 px-3.5 text-xs font-medium text-zinc-700 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/15"
                  >
                    <span>Spotify</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Compact Queue List inside Turntable View */}
              <div className="space-y-2 border-t border-zinc-200/80 pt-4 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <ListMusic className="h-3.5 w-3.5" />
                  <span>현재 재생 목록 ({playlist.tracks.length}곡)</span>
                </div>
                <div className="grid max-h-40 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                  {playlist.tracks.map((item, idx) => {
                    const active = item.id === track.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectTrack(playlist, item)}
                        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          active
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold'
                            : 'bg-white/60 text-zinc-700 hover:bg-white dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate">
                          <span className="mr-1.5 font-mono opacity-60 tabular-nums">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {item.title}
                        </span>
                        <span className="shrink-0 font-mono opacity-70 tabular-nums">
                          {item.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
