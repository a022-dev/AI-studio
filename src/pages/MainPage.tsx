import { ArrowRight, Droplets, ExternalLink, MapPin, Play, RefreshCw, Wind } from 'lucide-react';
import { useState } from 'react';
import { CITIES, PLAYLISTS, WEATHER_THEMES } from '../data/curationData';
import { PageId, Playlist, Track, WeatherData, WeatherKey } from '../types/music';
import { WeatherIcon } from '../components/WeatherIcon';

interface MainPageProps {
  weatherData: WeatherData;
  selectedCityId: string;
  overrideWeather: WeatherKey | null;
  isLoadingWeather: boolean;
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
  onSelectCity,
  onRefreshWeather,
  onSetOverrideWeather,
  onPlayPlaylist,
  onOpenPlaylistDetail,
  onNavigate,
}: MainPageProps) {
  const [activeEmbed, setActiveEmbed] = useState<'spotify' | 'youtube'>('spotify');

  const effectiveWeather: WeatherKey = overrideWeather ?? weatherData.weatherKey;
  const theme = WEATHER_THEMES[effectiveWeather];

  // Pick the flagship playlist matching the active weather
  const heroPlaylist =
    PLAYLISTS.find((p) => p.weather === effectiveWeather) ?? PLAYLISTS[0];

  // Featured 4 playlists for the main page grid
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
    <div className="space-y-16 pb-16">
      {/* 1. Weather Widget + Hero Banner */}
      <section className="pt-8 sm:pt-12">
        {/* Compact Weather Control Bar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {/* City Selector */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400 shrink-0" aria-hidden="true" />
              <label htmlFor="city-select" className="sr-only">
                지역 선택
              </label>
              <select
                id="city-select"
                value={selectedCityId}
                onChange={(e) => onSelectCity(e.target.value)}
                className="h-10 rounded-lg border border-white/10 bg-[#121212] px-3 text-sm font-medium text-white focus:border-[#1DB954] focus:outline-none cursor-pointer"
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
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#121212] text-zinc-300 transition-colors hover:border-white/25 hover:text-white cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingWeather ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Live Weather Readout */}
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <div className="flex items-center gap-2.5">
                <WeatherIcon weather={weatherData.weatherKey} className="h-5 w-5 text-zinc-200" />
                <span className="font-mono text-xl font-semibold text-white tabular-nums">
                  {weatherData.temperature}°C
                </span>
                <span className="text-sm text-zinc-300">{weatherData.conditionLabel}</span>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400 tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  습도 {weatherData.humidity}%
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  바람 {weatherData.windSpeed}m/s
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-zinc-500">
                  {weatherData.isLive ? `실시간 (${weatherData.updatedAt})` : '기본 기상 데이터'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Weather Mood Simulator */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#121212] p-1 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => onSetOverrideWeather(null)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                overrideWeather === null
                  ? 'bg-[#27272A] text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              실시간 연동
            </button>
            {WEATHER_KEYS.map((key) => {
              const isSelected = overrideWeather === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSetOverrideWeather(key)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected ? 'bg-[#27272A] text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  style={isSelected ? { color: WEATHER_THEMES[key].accentHex } : undefined}
                >
                  {WEATHER_THEMES[key].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Split: Left Copy + CTA / Right Square Album Artwork */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between lg:col-span-7">
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <span style={{ color: theme.accentHex }}>
                  {overrideWeather ? `${theme.label} 무드 미리보기` : `${weatherData.cityName}의 현재 날씨 큐레이션`}
                </span>
                <span aria-hidden="true">·</span>
                <span>{theme.englishLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{heroPlaylist.bpmRange}</span>
              </div>

              <h1 className="font-display text-3xl font-bold leading-[1.18] tracking-tight text-white sm:text-5xl">
                {heroPlaylist.title}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                {theme.headline}. {heroPlaylist.description}
              </p>

              <p className="max-w-2xl border-t border-white/[0.08] pt-4 text-sm leading-relaxed text-zinc-400">
                {heroPlaylist.editorialNote}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onPlayPlaylist(heroPlaylist)}
                className="inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-black transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: theme.accentHex }}
              >
                <Play className="h-4 w-4 fill-current" />
                <span>지금 듣기</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenPlaylistDetail(heroPlaylist)}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-[#1E1E1E] px-5 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-[#27272A] cursor-pointer whitespace-nowrap"
              >
                <span>트랙리스트 ({heroPlaylist.tracks.length}곡)</span>
              </button>

              <a
                href={heroPlaylist.spotifySearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white whitespace-nowrap"
              >
                <span>Spotify</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <a
                href={heroPlaylist.youtubeSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white whitespace-nowrap"
              >
                <span>YouTube</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Hero Album Cover */}
          <div className="lg:col-span-5">
            <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E1E]">
              <img
                src={heroPlaylist.coverUrl}
                alt={`${heroPlaylist.title} 대표 앨범 커버`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6">
                <p className="text-xs font-medium text-zinc-300">
                  {heroPlaylist.curator}
                  <span className="mx-2 text-zinc-500" aria-hidden="true">·</span>
                  <span>{heroPlaylist.genre}</span>
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-white">
                  {heroPlaylist.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Playlist Grid */}
      <section className="space-y-6 border-t border-white/[0.08] pt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">에디터 셀렉션 · 상황 및 날씨별 큐레이션</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
              오늘의 추천 플레이리스트
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <span>날씨별 전체 탐색</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredPlaylists.map((playlist) => {
            const cardTheme = WEATHER_THEMES[playlist.weather];
            return (
              <article
                key={playlist.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#1E1E1E] transition-colors duration-200 hover:border-white/20"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#27272A]">
                  <img
                    src={playlist.coverUrl}
                    alt={`${playlist.title} 앨범 커버`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => onPlayPlaylist(playlist)}
                    aria-label={`${playlist.title} 바로 재생`}
                    className="absolute right-3 bottom-3 flex h-11 w-11 items-center justify-center rounded-full text-black shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: cardTheme.accentHex }}
                  >
                    <Play className="h-4 w-4 fill-current translate-x-[1px]" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col justify-between p-4">
                  <div className="space-y-1.5">
                    <p className="text-xs text-zinc-400">
                      <span style={{ color: cardTheme.accentHex }}>{cardTheme.label}</span>
                      <span className="mx-1.5 text-zinc-600" aria-hidden="true">·</span>
                      <span>{playlist.genre}</span>
                    </p>
                    <h3 className="font-display text-base font-semibold text-white">
                      <button
                        type="button"
                        onClick={() => onOpenPlaylistDetail(playlist)}
                        className="text-left hover:underline cursor-pointer"
                      >
                        {playlist.title}
                      </button>
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
                      {playlist.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-zinc-400">
                    <span className="font-mono tabular-nums">{playlist.tracks.length}곡 · {playlist.totalDuration}</span>
                    <button
                      type="button"
                      onClick={() => onOpenPlaylistDetail(playlist)}
                      className="font-medium text-zinc-200 hover:text-white cursor-pointer"
                    >
                      상세 보기
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. External Streaming & Embedded Player Showcase */}
      <section className="grid grid-cols-1 gap-8 border-t border-white/[0.08] pt-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <p className="text-xs font-medium text-zinc-400">외부 음원 연동 · 스트리밍 브리지</p>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            지금 날씨의 사운드를 바로 스트리밍하세요
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            MY VIBE의 큐레이션은 하단 미니 플레이어로 분위기를 미리 청취하거나, Spotify·YouTube 임베드 플레이어 및 공식 검색 링크를 통해 전체 음원으로 이어집니다.
          </p>

          <div className="flex items-center gap-1 rounded-lg bg-[#1E1E1E] p-1 w-fit border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveEmbed('spotify')}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeEmbed === 'spotify' ? 'bg-[#1DB954] text-black font-semibold' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Spotify 플레이어
            </button>
            <button
              type="button"
              onClick={() => setActiveEmbed('youtube')}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeEmbed === 'youtube' ? 'bg-[#8A2BE2] text-white font-semibold' : 'text-zinc-300 hover:text-white'
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#1E1E1E] px-4 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-white/30 hover:text-white"
            >
              <span>Spotify 새 창으로 열기</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={heroPlaylist.youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#1E1E1E] px-4 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-white/30 hover:text-white"
            >
              <span>YouTube 새 창으로 열기</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E1E]">
            {activeEmbed === 'spotify' ? (
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
