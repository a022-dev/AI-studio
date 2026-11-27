import { ExternalLink, Pause, Play, X } from 'lucide-react';
import { useState } from 'react';
import { WEATHER_THEMES } from '../data/curationData';
import { Playlist, Track } from '../types/music';
import { WeatherIcon } from './WeatherIcon';

interface PlaylistModalProps {
  playlist: Playlist | null;
  activeTrackId: string;
  isPlaying: boolean;
  onClose: () => void;
  onPlayTrack: (playlist: Playlist, track: Track) => void;
}

export function PlaylistModal({
  playlist,
  activeTrackId,
  isPlaying,
  onClose,
  onPlayTrack,
}: PlaylistModalProps) {
  const [embedTab, setEmbedTab] = useState<'tracks' | 'spotify' | 'youtube'>('tracks');

  if (!playlist) return null;

  const theme = WEATHER_THEMES[playlist.weather];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="playlist-modal-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#18181B] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-[#18181B]/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <WeatherIcon weather={playlist.weather} className="h-4 w-4 text-zinc-300" />
            <span>{theme.label}</span>
            <span aria-hidden="true">·</span>
            <span>{playlist.genre}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{playlist.bpmRange}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="창 닫기"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Playlist Hero Info */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-[#27272A]">
              <img
                src={playlist.coverUrl}
                alt={`${playlist.title} 커버`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-2.5">
              <p className="text-xs font-medium text-zinc-400">
                <span>{playlist.curator}</span>
                <span className="mx-2 text-zinc-600" aria-hidden="true">·</span>
                <span className="tabular-nums">{playlist.tracks.length}곡</span>
                <span className="mx-2 text-zinc-600" aria-hidden="true">·</span>
                <span>{playlist.totalDuration}</span>
              </p>
              <h2 id="playlist-modal-title" className="font-display text-2xl font-bold text-white sm:text-3xl">
                {playlist.title}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-300">{playlist.editorialNote}</p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onPlayTrack(playlist, playlist.tracks[0])}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-black transition-transform duration-150 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: theme.accentHex }}
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>첫 곡부터 듣기</span>
                </button>

                <a
                  href={playlist.spotifySearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-white/30 hover:bg-white/5 whitespace-nowrap"
                >
                  <span>Spotify에서 찾기</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <a
                  href={playlist.youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-white/30 hover:bg-white/5 whitespace-nowrap"
                >
                  <span>YouTube에서 듣기</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Mode Tabs: Tracklist vs Embedded Players */}
          <div className="mt-8 flex items-center gap-1 rounded-lg bg-[#121212] p-1 w-fit border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setEmbedTab('tracks')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                embedTab === 'tracks' ? 'bg-[#27272A] text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              수록곡 트랙리스트
            </button>
            <button
              type="button"
              onClick={() => setEmbedTab('spotify')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                embedTab === 'spotify' ? 'bg-[#27272A] text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Spotify 임베드
            </button>
            <button
              type="button"
              onClick={() => setEmbedTab('youtube')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                embedTab === 'youtube' ? 'bg-[#27272A] text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              YouTube 임베드
            </button>
          </div>

          {embedTab === 'tracks' && (
            <div className="mt-5 divide-y divide-white/[0.06] border-t border-white/[0.08]">
              {playlist.tracks.map((track, index) => {
                const isCurrent = activeTrackId === track.id;
                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between gap-4 py-3.5 px-2 transition-colors rounded-lg ${
                      isCurrent ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => onPlayTrack(playlist, track)}
                        aria-label={`${track.title} 재생`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-200 transition-colors hover:border-white/30 hover:bg-white/10 cursor-pointer"
                        style={
                          isCurrent
                            ? { backgroundColor: theme.accentHex, color: '#000', borderColor: 'transparent' }
                            : undefined
                        }
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-current translate-x-[0.5px]" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          <span className="mr-2 font-mono text-xs text-zinc-500 tabular-nums">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {track.title}
                        </p>
                        <p className="truncate text-xs text-zinc-400">
                          {track.artist}
                          <span className="mx-1.5 text-zinc-600" aria-hidden="true">·</span>
                          <span className="text-zinc-500">{track.note}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-zinc-400 tabular-nums">
                      <span className="hidden sm:inline text-zinc-500">{track.bpm} BPM</span>
                      <span>{track.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {embedTab === 'spotify' && (
            <div className="mt-5 space-y-3">
              <p className="text-xs text-zinc-400">
                외부 Spotify 플레이어 임베드 영역입니다. 네트워크 환경에 따라 로그인 또는 전체 듣기 버튼으로 연결됩니다.
              </p>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121212]">
                <iframe
                  title={`${playlist.title} Spotify Embed`}
                  src={playlist.spotifyPlaylistEmbedUrl}
                  width="100%"
                  height="352"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="border-0"
                />
              </div>
            </div>
          )}

          {embedTab === 'youtube' && (
            <div className="mt-5 space-y-3">
              <p className="text-xs text-zinc-400">
                연관 무드 YouTube 임베드 플레이어입니다. 클릭하여 앰비언트 스트림을 감상하거나 외부 링크로 이동할 수 있습니다.
              </p>
              <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#121212]">
                <iframe
                  title={`${playlist.title} YouTube Embed`}
                  src={`https://www.youtube.com/embed/${playlist.youtubeEmbedId}`}
                  width="100%"
                  height="100%"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="border-0"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
