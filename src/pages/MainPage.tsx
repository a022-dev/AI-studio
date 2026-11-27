import { ArrowRight, ExternalLink, Pause, Play, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { TiltAlbumCard } from '../components/TiltAlbumCard';
import { VinylSpectrumRing } from '../components/VinylSpectrumRing';
import { WeatherMarqueeBar } from '../components/WeatherMarqueeBar';
import { CITIES, PLAYLISTS, WEATHER_THEMES } from '../data/curationData';
import { PageId, Playlist, Track, WeatherData, WeatherKey } from '../types/music';

interface MainPageProps {
  weatherData: WeatherData;
  selectedCityId: string;
  overrideWeather: WeatherKey | null;
  isLoadingWeather: boolean;
  isPlaying: boolean;
  activePlaylistId: string;
  themeMode: 'light' | 'dark';
  onToggleTheme: (mode: 'light' | 'dark') => void;
  onSelectCity: (cityId: string) => void;
  onRefreshWeather: () => void;
  onSetOverrideWeather: (weather: WeatherKey | null) => void;
  onPlayPlaylist: (playlist: Playlist, track?: Track) => void;
  onOpenPlaylistDetail: (playlist: Playlist) => void;
  onNavigate: (page: PageId, weatherFilter?: WeatherKey) => void;
}

const WEATHER_KEYS: WeatherKey[] = ['clear', 'rain', 'cloudy', 'snow', 'dawn'];

export function MainPage({
  weatherData,
  selectedCityId,
  overrideWeather,
  isLoadingWeather,
  isPlaying,
  activePlaylistId,
  themeMode,
  onToggleTheme,
  onSelectCity,
  onRefreshWeather,
  onSetOverrideWeather,
  onPlayPlaylist,
  onOpenPlaylistDetail,
  onNavigate,
}: MainPageProps) {
  const [activeEmbed, setActiveEmbed] = useState<'spotify' | 'youtube'>('spotify');
  const [embedLoaded, setEmbedLoaded] = useState(false);

  const effectiveWeather: WeatherKey = overrideWeather ?? weatherData.weatherKey;
  const theme = WEATHER_THEMES[effectiveWeather];

  useEffect(() => {
    setEmbedLoaded(false);
  }, [effectiveWeather, activeEmbed]);

  const heroPlaylist =
    PLAYLISTS.find((p) => p.weather === effectiveWeather) ?? PLAYLISTS[0];

  const isHeroPlaying = isPlaying && activePlaylistId === heroPlaylist.id;

  const featuredGridIds = [
    'dawn-emotional-rnb',
    'rain-coding-lofi',
    'clear-coastal-drive',
    'cloudy-rooftop-indie',
  ];
  const featuredPlaylists = featuredGridIds
    .map((id) => PLAYLISTS.find((p) => p.id === id))
    .filter((p): p is Playlist => Boolean(p));

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Weather Widget + Hero Banner */}
      <section className="pt-8 sm:pt-12">
        {/* Weather Control & Theme Bar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-md dark:border-white/[0.08] dark:bg-[#1E1E1E]/85 dark:shadow-none sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              {/* City Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="city-select" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  지역
                </label>
                <select
                  id="city-select"
                  value={selectedCityId}
                  onChange={(e) => onSelectCity(e.target.value)}
                  className="h-10 rounded-lg border border-zinc-300 bg-[#F7F6F2] px-3 text-sm font-medium text-zinc-900 focus:border-[#1DB954] focus:outline-none dark:border-white/10 dark:bg-[#121212] dark:text-white cursor-pointer"
                >
                  {CITIES.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.nameKo} ({city.nameEn})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={onRefreshWeather}
                  aria-label="날씨 새로고침"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 bg-[#F7F6F2] text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-white/10 dark:bg-[#121212] dark:text-zinc-300 dark:hover:border-white/25 dark:hover:text-white cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingWeather ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Live Weather Readout */}
              <div className="flex items-center gap-4 border-l border-zinc-200 pl-4 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xl font-semibold text-zinc-900 dark:text-white tabular-nums">
                    {weatherData.temperature}°C
                  </span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {weatherData.conditionLabel}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                  <span>습도 {weatherData.humidity}%</span>
                  <span aria-hidden="true">·</span>
                  <span>바람 {weatherData.windSpeed}m/s</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-zinc-400 dark:text-zinc-500">
                    {weatherData.isLive ? `실시간 (${weatherData.updatedAt})` : '기본 기상 데이터'}
                  </span>
                </div>
              </div>
            </div>

            {/* PWA Install + Light / Dark Theme Switch */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <PWAInstallButton />

              <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-[#F7F6F2] p-1 dark:border-white/[0.06] dark:bg-[#121212]">
                <button
                  type="button"
                  onClick={() => onToggleTheme('light')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    themeMode === 'light'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  라이트 테마
                </button>
                <button
                  type="button"
                  onClick={() => onToggleTheme('dark')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    themeMode === 'dark'
                      ? 'bg-[#27272A] text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  다크 테마
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Weather Mood Simulator with gliding indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-3 dark:border-white/[0.06]">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              날씨 무드 전환
            </span>
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-[#F7F6F2] p-1 dark:border-white/[0.06] dark:bg-[#121212]">
              <button
                type="button"
                onClick={() => onSetOverrideWeather(null)}
                className={`relative rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  overrideWeather === null
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {overrideWeather === null && (
                  <motion.span
                    layoutId="weather-sim-indicator"
                    transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                    className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-[#27272A]"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">실시간 연동</span>
              </button>
              {WEATHER_KEYS.map((key) => {
                const isSelected = overrideWeather === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSetOverrideWeather(key)}
                    className={`relative rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? WEATHER_THEMES[key].accentTextClass
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="weather-sim-indicator"
                        transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                        className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-[#27272A]"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10">{WEATHER_THEMES[key].label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hero Split: Left Copy + CTA / Right Vinyl Sleeve Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={effectiveWeather}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12"
          >
            <div className="flex flex-col justify-between lg:col-span-6">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <span className={`font-semibold ${theme.accentTextClass}`}>
                    {overrideWeather ? `${theme.label} 무드 미리보기` : `${weatherData.cityName}의 현재 날씨 큐레이션`}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{theme.englishLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{heroPlaylist.bpmRange}</span>
                </div>

                <h1 className="font-display text-3xl font-bold leading-[1.18] tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                  {heroPlaylist.title}
                </h1>

                <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                  {theme.headline}. {heroPlaylist.description}
                </p>

                <p className="max-w-2xl border-t border-zinc-200 pt-4 text-sm leading-relaxed text-zinc-500 dark:border-white/[0.08] dark:text-zinc-400">
                  {heroPlaylist.editorialNote}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onPlayPlaylist(heroPlaylist)}
                  className="inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-black transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: theme.accentHex }}
                >
                  {isHeroPlaying ? (
                    <>
                      <Pause className="h-4 w-4 fill-current" />
                      <span>일시정지</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>지금 듣기</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onOpenPlaylistDetail(heroPlaylist)}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-white/15 dark:bg-[#1E1E1E] dark:text-white dark:hover:border-white/30 dark:hover:bg-[#27272A] cursor-pointer whitespace-nowrap"
                >
                  <span>트랙리스트 ({heroPlaylist.tracks.length}곡)</span>
                </button>

                <a
                  href={heroPlaylist.spotifySearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white whitespace-nowrap"
                >
                  <span>Spotify</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <a
                  href={heroPlaylist.youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white whitespace-nowrap"
                >
                  <span>YouTube</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Hero Album Cover with Prominent Emerging Spinning LP Vinyl Disc */}
            <div className="lg:col-span-6 flex items-center justify-center px-4 py-3 sm:p-0">
              <div
                onClick={() => onPlayPlaylist(heroPlaylist)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPlayPlaylist(heroPlaylist);
                  }
                }}
                aria-label={`${heroPlaylist.title} 바이닐 재생 전환`}
                className="group relative w-full max-w-[460px] pr-[26%] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954] rounded-2xl"
              >
                {/* Emerging Spinning LP Disc — Always clearly visible on right side of sleeve */}
                <div
                  aria-hidden="true"
                  className={`absolute top-[4%] right-0 z-0 aspect-square w-[70%] rounded-full border-2 border-zinc-500/60 dark:border-zinc-400/35 shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isHeroPlaying
                      ? 'translate-x-2 sm:translate-x-4 scale-[1.02]'
                      : '-translate-x-4 group-hover:translate-x-1'
                  }`}
                >
                  {/* Audio-reactive Circular Spectrum Ring wrapping the outer LP rim */}
                  <VinylSpectrumRing
                    isPlaying={isHeroPlaying}
                    accentHex={theme.accentHex}
                    themeMode={themeMode}
                  />

                  {/* Spinning Grooved Vinyl Surface */}
                  <div
                    className={`relative h-full w-full rounded-full overflow-hidden ${
                      isHeroPlaying ? 'animate-[spin_4.5s_linear_infinite]' : ''
                    }`}
                    style={{
                      background:
                        'repeating-radial-gradient(circle at center, #27272a 0px, #27272a 2px, #0d0d10 3px, #0d0d10 6px)',
                    }}
                  >
                    {/* Specular glossy vinyl highlight so rotation is super clear */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          'conic-gradient(from 40deg, rgba(255,255,255,0.22) 0deg, transparent 55deg, rgba(255,255,255,0.06) 140deg, rgba(255,255,255,0.24) 210deg, transparent 280deg, rgba(255,255,255,0.12) 360deg)',
                      }}
                    />

                    {/* Center Vinyl Label */}
                    <div
                      className="absolute inset-0 m-auto flex h-[34%] w-[34%] items-center justify-center rounded-full border-4 border-[#121212] shadow-md"
                      style={{ backgroundColor: theme.accentHex }}
                    >
                      <span className="h-3 w-3 rounded-full border border-white/40 bg-[#121212]" />
                    </div>
                  </div>
                </div>

                {/* Front Album Sleeve */}
                <div className="relative z-10 aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 shadow-xl dark:border-white/15 dark:bg-[#1E1E1E] dark:shadow-2xl">
                  <img
                    src={heroPlaylist.coverUrl}
                    alt={`${heroPlaylist.title} 대표 앨범 커버`}
                    referrerPolicy="no-referrer"
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-5 sm:p-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-zinc-300">
                          {heroPlaylist.curator}
                          <span className="mx-2 text-zinc-500" aria-hidden="true">·</span>
                          <span>{heroPlaylist.genre}</span>
                        </p>
                        <p className="mt-1 font-display text-base font-semibold text-white sm:text-lg">
                          {heroPlaylist.subtitle}
                        </p>
                      </div>
                      <AudioVisualizer
                        isPlaying={isHeroPlaying}
                        accentHex={theme.accentHex}
                        barCount={7}
                        heightClass="h-6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Editorial Weather Lyric & Poetic Marquee Strip */}
      <WeatherMarqueeBar weather={effectiveWeather} bpmRange={heroPlaylist.bpmRange} />

      {/* 2. Featured Playlist Grid */}
      <section className="space-y-6 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              에디터 셀렉션 · 상황 및 날씨별 큐레이션
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
              오늘의 추천 플레이리스트
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <span>날씨별 전체 탐색</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Dedicated Horizontal Snap-Scroll Carousel */}
        <div className="md:hidden -mx-4 flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-2">
          {featuredPlaylists.map((playlist) => {
            const cardTheme = WEATHER_THEMES[playlist.weather];
            const isCardPlaying = isPlaying && activePlaylistId === playlist.id;
            return (
              <article
                key={`mobile-${playlist.id}`}
                className="snap-start shrink-0 w-[76vw] max-w-[280px] flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#1E1E1E] dark:shadow-none"
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
                  <button
                    type="button"
                    onClick={() => onPlayPlaylist(playlist)}
                    aria-label={`${playlist.title} 바로 재생`}
                    className="absolute right-3 bottom-3 flex h-11 w-11 items-center justify-center rounded-full text-black shadow-lg active:scale-95 cursor-pointer"
                    style={{ backgroundColor: cardTheme.accentHex }}
                  >
                    {isCardPlaying ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current translate-x-[1px]" />
                    )}
                  </button>
                </div>

                <div className="flex flex-1 flex-col justify-between p-4">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className={`font-medium ${cardTheme.accentTextClass}`}>
                        {cardTheme.label}
                      </span>
                      <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden="true">·</span>
                      <span>{playlist.genre}</span>
                    </p>
                    <h3 className="font-display text-base font-semibold text-zinc-900 dark:text-white truncate">
                      {playlist.title}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {playlist.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-white/[0.06] dark:text-zinc-400">
                    <span className="font-mono tabular-nums">{playlist.tracks.length}곡</span>
                    <button
                      type="button"
                      onClick={() => onOpenPlaylistDetail(playlist)}
                      className="min-h-[36px] font-medium text-zinc-800 dark:text-zinc-200 cursor-pointer"
                    >
                      트랙리스트 보기
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Desktop 4-Column Interactive Tilt Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPlaylists.map((playlist) => {
            const cardTheme = WEATHER_THEMES[playlist.weather];
            const isCardPlaying = isPlaying && activePlaylistId === playlist.id;
            return (
              <TiltAlbumCard
                key={playlist.id}
                accentHex={cardTheme.accentHex}
                className="flex"
              >
                <article className="group flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-colors duration-200 hover:border-zinc-300 dark:border-white/[0.07] dark:bg-[#1E1E1E] dark:shadow-none dark:hover:border-white/25">
                  <div className="relative aspect-square w-full overflow-hidden bg-zinc-200 dark:bg-[#27272A]">
                    <img
                      src={playlist.coverUrl}
                      alt={`${playlist.title} 앨범 커버`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => onPlayPlaylist(playlist)}
                      aria-label={`${playlist.title} 바로 재생`}
                      className="absolute right-3 bottom-3 flex h-11 w-11 items-center justify-center rounded-full text-black shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: cardTheme.accentHex }}
                    >
                      {isCardPlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                      ) : (
                        <Play className="h-4 w-4 fill-current translate-x-[1px]" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <p className="truncate">
                          <span className={`font-medium ${cardTheme.accentTextClass}`}>
                            {cardTheme.label}
                          </span>
                          <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden="true">·</span>
                          <span>{playlist.genre}</span>
                        </p>
                        {isCardPlaying && (
                          <AudioVisualizer
                            isPlaying={true}
                            accentHex={cardTheme.accentHex}
                            barCount={4}
                            heightClass="h-3.5"
                          />
                        )}
                      </div>
                      <h3 className="font-display text-base font-semibold text-zinc-900 dark:text-white">
                        <button
                          type="button"
                          onClick={() => onOpenPlaylistDetail(playlist)}
                          className="text-left hover:underline cursor-pointer"
                        >
                          {playlist.title}
                        </button>
                      </h3>
                      <p className="line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {playlist.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-white/[0.06] dark:text-zinc-400">
                      <span className="font-mono tabular-nums">{playlist.tracks.length}곡 · {playlist.totalDuration}</span>
                      <button
                        type="button"
                        onClick={() => onOpenPlaylistDetail(playlist)}
                        className="font-medium text-zinc-800 hover:text-black dark:text-zinc-200 dark:hover:text-white cursor-pointer"
                      >
                        상세 보기
                      </button>
                    </div>
                  </div>
                </article>
              </TiltAlbumCard>
            );
          })}
        </div>
      </section>

      {/* 3. External Streaming & Embedded Player Showcase */}
      <section className="grid grid-cols-1 gap-8 border-t border-zinc-200 pt-12 dark:border-white/[0.08] lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            외부 음원 연동 · 스트리밍 브리지
          </p>
          <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
            지금 날씨의 사운드를 바로 스트리밍하세요
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            MY VIBE의 큐레이션은 하단 미니 플레이어로 분위기를 미리 청취하거나, Spotify·YouTube 임베드 플레이어 및 공식 검색 링크를 통해 전체 음원으로 이어집니다.
          </p>

          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 w-fit dark:border-white/[0.06] dark:bg-[#1E1E1E]">
            <button
              type="button"
              onClick={() => setActiveEmbed('spotify')}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeEmbed === 'spotify'
                  ? 'bg-[#1DB954] text-black font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white'
              }`}
            >
              Spotify 플레이어
            </button>
            <button
              type="button"
              onClick={() => setActiveEmbed('youtube')}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeEmbed === 'youtube'
                  ? 'bg-[#8A2BE2] text-white font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white'
              }`}
            >
              YouTube 플레이어
            </button>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={heroPlaylist.spotifySearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-400 hover:text-black dark:border-white/15 dark:bg-[#1E1E1E] dark:text-zinc-200 dark:hover:border-white/30 dark:hover:text-white"
            >
              <span>Spotify 새 창으로 열기</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={heroPlaylist.youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-400 hover:text-black dark:border-white/15 dark:bg-[#1E1E1E] dark:text-zinc-200 dark:hover:border-white/30 dark:hover:text-white"
            >
              <span>YouTube 새 창으로 열기</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1E1E1E] dark:shadow-none">
            {!embedLoaded ? (
              <div className="relative flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
                <img
                  src={heroPlaylist.coverUrl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-20 blur-sm"
                />
                <div className="relative z-10 max-w-md space-y-3">
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {activeEmbed === 'spotify' ? 'Spotify' : 'YouTube'} 지연 로딩 플레이어
                  </p>
                  <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-white">
                    {heroPlaylist.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    초기 페이지 속도를 높이기 위해 외부 플레이어를 필요할 때만 불러옵니다.
                  </p>
                  <button
                    type="button"
                    onClick={() => setEmbedLoaded(true)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-5 text-xs font-semibold text-black transition-transform duration-150 hover:scale-[1.02] cursor-pointer"
                    style={{
                      backgroundColor: activeEmbed === 'spotify' ? '#1DB954' : theme.accentHex,
                    }}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>
                      {activeEmbed === 'spotify' ? 'Spotify 플레이어 불러오기' : 'YouTube 플레이어 불러오기'}
                    </span>
                  </button>
                </div>
              </div>
            ) : activeEmbed === 'spotify' ? (
              <iframe
                title={`${heroPlaylist.title} Spotify Embed`}
                src={heroPlaylist.spotifyPlaylistEmbedUrl}
                width="100%"
                height="352"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="border-0"
              />
            ) : (
              <div className="aspect-video w-full">
                <iframe
                  title={`${heroPlaylist.title} YouTube Embed`}
                  src={`https://www.youtube.com/embed/${heroPlaylist.youtubeEmbedId}`}
                  width="100%"
                  height="100%"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="border-0"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
