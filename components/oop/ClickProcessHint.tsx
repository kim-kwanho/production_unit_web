"use client";

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  computeHintScreenPosition,
  HINT_TOOLTIP_HEIGHT,
  HINT_TOOLTIP_WIDTH,
  type HintPlacement,
} from "./hintPosition";
import type { ClickHintAnchor } from "./oopClickHint";

const DEFAULT_DISMISS_MS = 6500;

function caretPositionClass(placement: HintPlacement): string {
  switch (placement) {
    case "left":
      return "right-0 top-5 translate-x-1/2";
    case "below":
      return "left-8 top-0 -translate-y-1/2";
    default:
      return "left-0 top-5 -translate-x-1/2";
  }
}

export default function ClickProcessHint({
  hint,
  onDismiss,
  autoDismissMs = DEFAULT_DISMISS_MS,
}: {
  hint: ClickHintAnchor | null;
  onDismiss: () => void;
  /** null이면 호버 중처럼 자동 닫힘 없음 */
  autoDismissMs?: number | null;
}) {
  const layout = useMemo(() => {
    if (!hint || typeof window === "undefined") return null;
    const pos = computeHintScreenPosition(
      hint.anchorRect,
      hint.clientX,
      hint.clientY,
      HINT_TOOLTIP_WIDTH,
      HINT_TOOLTIP_HEIGHT,
    );
    return pos;
  }, [hint]);

  useEffect(() => {
    if (!hint) return;
    const timer =
      autoDismissMs != null
        ? window.setTimeout(onDismiss, autoDismissMs)
        : undefined;
    const onScroll = () => onDismiss();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onDismiss);
    window.addEventListener("keydown", onKey);
    return () => {
      if (timer != null) window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onDismiss);
      window.removeEventListener("keydown", onKey);
    };
  }, [hint, onDismiss, autoDismissMs]);

  if (!hint || !layout) return null;

  const variant = hint.content.variant;
  const boxClass =
    variant === "override"
      ? "border-2 border-emerald-600 bg-emerald-50 text-emerald-950 shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-2 ring-white/80 dark:border-emerald-400 dark:bg-emerald-950 dark:text-emerald-50 dark:ring-slate-900/80"
      : variant === "override-fail"
        ? "border-2 border-red-600 bg-red-50 text-red-950 shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-2 ring-white/80 dark:border-red-400 dark:bg-red-950 dark:text-red-50 dark:ring-slate-900/80"
        : "border-2 border-slate-500 bg-white text-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-2 ring-white/80 dark:border-slate-400 dark:bg-slate-800 dark:text-slate-50 dark:ring-slate-900/80";

  const footerClass =
    variant === "override-fail"
      ? "border-red-300 text-red-900 dark:border-red-700 dark:text-red-100"
      : "border-emerald-300 text-emerald-900 dark:border-emerald-700 dark:text-emerald-100";

  const caretColors =
    variant === "override"
      ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950"
      : variant === "override-fail"
        ? "border-red-600 bg-red-50 dark:border-red-400 dark:bg-red-950"
        : "border-slate-500 bg-white dark:border-slate-400 dark:bg-slate-800";

  const specPanelClass =
    variant === "override"
      ? "bg-emerald-100 dark:bg-emerald-900"
      : variant === "override-fail"
        ? "bg-red-100 dark:bg-red-900"
        : "bg-slate-100 dark:bg-slate-700";

  const specRows = hint.content.specRows ?? [];
  const compact = hint.content.compact ?? false;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed z-[200] max-h-[min(168px,calc(100vh-32px))] animate-log-entry"
      style={{ left: layout.left, top: layout.top, width: HINT_TOOLTIP_WIDTH }}
    >
      <div className="relative">
        <span
          aria-hidden
          className={`absolute h-2.5 w-2.5 rotate-45 border-2 ${caretColors} ${caretPositionClass(layout.placement)}`}
        />
        <div
          className={`rounded-lg px-2.5 py-2 ${boxClass} ${
            compact ? "" : "max-h-[min(300px,calc(100vh-32px))] overflow-y-auto px-3 py-2.5"
          }`}
        >
          {!compact && (
            <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">
              유닛 정보
            </p>
          )}
          <p className={`font-semibold leading-snug ${compact ? "text-xs" : "mt-1 text-xs"}`}>
            {hint.content.title}
          </p>
          {hint.content.subtitle && (
            <p
              className={`mt-0.5 leading-snug text-inherit/90 ${
                compact ? "text-[11px] font-semibold text-emerald-800 dark:text-emerald-200" : "text-[11px] font-medium"
              }`}
            >
              {hint.content.subtitle}
            </p>
          )}

          {specRows.length > 0 && (
            <dl
              className={`space-y-0.5 rounded-md border border-current/25 px-2 py-1.5 ${specPanelClass} ${
                compact ? "mt-1.5" : "mt-2 px-2.5 py-2"
              }`}
            >
              {hint.content.specCaption && (
                <dt className="mb-0.5 text-[9px] font-medium uppercase tracking-wide opacity-60">
                  {hint.content.specCaption}
                </dt>
              )}
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-1.5 text-[11px] leading-snug ${
                    row.highlight ? "font-bold" : ""
                  }`}
                >
                  <dt className="text-right font-medium">{row.label}</dt>
                  <dd className="font-mono text-[10.5px]">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {hint.content.lines.length > 0 && (
            <p
              className={`text-[11px] font-semibold leading-snug ${
                specRows.length > 0 ? "mt-1.5 border-t border-current/25 pt-1.5" : "mt-1"
              }`}
            >
              {hint.content.lines.join(" · ")}
            </p>
          )}

          {!compact && variant !== "info" && (
            <p
              className={`mt-2 flex items-center gap-1 border-t pt-2 text-[10px] font-medium ${footerClass}`}
            >
              <span aria-hidden>→</span>
              <span>오른쪽 「실행 결과」 패널</span>
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
