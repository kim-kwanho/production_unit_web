"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { LogEntry } from "@/domain/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MessageLogProps {
  entries: LogEntry[];
  /** flex-1로 남은 공간을 채우고 내부만 스크롤 */
  fill?: boolean;
}

const LEVEL_STYLES: Record<LogEntry["level"], string> = {
  info: "text-slate-600 dark:text-slate-300",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
};

function MessageLog({ entries, fill = false }: MessageLogProps) {
  const [level, setLevel] = useState<LogEntry["level"] | "all">("all");
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    if (level === "all") return entries;
    return entries.filter((e) => e.level === level);
  }, [entries, level]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [filtered.length]);

  const heightClass = fill ? "min-h-0 flex-1" : "h-[320px]";

  return (
    <Card className={`flex ${heightClass} flex-col overflow-hidden`}>
      <CardHeader className="shrink-0 px-3 py-2">
        <div>
          <CardTitle className="text-xs">실행 로그</CardTitle>
          {!fill && (
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              라인은 왼쪽→오른쪽(유닛 순서)으로 처리되며, 로그는 그 순서대로 누적됩니다.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1 text-[11px]">
          {(["all", "info", "success", "warning", "error"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setLevel(k)}
              className={`rounded-full px-2 py-1 transition-colors ${
                level === k
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {k === "all"
                ? "전체"
                : k === "info"
                  ? "정보"
                  : k === "success"
                    ? "성공"
                    : k === "warning"
                      ? "경고"
                      : "에러"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-2">
        <div ref={scrollerRef} className="h-full overflow-y-auto font-mono text-xs">
          {filtered.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              {entries.length === 0
                ? "파이프라인 실행 로그가 여기에 표시됩니다."
                : "선택한 필터 조건에 해당하는 로그가 없습니다."}
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((entry, i) => (
                <li key={`${entry.time}-${i}`} className="flex gap-2">
                  <span className="shrink-0 text-slate-400">[{entry.time}]</span>
                  <span className={LEVEL_STYLES[entry.level]}>{entry.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(MessageLog);
