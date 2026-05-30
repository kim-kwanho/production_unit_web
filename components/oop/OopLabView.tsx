"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { appendLogEntries } from "@/lib/logBuffer";
import ClickProcessHint from "@/components/oop/ClickProcessHint";
import InheritanceDiagram from "@/components/oop/InheritanceDiagram";
import OopSidePanel from "@/components/oop/OopSidePanel";
import {
  applyRunToHoverHint,
  buildHoverUnitHint,
  type ClickHintAnchor,
  type HintAnchorRect,
  type NodeHoverEvent,
} from "@/components/oop/oopClickHint";
import { createLogEntry } from "@/domain/log";
import { createOopLabFactory } from "@/domain/oopLabFactory";
import {
  NODE_CLICK_ITEM,
  NODE_INFO,
  NODE_TO_UNIT,
  OOP_CLASS_NODES,
} from "@/components/oop/oopLabModel";
import type { LogEntry, ProductPreset } from "@/domain/types";
import { useOopLabProcess } from "@/hooks/useOopLabProcess";

const WORKING_MS = 900;

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
  const [renderVersion, setRenderVersion] = useState(0);
  const [hoverHint, setHoverHint] = useState<ClickHintAnchor | null>(null);
  const [workingNodeId, setWorkingNodeId] = useState<string | null>(null);
  const workingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredNodeIdRef = useRef<string | null>(null);

  const appendLogs = useCallback((entries: LogEntry[]) => {
    setLogs((prev) => appendLogEntries(prev, entries));
  }, []);

  const { getUnitForNode, runProcess } = useOopLabProcess(
    factory,
    appendLogs,
    () => setRenderVersion((n) => n + 1),
  );

  const flashWorking = useCallback((nodeId: string, ok: boolean) => {
    if (!ok) return;
    if (workingTimerRef.current) {
      clearTimeout(workingTimerRef.current);
    }
    setWorkingNodeId(nodeId);
    workingTimerRef.current = setTimeout(() => {
      setWorkingNodeId(null);
      workingTimerRef.current = null;
    }, WORKING_MS);
  }, []);

  const runWithFeedback = useCallback(
    (nodeId: string, item: string) => {
      const outcome = runProcess(nodeId, item);
      if (outcome && hoveredNodeIdRef.current === nodeId) {
        setHoverHint((prev) =>
          prev ? applyRunToHoverHint(prev, nodeId, outcome) : prev,
        );
      }
      flashWorking(nodeId, outcome?.ok ?? false);
      return outcome;
    },
    [flashWorking, runProcess],
  );

  const handleNodeHover = useCallback(
    (nodeId: string, event: NodeHoverEvent, anchorRect: HintAnchorRect) => {
      hoveredNodeIdRef.current = nodeId;
      const hint = buildHoverUnitHint(nodeId, event, anchorRect);
      if (hint) setHoverHint(hint);
    },
    [],
  );

  const handleNodeHoverEnd = useCallback((nodeId: string) => {
    if (hoveredNodeIdRef.current === nodeId) {
      hoveredNodeIdRef.current = null;
      setHoverHint(null);
    }
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string | null) => {
      if (nodeId === null) {
        setSelectedNodeId(null);
        hoveredNodeIdRef.current = null;
        setHoverHint(null);
        onConcreteSelect?.(null);
        return;
      }

      setSelectedNodeId(nodeId);

      const infoText = NODE_INFO[nodeId];
      if (infoText) {
        onConcreteSelect?.(null);
        return;
      }

      const kind = NODE_TO_UNIT[nodeId];
      if (!kind) return;
      const unit = getUnitForNode(nodeId);
      onConcreteSelect?.(unit?.deviceId ?? null);
      runWithFeedback(nodeId, NODE_CLICK_ITEM);
    },
    [getUnitForNode, onConcreteSelect, runWithFeedback],
  );

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
    const outcome = runProcess(selectedNodeId, selectedPreset);
    flashWorking(selectedNodeId, outcome?.ok ?? false);
  };

  const selectedUnit = useMemo(() => {
    void renderVersion;
    if (!selectedNodeId) return null;
    return getUnitForNode(selectedNodeId);
  }, [getUnitForNode, selectedNodeId, renderVersion]);

  const selectedUnitStatus = selectedUnit?.status ?? null;

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
    if (workingTimerRef.current) clearTimeout(workingTimerRef.current);
    factory.reset();
    setLogs([]);
    setSelectedNodeId(null);
    setHoverHint(null);
    hoveredNodeIdRef.current = null;
    setWorkingNodeId(null);
    onConcreteSelect?.(null);
    setRenderVersion((n) => n + 1);
  };

  const selectedNode = useMemo(
    () => OOP_CLASS_NODES.find((n) => n.id === selectedNodeId) ?? null,
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
      <ClickProcessHint
        hint={hoverHint}
        autoDismissMs={null}
        onDismiss={() => {
          hoveredNodeIdRef.current = null;
          setHoverHint(null);
        }}
      />

      {!compact && (
        <p className="mb-2 shrink-0 text-xs text-slate-600 dark:text-slate-400">
          <strong>호버</strong>로 스펙 확인 · 초록 노드 <strong>클릭</strong> → P1{" "}
          <code className="font-mono text-emerald-600 dark:text-emerald-400">process()</code>
          (클릭 순서 자유 — 클래스별 차이 비교용). 실패 데모는 「추가 실험」.
          공장 에너지 한도{" "}
          <span className="font-mono">{factory.plantEnergy.limit.toLocaleString()}</span>
          (대시보드 100과 별도).
        </p>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[1fr_minmax(300px,36%)]">
        <InheritanceDiagram
          selectedNodeId={selectedNodeId}
          workingNodeId={workingNodeId}
          onNodeHover={handleNodeHover}
          onNodeHoverEnd={handleNodeHoverEnd}
          onSelectNode={handleNodeClick}
          compact={compact}
        />
        <OopSidePanel
          logs={logs}
          selectedPreset={selectedPreset}
          selectedNode={selectedNode}
          selectedUnitStatus={selectedUnitStatus}
          canControlUnit={canControlUnit}
          onClearSelection={() => handleNodeClick(null)}
          onPresetClick={handlePresetClick}
          onRunSelected={handleRunSelected}
          onStartSelected={handleStartSelected}
          onStopSelected={handleStopSelected}
          onReset={handleReset}
          plantEnergy={`${factory.plantEnergy.total.toFixed(1)} / ${factory.plantEnergy.limit}`}
          compact={compact}
        />
      </div>
    </div>
  );
}
