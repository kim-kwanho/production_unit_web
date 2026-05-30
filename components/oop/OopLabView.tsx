"use client";

import { useCallback, useMemo, useState } from "react";
import { appendLogEntries } from "@/lib/logBuffer";
import InheritanceView from "@/components/oop/InheritanceView";
import OopSidePanel from "@/components/oop/OopSidePanel";
import { createLogEntry } from "@/domain/log";
import { createOopLabFactory } from "@/domain/oopLabFactory";
import {
  getDemoItemForNode,
  getDemoItemOwnerNodeId,
  NODE_INFO,
  NODE_TO_UNIT,
  OOP_CLASS_NODES,
} from "@/components/oop/oopLabModel";
import {
  PLANT_ENERGY_LIMIT,
  type LogEntry,
  type ProductPreset,
} from "@/domain/types";
import { useOopLabProcess } from "@/hooks/useOopLabProcess";

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

  const appendLogs = useCallback((entries: LogEntry[]) => {
    setLogs((prev) => appendLogEntries(prev, entries));
  }, []);

  const { getUnitForNode, runProcess, getDemoItemForKind } = useOopLabProcess(
    factory,
    appendLogs,
    () => setRenderVersion((n) => n + 1),
  );

  const handleNodeClick = useCallback(
    (nodeId: string | null) => {
      if (nodeId === null) {
        setSelectedNodeId(null);
        onConcreteSelect?.(null);
        return;
      }

      const infoText = NODE_INFO[nodeId];
      if (infoText) {
        appendLogs([createLogEntry(`ℹ ${infoText}`, "info")]);
        return;
      }

      const kind = NODE_TO_UNIT[nodeId];
      if (!kind) return;

      const demoItem = getDemoItemForKind(kind);
      setSelectedNodeId(nodeId);
      setSelectedPreset(demoItem as ProductPreset);
      const unit = getUnitForNode(nodeId);
      onConcreteSelect?.(unit?.deviceId ?? null);
      runProcess(nodeId, demoItem);
    },
    [appendLogs, getDemoItemForKind, getUnitForNode, onConcreteSelect, runProcess],
  );

  const handlePresetClick = (preset: ProductPreset) => {
    setSelectedPreset(preset);
  };

  const handleRunSelected = () => {
    if (!selectedNodeId || !NODE_TO_UNIT[selectedNodeId]) {
      appendLogs([
        createLogEntry(
          "먼저 상속 뷰에서 초록색 구현 클래스(Conveyor / Robot / Inspection)를 클릭하세요.",
          "warning",
        ),
      ]);
      return;
    }
    const unitDemo = getDemoItemForNode(selectedNodeId);
    const ownerNodeId = getDemoItemOwnerNodeId(selectedPreset);
    if (
      unitDemo &&
      selectedPreset !== "P1" &&
      selectedPreset !== unitDemo &&
      ownerNodeId &&
      ownerNodeId !== selectedNodeId
    ) {
      const ownerLabel =
        OOP_CLASS_NODES.find((n) => n.id === ownerNodeId)?.label ?? ownerNodeId;
      appendLogs([
        createLogEntry(
          `ℹ "${selectedPreset}"은(는) ${ownerLabel} 전용 실패 데모입니다. 현재 선택 클래스에서는 다른 키워드 검사가 적용됩니다.`,
          "info",
        ),
      ]);
    }
    runProcess(selectedNodeId, selectedPreset);
  };

  const handleRunDemo = () => {
    if (!selectedNodeId || !NODE_TO_UNIT[selectedNodeId]) {
      appendLogs([
        createLogEntry("먼저 상속 뷰에서 초록색 구현 클래스를 클릭하세요.", "warning"),
      ]);
      return;
    }
    const kind = NODE_TO_UNIT[selectedNodeId];
    if (!kind) return;
    const demoItem = getDemoItemForKind(kind);
    setSelectedPreset(demoItem as ProductPreset);
    runProcess(selectedNodeId, demoItem);
  };

  const handleStartSelected = () => {
    if (!selectedNodeId || !NODE_TO_UNIT[selectedNodeId]) {
      appendLogs([
        createLogEntry("먼저 상속 뷰에서 초록색 구현 클래스를 클릭하세요.", "warning"),
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
    setSelectedPreset("P1");
    onConcreteSelect?.(null);
    setRenderVersion((n) => n + 1);
  };

  const selectedNode = useMemo(
    () => OOP_CLASS_NODES.find((n) => n.id === selectedNodeId) ?? null,
    [selectedNodeId],
  );
  const unitDemoItem = useMemo(
    () => (selectedNodeId ? getDemoItemForNode(selectedNodeId) : null),
    [selectedNodeId],
  );
  const canControlUnit = Boolean(selectedNodeId && NODE_TO_UNIT[selectedNodeId]);

  return (
    <div
      className={
        compact
          ? "flex h-full min-h-0 flex-col overflow-hidden p-3"
          : "flex h-full min-h-0 flex-col overflow-hidden p-3 lg:p-4"
      }
    >
      {!compact && (
        <p className="mb-2 shrink-0 text-xs text-slate-600 dark:text-slate-400">
          같은 <code className="text-emerald-600 dark:text-emerald-400">process()</code> 호출 —
          클래스마다 다른 결과(다형성).{" "}
          <span className="font-medium text-emerald-700 dark:text-emerald-300">
            초록 구현 카드를 클릭하면 오른쪽 실행 결과에 즉시 표시됩니다.
          </span>
        </p>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[1fr_minmax(300px,36%)]">
        <InheritanceView
          selectedNodeId={selectedNodeId}
          onSelectNode={handleNodeClick}
          compact={compact}
        />
        <OopSidePanel
          logs={logs}
          selectedPreset={selectedPreset}
          unitDemoItem={unitDemoItem}
          selectedNode={selectedNode}
          canControlUnit={canControlUnit}
          onClearSelection={() => handleNodeClick(null)}
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
