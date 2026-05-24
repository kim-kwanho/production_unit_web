"use client";

import { useCallback, useState } from "react";
import InheritanceDiagram from "@/components/oop/InheritanceDiagram";
import OopSidePanel from "@/components/oop/OopSidePanel";
import { createLogEntry, logFromProcess } from "@/domain/log";
import { createOopLabFactory } from "@/domain/oopLabFactory";
import type { IProductionUnit } from "@/domain/ProductionUnitADT";
import {
  DEMO_ITEMS,
  PLANT_ENERGY_LIMIT,
  type ConcreteUnitKind,
  type LogEntry,
  type ProductPreset,
} from "@/domain/types";

const NODE_TO_UNIT: Record<string, ConcreteUnitKind> = {
  conveyor: "conveyor",
  robot: "robot_arm",
  inspection: "inspection",
};

const INFO_NODES: Record<string, string> = {
  adt: "ProductionUnitADT — 추상 인터페이스. process(item) 등 5개 메서드 시그니처만 정의합니다.",
  base: "ProductionUnit — 공통 구현. plant energy 한도(100), start/stop, 기본 process()를 제공합니다.",
};

export default function OopLabPage() {
  const [factory] = useState(() => createOopLabFactory());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ProductPreset>("P1");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [, setRenderVersion] = useState(0);

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

      const result = unit.process(item);
      appendLogs([
        createLogEntry(
          `▶ ${unit.deviceId}.process("${item}") → ${result.ok ? "성공" : "실패"}`,
          result.ok ? "success" : "error",
        ),
        ...logFromProcess(result.messages),
      ]);
      setRenderVersion((n) => n + 1);
    },
    [appendLogs, getUnitForNode],
  );

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);

    const infoText = INFO_NODES[nodeId];
    if (infoText) {
      appendLogs([createLogEntry(`ℹ ${infoText}`, "info")]);
      return;
    }

    const kind = NODE_TO_UNIT[nodeId];
    if (!kind) return;
    runProcess(nodeId, DEMO_ITEMS[kind]);
  };

  const handlePresetClick = (preset: ProductPreset) => {
    setSelectedPreset(preset);
    if (!selectedNodeId || !NODE_TO_UNIT[selectedNodeId]) {
      appendLogs([
        createLogEntry(
          "먼저 다이어그램에서 구현 클래스(Conveyor / Robot / Inspection)를 클릭하세요.",
          "warning",
        ),
      ]);
      return;
    }
    runProcess(selectedNodeId, preset);
  };

  const handleStartSelected = () => {
    if (!selectedNodeId || !NODE_TO_UNIT[selectedNodeId]) {
      appendLogs([
        createLogEntry(
          "먼저 다이어그램에서 구현 클래스를 선택하세요.",
          "warning",
        ),
      ]);
      return;
    }
    const unit = getUnitForNode(selectedNodeId);
    if (!unit) return;
    unit.start();
    appendLogs([
      createLogEntry(`[${unit.deviceId}] 가동 시작`, "success"),
    ]);
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
    setRenderVersion((n) => n + 1);
  };

  const selectedUnit = selectedNodeId ? getUnitForNode(selectedNodeId) : null;
  const canControlUnit = Boolean(selectedNodeId && NODE_TO_UNIT[selectedNodeId]);

  return (
    <div className="flex h-full flex-col p-4 lg:p-6">
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        같은{" "}
        <code className="text-emerald-600 dark:text-emerald-400">process()</code>{" "}
        호출 — 클래스마다 다른 결과 (다형성)
      </p>

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
          onStartSelected={handleStartSelected}
          onStopSelected={handleStopSelected}
          onReset={handleReset}
          plantEnergy={`${factory.plantEnergy.total.toFixed(1)} / ${PLANT_ENERGY_LIMIT}`}
        />
      </div>
    </div>
  );
}
