"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_OPEN = "sf-dashboard-onboarding-open";

const STEPS = [
  "전체 가동으로 유닛을 켭니다. (전체 정지로 끔)",
  "제품 ID 또는 프리셋 선택 후 파이프라인 실행",
  "픽셀 라인 맵(색상)과 Message Log로 결과 확인",
  "유닛 추가·unit_count로 라인·효율 변화 비교",
] as const;

const DETAILS = [
  "초록=가동 · 노랑=정지 · 빨강=마지막 실패 유닛",
  "처리 순서: 라인 왼쪽→오른쪽",
  "효율: 최근 60초 (완제품/에너지)",
] as const;

export default function DashboardOnboarding({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_OPEN);
    if (saved === "1" || saved === "0") {
      setOpen(saved === "1");
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        localStorage.setItem(STORAGE_OPEN, "0");
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        localStorage.setItem(STORAGE_OPEN, "0");
      }
    };

    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const setOpenPersist = (next: boolean) => {
    setOpen(next);
    localStorage.setItem(STORAGE_OPEN, next ? "1" : "0");
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        onClick={() => setOpenPersist(!open)}
        variant={open ? "primary" : "ghost"}
        size="sm"
        className={`h-8 shrink-0 ${compact ? "text-[11px]" : ""}`}
        aria-expanded={open}
        aria-controls="dashboard-onboarding-panel"
      >
        {open ? "사용법 닫기" : "1분 사용법"}
      </Button>

      {open && (
        <aside
          id="dashboard-onboarding-panel"
          className={`absolute z-30 overflow-hidden rounded-lg border border-emerald-500/30 bg-white shadow-lg dark:border-emerald-700/40 dark:bg-slate-900 ${
            compact
              ? "right-0 top-[calc(100%+0.35rem)] w-[min(17rem,calc(100vw-1.5rem))]"
              : "right-0 top-[calc(100%+0.35rem)] w-72"
          }`}
        >
          <div className="border-b border-emerald-500/20 bg-emerald-50/90 px-3 py-2 dark:border-emerald-800/40 dark:bg-emerald-950/50">
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">
              Dashboard — 1분 사용법
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-900/70 dark:text-emerald-200/75">
              가동 → 실행 → 해석
            </p>
          </div>

          <div className="max-h-[min(18rem,50vh)] overflow-y-auto px-3 py-2">
            <ol className="list-inside list-decimal space-y-1.5 text-[11px] leading-snug text-slate-800 dark:text-slate-100">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <ul className="mt-2.5 space-y-1 border-t border-slate-200/80 pt-2.5 text-[10px] leading-snug text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {DETAILS.map((d) => (
                <li key={d} className="flex gap-1.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/80" />
                  <span className="min-w-0">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
