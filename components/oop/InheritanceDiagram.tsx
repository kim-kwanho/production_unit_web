"use client";

import { memo, useCallback, useId, useMemo } from "react";
import ClassNode, { type ClassNodeData } from "./ClassNode";
import { rectFromElement } from "./hintPosition";
import type { HintAnchorRect, NodePointerEvent } from "./oopClickHint";
import { GENERALIZATION_EDGES, OOP_CLASS_NODES } from "./oopLabModel";

interface InheritanceDiagramProps {
  selectedNodeId: string | null;
  workingNodeId: string | null;
  onNodeHover: (nodeId: string, event: NodePointerEvent, anchorRect: HintAnchorRect) => void;
  onNodeHoverEnd: (nodeId: string) => void;
  onSelectNode: (nodeId: string | null, event?: NodePointerEvent) => void;
  compact?: boolean;
}

function centerBottom(node: ClassNodeData) {
  return { x: node.x + node.width / 2, y: node.y + node.height };
}

function centerTop(node: ClassNodeData) {
  return { x: node.x + node.width / 2, y: node.y };
}

function FlowGuide({ compact }: { compact?: boolean }) {
  const steps = [
    { n: "①", label: "노드 호버", sub: "유닛 스펙" },
    { n: "②", label: "초록 노드 클릭", sub: "P1 가동" },
    { n: "③", label: "실행 결과", sub: "다형성 로그" },
  ];

  return (
    <div
      className={`flex shrink-0 flex-wrap items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2 py-1.5 dark:border-slate-700/60 dark:bg-slate-950/40 ${
        compact ? "text-[9px]" : "text-[10px]"
      }`}
    >
      {steps.map((step, i) => (
        <span key={step.n} className="inline-flex items-center gap-1">
          {i > 0 && (
            <span className="text-slate-400 dark:text-slate-500" aria-hidden>
              →
            </span>
          )}
          <span className="inline-flex flex-col">
            <span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                {step.n}
              </span>{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {step.label}
              </span>
            </span>
            {!compact && (
              <span className="text-slate-500 dark:text-slate-400">{step.sub}</span>
            )}
          </span>
        </span>
      ))}
    </div>
  );
}

function DiagramLegend({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600 dark:text-slate-400 ${
        compact ? "mt-1" : "mt-1.5"
      }`}
    >
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-4 rounded-sm border border-dashed border-slate-400 bg-slate-200 dark:bg-slate-700" />
        ADT
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-4 rounded-sm border border-slate-400 bg-slate-300 dark:bg-slate-600" />
        Base
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-4 rounded-sm border border-emerald-500 bg-emerald-200 dark:bg-emerald-800" />
        호버 스펙 · 클릭 P1
      </span>
      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
        ★ <span className="font-mono">process()</span> 오버라이드
      </span>
      <span className="text-slate-500 dark:text-slate-400">
        (실패 데모: 추가 실험에서 P-JAM 등)
      </span>
    </div>
  );
}

function InheritanceDiagram({
  selectedNodeId,
  workingNodeId,
  onNodeHover,
  onNodeHoverEnd,
  onSelectNode,
  compact = false,
}: InheritanceDiagramProps) {
  const markerId = useId().replace(/:/g, "");

  const nodeMap = useMemo(
    () => Object.fromEntries(OOP_CLASS_NODES.map((n) => [n.id, n])),
    [],
  );

  const handleNodePointerEnter = useCallback(
    (node: ClassNodeData, event: NodePointerEvent) => {
      const target = event.currentTarget;
      const anchorRect =
        target instanceof Element ? rectFromElement(target) : rectFromElement(event.target as Element);
      onNodeHover(node.id, event, anchorRect);
    },
    [onNodeHover],
  );

  const handleNodePointerLeave = useCallback(
    (node: ClassNodeData) => {
      onNodeHoverEnd(node.id);
    },
    [onNodeHoverEnd],
  );

  const handleNodePointerUp = useCallback(
    (node: ClassNodeData) => {
      onSelectNode(node.id);
    },
    [onSelectNode],
  );

  const svgClassName = compact
    ? "h-full min-h-[180px] w-full rounded-lg bg-slate-50/70 ring-1 ring-slate-200 dark:bg-slate-950/30 dark:ring-slate-800"
    : "h-full min-h-[220px] w-full rounded-lg bg-slate-50/70 ring-1 ring-slate-200 dark:bg-slate-950/30 dark:ring-slate-800";

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 ${
        compact ? "p-2" : "p-3"
      }`}
    >
      <div className="mb-2 flex shrink-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            상속 · 다형성 다이어그램
          </h2>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
            UML
          </span>
        </div>
        <FlowGuide compact={compact} />
      </div>

      <div className="relative min-h-0 flex-1">
        <svg viewBox="0 0 680 360" preserveAspectRatio="xMidYMid meet" className={svgClassName}>
          <defs>
            <style>{`
              @keyframes oop-draw-edge {
                to { stroke-dashoffset: 0; }
              }
              @keyframes pulse-ring {
                0%, 100% { opacity: 0.35; stroke-width: 2; }
                50% { opacity: 0.95; stroke-width: 3.5; }
              }
              @keyframes oop-work-pulse {
                0%, 100% { opacity: 0.85; }
                50% { opacity: 1; }
              }
              .oop-edge-draw {
                stroke-dasharray: 100;
                stroke-dashoffset: 100;
                animation: oop-draw-edge 0.7s ease forwards;
              }
              .oop-concrete-pulse-ring {
                fill: none;
                stroke: #22c55e;
                animation: pulse-ring 2.4s ease-in-out infinite;
              }
              .oop-node-working {
                animation: oop-work-pulse 0.55s ease-in-out infinite;
              }
            `}</style>
            <marker
              id={`inherit-arrow-${markerId}`}
              markerWidth="14"
              markerHeight="14"
              refX="12"
              refY="7"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path
                d="M12,7 L2,1 L2,13 Z"
                fill="var(--oop-node-interface-fill, #f8fafc)"
                stroke="#22c55e"
                strokeWidth={1.5}
              />
            </marker>
          </defs>
          {GENERALIZATION_EDGES.map(({ subclass, superclass }, edgeIndex) => {
            const a = centerTop(nodeMap[subclass]);
            const b = centerBottom(nodeMap[superclass]);
            const midY = (a.y + b.y) / 2;
            return (
              <path
                key={`${subclass}-${superclass}`}
                className="oop-edge-draw"
                style={{ animationDelay: `${edgeIndex * 0.2}s` }}
                pathLength={100}
                d={`M ${a.x} ${a.y} V ${midY} H ${b.x} V ${b.y}`}
                fill="none"
                stroke="#22c55e"
                strokeWidth={2}
                markerEnd={`url(#inherit-arrow-${markerId})`}
              />
            );
          })}
          {OOP_CLASS_NODES.map((node) => (
            <ClassNode
              key={node.id}
              node={node}
              selected={selectedNodeId === node.id}
              isWorking={workingNodeId === node.id}
              onPointerEnter={handleNodePointerEnter}
              onPointerLeave={handleNodePointerLeave}
              onPointerUp={handleNodePointerUp}
              showMethods={node.kind !== "concrete"}
            />
          ))}
        </svg>
      </div>

      <DiagramLegend compact={compact} />
    </div>
  );
}

export default memo(InheritanceDiagram);
