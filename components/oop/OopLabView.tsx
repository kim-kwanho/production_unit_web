"use client";

import { useCallback, useState } from "react";
import InheritanceDiagram from "@/components/oop/InheritanceDiagram";
import OopSidePanel from "@/components/oop/OopSidePanel";
import { createLogEntry, logFromProcess } from "@/domain/log";
import { createOopLabFactory } from "@/domain/oopLabFactory";
import type { IProductionUnit } from "@/domain/ProductionUnitADT";
import {
  NODE_DEMO_ITEMS,
  NODE_INFO,
  NODE_TO_UNIT,
} from "@/components/oop/oopLabModel";
import {
  PLANT_ENERGY_LIMIT,
  type LogEntry,
  type ProductPreset,
} from "@/domain/types";

export default function OopLabView({
  compact = false,
  onConcreteSelect,
}: {
  compact?: boolean;
  onConcreteSelect?: (unitId: string | null) => void;
}) {
  const [factory] = useState(() => createOopLabFactory());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ProductPreset>("P1");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [, setRenderVersion] = useState(0);

  const snapshotUnit = useCallback((u: IProductionUnit) => {
    const info = u.info();
    const kv = Object.fromEntries(
      info
        .split(",")
        .map((s) => s.trim())
        .map((pair) => {
          const i = pair.indexOf("=");
          if (i < 0) return [pair, ""];
          return [pair.slice(0, i), pair.slice(i + 1)];
        }),
    );
    const toNum = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    return {
      deviceId: u.deviceId,
      stationType: u.stationType,
      processedCount: u.processedCount,
      expEff: toNum(kv.exp_eff),
    };
  }, []);

  const getUnitForNode = useCallback(
    (nodeId: string): IProductionUnit | null => {
      const kind = NODE_TO_UNIT[nodeId];
      if (!kind) return null;
      if (kind === "conveyor") return factory.units.conveyor;
      if (kind === "robot_arm") return factory.units.robot;
      return factory.units.inspection;
    },
    [factory],
  );

  const appendLogs = useCallback((entries: LogEntry[]) => {
    setLogs((prev) => [...prev, ...entries]);
  }, []);

  const runProcess = useCallback(
    (nodeId: string, item: string) => {
      const unit = getUnitForNode(nodeId);
      if (!unit) return;

      const plantBefore = factory.plantEnergy.total;
      const before = snapshotUnit(unit);
      const result = unit.process(item);
      const plantAfter = factory.plantEnergy.total;
      const after = snapshotUnit(unit);

      const processedDelta = after.processedCount - before.processedCount;
      const energyDelta = plantAfter - plantBefore;

      appendLogs([
        createLogEntry(
          `━━ 변화(diff): ${before.deviceId} (${before.stationType}) ━━`,
          "info",
        ),
        createLogEntry(
          `processed: ${before.processedCount} → ${after.processedCount} (${processedDelta >= 0 ? "+" : ""}${processedDelta})`,
          processedDelta > 0 ? "success" : "info",
        ),
        createLogEntry(
          `plant_energy: ${plantBefore.toFixed(1)} → ${plantAfter.toFixed(1)} (${energyDelta >= 0 ? "+" : ""}${energyDelta.toFixed(1)})`,
          energyDelta > 0 ? "warning" : "info",
        ),
        createLogEntry(
          `▶ ${unit.deviceId}.process("${item}") → ${result.ok ? "성공" : "실패"}`,
          result.ok ? "success" : "error",
        ),
        ...logFromProcess(result.messages),
      ]);
      setRenderVersion((n) => n + 1);
    },
    [appendLogs, factory.plantEnergy, getUnitForNode, snapshotUnit],
  );

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);

    const infoText = NODE_INFO[nodeId];
    if (infoText) {
      appendLogs([createLogEntry(`ℹ ${infoText}`, "info")]);
      onConcreteSelect?.(null);
      return;
    }

    const kind = NODE_TO_UNIT[nodeId];
    if (!kind) return;
    const unit = getUnitForNode(nodeId);
    onConcreteSelect?.(unit?.deviceId ?? null);
    appendLogs([
      createLogEntry(
        `선택됨: ${nodeId} — 우측에서 입력(item)을 선택하고 실행해 보세요.`,
        "info",
      ),
    ]);
  };

  const handlePresetClick = (preset: ProductPreset) => {
    setSelectedPreset(preset);
  };

  const handleRunSelected = () => {
    if (!selectedNodeId || !NODE_TO_UNIT[selectedNodeId]) {
      appendLogs([
        createLogEntry(
          "먼저 다이어그램에서 구현 클래스(Conveyor / Robot / Inspection)를 선택하세요.",
          "warning",
        ),
      ]);
      return;
    }
    runProcess(selectedNodeId, selectedPreset);
  };

  const handleRunDemo = () => {
    if (!selectedNodeId || !NODE_TO_UNIT[selectedNodeId]) {
      appendLogs([
        createLogEntry("먼저 다이어그램에서 구현 클래스를 선택하세요.", "warning"),
      ]);
      return;
    }
    const kind = NODE_TO_UNIT[selectedNodeId];
    if (!kind) return;
    runProcess(selectedNodeId, NODE_DEMO_ITEMS[kind]);
  };

  const handleStartSelected = () => {
    if (!selectedNodeId || !NODE_TO_UNIT[selectedNodeId]) {
      appendLogs([
        createLogEntry("먼저 다이어그램에서 구현 클래스를 선택하세요.", "warning"),
      ]);
      return;
    }
    const unit = getUnitForNode(selectedNodeId);
    if (!unit) return;
    unit.start();
    appendLogs([createLogEntry(`[${unit.deviceId}] 가동 시작`, "success")]);
    setRenderVersion((n) => n + 1);
  };

  const handleStopSelected = () => {
    if (!selectedNodeId || !NODE_TO_UNIT[selectedNodeId]) return;
    const unit = getUnitForNode(selectedNodeId);
    if (!unit) return;
    unit.stop();
    appendLogs([createLogEntry(`[${unit.deviceId}] 정지`, "warning")]);
    setRenderVersion((n) => n + 1);
  };

  const handleReset = () => {
    if (!window.confirm("OOP Lab 세션을 리셋하시겠습니까?")) return;
    factory.reset();
    setLogs([]);
    setSelectedNodeId(null);
    onConcreteSelect?.(null);
    setRenderVersion((n) => n + 1);
  };

  const selectedUnit = selectedNodeId ? getUnitForNode(selectedNodeId) : null;
  const canControlUnit = Boolean(selectedNodeId && NODE_TO_UNIT[selectedNodeId]);

  return (
    <div
      className={
        compact
          ? "flex h-full flex-col p-3"
          : "flex h-full flex-col p-4 lg:p-6"
      }
    >
      {!compact && (
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          같은{" "}
          <code className="text-emerald-600 dark:text-emerald-400">process()</code>{" "}
          호출 — 클래스마다 다른 결과 (다형성)
        </p>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(280px,30%)]">
        <InheritanceDiagram
          selectedNodeId={selectedNodeId}
          onSelectNode={handleNodeClick}
        />
        <OopSidePanel
          logs={logs}
          selectedPreset={selectedPreset}
          selectedNodeLabel={selectedUnit?.deviceId ?? null}
          canControlUnit={canControlUnit}
          onPresetClick={handlePresetClick}
          onRunSelected={handleRunSelected}
          onRunDemo={handleRunDemo}
          onStartSelected={handleStartSelected}
          onStopSelected={handleStopSelected}
          onReset={handleReset}
          plantEnergy={`${factory.plantEnergy.total.toFixed(1)} / ${PLANT_ENERGY_LIMIT}`}
          compact={compact}
        />
      </div>
    </div>
  );
}

