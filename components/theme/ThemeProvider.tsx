"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  resolvedTheme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("sf-oop-theme");
  if (saved === "light" || saved === "dark") return saved;
  // migrate old "auto" (or missing) to current system preference once
  const m = window.matchMedia?.("(prefers-color-scheme: dark)");
  return m?.matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("sf-oop-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, resolvedTheme: theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
