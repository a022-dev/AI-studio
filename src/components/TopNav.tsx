import { motion } from 'motion/react';
import { PageId } from '../types/music';

interface TopNavProps {
  activePage: PageId;
  themeMode: 'light' | 'dark';
  onNavigate: (page: PageId) => void;
  onToggleTheme: () => void;
}

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: 'main', label: '메인' },
  { id: 'explore', label: '날씨별 탐색' },
  { id: 'recommend', label: '추천·제보' },
  { id: 'about', label: '서비스 소개' },
];

export function TopNav({ activePage, themeMode, onNavigate, onToggleTheme }: TopNavProps) {
  const handleSelect = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="relative md:sticky top-0 z-40 border-b border-zinc-200 dark:border-white/[0.08] bg-[#F7F6F2]/90 dark:bg-[#121212]/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 md:h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('main')}
          className="font-display text-lg md:text-xl font-bold tracking-tight text-zinc-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954] rounded"
        >
          MY VIBE
        </button>

        {/* Zone 2: 4 clean single-line text navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7" aria-label="주 메뉴">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954] rounded ${
                  isActive
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-[#16A34A] dark:bg-[#1DB954]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Desktop primary CTA / Mobile compact theme switch */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect('recommend')}
            className="hidden md:inline-flex items-center justify-center rounded-lg bg-[#1DB954] px-4 py-2 text-xs font-semibold text-black whitespace-nowrap shrink-0 cursor-pointer transition-transform duration-150 hover:bg-[#1ed760] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
          >
            곡 추천하기
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex md:hidden min-h-[40px] items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-800 dark:border-white/15 dark:bg-[#1E1E1E] dark:text-zinc-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {themeMode === 'dark' ? '라이트 모드' : '다크 모드'}
          </button>
        </div>
      </div>
    </header>
  );
}
