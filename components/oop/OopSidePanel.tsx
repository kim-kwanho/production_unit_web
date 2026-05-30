"use client";

import ActivityLog from "./ActivityLog";
import ClassNodeDetailPanel from "./ClassNodeDetailPanel";
import type { ClassNodeData } from "./ClassNode";
import type { LogEntry, ProductPreset, UnitStatus } from "@/domain/types";
import { PRODUCT_PRESETS, RUNNING } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const RUN_LOADING_MS = 150;
const RESULT_BADGE_MS = 3000;
const QUICK_PRESETS: ProductPreset[] = ["P1", "P-JAM", "P-HEAVY", "P-DEFECT"];

function parsePlantEnergy(plantEnergy: string): { current: number; max: number } {
  const match = plantEnergy.match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (match) {
    return { current: parseFloat(match[1]), max: parseFloat(match[2]) };
  }
  return { current: 0, max: 100 };
}

function detectRunResult(logs: LogEntry[]): "success" | "fail" | null {
  for (let i = logs.length - 1; i >= 0; i -= 1) {
    const text = logs[i].text;
    if (text.includes("→ 성공")) return "success";
    if (text.includes("→ 실패")) return "fail";
  }
  return null;
}

interface OopSidePanelProps {
  logs: LogEntry[];
  selectedPreset: ProductPreset;
  selectedNode: ClassNodeData | null;
  selectedUnitStatus: UnitStatus | null;
  canControlUnit: boolean;
  onClearSelection?: () => void;
  onPresetClick: (preset: ProductPreset) => void;
  onRunSelected: () => void;
  onStartSelected: () => void;
  onStopSelected: () => void;
  onReset: () => void;
  plantEnergy: string;
  compact?: boolean;
}

export default function OopSidePanel({
  logs,
  selectedPreset,
  selectedNode,
  selectedUnitStatus,
  canControlUnit,
  onClearSelection,
  onPresetClick,
  onRunSelected,
  onStartSelected,
  onStopSelected,
  onReset,
  plantEnergy,
  compact = false,
}: OopSidePanelProps) {
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [lastResult, setLastResult] = useState<"success" | "fail" | null>(null);
  const awaitingResultRef = useRef(false);
  const logsLengthBeforeRunRef = useRef(0);

  const energyGauge = useMemo(() => parsePlantEnergy(plantEnergy), [plantEnergy]);
  const energyPct = Math.min(
    100,
    Math.max(0, (energyGauge.current / energyGauge.max) * 100),
  );

  const unitStopped =
    canControlUnit && selectedUnitStatus !== null && selectedUnitStatus !== RUNNING;

  const presetOptions = showAllPresets ? PRODUCT_PRESETS : QUICK_PRESETS;

  useEffect(() => {
    if (!awaitingResultRef.current) return;
    const newLogs = logs.slice(logsLengthBeforeRunRef.current);
    const result = detectRunResult(newLogs);
    if (!result) return;
    awaitingResultRef.current = false;
    setLastResult(result);
  }, [logs]);

  useEffect(() => {
    if (!lastResult) return;
    const timer = window.setTimeout(() => setLastResult(null), RESULT_BADGE_MS);
    return () => window.clearTimeout(timer);
  }, [lastResult]);

  const handleRunSelected = useCallback(() => {
    if (runLoading || !canControlUnit) return;
    logsLengthBeforeRunRef.current = logs.length;
    awaitingResultRef.current = true;
    setRunLoading(true);
    onRunSelected();
    window.setTimeout(() => setRunLoading(false), RUN_LOADING_MS);
  }, [canControlUnit, logs.length, onRunSelected, runLoading]);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden">
      <Card className="flex h-full min-h-0 flex-col overflow-hidden dark:bg-slate-900/70">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3">
          <div className="shrink-0">
            <div className="mb-0.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>공장 에너지</span>
              <span className="font-mono">{plantEnergy}</span>
            </div>
            <div
              className="h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              role="progressbar"
              aria-valuenow={energyGauge.current}
              aria-valuemin={0}
              aria-valuemax={energyGauge.max}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 dark:bg-emerald-400"
                style={{ width: `${energyPct}%` }}
              />
            </div>
          </div>

          {unitStopped && (
            <div
              className="shrink-0 rounded-md border border-amber-300/80 bg-amber-50 px-2 py-1.5 text-[10px] leading-snug text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
              role="status"
            >
              <span className="font-medium">정지 상태</span> — 오버라이드 데모 대신 base
              경고만 나올 수 있습니다. 아래에서 <strong>가동</strong> 후 카드를 다시 클릭하세요.
            </div>
          )}

          <ActivityLog entries={logs} compact={compact} fill />

          <details className="shrink-0 rounded-lg border border-slate-200/80 bg-slate-50/50 dark:border-slate-700/60 dark:bg-slate-950/30">
            <summary className="cursor-pointer select-none px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              추가 실험 · 가동/정지
            </summary>
            <div className="space-y-2 border-t border-slate-200/80 px-2.5 py-2 dark:border-slate-700/60">
              <p className="text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                클릭은 <strong className="text-slate-700 dark:text-slate-200">P1</strong> 정상
                가동(에너지·효율 비교).{" "}
                <strong className="text-slate-700 dark:text-slate-200">P-JAM / P-HEAVY / P-DEFECT</strong>
                는 막힘·실패 데모용입니다.
              </p>

              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                  item
                </span>
                {presetOptions.map((preset) => (
                  <Button
                    key={preset}
                    onClick={() => onPresetClick(preset)}
                    variant={selectedPreset === preset ? "primary" : "secondary"}
                    size="sm"
                    className="h-6 rounded-full px-2 text-[10px]"
                    disabled={!canControlUnit}
                  >
                    {preset}
                  </Button>
                ))}
                <Button
                  onClick={() => setShowAllPresets((v) => !v)}
                  variant="ghost"
                  size="sm"
                  className="h-6 rounded-full px-2 text-[10px]"
                >
                  {showAllPresets ? "접기" : "전체"}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  onClick={handleRunSelected}
                  variant="secondary"
                  size="sm"
                  disabled={!canControlUnit || runLoading}
                  className="h-7 flex-1 text-[10px]"
                >
                  {runLoading ? "실행 중…" : `재실행 process("${selectedPreset}")`}
                </Button>
                {lastResult && (
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                      lastResult === "success"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                    }`}
                  >
                    {lastResult === "success" ? "✓" : "✗"}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Button
                  onClick={onStartSelected}
                  variant="secondary"
                  size="sm"
                  disabled={!canControlUnit}
                  className="h-7 text-[10px]"
                >
                  가동
                </Button>
                <Button
                  onClick={onStopSelected}
                  variant="warning"
                  size="sm"
                  disabled={!canControlUnit}
                  className="h-7 text-[10px]"
                >
                  정지
                </Button>
                <Button onClick={onReset} variant="ghost" size="sm" className="h-7 text-[10px]">
                  세션 리셋
                </Button>
              </div>

              {selectedNode && (
                <ClassNodeDetailPanel
                  node={selectedNode}
                  canControlUnit={canControlUnit}
                  onClear={onClearSelection}
                  compact={compact}
                  minimal
                />
              )}
            </div>
          </details>
        </CardContent>
      </Card>
    </aside>
  );
}
