"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light" | "auto";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  resolvedTheme: Exclude<Theme, "auto">;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("sf-oop-theme");
  return saved === "light" || saved === "dark" || saved === "auto"
    ? saved
    : "auto";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("auto");
  const [resolvedTheme, setResolvedTheme] =
    useState<Exclude<Theme, "auto">>("dark");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const systemPrefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)",
    );

    const apply = (t: Exclude<Theme, "auto">) => {
      root.classList.remove("light", "dark");
      root.classList.add(t);
      setResolvedTheme(t);
    };

    if (theme === "auto") {
      const current = systemPrefersDark?.matches ? "dark" : "light";
      apply(current);

      const onChange = (e: MediaQueryListEvent) => {
        apply(e.matches ? "dark" : "light");
      };
      systemPrefersDark?.addEventListener?.("change", onChange);
      localStorage.setItem("sf-oop-theme", "auto");

      return () => {
        systemPrefersDark?.removeEventListener?.("change", onChange);
      };
    }

    apply(theme);
    localStorage.setItem("sf-oop-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      if (t === "auto") return "dark";
      if (t === "dark") return "light";
      return "auto";
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, resolvedTheme }}>
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
