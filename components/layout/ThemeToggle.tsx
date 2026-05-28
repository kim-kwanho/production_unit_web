"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme, resolvedTheme } = useTheme();
  const label =
    theme === "auto"
      ? `자동 (${resolvedTheme === "dark" ? "다크" : "라이트"})`
      : theme === "dark"
        ? "다크"
        : "라이트";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      aria-label="테마 전환 (자동/다크/라이트)"
    >
      테마: {label}
    </button>
  );
}
