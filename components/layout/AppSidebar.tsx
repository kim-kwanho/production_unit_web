"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconFactory, IconHome, IconOop } from "./NavIcons";
import { useSidebar } from "./SidebarContext";

const NAV_ITEMS = [
  { href: "/", label: "Home", subtitle: "시작", Icon: IconHome },
  { href: "/studio", label: "Studio", subtitle: "한 화면 시연", Icon: IconHome },
  { href: "/oop-lab", label: "OOP Lab", subtitle: "상속·다형성", Icon: IconOop },
  {
    href: "/dashboard",
    label: "Dashboard",
    subtitle: "라인 시뮬레이션",
    Icon: IconFactory,
  },
] as const;

export default function AppSidebar() {
  const pathname = usePathname();
  const { expanded } = useSidebar();

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-slate-800 dark:bg-slate-900 ${
        expanded ? "w-[var(--sidebar-width)]" : "w-14"
      }`}
    >
      <div
        className={`border-b border-slate-200 dark:border-slate-800 ${
          expanded ? "p-5" : "flex justify-center py-4"
        }`}
      >
        {expanded ? (
          <>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Smart Factory
            </p>
            <h1 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              OOP
            </h1>
          </>
        ) : (
          <span
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400"
            title="Smart Factory OOP"
          >
            SF
          </span>
        )}
      </div>

      <nav className={`flex flex-1 flex-col gap-1 ${expanded ? "p-3" : "p-2"}`}>
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!expanded ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg transition-colors ${
                expanded ? "px-3 py-3" : "justify-center p-2.5"
              } ${
                active
                  ? "bg-emerald-600/15 text-emerald-700 ring-1 ring-emerald-500/40 dark:bg-emerald-600/20 dark:text-emerald-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {expanded && (
                <div className="min-w-0">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.subtitle}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {expanded && (
        <div className="border-t border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800">
          OOP · Next.js
        </div>
      )}
    </aside>
  );
}
