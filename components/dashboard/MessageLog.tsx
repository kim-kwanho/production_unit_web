"use client";

import type { LogEntry } from "@/domain/types";

interface MessageLogProps {
  entries: LogEntry[];
}

const LEVEL_STYLES: Record<LogEntry["level"], string> = {
  info: "text-slate-600 dark:text-slate-300",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
};

export default function MessageLog({ entries }: MessageLogProps) {
  return (
    <div className="flex min-h-[200px] flex-1 flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Message Log
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {entries.length === 0 ? (
          <p className="text-slate-500">
            파이프라인 실행 로그가 여기에 표시됩니다.
          </p>
        ) : (
          <ul className="space-y-2">
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
