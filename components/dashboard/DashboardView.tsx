"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appendLogEntries } from "@/lib/logBuffer";

const EfficiencyDonut = dynamic(
  () => import("@/components/dashboard/EfficiencyDonut"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-32 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
        효율 차트 로딩…
      </div>
    ),
  },
);
import MessageLog from "@/components/dashboard/MessageLog";
import PixelLineMap from "@/components/dashboard/PixelLineMap";
import UnitControlPanel from "@/components/dashboard/UnitControlPanel";
import DashboardOnboarding from "@/components/dashboard/DashboardOnboarding";
import { Button } from "@/components/ui/button";
import { createDashboardFactory } from "@/domain/dashboardFactory";
import { createLogEntry, logFromProcess } from "@/domain/log";
import { processPipeline } from "@/domain/pipeline";
import {
  PLANT_ENERGY_LIMIT,
  UNIT_COUNT_MAX,
  UNIT_COUNT_MIN,
  type AddUnitKind,
  type LogEntry,
} from "@/domain/types";
import { clampUnitCount } from "@/lib/format";

export default function DashboardView({
  compact = false,
  showOnboarding = true,
  highlightUnitId,
}: {
  compact?: boolean;
  showOnboarding?: boolean;
  highlightUnitId?: string | null;
}) {
  const [factory] = useState(() => createDashboardFactory());
  const [productInput, setProductInput] = useState("P1");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastFailedUnitId, setLastFailedUnitId] = useState<string | null>(null);
  const [addUnitKind, setAddUnitKind] = useState<AddUnitKind>("robot_arm");
  const [renderVersion, setRenderVersion] = useState(0);

  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [activeItemLabel, setActiveItemLabel] = useState<string | null>(null);
  const [activeProgress, setActiveProgress] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [runHistory, setRunHistory] = useState<
    { ts: number; energyUsed: number; finished: number }[]
  >([]);
  const runIdRef = useRef(0);

  void renderVersion;
  const energyAtLimit = factory.plantEnergy.isAtLimit;
  const canAddUnit = factory.canAddUnit();

  const getFinishedOnLine = useCallback(() => {
    return factory.line
      .filter((u) => u.stationType === "inspection")
      .reduce((sum, u) => sum + u.processedCount, 0);
  }, [factory.line]);

  const efficiency = useMemo(() => {
    const WINDOW_MS = 60_000;
    const cutoff = Date.now() - WINDOW_MS;
    const recent = runHistory.filter((r) => r.ts >= cutoff);
    const plant = recent.reduce((sum, r) => sum + r.energyUsed, 0);
    const finished = recent.reduce((sum, r) => sum + r.finished, 0);
    const rawScore = plant <= 0 ? 0 : (finished / plant) * 1000;
    const percent = Math.min(100, rawScore);
    return { score: rawScore, finished, plant, percent };
  }, [runHistory]);

  const appendLogs = useCallback((entries: LogEntry[]) => {
    setLogs((prev) => appendLogEntries(prev, entries));
  }, []);

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  const cancelRun = useCallback(() => {
    runIdRef.current += 1;
    setAnimating(false);
    setActiveUnitId(null);
    setActiveItemLabel(null);
    setActiveProgress(0);
  }, []);

  const handleStartAll = () => {
    factory.line.forEach((u) => u.start());
    appendLogs([createLogEntry("▶ 전체 유닛 가동 시작", "info")]);
    setRenderVersion((n) => n + 1);
  };

  const handleStopAll = () => {
    factory.line.forEach((u) => u.stop());
    appendLogs([createLogEntry("■ 전체 유닛 정지", "warning")]);
    setRenderVersion((n) => n + 1);
  };

  const handleRunPipeline = async () => {
    if (energyAtLimit) return;
    if (animating) return;

    const runId = ++runIdRef.current;
    const item = productInput.trim() || "P1";
    setAnimating(true);
    setLastFailedUnitId(null);
    setActiveItemLabel(item);

    appendLogs([createLogEntry(`━━ Pipeline: "${item}" ━━`, "info")]);

    const energyBefore = factory.plantEnergy.total;
    const finishedBefore = getFinishedOnLine();
    const { results, failedUnitId } = processPipeline(factory.line, item);
    const okAll = failedUnitId === null;

    for (let i = 0; i < factory.line.length; i++) {
      const unit = factory.line[i];
      const result = results[i];
      if (runIdRef.current !== runId) return;
      setActiveUnitId(unit.deviceId);

      if (compact) {
        setActiveProgress(0.5);
        await sleep(280);
        if (runIdRef.current !== runId) return;
      } else {
        setActiveProgress(0);
        await sleep(120);
        if (runIdRef.current !== runId) return;
        setActiveProgress(0.35);
        await sleep(180);
        if (runIdRef.current !== runId) return;
        setActiveProgress(0.7);
        await sleep(220);
        if (runIdRef.current !== runId) return;
      }
      setActiveProgress(1);

      appendLogs([...logFromProcess(result.messages)]);

      if (failedUnitId === unit.deviceId) {
        setLastFailedUnitId(failedUnitId);
      }

      await sleep(compact ? 120 : 220);
    }

    const energyAfter = factory.plantEnergy.total;
    const finishedAfter = getFinishedOnLine();
    const energyUsed = Math.max(0, energyAfter - energyBefore);
    const finishedDelta = Math.max(0, finishedAfter - finishedBefore);

    if (energyUsed > 0 || finishedDelta > 0) {
      setRunHistory((prev) => {
        const now = Date.now();
        const next = [...prev, { ts: now, energyUsed, finished: finishedDelta }];
        const cutoff = now - 60_000;
        return next.filter((r) => r.ts >= cutoff);
      });
    }

    if (okAll && finishedDelta > 0 && energyUsed > 0) {
      factory.plantEnergy.remove(energyUsed);
      appendLogs([
        createLogEntry(
          `↺ 완제품 완료: 이번 제품에 사용한 에너지 ${energyUsed.toFixed(1)}을(를) 환급하여 생산 전 상태로 복귀합니다.`,
          "info",
        ),
      ]);
    }

    setActiveUnitId(null);
    setActiveItemLabel(null);
    setActiveProgress(0);
    if (runIdRef.current !== runId) return;
    setAnimating(false);
    setRenderVersion((n) => n + 1);
  };

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
    };
  }, []);

  const handleAddUnit = () => {
    const result = factory.addUnit(addUnitKind);
    if (!result.ok) {
      appendLogs([createLogEntry(result.reason, "warning")]);
      return;
    }
    const labels: Record<AddUnitKind, string> = {
      conveyor: "라인 맨 앞",
      robot_arm: "검사기 앞",
      inspection: "라인 맨 뒤",
    };
    appendLogs([
      createLogEntry(
        `+ ${result.unit.deviceId} (${addUnitKind}) 추가 — ${labels[addUnitKind]}`,
        "info",
      ),
    ]);
    setRenderVersion((n) => n + 1);
  };

  const handleUnitCountChange = (deviceId: string, delta: number) => {
    const unit = factory.line.find((u) => u.deviceId === deviceId);
    if (!unit) return;

    const next = clampUnitCount(
      unit.unitCount + delta,
      UNIT_COUNT_MIN,
      UNIT_COUNT_MAX,
    );
    if (next === unit.unitCount) return;

    unit.unitCount = next;
    appendLogs([createLogEntry(`[${deviceId}] unit_count → ${next}`, "info")]);
    setRenderVersion((n) => n + 1);
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "Dashboard 세션을 리셋하시겠습니까?\n(라인은 CV-01·RA-01·INSP-01 초기 구성으로 돌아갑니다)",
      )
    )
      return;
    cancelRun();
    factory.reset();
    setLogs([]);
    setLastFailedUnitId(null);
    setRunHistory([]);
    setRenderVersion((n) => n + 1);
  };

  const recentEnergyUsed = efficiency.plant;
  const plantLabel = `에너지: 현재 부하 ${factory.plantEnergy.total.toFixed(1)} / ${PLANT_ENERGY_LIMIT} · 최근 60초 사용 ${recentEnergyUsed.toFixed(1)}`;

  const [panel, setPanel] = useState<"control" | "metrics" | "log">("control");

  return (
    <div
      className={
        compact
          ? "flex h-full min-h-0 flex-col overflow-hidden p-3"
          : "flex h-full min-h-0 flex-col overflow-hidden p-3 lg:p-4"
      }
    >
      {showOnboarding && (
        <div className="mb-2 shrink-0">
          <DashboardOnboarding />
        </div>
      )}
      {!compact && (
        <header className="mb-2 flex shrink-0 items-center justify-between gap-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Factory Dashboard — 생산 라인 상태와 처리 결과를 한 화면에서 확인합니다.
          </p>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            세션 리셋
          </Button>
        </header>
      )}

      <div className="shrink-0">
        <PixelLineMap
          line={factory.line}
          lineSyncVersion={renderVersion}
          lastFailedUnitId={lastFailedUnitId}
          activeUnitId={activeUnitId}
          activeItemLabel={activeItemLabel}
          activeProgress={activeProgress}
          highlightUnitId={highlightUnitId}
          compact={compact}
        />
      </div>

      {compact ? (
        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-1 text-[11px]">
            {(
              [
                { id: "control", label: "실행" },
                { id: "metrics", label: "효율" },
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
            {animating && (
              <span className="ml-auto flex items-center text-[11px] text-emerald-700 dark:text-emerald-300">
                실행 중…
              </span>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {panel === "control" && (
              <div className="h-full overflow-auto">
                <UnitControlPanel
                  line={factory.line}
                  productInput={productInput}
                  addUnitKind={addUnitKind}
                  onAddUnitKindChange={setAddUnitKind}
                  canAddUnit={canAddUnit}
                  onProductInputChange={setProductInput}
                  onPresetSelect={setProductInput}
                  onStartAll={handleStartAll}
                  onStopAll={handleStopAll}
                  onRunPipeline={handleRunPipeline}
                  onAddUnit={handleAddUnit}
                  onUnitCountChange={handleUnitCountChange}
                  energyAtLimit={energyAtLimit}
                  plantEnergyLabel={plantLabel}
                />
              </div>
            )}

            {panel === "metrics" && (
              <div className="h-full overflow-auto">
                <EfficiencyDonut
                  percent={efficiency.percent}
                  finished={efficiency.finished}
                  plant={efficiency.plant}
                  energyAtLimit={energyAtLimit}
                />
              </div>
            )}

            {panel === "log" && (
              <div className="h-full overflow-auto">
                <MessageLog entries={logs} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-2 grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden lg:grid-cols-2 lg:gap-3">
          <div className="min-h-0 overflow-hidden">
            <UnitControlPanel
              fill
              line={factory.line}
              productInput={productInput}
              addUnitKind={addUnitKind}
              onAddUnitKindChange={setAddUnitKind}
              canAddUnit={canAddUnit}
              onProductInputChange={setProductInput}
              onPresetSelect={setProductInput}
              onStartAll={handleStartAll}
              onStopAll={handleStopAll}
              onRunPipeline={handleRunPipeline}
              onAddUnit={handleAddUnit}
              onUnitCountChange={handleUnitCountChange}
              energyAtLimit={energyAtLimit}
              plantEnergyLabel={plantLabel}
            />
          </div>

          <div className="flex min-h-0 flex-col gap-2 overflow-hidden lg:gap-3">
            <div className="shrink-0">
              <EfficiencyDonut
                compact
                percent={efficiency.percent}
                finished={efficiency.finished}
                plant={efficiency.plant}
                energyAtLimit={energyAtLimit}
              />
            </div>
            <MessageLog entries={logs} fill />
          </div>
        </div>
      )}
    </div>
  );
}

