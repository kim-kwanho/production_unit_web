"use client";

import { useMemo, useState } from "react";
import ClassNode, { type ClassNodeData } from "./ClassNode";

const NODES: ClassNodeData[] = [
  {
    id: "adt",
    label: "ProductionUnitADT",
    kind: "interface",
    methods: [
      { name: "start" },
      { name: "stop" },
      { name: "process", overridden: true },
      { name: "efficiency" },
      { name: "info" },
    ],
    x: 200,
    y: 20,
    width: 220,
    height: 72,
  },
  {
    id: "base",
    label: "ProductionUnit",
    kind: "abstract",
    methods: [
      { name: "start" },
      { name: "stop" },
      { name: "process", overridden: true },
      { name: "efficiency" },
      { name: "info" },
    ],
    x: 200,
    y: 130,
    width: 220,
    height: 72,
  },
  {
    id: "conveyor",
    label: "ConveyorBeltUnit",
    kind: "concrete",
    stationType: "conveyor",
    deviceId: "CV-01",
    methods: [
      { name: "start" },
      { name: "stop" },
      { name: "process", overridden: true },
      { name: "efficiency" },
      { name: "info" },
    ],
    x: 20,
    y: 260,
    width: 200,
    height: 82,
  },
  {
    id: "robot",
    label: "RobotArmUnit",
    kind: "concrete",
    stationType: "robot_arm",
    deviceId: "RA-01",
    methods: [
      { name: "start" },
      { name: "stop" },
      { name: "process", overridden: true },
      { name: "efficiency" },
      { name: "info" },
    ],
    x: 240,
    y: 260,
    width: 200,
    height: 82,
  },
  {
    id: "inspection",
    label: "InspectionUnit",
    kind: "concrete",
    stationType: "inspection",
    deviceId: "INSP-01",
    methods: [
      { name: "start" },
      { name: "stop" },
      { name: "process", overridden: true },
      { name: "efficiency" },
      { name: "info" },
    ],
    x: 460,
    y: 260,
    width: 200,
    height: 82,
  },
];

const EDGES = [
  { from: "adt", to: "base" },
  { from: "base", to: "conveyor" },
  { from: "base", to: "robot" },
  { from: "base", to: "inspection" },
];

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
    () => Object.fromEntries(NODES.map((n) => [n.id, n])),
    [],
  );

  return (
    <div className="relative flex h-full min-h-[calc(100vh-8rem)] flex-col rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        상속 계층 다이어그램 — 노드 클릭으로 다형성 시연
      </h2>
      <svg viewBox="0 0 680 360" className="h-[min(70vh,520px)] w-full">
        <defs>
          <marker
            id="inherit-arrow"
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill="#22c55e" />
          </marker>
        </defs>
        {EDGES.map(({ from, to }) => {
          const a = centerBottom(nodeMap[from]);
          const b = centerTop(nodeMap[to]);
          const midY = (a.y + b.y) / 2;
          return (
            <path
              key={`${from}-${to}`}
              d={`M ${a.x} ${a.y} V ${midY} H ${b.x} V ${b.y}`}
              fill="none"
              stroke="#22c55e"
              strokeWidth={2.5}
              markerEnd="url(#inherit-arrow)"
            />
          );
        })}
        {NODES.map((node) => (
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
        <div className="pointer-events-none absolute left-4 top-14 max-w-md rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-950/95">
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
              ? "ADT — 클릭 시 메서드 설명"
              : hovered.kind === "abstract"
                ? "추상 클래스 — 클릭 시 설명"
                : "구현 클래스 — 클릭 시 process() 실행"}
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
