import {
  ListMusic,
  Maximize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion } from 'motion/react';
import { WEATHER_THEMES } from '../data/curationData';
import { PageId, Playlist, Track } from '../types/music';
import { AudioVisualizer } from './AudioVisualizer';
import { WaveformSeekbar } from './WaveformSeekbar';

interface MiniPlayerProps {
  playlist: Playlist;
  track: Track;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  themeMode: 'light' | 'dark';
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onToggleTheme: () => void;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onToggleMute: () => void;
  onOpenPlaylistDetail: () => void;
  onOpenTurntable: () => void;
}

const MOBILE_TABS: { id: PageId; label: string }[] = [
  { id: 'main', label: '메인' },
  { id: 'explore', label: '날씨별' },
  { id: 'recommend', label: '추천·제보' },
  { id: 'about', label: '소개' },
];

function formatSeconds(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function MiniPlayer({
  playlist,
  track,
  isPlaying,
  isMuted,
  currentTime,
  themeMode,
  activePage,
  onNavigate,
  onToggleTheme,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onToggleMute,
  onOpenPlaylistDetail,
  onOpenTurntable,
}: MiniPlayerProps) {
  const theme = WEATHER_THEMES[playlist.weather];
  const progressPercent = Math.min(
    100,
    track.durationSeconds > 0 ? (currentTime / track.durationSeconds) * 100 : 0
  );

  return (
    <aside
      aria-label="하단 미니 오디오 플레이어 및 모바일 내비게이션"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 dark:border-white/[0.1] dark:bg-[#161618]/95 backdrop-blur-lg transition-colors"
    >
      {/* Mobile-only interactive top progress hairline */}
      <div className="relative h-1 w-full bg-zinc-200 dark:bg-white/10 md:hidden">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: theme.accentHex,
          }}
        />
        <input
          type="range"
          min={0}
          max={track.durationSeconds}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="재생 위치 조절"
          className="absolute inset-0 h-3 -top-1 w-full cursor-pointer opacity-0"
        />
      </div>

      {/* Player Bar: Compact 54px on mobile, 68px on desktop */}
      <div className="mx-auto flex h-[54px] md:h-[68px] max-w-6xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
        {/* Left: Spinning disc + current track info */}
        <button
          type="button"
          onClick={onOpenTurntable}
          aria-label="풀스크린 턴테이블 몰입 모드 열기"
          className="flex min-w-0 flex-1 md:flex-initial md:w-[230px] lg:w-[260px] items-center gap-2.5 md:gap-3 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954] rounded-lg"
        >
          <div className="relative h-9 w-9 md:h-11 md:w-11 shrink-0 overflow-hidden rounded-full border border-zinc-300 bg-zinc-200 dark:border-white/15 dark:bg-[#262629]">
            <img
              src={playlist.coverUrl}
              alt={`${playlist.title} 앨범 커버`}
              referrerPolicy="no-referrer"
              className={`h-full w-full object-cover transition-transform duration-300 ${
                isPlaying ? 'animate-[spin_8s_linear_infinite]' : 'group-hover:scale-105'
              }`}
            />
            <span
              className="pointer-events-none absolute inset-0 m-auto h-2 w-2 md:h-2.5 md:w-2.5 rounded-full border border-zinc-400 bg-white dark:border-white/30 dark:bg-[#161618]"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs md:text-sm font-semibold text-zinc-900 dark:text-white group-hover:underline">
              {track.title}
            </p>
            <p className="truncate text-[11px] md:text-xs text-zinc-500 dark:text-zinc-400">
              <span>{track.artist}</span>
              <span className="hidden sm:inline mx-1.5 text-zinc-400 dark:text-zinc-600" aria-hidden="true">·</span>
              <span className="hidden sm:inline">{theme.label} 무드</span>
            </p>
          </div>
          <div className="hidden lg:block shrink-0 pr-1">
            <AudioVisualizer
              isPlaying={isPlaying}
              accentHex={theme.accentHex}
              barCount={5}
              heightClass="h-4"
            />
          </div>
        </button>

        {/* Center: Playback controls + Desktop Waveform Seekbar */}
        <div className="flex items-center gap-1 md:flex-1 md:justify-center md:gap-4 shrink-0">
          <button
            type="button"
            onClick={onOpenTurntable}
            aria-label="턴테이블 모드 열기"
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300 cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onPrev}
              aria-label="이전 곡"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? '일시정지' : '재생'}
              className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full text-black transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
              style={{ backgroundColor: theme.accentHex }}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current translate-x-[1px]" />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              aria-label="다음 곡"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop SoundCloud-style Waveform Seekbar */}
          <div className="hidden md:flex flex-1 max-w-[260px] lg:max-w-[320px] items-center gap-2.5">
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums w-10 text-right shrink-0">
              {formatSeconds(currentTime)}
            </span>
            <WaveformSeekbar
              trackId={track.id}
              currentTime={currentTime}
              durationSeconds={track.durationSeconds}
              isPlaying={isPlaying}
              accentHex={theme.accentHex}
              barCount={36}
              heightClass="h-6"
              onSeek={onSeek}
            />
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums w-10 shrink-0">
              {track.duration}
            </span>
          </div>
        </div>

        {/* Desktop Right: Mute, Theme toggle, Turntable expand & Tracklist */}
        <div className="hidden md:flex items-center justify-end gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? '소리 켜기' : '음소거'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="hidden lg:flex h-9 items-center rounded-lg border border-zinc-300 px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white cursor-pointer whitespace-nowrap shrink-0"
          >
            {themeMode === 'dark' ? '라이트' : '다크'}
          </button>

          <button
            type="button"
            onClick={onOpenPlaylistDetail}
            aria-label="현재 플레이리스트 트랙리스트 열기"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-300 px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
          >
            <ListMusic className="h-3.5 w-3.5" />
            <span>트랙리스트</span>
          </button>

          <button
            type="button"
            onClick={onOpenTurntable}
            aria-label="풀스크린 턴테이블 모드"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Dedicated Mobile Bottom Thumb Navigation Dock (<= 15% combined viewport height) */}
      <nav
        aria-label="모바일 하단 탭 메뉴"
        className="grid grid-cols-4 border-t border-zinc-200 dark:border-white/[0.08] md:hidden"
      >
        {MOBILE_TABS.map((tab) => {
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`relative flex h-12 items-center justify-center text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'text-zinc-900 dark:text-white font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-tab-indicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                  className="absolute top-0 inset-x-4 h-[2px] rounded-full"
                  style={{ backgroundColor: theme.accentHex }}
                  aria-hidden="true"
                />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
