"use client";

import ActivityLog from "./ActivityLog";
import OopOnboarding from "./OopOnboarding";
import type { LogEntry, ProductPreset } from "@/domain/types";
import { PRODUCT_PRESETS } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useEffect, useState } from "react";

const PRIMARY_PRESETS: ProductPreset[] = ["P1", "P-JAM"];

interface OopSidePanelProps {
  logs: LogEntry[];
  selectedPreset: ProductPreset;
  selectedNodeLabel: string | null;
  canControlUnit: boolean;
  onPresetClick: (preset: ProductPreset) => void;
  onRunSelected: () => void;
  onRunDemo: () => void;
  onStartSelected: () => void;
  onStopSelected: () => void;
  onReset: () => void;
  plantEnergy: string;
  compact?: boolean;
}

export default function OopSidePanel({
  logs,
  selectedPreset,
  selectedNodeLabel,
  canControlUnit,
  onPresetClick,
  onRunSelected,
  onRunDemo,
  onStartSelected,
  onStopSelected,
  onReset,
  plantEnergy,
  compact = false,
}: OopSidePanelProps) {
  const [simpleMode, setSimpleMode] = useState(true);
  const [showMoreItems, setShowMoreItems] = useState(false);
  const [panel, setPanel] = useState<"control" | "log">("control");

  useEffect(() => {
    const saved = localStorage.getItem("sf-oop-simple-mode");
    if (saved === "0") setSimpleMode(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("sf-oop-simple-mode", simpleMode ? "1" : "0");
  }, [simpleMode]);

  return (
    <aside className="flex h-full min-h-[calc(100vh-8rem)] flex-col">
      <Card className="flex h-full flex-col dark:bg-slate-900/70">
        <CardContent className={`flex min-h-0 flex-1 flex-col ${compact ? "p-3" : "p-4"}`}>
          {!compact && <OopOnboarding />}

          {compact && (
            <div className="mb-2 flex flex-wrap gap-1 text-[11px]">
              {(
                [
                  { id: "control", label: "실행" },
                  { id: "log", label: "로그" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPanel(t.id)}
                  className={`rounded-full px-2 py-1 transition-colors ${
                    panel === t.id
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <span className="ml-auto flex items-center text-[11px] text-slate-500 dark:text-slate-400">
                {selectedNodeLabel ?? "선택 없음"}
              </span>
            </div>
          )}

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                선택된 클래스
              </p>
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {selectedNodeLabel ?? "아직 선택되지 않음"}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {canControlUnit
                  ? "구현 클래스 선택됨 → process() 실행 가능"
                  : "ADT/추상 클래스는 ‘설명용’ 노드입니다."}
              </p>
            </div>
            <Button
              onClick={() => setSimpleMode((v) => !v)}
              variant="secondary"
              size="sm"
              title="표시 옵션 전환"
              className={compact ? "hidden" : undefined}
            >
              {simpleMode ? "기본 모드" : "확장 모드"}
            </Button>
          </div>

          {compact && panel === "log" ? (
            <div className="min-h-0 flex-1">
              <ActivityLog entries={logs} compact />
            </div>
          ) : (
            <>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              입력(item) 선택
            </h2>
            {!compact && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              같은 process(item) 호출이 클래스마다 어떻게 달라지는지 확인하세요.
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {(showMoreItems ? PRODUCT_PRESETS : PRIMARY_PRESETS).map(
                (preset) => (
                <Button
                  key={preset}
                  onClick={() => onPresetClick(preset)}
                  variant={selectedPreset === preset ? "primary" : "secondary"}
                  size="sm"
                  className="rounded-full px-3"
                >
                  {preset}
                </Button>
                ),
              )}
              <Button
                onClick={() => setShowMoreItems((v) => !v)}
                variant="ghost"
                size="sm"
                className="rounded-full px-3"
                title="입력(item) 더보기"
              >
                {showMoreItems ? "접기" : "더보기"}
              </Button>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <Button
              onClick={onRunSelected}
              variant="primary"
              size="md"
              disabled={!canControlUnit}
              title={!canControlUnit ? "먼저 구현 클래스를 선택하세요" : undefined}
              className="flex-1"
            >
              process(&quot;{selectedPreset}&quot;) 실행
            </Button>
            <Button
              onClick={onRunDemo}
              variant="secondary"
              size="md"
              disabled={!canControlUnit}
              title={!canControlUnit ? "먼저 구현 클래스를 선택하세요" : undefined}
            >
              데모 실행
            </Button>
          </div>

          {!compact && (
            <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
              <p className="font-semibold">핵심 관찰 포인트</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                동일한{" "}
                <code className="font-mono text-emerald-700 dark:text-emerald-300">
                  process()
                </code>{" "}
                호출이라도, <b>선택한 구현 클래스</b>에 따라 로그 메시지가 달라집니다
                (오버라이딩/다형성).
              </p>
            </div>
          )}

          {!compact && !simpleMode && (
            <details className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40">
              <summary className="cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-200">
                확장 옵션(공장 요소)
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  onClick={onStartSelected}
                  variant="primary"
                  size="sm"
                  disabled={!canControlUnit}
                >
                  가동
                </Button>
                <Button
                  onClick={onStopSelected}
                  variant="warning"
                  size="sm"
                  disabled={!canControlUnit}
                >
                  정지
                </Button>
                <Button onClick={onReset} variant="secondary" size="sm">
                  세션 리셋
                </Button>
                <span className="ml-auto flex items-center text-[11px] text-slate-500 dark:text-slate-400">
                  에너지 {plantEnergy}
                </span>
              </div>
            </details>
          )}

          {!compact && (
            <div className="min-h-0 flex-1">
              <ActivityLog entries={logs} compact={compact} />
            </div>
          )}
            </>
          )}
        </CardContent>

        <CardFooter className={`${compact ? "px-3 py-2" : "px-4 py-3"}`}>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {simpleMode
              ? "기본 모드: 선택 → 실행 → 로그 확인"
              : "확장 모드: 가동/정지/에너지 포함"}
          </p>
          {simpleMode && (
            <Button onClick={onReset} variant="secondary" size="sm">
              세션 리셋
            </Button>
          )}
        </CardFooter>
      </Card>
    </aside>
  );
}
