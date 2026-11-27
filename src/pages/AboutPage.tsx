import { CheckCircle2, CloudSun, Code2, Music2, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { TEAM_MEMBERS, WEATHER_THEMES } from '../data/curationData';
import { BugReport, WeatherKey } from '../types/music';
import { WeatherIcon } from '../components/WeatherIcon';

interface AboutPageProps {
  onReportBug: (report: Omit<BugReport, 'id' | 'createdAt'>) => void;
}

const WEATHER_ORDER: WeatherKey[] = ['clear', 'rain', 'cloudy', 'snow', 'dawn'];

export function AboutPage({ onReportBug }: AboutPageProps) {
  const [category, setCategory] = useState('날씨 API/데이터 오류');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sentNotice, setSentNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReportSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('제보하실 내용이나 개선 의견을 입력해 주세요.');
      return;
    }
    setErrorMsg('');
    onReportBug({
      category,
      email: email.trim() || '미입력',
      message: message.trim(),
    });
    setEmail('');
    setMessage('');
    setSentNotice(true);
    window.setTimeout(() => setSentNotice(false), 3500);
  };

  return (
    <div className="space-y-16 pt-8 pb-16 sm:pt-12">
      {/* 1. Editorial Intro */}
      <section className="max-w-3xl space-y-4">
        <p className="text-xs font-medium text-[#1DB954]">서비스 소개 및 큐레이션 가이드</p>
        <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
          오늘의 하늘빛과 온도를 소리로 번역하는 음악 웹진, MY VIBE
        </h1>
        <p className="text-base leading-relaxed text-zinc-300">
          MY VIBE는 기상 조건에 따라 달라지는 사람의 감정선과 집중도에 주목한 날씨 기반 음악 큐레이션 프로젝트입니다.
          단순한 차트 나열이 아니라, 실시간 기상 데이터와 음악의 템포(BPM)·악기 질감을 매칭해 지금 이 순간 가장 듣기 좋은 사운드를 제안합니다.
        </p>
      </section>

      {/* 2. Weather-to-Music Curation Criteria Matrix */}
      <section className="space-y-5 border-t border-white/[0.08] pt-12">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold text-white">날씨별 큐레이션 기준</h2>
          <p className="text-sm text-zinc-400">
            각 기상 상태에 맞춰 선곡할 때 적용한 BPM 범위와 핵심 사운드 기준입니다.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#1E1E1E]">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-white/[0.08] bg-[#161618] text-xs text-zinc-400">
              <tr>
                <th className="px-5 py-3.5 font-medium">날씨 무드</th>
                <th className="px-5 py-3.5 font-medium">목표 BPM</th>
                <th className="px-5 py-3.5 font-medium">주요 악기 및 톤</th>
                <th className="px-5 py-3.5 font-medium">추천 청취 상황</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {WEATHER_ORDER.map((key) => {
                const item = WEATHER_THEMES[key];
                return (
                  <tr key={key} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span style={{ color: item.accentHex }}>
                          <WeatherIcon weather={key} className="h-4 w-4" />
                        </span>
                        <span>{item.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-zinc-300 tabular-nums whitespace-nowrap">
                      {item.bpmTarget}
                    </td>
                    <td className="px-5 py-4 text-xs leading-relaxed text-zinc-300">
                      {item.instruments}
                    </td>
                    <td className="px-5 py-4 text-xs leading-relaxed text-zinc-400">
                      {item.listeningScene}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Open API & Attribution */}
      <section className="grid grid-cols-1 gap-6 border-t border-white/[0.08] pt-12 md:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-[#1E1E1E] p-5 space-y-2">
          <CloudSun className="h-5 w-5 text-[#1DB954]" aria-hidden="true" />
          <h3 className="font-display text-base font-semibold text-white">실시간 날씨 오픈 API</h3>
          <p className="text-xs leading-relaxed text-zinc-400">
            Open-Meteo Weather Forecast API를 연동하여 선택한 도시의 기온, 체감온도, 습도, 풍속 및 WMO 기상 코드를 실시간으로 받아옵니다.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#1E1E1E] p-5 space-y-2">
          <Music2 className="h-5 w-5 text-[#A855F7]" aria-hidden="true" />
          <h3 className="font-display text-base font-semibold text-white">음원 연결 및 오디오 미리듣기</h3>
          <p className="text-xs leading-relaxed text-zinc-400">
            하단 미니 플레이어는 Web Audio API 신시사이저로 날씨별 분위기 코드를 연주하며, 전체 곡은 Spotify 및 YouTube 공식 임베드·검색 링크로 연결됩니다.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#1E1E1E] p-5 space-y-2">
          <Code2 className="h-5 w-5 text-[#60A5FA]" aria-hidden="true" />
          <h3 className="font-display text-base font-semibold text-white">반응형 다크 모드 UI</h3>
          <p className="text-xs leading-relaxed text-zinc-400">
            장시간 감상해도 눈이 편안한 딥 차콜(#121212) 기반 위에 날씨별 포인트 컬러를 적용해 PC와 모바일 환경 모두에 최적화했습니다.
          </p>
        </div>
      </section>

      {/* 4. Team & Bug Report Form */}
      <section className="grid grid-cols-1 gap-10 border-t border-white/[0.08] pt-12 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-white">제작자 소개</h2>
            <p className="text-sm text-zinc-400">MY VIBE 웹진 프로젝트를 기획하고 구현한 팀원들입니다.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TEAM_MEMBERS.map((member) => (
              <article
                key={member.name}
                className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#1E1E1E] p-5"
              >
                <div className="space-y-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] font-display text-base font-bold text-white">
                    {member.name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">{member.name}</h3>
                    <p className="text-xs text-[#1DB954]">{member.role}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-400">{member.bio}</p>
                </div>

                <div className="mt-4 border-t border-white/[0.06] pt-3 text-xs text-zinc-400 space-y-0.5">
                  <p className="text-zinc-300">{member.favoriteWeather}</p>
                  <p className="text-zinc-500">{member.favoriteGenre}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Bug / Feedback Report Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleReportSubmit}
            className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6"
          >
            <div>
              <h2 className="font-display text-xl font-bold text-white">오류 제보 및 피드백</h2>
              <p className="mt-1 text-xs text-zinc-400">
                링크 오류, 화면 깨짐, 큐레이션 제안을 남겨주세요.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bug-category" className="block text-xs font-medium text-zinc-300">
                문의 유형
              </label>
              <select
                id="bug-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-[#121212] px-3 text-sm text-white focus:border-[#1DB954] focus:outline-none cursor-pointer"
              >
                <option value="날씨 API/데이터 오류">날씨 API/데이터 오류</option>
                <option value="플레이리스트/링크 오류">플레이리스트/링크 오류</option>
                <option value="UI/반응형 화면 제보">UI/반응형 화면 제보</option>
                <option value="기타 의견 제안">기타 의견 제안</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bug-email" className="block text-xs font-medium text-zinc-300">
                회신 받을 이메일 (선택)
              </label>
              <input
                id="bug-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="h-11 w-full rounded-lg border border-white/10 bg-[#121212] px-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#1DB954] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bug-message" className="block text-xs font-medium text-zinc-300">
                내용
              </label>
              <textarea
                id="bug-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="발견하신 오류나 개선 아이디어를 적어주세요."
                className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#1DB954] focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-rose-400" role="alert">
                {errorMsg}
              </p>
            )}

            {sentNotice && (
              <div className="flex items-center gap-2 rounded-lg border border-[#1DB954]/40 bg-[#1DB954]/10 px-3 py-2 text-xs font-medium text-[#1DB954]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>소중한 제보가 접수되었습니다. 감사합니다!</span>
              </div>
            )}

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white text-sm font-semibold text-black transition-colors hover:bg-zinc-200 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>제보 보내기</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
