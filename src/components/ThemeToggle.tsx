import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700
                 text-slate-700 dark:text-slate-200
                 hover:bg-white dark:hover:bg-slate-700
                 hover:border-emerald-500/60 dark:hover:border-emerald-500/60
                 active:scale-95
                 transition-all duration-200
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
    >
      {isDark ? (
        // Sun (clicking switches to light)
        <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current" width="18" height="18">
          <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-5a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 17a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM3 12a1 1 0 011-1h2a1 1 0 110 2H4a1 1 0 01-1-1zm15 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM5.64 5.64a1 1 0 011.41 0l1.42 1.42A1 1 0 117.05 8.46L5.64 7.05a1 1 0 010-1.41zm10.9 10.9a1 1 0 011.41 0l1.42 1.42a1 1 0 11-1.42 1.41l-1.41-1.41a1 1 0 010-1.42zm1.41-10.9a1 1 0 010 1.41l-1.41 1.42a1 1 0 01-1.42-1.42l1.42-1.41a1 1 0 011.41 0zM7.05 16.54a1 1 0 010 1.42l-1.41 1.41a1 1 0 11-1.42-1.41l1.42-1.42a1 1 0 011.41 0z" />
        </svg>
      ) : (
        // Moon (clicking switches to dark)
        <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current" width="18" height="18">
          <path d="M21.64 13.01A9 9 0 1110.99 2.36a1 1 0 011.13 1.39A7 7 0 0020.25 11.88a1 1 0 011.39 1.13z" />
        </svg>
      )}
    </button>
  );
}
