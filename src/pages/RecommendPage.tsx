import { ExternalLink, Heart, Play, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FormEvent, useState } from 'react';
import { PLAYLISTS, WEATHER_THEMES } from '../data/curationData';
import { CommunitySubmission, Playlist, Track, WeatherKey } from '../types/music';

interface RecommendPageProps {
  submissions: CommunitySubmission[];
  onAddSubmission: (newItem: Omit<CommunitySubmission, 'id' | 'createdAt' | 'likes'>) => void;
  onToggleLike: (id: string) => void;
  onPlayMoodPreview: (playlist: Playlist, track?: Track) => void;
}

const WEATHER_OPTIONS: WeatherKey[] = ['clear', 'rain', 'cloudy', 'snow', 'dawn'];

export function RecommendPage({
  submissions,
  onAddSubmission,
  onToggleLike,
  onPlayMoodPreview,
}: RecommendPageProps) {
  const [weather, setWeather] = useState<WeatherKey>('rain');
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [nickname, setNickname] = useState('');
  const [comment, setComment] = useState('');
  const [filterWeather, setFilterWeather] = useState<WeatherKey | 'all'>('all');
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !artist.trim() || !comment.trim()) {
      setFormError('곡 제목, 아티스트, 추천 한마디를 모두 입력해 주세요.');
      return;
    }

    setFormError('');
    onAddSubmission({
      weather,
      songTitle: songTitle.trim(),
      artist: artist.trim(),
      nickname: nickname.trim() || '익명의 리스너',
      comment: comment.trim(),
    });

    setSongTitle('');
    setArtist('');
    setNickname('');
    setComment('');
    setSubmittedNotice(true);
    window.setTimeout(() => setSubmittedNotice(false), 3500);
  };

  const filteredSubmissions =
    filterWeather === 'all'
      ? submissions
      : submissions.filter((item) => item.weather === filterWeather);

  return (
    <div className="space-y-10 pt-8 pb-16 sm:pt-12">
      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          커뮤니티 참여형 큐레이션 게시판
        </p>
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
          날씨와 어울리는 나만의 곡을 추천해 주세요
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          비 오는 날, 혹은 새벽 공기가 차가운 날 가장 먼저 떠오르는 노래를 제보하면 아래 피드에 즉시 등록되어 다른 방문자들과 나눌 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Submission Form */}
        <section className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#1E1E1E] dark:shadow-none"
          >
            <div className="border-b border-zinc-200 pb-4 dark:border-white/[0.08]">
              <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-white">
                플레이리스트 추천 · 제보
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                작성한 추천곡은 브라우저에 저장되어 새로고침 후에도 유지됩니다.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rec-weather" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                어울리는 날씨 선택
              </label>
              <select
                id="rec-weather"
                value={weather}
                onChange={(e) => setWeather(e.target.value as WeatherKey)}
                className="h-11 w-full rounded-lg border border-zinc-300 bg-[#F7F6F2] px-3.5 text-sm text-zinc-900 focus:border-[#1DB954] focus:outline-none dark:border-white/10 dark:bg-[#121212] dark:text-white cursor-pointer"
              >
                {WEATHER_OPTIONS.map((key) => (
                  <option key={key} value={key}>
                    {WEATHER_THEMES[key].label} ({WEATHER_THEMES[key].englishLabel})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="rec-song" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  곡 제목
                </label>
                <input
                  id="rec-song"
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="예: Rainy Day"
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-[#F7F6F2] px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1DB954] focus:outline-none dark:border-white/10 dark:bg-[#121212] dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="rec-artist" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  아티스트
                </label>
                <input
                  id="rec-artist"
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="예: 백예린"
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-[#F7F6F2] px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1DB954] focus:outline-none dark:border-white/10 dark:bg-[#121212] dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rec-nickname" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                작성자 닉네임 (선택)
              </label>
              <input
                id="rec-nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 새벽산책자"
                className="h-11 w-full rounded-lg border border-zinc-300 bg-[#F7F6F2] px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1DB954] focus:outline-none dark:border-white/10 dark:bg-[#121212] dark:text-white dark:placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rec-comment" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                추천 한마디
              </label>
              <textarea
                id="rec-comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="이 날씨에 이 곡이 왜 잘 어울리는지 들려주세요."
                className="w-full rounded-lg border border-zinc-300 bg-[#F7F6F2] p-3.5 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-[#1DB954] focus:outline-none dark:border-white/10 dark:bg-[#121212] dark:text-white dark:placeholder:text-zinc-500"
              />
            </div>

            {formError && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
                {formError}
              </p>
            )}

            {submittedNotice && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-medium text-emerald-700 dark:text-[#1DB954]">
                추천곡이 성공적으로 피드에 등록되었습니다.
              </div>
            )}

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1DB954] px-5 text-sm font-semibold text-black transition-transform duration-150 hover:bg-[#1ed760] active:scale-[0.99] cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>추천곡 등록하기</span>
            </button>
          </form>
        </section>

        {/* Right: Community Recommendation Cards Feed */}
        <section className="space-y-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-white">
              방문자 추천 피드 ({filteredSubmissions.length})
            </h2>

            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-white/[0.06] dark:bg-[#1E1E1E]">
              <button
                type="button"
                onClick={() => setFilterWeather('all')}
                className={`relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filterWeather === 'all'
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {filterWeather === 'all' && (
                  <motion.span
                    layoutId="recommend-filter-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                    className="absolute inset-0 rounded-md bg-zinc-100 dark:bg-[#27272A]"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">전체</span>
              </button>
              {WEATHER_OPTIONS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilterWeather(key)}
                  className={`relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    filterWeather === key
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {filterWeather === key && (
                    <motion.span
                      layoutId="recommend-filter-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                      className="absolute inset-0 rounded-md bg-zinc-100 dark:bg-[#27272A]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{WEATHER_THEMES[key].label}</span>
                </button>
              ))}
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center dark:border-white/[0.08] dark:bg-[#1E1E1E]">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                선택한 날씨에 등록된 추천곡이 아직 없습니다. 첫 번째 곡을 추천해 보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {filteredSubmissions.map((item) => {
                  const itemTheme = WEATHER_THEMES[item.weather];
                  const matchingPlaylist =
                    PLAYLISTS.find((p) => p.weather === item.weather) ?? PLAYLISTS[0];
                  const youtubeQueryUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${item.artist} ${item.songTitle}`
                  )}`;
                  const spotifyQueryUrl = `https://open.spotify.com/search/${encodeURIComponent(
                    `${item.artist} ${item.songTitle}`
                  )}`;

                  return (
                    <motion.article
                      layout
                      key={item.id}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 dark:border-white/[0.08] dark:bg-[#1E1E1E] dark:shadow-none dark:hover:border-white/15"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-2 font-medium">
                          <span style={{ color: itemTheme.accentHex }}>{itemTheme.label}</span>
                          <span className="text-zinc-300 dark:text-zinc-600" aria-hidden="true">·</span>
                          <span className="text-zinc-700 dark:text-zinc-300">{item.nickname}</span>
                        </div>
                        <span className="font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
                          {item.createdAt}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <h3 className="font-display text-lg font-semibold text-zinc-900 dark:text-white">
                          {item.songTitle}
                          <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
                            — {item.artist}
                          </span>
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                          {item.comment}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-3 dark:border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onToggleLike(item.id)}
                            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors cursor-pointer ${
                              item.likedByMe
                                ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:text-white'
                            }`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${item.likedByMe ? 'fill-current' : ''}`} />
                            <span className="font-mono tabular-nums">{item.likes}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onPlayMoodPreview(matchingPlaylist)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-300 px-3 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:text-white cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>{itemTheme.label} 무드 듣기</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                          <a
                            href={spotifyQueryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white"
                          >
                            <span>Spotify</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <a
                            href={youtubeQueryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white"
                          >
                            <span>YouTube</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
