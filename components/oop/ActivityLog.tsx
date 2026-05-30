"use client";

import { memo, useLayoutEffect, useRef } from "react";
import type { LogEntry } from "@/domain/types";

interface ActivityLogProps {
  entries: LogEntry[];
  compact?: boolean;
  /** flex-1로 남은 공간을 채우고 내부만 스크롤 */
  fill?: boolean;
  title?: string;
}

const LEVEL_TEXT: Record<LogEntry["level"], string> = {
  info: "text-slate-600 dark:text-slate-300",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
};

const LEVEL_ROW: Record<LogEntry["level"], string> = {
  info: "border-l-slate-400 bg-slate-50/60 dark:border-l-slate-500 dark:bg-slate-800/40",
  success:
    "border-l-emerald-500 bg-emerald-50/60 dark:border-l-emerald-400 dark:bg-emerald-950/30",
  warning:
    "border-l-amber-500 bg-amber-50/60 dark:border-l-amber-400 dark:bg-amber-950/30",
  error: "border-l-red-500 bg-red-50/60 dark:border-l-red-400 dark:bg-red-950/30",
};

function ActivityLog({
  entries,
  compact = false,
  fill = false,
  title = "실행 결과 (다형성 증명)",
}: ActivityLogProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLLIElement | null>(null);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [entries]);

  const heightClass = fill
    ? "min-h-0 flex-1"
    : compact
      ? "h-[200px]"
      : "h-[240px]";

  return (
    <div
      className={`flex ${heightClass} flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80`}
    >
      <div className="shrink-0 border-b border-slate-200 px-2.5 py-1.5 dark:border-slate-700">
        <h3 className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </h3>
        {!compact && (
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
            구현 클래스 클릭 시 같은 process() 호출, 클래스마다 다른 결과
          </p>
        )}
      </div>
      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-y-auto p-2 font-mono text-[11px]"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {entries.length === 0 ? (
          <div className="space-y-1.5 text-slate-500 dark:text-slate-400">
            <p className="font-medium text-slate-600 dark:text-slate-300">
              아직 실행 결과가 없습니다
            </p>
            <p>
              왼쪽 상속 뷰에서{" "}
              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                초록색 구현 카드
              </span>
              (Conveyor / Robot / Inspection)를 클릭하세요.
            </p>
            <p className="text-[10px]">
              클래스마다 전용 데모 item(Conveyor→P-JAM, Robot→P-HEAVY, Inspection→P-DEFECT)으로
              process()가 실행되고 결과가 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {entries.map((entry, i) => (
              <li
                key={`${entry.time}-${i}`}
                ref={i === entries.length - 1 ? bottomRef : undefined}
                className={`animate-log-entry flex gap-2 rounded-r border-l-[3px] px-2 py-0.5 ${LEVEL_ROW[entry.level]}`}
              >
                <span className="shrink-0 text-slate-400">[{entry.time}]</span>
                <span className={LEVEL_TEXT[entry.level]}>{entry.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default memo(ActivityLog);
