"use client";

import type { LogEntry } from "@/domain/types";

interface ActivityLogProps {
  entries: LogEntry[];
  compact?: boolean;
}

const LEVEL_STYLES: Record<LogEntry["level"], string> = {
  info: "text-slate-600 dark:text-slate-300",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
};

export default function ActivityLog({
  entries,
  compact = false,
}: ActivityLogProps) {
  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80 ${
        compact ? "min-h-[140px]" : "min-h-[200px]"
      }`}
    >
      <div className="shrink-0 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
        <h3 className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Activity Log
        </h3>
      </div>
      <div
        className="flex-1 overflow-y-auto p-2 font-mono text-[11px]"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {entries.length === 0 ? (
          <p className="text-slate-500">
            구현 클래스를 클릭하거나 프리셋을 선택하세요.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {entries.map((entry, i) => (
              <li key={`${entry.time}-${i}`} className="flex gap-2">
                <span className="shrink-0 text-slate-400">[{entry.time}]</span>
                <span className={LEVEL_STYLES[entry.level]}>{entry.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
