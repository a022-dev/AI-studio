import { ListMusic, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { WEATHER_THEMES } from '../data/curationData';
import { Playlist, Track } from '../types/music';

interface MiniPlayerProps {
  playlist: Playlist;
  track: Track;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onToggleMute: () => void;
  onOpenPlaylistDetail: () => void;
}

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
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onToggleMute,
  onOpenPlaylistDetail,
}: MiniPlayerProps) {
  const theme = WEATHER_THEMES[playlist.weather];
  const progressPercent = Math.min(
    100,
    track.durationSeconds > 0 ? (currentTime / track.durationSeconds) * 100 : 0
  );

  return (
    <aside
      aria-label="하단 미니 오디오 플레이어"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.1] bg-[#161618]/95 backdrop-blur-lg"
    >
      {/* Interactive top progress hairline for mobile & quick scrubbing */}
      <div className="relative h-1 w-full bg-white/10">
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

      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Cover art + current track info */}
        <button
          type="button"
          onClick={onOpenPlaylistDetail}
          className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954] rounded-lg"
        >
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-[#262629]">
            <img
              src={playlist.coverUrl}
              alt={`${playlist.title} 앨범 커버`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white group-hover:underline">
              {track.title}
            </p>
            <p className="truncate text-xs text-zinc-400">
              <span>{track.artist}</span>
              <span className="mx-1.5 text-zinc-600" aria-hidden="true">·</span>
              <span className="hidden sm:inline">{theme.label} 무드</span>
            </p>
          </div>
        </button>

        {/* Center: Playback controls & desktop time scrubber */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onPrev}
              aria-label="이전 곡"
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? '일시정지' : '재생'}
              className="flex h-10 w-10 items-center justify-center rounded-full text-black transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Time readout, mute toggle & tracklist trigger */}
        <div className="hidden sm:flex flex-1 items-center justify-end gap-3">
          <span className="font-mono text-xs text-zinc-400 tabular-nums whitespace-nowrap">
            {formatSeconds(currentTime)} / {track.duration}
          </span>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? '소리 켜기' : '음소거'}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenPlaylistDetail}
            aria-label="현재 플레이리스트 트랙리스트 열기"
            className="flex h-10 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
          >
            <ListMusic className="h-4 w-4" />
            <span>트랙리스트</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
