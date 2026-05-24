"use client";

import { usePathname } from "next/navigation";
import SidebarToggle from "./SidebarToggle";
import ThemeToggle from "./ThemeToggle";

const PAGE_TITLES: Record<string, string> = {
  "/": "Smart Factory OOP",
  "/oop-lab": "OOP Lab",
  "/dashboard": "Factory Dashboard",
};

export default function AppHeader() {
  const pathname = usePathname();
  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/oop-lab")
      ? "OOP Lab"
      : pathname.startsWith("/dashboard")
        ? "Factory Dashboard"
        : "Smart Factory OOP");

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex min-w-0 items-center">
        <SidebarToggle />
        <h1 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
