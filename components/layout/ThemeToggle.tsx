"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "다크" : "라이트";

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      aria-label="테마 전환 (다크/라이트)"
      title="테마 전환"
      className="border border-slate-200 bg-white/70 backdrop-blur hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-800"
    >
      테마: {label}
    </Button>
  );
}
