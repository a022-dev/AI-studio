import { ExternalLink, Pause, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { PLAYLISTS, WEATHER_THEMES } from '../data/curationData';
import { Playlist, Track, WeatherKey } from '../types/music';

interface ExplorePageProps {
  initialWeather: WeatherKey;
  activeTrackId: string;
  isPlaying: boolean;
  onPlayTrack: (playlist: Playlist, track: Track) => void;
  onOpenPlaylistDetail: (playlist: Playlist) => void;
}

const WEATHER_TABS: WeatherKey[] = ['clear', 'rain', 'cloudy', 'snow', 'dawn'];

export function ExplorePage({
  initialWeather,
  activeTrackId,
  isPlaying,
  onPlayTrack,
  onOpenPlaylistDetail,
}: ExplorePageProps) {
  const [selectedWeather, setSelectedWeather] = useState<WeatherKey>(initialWeather);
  const theme = WEATHER_THEMES[selectedWeather];
  const filteredPlaylists = PLAYLISTS.filter((p) => p.weather === selectedWeather);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(
    filteredPlaylists[0]?.id ?? PLAYLISTS[0].id
  );

  const handleWeatherChange = (key: WeatherKey) => {
    setSelectedWeather(key);
    const first = PLAYLISTS.find((p) => p.weather === key);
    if (first) {
      setSelectedPlaylistId(first.id);
    }
  };

  const activePlaylist =
    filteredPlaylists.find((p) => p.id === selectedPlaylistId) ??
    filteredPlaylists[0] ??
    PLAYLISTS[0];

  return (
    <div className="space-y-10 pt-8 pb-16 sm:pt-12">
      {/* Page Header & Weather Tab Bar */}
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            날씨별 큐레이션 아카이브
          </p>
          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
            원하는 날씨의 사운드를 탐색하세요
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            현재 바깥 날씨와 상관없이 지금 내 기분에 맞는 날씨 탭을 선택하고, 매칭된 플레이리스트와 전체 트랙리스트를 감상해 보세요.
          </p>
        </div>

        {/* Weather Tabs with sliding motion highlight */}
        <div
          className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-4 dark:border-white/[0.08]"
          role="tablist"
          aria-label="날씨별 음악 카테고리"
        >
          {WEATHER_TABS.map((key) => {
            const tabTheme = WEATHER_THEMES[key];
            const isActive = selectedWeather === key;
            const count = PLAYLISTS.filter((p) => p.weather === key).length;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleWeatherChange(key)}
                className={`relative inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-transparent text-zinc-900 dark:text-white'
                    : 'border-zinc-200 bg-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:border-white/[0.06] dark:text-zinc-400 dark:hover:border-white/15 dark:hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="explore-tab-highlight"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-lg border bg-white shadow-sm dark:bg-[#1E1E1E] dark:shadow-none"
                    style={{ borderColor: tabTheme.accentHex }}
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-2">
                  <span>{tabTheme.label}</span>
                  <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weather Mood Sonic Summary Banner & Split Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedWeather}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10"
        >
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#1E1E1E] dark:shadow-none sm:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              <div className="space-y-2 lg:col-span-7">
                <p className={`text-xs font-semibold ${theme.accentTextClass}`}>
                  {theme.label} · {theme.englishLabel}
                </p>
                <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-white">
                  {theme.headline}
                </h2>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {theme.sonicSummary}
                </p>
              </div>

              <dl className="grid grid-cols-1 gap-4 border-t border-zinc-200 pt-4 text-xs sm:grid-cols-3 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 dark:border-white/[0.08]">
                <div>
                  <dt className="text-zinc-500">권장 템포</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">
                    {theme.bpmTarget}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">주요 사운드</dt>
                  <dd className="mt-1 text-zinc-700 dark:text-zinc-200 leading-relaxed">
                    {theme.instruments}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">어울리는 순간</dt>
                  <dd className="mt-1 text-zinc-700 dark:text-zinc-200 leading-relaxed">
                    {theme.listeningScene}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Split Layout: Matching Playlists List + Detailed Tracklist Viewer */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left: Playlists for selected weather */}
            <div className="space-y-4 lg:col-span-5">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {theme.label} 날씨 추천 플레이리스트 ({filteredPlaylists.length})
              </h3>

              <div className="space-y-4">
                {filteredPlaylists.map((playlist) => {
                  const isSelected = activePlaylist.id === playlist.id;
                  return (
                    <article
                      key={playlist.id}
                      onClick={() => setSelectedPlaylistId(playlist.id)}
                      className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors ${
                        isSelected
                          ? 'border-zinc-400 bg-white shadow-sm dark:border-white/25 dark:bg-[#1E1E1E] dark:shadow-none'
                          : 'border-zinc-200 bg-white/70 hover:border-zinc-300 hover:bg-white dark:border-white/[0.06] dark:bg-[#161618] dark:hover:border-white/15 dark:hover:bg-[#1E1E1E]'
                      }`}
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-200 dark:bg-[#27272A]">
                        <img
                          src={playlist.coverUrl}
                          alt={`${playlist.title} 커버`}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {playlist.genre}
                            <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{playlist.bpmRange}</span>
                          </p>
                          <h4 className="mt-1 truncate font-display text-base font-semibold text-zinc-900 dark:text-white">
                            {playlist.title}
                          </h4>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {playlist.subtitle}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayTrack(playlist, playlist.tracks[0]);
                            }}
                            className={`inline-flex items-center gap-1 font-semibold cursor-pointer ${theme.accentTextClass}`}
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>재생</span>
                          </button>
                          <span className="text-zinc-300 dark:text-zinc-600" aria-hidden="true">·</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPlaylistDetail(playlist);
                            }}
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white cursor-pointer"
                          >
                            임베드/전체 보기
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Playlist Tracklist Detail */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#1E1E1E] dark:shadow-none">
                <div className="flex flex-col gap-5 border-b border-zinc-200 pb-6 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{activePlaylist.curator}</span>
                      <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{activePlaylist.tracks.length}곡</span>
                      <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden="true">·</span>
                      <span>{activePlaylist.totalDuration}</span>
                    </p>
                    <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                      {activePlaylist.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <a
                      href={activePlaylist.spotifySearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-white/15 dark:text-zinc-200 dark:hover:border-white/30 dark:hover:text-white"
                    >
                      <span>Spotify</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={activePlaylist.youtubeSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-white/15 dark:text-zinc-200 dark:hover:border-white/30 dark:hover:text-white"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {activePlaylist.editorialNote}
                </p>

                {/* Track Rows */}
                <div className="mt-6 divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-white/[0.06] dark:border-white/[0.08]">
                  {activePlaylist.tracks.map((track, idx) => {
                    const isCurrent = activeTrackId === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`flex items-center justify-between gap-4 py-3.5 px-2 rounded-lg transition-colors ${
                          isCurrent
                            ? 'bg-zinc-100 dark:bg-white/[0.05]'
                            : 'hover:bg-zinc-50 dark:hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          <button
                            type="button"
                            onClick={() => onPlayTrack(activePlaylist, track)}
                            aria-label={`${track.title} 재생`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition-colors hover:border-zinc-400 dark:border-white/15 dark:text-zinc-200 dark:hover:border-white/35 cursor-pointer"
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
                            <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                              <span className="mr-2 font-mono text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              {track.title}
                            </p>
                            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                              <span>{track.artist}</span>
                              <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden="true">·</span>
                              <span>{track.note}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                          {isCurrent && isPlaying && (
                            <AudioVisualizer
                              isPlaying={true}
                              accentHex={theme.accentHex}
                              barCount={4}
                              heightClass="h-4"
                            />
                          )}
                          <span className="hidden sm:inline">{track.bpm} BPM</span>
                          <span>{track.duration}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
