"use client";

import { useCallback, useMemo, useState } from "react";
import EfficiencyDonut from "@/components/dashboard/EfficiencyDonut";
import MessageLog from "@/components/dashboard/MessageLog";
import PixelLineMap from "@/components/dashboard/PixelLineMap";
import UnitControlPanel from "@/components/dashboard/UnitControlPanel";
import {
  computeEfficiencyScore,
  createDashboardFactory,
} from "@/domain/dashboardFactory";
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

export default function DashboardPage() {
  const [factory] = useState(() => createDashboardFactory());
  const [productInput, setProductInput] = useState("P1");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastFailedUnitId, setLastFailedUnitId] = useState<string | null>(
    null,
  );
  const [addUnitKind, setAddUnitKind] = useState<AddUnitKind>("robot_arm");
  const [renderVersion, setRenderVersion] = useState(0);

  void renderVersion;
  const energyAtLimit = factory.plantEnergy.isAtLimit;
  const canAddUnit = factory.canAddUnit();

  const efficiency = useMemo(
    () => computeEfficiencyScore(factory.plantEnergy, factory.line),
    // factory mutates in place; renderVersion bumps trigger re-read
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [factory, renderVersion],
  );

  const appendLogs = useCallback((entries: LogEntry[]) => {
    setLogs((prev) => [...prev, ...entries]);
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

  const handleRunPipeline = () => {
    if (energyAtLimit) return;

    const item = productInput.trim() || "P1";
    const { results, failedUnitId } = processPipeline(factory.line, item);

    setLastFailedUnitId(failedUnitId);

    const newEntries: LogEntry[] = [
      createLogEntry(`━━ Pipeline: "${item}" ━━`, "info"),
    ];

    for (const result of results) {
      newEntries.push(...logFromProcess(result.messages));
    }

    const { score, finished, plant } = computeEfficiencyScore(
      factory.plantEnergy,
      factory.line,
    );
    newEntries.push(
      createLogEntry(
        `공장 효율성 점수=${score.toFixed(2)} (완제품 ${finished}, 에너지 ${plant.toFixed(1)})`,
        "info",
      ),
    );

    appendLogs(newEntries);
    setRenderVersion((n) => n + 1);
  };

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
    appendLogs([
      createLogEntry(`[${deviceId}] unit_count → ${next}`, "info"),
    ]);
    setRenderVersion((n) => n + 1);
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "Dashboard 세션을 리셋하시겠습니까?\n(라인은 CV-01·RA-01·INSP-01 초기 구성으로 돌아갑니다)",
      )
    )
      return;
    factory.reset();
    setLogs([]);
    setLastFailedUnitId(null);
    setRenderVersion((n) => n + 1);
  };

  const plantLabel = `${factory.plantEnergy.total.toFixed(1)} / ${PLANT_ENERGY_LIMIT}`;

  return (
    <div className="flex h-full flex-col p-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            라인 시뮬레이션 — 픽셀 맵 · 효율 · 파이프라인 로그
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          세션 리셋
        </button>
      </header>

      <PixelLineMap line={factory.line} lastFailedUnitId={lastFailedUnitId} />

      <div className="mt-4 grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
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

        <div className="flex flex-col gap-4">
          <EfficiencyDonut
            percent={efficiency.percent}
            finished={efficiency.finished}
            plant={efficiency.plant}
            energyAtLimit={energyAtLimit}
          />
          <MessageLog entries={logs} />
        </div>
      </div>
    </div>
  );
}
