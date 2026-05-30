"use client";

import ActivityLog from "./ActivityLog";
import ClassNodeDetailPanel from "./ClassNodeDetailPanel";
import type { ClassNodeData } from "./ClassNode";
import OopOnboarding from "./OopOnboarding";
import type { LogEntry, ProductPreset } from "@/domain/types";
import { PRODUCT_PRESETS } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const RUN_LOADING_MS = 150;
const RESULT_BADGE_MS = 3000;

function presetOptionsForUnit(unitDemoItem: string | null): ProductPreset[] {
  if (!unitDemoItem) return ["P1"];
  const demo = unitDemoItem as ProductPreset;
  return demo === "P1" ? ["P1"] : ["P1", demo];
}

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
  unitDemoItem: string | null;
  selectedNode: ClassNodeData | null;
  canControlUnit: boolean;
  onClearSelection?: () => void;
  onPresetClick: (preset: ProductPreset) => void;
  onRunSelected: () => void;
  onRunDemo: () => void;
  onStartSelected: () => void;
  onStopSelected: () => void;
  onReset: () => void;
  plantEnergy: string;
  compact?: boolean;
}

function CompactRerunBar({
  selectedPreset,
  unitDemoItem,
  canControlUnit,
  showMoreItems,
  setShowMoreItems,
  onPresetClick,
  handleRunSelected,
  onRunDemo,
  runLoading,
  lastResult,
}: {
  selectedPreset: ProductPreset;
  unitDemoItem: string | null;
  canControlUnit: boolean;
  showMoreItems: boolean;
  setShowMoreItems: (v: boolean | ((prev: boolean) => boolean)) => void;
  onPresetClick: (preset: ProductPreset) => void;
  handleRunSelected: () => void;
  onRunDemo: () => void;
  runLoading: boolean;
  lastResult: "success" | "fail" | null;
}) {
  const quickPresets = presetOptionsForUnit(unitDemoItem);

  return (
    <div className="mt-2 shrink-0 space-y-1.5 rounded-lg border border-slate-200/80 bg-white/60 px-2 py-1.5 dark:border-slate-700/60 dark:bg-slate-950/30">
      <div className="flex flex-wrap items-center gap-1">
        <span className="shrink-0 text-[10px] font-medium text-slate-600 dark:text-slate-300">
          item
        </span>
        {(showMoreItems ? PRODUCT_PRESETS : quickPresets).map((preset) => (
          <Button
            key={preset}
            onClick={() => onPresetClick(preset)}
            variant={selectedPreset === preset ? "primary" : "secondary"}
            size="sm"
            className="h-6 rounded-full px-2 text-[10px]"
            title={
              preset === unitDemoItem ? "이 클래스 전용 실패 데모 item" : undefined
            }
          >
            {preset}
            {preset === unitDemoItem ? " ★" : ""}
          </Button>
        ))}
        <Button
          onClick={() => setShowMoreItems((v) => !v)}
          variant="ghost"
          size="sm"
          className="h-6 rounded-full px-2 text-[10px]"
        >
          {showMoreItems ? "접기" : "더보기"}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          onClick={handleRunSelected}
          variant="secondary"
          size="sm"
          disabled={!canControlUnit || runLoading}
          title={
            !canControlUnit
              ? "먼저 구현 클래스를 클릭하세요"
              : `선택 item "${selectedPreset}"으로 재실행`
          }
          className="h-7 min-w-0 flex-1 text-[10px]"
        >
          {runLoading ? (
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-slate-400/30 border-t-slate-600 dark:border-t-slate-200"
                aria-hidden
              />
              재실행…
            </span>
          ) : (
            <>재실행 process(&quot;{selectedPreset}&quot;)</>
          )}
        </Button>
        {lastResult && (
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
              lastResult === "success"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
            }`}
          >
            {lastResult === "success" ? "✓ 성공" : "✗ 실패"}
          </span>
        )}
        <Button
          onClick={onRunDemo}
          variant="ghost"
          size="sm"
          disabled={!canControlUnit || !unitDemoItem}
          className="h-7 text-[10px]"
          title={
            unitDemoItem
              ? `데모 item "${unitDemoItem}"으로 재실행`
              : "데모 item 재실행"
          }
        >
          {unitDemoItem ? `데모 (${unitDemoItem})` : "데모"}
        </Button>
      </div>
    </div>
  );
}

function ExtendedControls({
  simpleMode,
  onStartSelected,
  onStopSelected,
  onReset,
  canControlUnit,
  onToggleSimpleMode,
}: {
  simpleMode: boolean;
  onStartSelected: () => void;
  onStopSelected: () => void;
  onReset: () => void;
  canControlUnit: boolean;
  onToggleSimpleMode: () => void;
}) {
  return (
    <details className="mt-1.5 shrink-0 rounded-lg border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/40">
      <summary className="cursor-pointer select-none px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
        확장 옵션 · 사용법
      </summary>
      <div className="space-y-2 border-t border-slate-200 px-2.5 py-2 dark:border-slate-700">
        <OopOnboarding />
        {!simpleMode && (
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
        )}
        <Button
          onClick={onToggleSimpleMode}
          variant="ghost"
          size="sm"
          className="h-7 text-[10px]"
        >
          {simpleMode ? "전체 보기 (가동/정지 포함)" : "간편 보기로 전환"}
        </Button>
      </div>
    </details>
  );
}

export default function OopSidePanel({
  logs,
  selectedPreset,
  unitDemoItem,
  selectedNode,
  canControlUnit,
  onClearSelection,
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
  const [panel, setPanel] = useState<"log" | "rerun">("log");
  const [runLoading, setRunLoading] = useState(false);
  const [lastResult, setLastResult] = useState<"success" | "fail" | null>(null);
  const awaitingResultRef = useRef(false);
  const logsLengthBeforeRunRef = useRef(0);
  const hasLogs = logs.length > 0;

  const energyGauge = useMemo(() => parsePlantEnergy(plantEnergy), [plantEnergy]);
  const energyPct = Math.min(
    100,
    Math.max(0, (energyGauge.current / energyGauge.max) * 100),
  );

  useEffect(() => {
    const saved = localStorage.getItem("sf-oop-simple-mode");
    if (saved === "0") setSimpleMode(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("sf-oop-simple-mode", simpleMode ? "1" : "0");
  }, [simpleMode]);

  useEffect(() => {
    if (hasLogs && compact) {
      setPanel("log");
    }
  }, [hasLogs, compact]);

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

  const rerunBar = (
    <CompactRerunBar
      selectedPreset={selectedPreset}
      unitDemoItem={unitDemoItem}
      canControlUnit={canControlUnit}
      showMoreItems={showMoreItems}
      setShowMoreItems={setShowMoreItems}
      onPresetClick={onPresetClick}
      handleRunSelected={handleRunSelected}
      onRunDemo={onRunDemo}
      runLoading={runLoading}
      lastResult={lastResult}
    />
  );

  const classInfoSection = (
    <details className="mt-1.5 shrink-0 rounded-lg border border-slate-200/80 bg-slate-50/50 dark:border-slate-700/60 dark:bg-slate-950/25">
      <summary className="cursor-pointer select-none px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
        클래스 참고 정보
        {selectedNode && (
          <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">
            — {selectedNode.label}
          </span>
        )}
      </summary>
      <div className="space-y-1.5 border-t border-slate-200/80 px-2.5 py-2 dark:border-slate-700/60">
        {selectedNode ? (
          <ClassNodeDetailPanel
            node={selectedNode}
            canControlUnit={canControlUnit}
            onClear={onClearSelection}
            compact={compact}
            minimal
          />
        ) : (
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            왼쪽 상속 뷰에서 초록색 구현 클래스를 클릭하면 선택 정보가 표시됩니다.
          </p>
        )}
      </div>
    </details>
  );

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden">
      <Card className="flex h-full min-h-0 flex-col overflow-hidden dark:bg-slate-900/70">
        <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
          <div className="mb-2 shrink-0">
            <div className="mb-0.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-300">공장 에너지</span>
              <span>{plantEnergy}</span>
            </div>
            <div
              className="h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              role="progressbar"
              aria-valuenow={energyGauge.current}
              aria-valuemin={0}
              aria-valuemax={energyGauge.max}
              aria-label={`공장 에너지 ${plantEnergy}`}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 ease-out dark:bg-emerald-400"
                style={{ width: `${energyPct}%` }}
              />
            </div>
          </div>

          {compact && (
            <div className="mb-2 flex shrink-0 flex-wrap gap-1 text-[11px]">
              {(
                [
                  { id: "log", label: "실행 결과" },
                  { id: "rerun", label: "재실행" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPanel(t.id)}
                  className={`rounded-full px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 ${
                    panel === t.id
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {compact && panel === "rerun" ? (
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
              {rerunBar}
              {classInfoSection}
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ActivityLog entries={logs} compact={compact} fill />

              {rerunBar}

              {!compact && classInfoSection}

              {!compact && (
                <ExtendedControls
                  simpleMode={simpleMode}
                  onStartSelected={onStartSelected}
                  onStopSelected={onStopSelected}
                  onReset={onReset}
                  canControlUnit={canControlUnit}
                  onToggleSimpleMode={() => setSimpleMode((v) => !v)}
                />
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="shrink-0 px-3 py-1.5">
          <div className="flex w-full items-center justify-between gap-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {canControlUnit && selectedNode
                ? `선택: ${selectedNode.label} — 로그에서 다형성 결과 확인`
                : "초록 구현 카드 클릭 → 실행 결과가 바로 표시됩니다"}
            </p>
            <Button onClick={onReset} variant="ghost" size="sm" className="h-7 shrink-0 text-[10px]">
              리셋
            </Button>
          </div>
        </CardFooter>
      </Card>
    </aside>
  );
}
