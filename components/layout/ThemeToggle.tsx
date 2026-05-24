"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      aria-label={theme === "dark" ? "라이트 모드" : "다크 모드"}
    >
      {theme === "dark" ? "☀ 라이트" : "🌙 다크"}
    </button>
  );
}
