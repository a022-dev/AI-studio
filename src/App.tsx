import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { MiniPlayer } from './components/MiniPlayer';
import { PlaylistModal } from './components/PlaylistModal';
import { TopNav } from './components/TopNav';
import { WeatherAtmosphereCanvas } from './components/WeatherAtmosphereCanvas';
import { WeatherGlassOverlay } from './components/WeatherGlassOverlay';
import { CITIES, INITIAL_SUBMISSIONS, PLAYLISTS } from './data/curationData';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { AboutPage } from './pages/AboutPage';
import { ExplorePage } from './pages/ExplorePage';
import { MainPage } from './pages/MainPage';
import { RecommendPage } from './pages/RecommendPage';
import {
  BugReport,
  CommunitySubmission,
  PageId,
  Playlist,
  Track,
  WeatherData,
  WeatherKey,
} from './types/music';
import { ambientEngine } from './utils/audioPreview';
import { fetchCityWeather } from './utils/weatherApi';

const SUBMISSIONS_STORAGE_KEY = 'myvibe_submissions_v1';
const BUG_REPORTS_STORAGE_KEY = 'myvibe_bug_reports_v1';
const THEME_STORAGE_KEY = 'myvibe_theme_v1';

export default function App() {
  const isOnline = useOnlineStatus();
  const [activePage, setActivePage] = useState<PageId>('main');
  const [exploreInitialWeather, setExploreInitialWeather] = useState<WeatherKey>('clear');

  // Dual-theme state synced with <html class="dark">
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', themeMode === 'dark' ? '#121212' : '#F7F6F2');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // Ignore storage errors
    }
  }, [themeMode]);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Weather state
  const [selectedCityId, setSelectedCityId] = useState<string>('seoul');
  const [overrideWeather, setOverrideWeather] = useState<WeatherKey | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherData>({
    cityId: 'seoul',
    cityName: '서울',
    temperature: 14,
    apparentTemperature: 13,
    humidity: 52,
    windSpeed: 3.1,
    weatherKey: 'clear',
    conditionLabel: '맑음',
    isLive: false,
    updatedAt: '불러오는 중',
  });

  // Player state
  const [activePlaylist, setActivePlaylist] = useState<Playlist>(PLAYLISTS[0]);
  const [activeTrack, setActiveTrack] = useState<Track>(PLAYLISTS[0].tracks[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Modal state
  const [modalPlaylist, setModalPlaylist] = useState<Playlist | null>(null);

  // Community submissions persisted in localStorage
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>(() => {
    try {
      const saved = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }
    return INITIAL_SUBMISSIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
    } catch {
      // Ignore storage errors
    }
  }, [submissions]);

  // Fetch weather whenever selectedCityId changes
  const loadWeather = useCallback(async (cityId: string) => {
    const city = CITIES.find((c) => c.id === cityId) ?? CITIES[0];
    setIsLoadingWeather(true);
    const result = await fetchCityWeather(city);
    setWeatherData(result);
    setIsLoadingWeather(false);
  }, []);

  useEffect(() => {
    loadWeather(selectedCityId);
  }, [selectedCityId, loadWeather]);

  // Audio playback & timer loop
  const handlePlayTrack = useCallback(
    (playlist: Playlist, track?: Track) => {
      const targetTrack = track ?? playlist.tracks[0];
      const isSameTrack = activeTrack.id === targetTrack.id && activePlaylist.id === playlist.id;

      if (isSameTrack) {
        setIsPlaying((prev) => {
          const next = !prev;
          if (next) {
            ambientEngine.start(targetTrack.chordPreset);
          } else {
            ambientEngine.stop();
          }
          return next;
        });
        return;
      }

      setActivePlaylist(playlist);
      setActiveTrack(targetTrack);
      setCurrentTime(0);
      setIsPlaying(true);
      ambientEngine.start(targetTrack.chordPreset);
    },
    [activePlaylist.id, activeTrack.id]
  );

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        ambientEngine.start(activeTrack.chordPreset);
      } else {
        ambientEngine.stop();
      }
      return next;
    });
  }, [activeTrack.chordPreset]);

  const handleNextTrack = useCallback(() => {
    const idx = activePlaylist.tracks.findIndex((t) => t.id === activeTrack.id);
    const nextIdx = (idx + 1) % activePlaylist.tracks.length;
    const nextTrack = activePlaylist.tracks[nextIdx];
    setActiveTrack(nextTrack);
    setCurrentTime(0);
    if (isPlaying) {
      ambientEngine.start(nextTrack.chordPreset);
    }
  }, [activePlaylist.tracks, activeTrack.id, isPlaying]);

  const handlePrevTrack = useCallback(() => {
    const idx = activePlaylist.tracks.findIndex((t) => t.id === activeTrack.id);
    const prevIdx = (idx - 1 + activePlaylist.tracks.length) % activePlaylist.tracks.length;
    const prevTrack = activePlaylist.tracks[prevIdx];
    setActiveTrack(prevTrack);
    setCurrentTime(0);
    if (isPlaying) {
      ambientEngine.start(prevTrack.chordPreset);
    }
  }, [activePlaylist.tracks, activeTrack.id, isPlaying]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      ambientEngine.setMuted(next);
      return next;
    });
  }, []);

  // Advance playback timer while playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        if (prev + 1 >= activeTrack.durationSeconds) {
          handleNextTrack();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying, activeTrack.durationSeconds, handleNextTrack]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      ambientEngine.stop();
    };
  }, []);

  const handleNavigate = (page: PageId, weatherFilter?: WeatherKey) => {
    if (weatherFilter) {
      setExploreInitialWeather(weatherFilter);
    } else if (page === 'explore') {
      setExploreInitialWeather(overrideWeather ?? weatherData.weatherKey);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSubmission = (newItem: Omit<CommunitySubmission, 'id' | 'createdAt' | 'likes'>) => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}.${String(today.getDate()).padStart(2, '0')}`;

    const created: CommunitySubmission = {
      ...newItem,
      id: `sub-${Date.now()}`,
      createdAt: formattedDate,
      likes: 1,
      likedByMe: true,
    };
    setSubmissions((prev) => [created, ...prev]);
  };

  const handleToggleLike = (id: string) => {
    setSubmissions((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const liked = !item.likedByMe;
        return {
          ...item,
          likedByMe: liked,
          likes: Math.max(0, item.likes + (liked ? 1 : -1)),
        };
      })
    );
  };

  const handleReportBug = (report: Omit<BugReport, 'id' | 'createdAt'>) => {
    try {
      const existing = JSON.parse(localStorage.getItem(BUG_REPORTS_STORAGE_KEY) || '[]');
      const next = [
        {
          ...report,
          id: `bug-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...existing,
      ];
      localStorage.setItem(BUG_REPORTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  };

  const effectiveWeather: WeatherKey = overrideWeather ?? weatherData.weatherKey;

  return (
    <div className="relative min-h-screen bg-[#F7F6F2] text-zinc-900 dark:bg-[#121212] dark:text-[#F4F4F5] flex flex-col transition-colors">
      <WeatherAtmosphereCanvas
        weather={effectiveWeather}
        isPlaying={isPlaying}
        themeMode={themeMode}
      />

      <WeatherGlassOverlay weather={effectiveWeather} themeMode={themeMode} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <TopNav
          activePage={activePage}
          themeMode={themeMode}
          onNavigate={(page) => handleNavigate(page)}
          onToggleTheme={toggleThemeMode}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {activePage === 'main' && (
                <MainPage
                  weatherData={weatherData}
                  selectedCityId={selectedCityId}
                  overrideWeather={overrideWeather}
                  isLoadingWeather={isLoadingWeather}
                  isPlaying={isPlaying}
                  activePlaylistId={activePlaylist.id}
                  themeMode={themeMode}
                  onToggleTheme={setThemeMode}
                  onSelectCity={setSelectedCityId}
                  onRefreshWeather={() => loadWeather(selectedCityId)}
                  onSetOverrideWeather={setOverrideWeather}
                  onPlayPlaylist={handlePlayTrack}
                  onOpenPlaylistDetail={setModalPlaylist}
                  onNavigate={handleNavigate}
                />
              )}

              {activePage === 'explore' && (
                <ExplorePage
                  initialWeather={exploreInitialWeather}
                  activeTrackId={activeTrack.id}
                  isPlaying={isPlaying}
                  onPlayTrack={handlePlayTrack}
                  onOpenPlaylistDetail={setModalPlaylist}
                />
              )}

              {activePage === 'recommend' && (
                <RecommendPage
                  submissions={submissions}
                  onAddSubmission={handleAddSubmission}
                  onToggleLike={handleToggleLike}
                  onPlayMoodPreview={handlePlayTrack}
                />
              )}

              {activePage === 'about' && <AboutPage onReportBug={handleReportBug} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Quiet Editorial Footer above fixed mini player / mobile thumb dock */}
        <footer className="border-t border-zinc-200 bg-[#F7F6F2]/85 dark:border-white/[0.08] dark:bg-[#121212]/80 backdrop-blur-sm pb-32 md:pb-24 pt-8 transition-colors">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="font-display text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                MY VIBE
              </span>
              <span aria-hidden="true">·</span>
              <span>날씨와 음악을 잇는 큐레이션 웹진</span>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => handleNavigate('main')}
                className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
              >
                메인
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('explore')}
                className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
              >
                날씨별 탐색
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('recommend')}
                className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
              >
                추천·제보
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('about')}
                className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
              >
                서비스 소개
              </button>
              <button
                type="button"
                onClick={toggleThemeMode}
                className="font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white cursor-pointer"
              >
                {themeMode === 'dark' ? '라이트 테마로 전환' : '다크 테마로 전환'}
              </button>
            </div>
          </div>
        </footer>
      </div>

      <MiniPlayer
        playlist={activePlaylist}
        track={activeTrack}
        isPlaying={isPlaying}
        isMuted={isMuted}
        currentTime={currentTime}
        themeMode={themeMode}
        activePage={activePage}
        onNavigate={(page) => handleNavigate(page)}
        onToggleTheme={toggleThemeMode}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        onSeek={setCurrentTime}
        onToggleMute={handleToggleMute}
        onOpenPlaylistDetail={() => setModalPlaylist(activePlaylist)}
      />

      {!isOnline && (
        <div
          role="status"
          className="fixed top-16 right-4 z-50 rounded-lg border border-amber-500/40 bg-amber-500/95 px-3.5 py-2 text-xs font-medium text-black shadow-lg"
        >
          오프라인 모드 · 저장된 캐시 데이터를 표시 중입니다
        </div>
      )}

      <PlaylistModal
        playlist={modalPlaylist}
        activeTrackId={activeTrack.id}
        isPlaying={isPlaying}
        onClose={() => setModalPlaylist(null)}
        onPlayTrack={handlePlayTrack}
      />
    </div>
  );
}
