"use client";

import { useSidebar } from "./SidebarContext";

export default function SidebarToggle() {
  const { expanded, toggle } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      className="mr-3 rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label={expanded ? "사이드바 접기" : "사이드바 펼치기"}
      aria-expanded={expanded}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
