"use client";

import { useMemo, useState } from "react";
import ClassNode, { type ClassNodeData } from "./ClassNode";
import { GENERALIZATION_EDGES, OOP_CLASS_NODES } from "./oopLabModel";

interface InheritanceDiagramProps {
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

function centerBottom(node: ClassNodeData) {
  return { x: node.x + node.width / 2, y: node.y + node.height };
}

function centerTop(node: ClassNodeData) {
  return { x: node.x + node.width / 2, y: node.y };
}

export default function InheritanceDiagram({
  selectedNodeId,
  onSelectNode,
}: InheritanceDiagramProps) {
  const [hovered, setHovered] = useState<ClassNodeData | null>(null);

  const nodeMap = useMemo(
    () => Object.fromEntries(OOP_CLASS_NODES.map((n) => [n.id, n])),
    [],
  );

  return (
    <div className="relative flex h-full min-h-[calc(100vh-8rem)] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        상속 계층 다이어그램 — 노드 클릭으로 다형성 시연
      </h2>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        구현 클래스(아래 3개)를 선택한 뒤 우측에서{" "}
        <code className="font-mono">process(item)</code>를 실행하세요. ADT/추상
        클래스는 설명용입니다.
      </p>
      <svg
        viewBox="0 0 680 360"
        className="h-[min(70vh,520px)] w-full rounded-lg bg-slate-50/70 ring-1 ring-slate-200 dark:bg-slate-950/30 dark:ring-slate-800"
      >
        <defs>
          <marker
            id="inherit-arrow"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="6"
            orient="auto"
          >
            <path
              d="M10,6 L1,1 L1,11 Z"
              fill="var(--oop-node-abstract-fill)"
              stroke="#22c55e"
              strokeWidth="1.5"
            />
          </marker>
        </defs>
        {GENERALIZATION_EDGES.map(({ subclass, superclass }) => {
          const a = centerTop(nodeMap[subclass]);
          const b = centerBottom(nodeMap[superclass]);
          const midY = (a.y + b.y) / 2;
          return (
            <path
              key={`${subclass}-${superclass}`}
              d={`M ${a.x} ${a.y} V ${midY} H ${b.x} V ${b.y}`}
              fill="none"
              stroke="#22c55e"
              strokeWidth={2.5}
              markerEnd="url(#inherit-arrow)"
            />
          );
        })}
        {OOP_CLASS_NODES.map((node) => (
          <ClassNode
            key={node.id}
            node={node}
            selected={selectedNodeId === node.id}
            onHover={setHovered}
            onClick={(n) => onSelectNode(n.id)}
          />
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-20 max-w-md rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-950/95"
          style={{
            left: Math.min(
              16 + hovered.x + hovered.width + 12,
              // keep within container (approx)
              16 + 680 - 320,
            ),
            top: Math.max(64, 16 + hovered.y - 6),
          }}
        >
          <p className="font-semibold text-emerald-700 dark:text-emerald-300">
            {hovered.label}
          </p>
          {hovered.deviceId && (
            <p className="text-slate-700 dark:text-slate-300">
              device_id: {hovered.deviceId}
            </p>
          )}
          {hovered.stationType && (
            <p className="text-slate-700 dark:text-slate-300">
              station_type: {hovered.stationType}
            </p>
          )}
          <p className="text-slate-500 dark:text-slate-400">
            {hovered.kind === "interface"
              ? "ADT(인터페이스) — 설명 노드"
              : hovered.kind === "abstract"
                ? "추상 클래스 — 설명 노드"
                : "구현 클래스 — 실행 노드 (우측에서 process() 실행)"}
          </p>
          <p className="mt-2 text-slate-500">메서드 (hover):</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {hovered.methods.map((m) => (
              <li
                key={m.name}
                className="rounded bg-slate-100 px-2 py-0.5 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                {m.name}
                {m.overridden ? " ★" : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
