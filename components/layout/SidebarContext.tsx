"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "sf-sidebar-expanded";

interface SidebarContextValue {
  expanded: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function readExpanded(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) !== "0";
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setExpanded(readExpanded());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, expanded ? "1" : "0");
    document.documentElement.style.setProperty(
      "--sidebar-width",
      expanded ? "240px" : "3.5rem",
    );
  }, [expanded]);

  const toggle = useCallback(() => {
    setExpanded((e) => !e);
  }, []);

  return (
    <SidebarContext.Provider value={{ expanded, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}
