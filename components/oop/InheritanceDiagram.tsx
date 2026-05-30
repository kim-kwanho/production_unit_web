"use client";

import { memo, useCallback, useId, useMemo } from "react";
import ClassNode, { type ClassNodeData } from "./ClassNode";
import { GENERALIZATION_EDGES, OOP_CLASS_NODES } from "./oopLabModel";

interface InheritanceDiagramProps {
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  compact?: boolean;
  /** InheritanceView 내부에서 사용 시 외곽 chrome 생략 */
  embedded?: boolean;
}

function centerBottom(node: ClassNodeData) {
  return { x: node.x + node.width / 2, y: node.y + node.height };
}

function centerTop(node: ClassNodeData) {
  return { x: node.x + node.width / 2, y: node.y };
}

function DiagramLegend({ compact }: { compact?: boolean }) {
  const items = [
    { label: "인터페이스", dash: true, fill: "bg-slate-200 dark:bg-slate-700" },
    { label: "추상", dash: false, fill: "bg-slate-300 dark:bg-slate-600" },
    { label: "구현", dash: false, fill: "bg-emerald-200 dark:bg-emerald-800" },
    { label: "★ process() 오버라이드", icon: "★", fill: "" },
  ];

  return (
    <div
      className={`flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600 dark:text-slate-400 ${
        compact ? "mt-1 px-1" : "mt-1.5 px-2"
      }`}
    >
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          {item.icon ? (
            <span className="text-emerald-600 dark:text-emerald-400">{item.icon}</span>
          ) : (
            <span
              className={`inline-block h-2.5 w-4 rounded-sm border border-slate-400 ${item.fill} ${
                item.dash ? "border-dashed" : ""
              }`}
            />
          )}
          {item.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <svg viewBox="0 0 10 8" className="h-2 w-2.5 fill-none stroke-emerald-600 stroke-[1.5] dark:stroke-emerald-400">
          <path d="M1 1 L5 7 L9 1 Z" />
        </svg>
        일반화(상속)
      </span>
    </div>
  );
}

function InheritanceDiagram({
  selectedNodeId,
  onSelectNode,
  compact = false,
  embedded = false,
}: InheritanceDiagramProps) {
  const markerId = useId().replace(/:/g, "");
  const nodeMap = useMemo(
    () => Object.fromEntries(OOP_CLASS_NODES.map((n) => [n.id, n])),
    [],
  );

  const handleNodeClick = useCallback(
    (node: ClassNodeData) => {
      onSelectNode(node.id);
    },
    [onSelectNode],
  );

  const svgClassName = embedded
    ? "h-full min-h-[140px] w-full rounded-lg bg-slate-50/70 ring-1 ring-slate-200 dark:bg-slate-950/30 dark:ring-slate-800"
    : compact
      ? "h-[min(42vh,320px)] min-h-[200px] w-full rounded-lg bg-slate-50/70 ring-1 ring-slate-200 dark:bg-slate-950/30 dark:ring-slate-800"
      : "h-[min(70vh,520px)] w-full rounded-lg bg-slate-50/70 ring-1 ring-slate-200 dark:bg-slate-950/30 dark:ring-slate-800";

  const diagramSvg = (
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
          onClick={handleNodeClick}
          showMethods={node.kind !== "concrete"}
        />
      ))}
    </svg>
  );

  if (embedded) {
    return (
      <div className="relative flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1">{diagramSvg}</div>
        <DiagramLegend compact={compact} />
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 ${
        compact ? "p-2" : "p-3"
      }`}
    >
      {!compact && (
        <h2 className="mb-1 shrink-0 text-xs font-semibold text-slate-700 dark:text-slate-200">
          상속 계층 다이어그램
        </h2>
      )}
      {compact && (
        <p className="mb-1 shrink-0 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          초록 노드 클릭 → 즉시 실행
        </p>
      )}
      <p className="mb-1 shrink-0 rounded-md border border-emerald-200/70 bg-emerald-50/60 px-2 py-0.5 text-[10px] text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        초록 구현 노드(Conveyor / Robot / Inspection) 클릭 시 데모 item으로 process() 실행
      </p>
      <div className="min-h-0 flex-1">
        {diagramSvg}
        <DiagramLegend compact={compact} />
      </div>
    </div>
  );
}

export default memo(InheritanceDiagram);
