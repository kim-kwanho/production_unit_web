"use client";

import { memo } from "react";
import type { NodePointerEvent } from "./oopClickHint";

export interface ClassMethodRef {
  name: string;
  overridden?: boolean;
  abstract?: boolean;
}

export interface ClassNodeData {
  id: string;
  label: string;
  kind: "interface" | "abstract" | "concrete";
  stationType?: string;
  deviceId?: string;
  inheritedMethods: ClassMethodRef[];
  overriddenMethods: ClassMethodRef[];
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ClassNodeProps {
  node: ClassNodeData;
  selected: boolean;
  isWorking?: boolean;
  onPointerEnter: (node: ClassNodeData, event: NodePointerEvent) => void;
  onPointerLeave: (node: ClassNodeData) => void;
  onPointerUp: (node: ClassNodeData, event: NodePointerEvent) => void;
  showMethods?: boolean;
}

function nodeFill(kind: ClassNodeData["kind"], selected: boolean): string {
  if (kind === "interface") return "var(--oop-node-interface-fill)";
  if (kind === "abstract") return "var(--oop-node-abstract-fill)";
  return selected
    ? "var(--oop-node-concrete-selected-fill)"
    : "var(--oop-node-concrete-fill)";
}

function ClassNode({
  node,
  selected,
  isWorking = false,
  onPointerEnter,
  onPointerLeave,
  onPointerUp,
  showMethods = false,
}: ClassNodeProps) {
  const stroke = isWorking
    ? "#16a34a"
    : selected
      ? "#22c55e"
      : node.kind === "interface"
        ? "var(--oop-node-interface-stroke, #7c3aed)"
        : node.kind === "abstract"
          ? "var(--oop-node-abstract-stroke, #2563eb)"
          : "#10b981";
  const dash = node.kind === "interface" ? "6 4" : undefined;
  const strokeWidth = isWorking || selected ? 3.5 : 2;
  const showPulse = node.kind === "concrete" && !selected && !isWorking;

  const isRunnable = node.kind === "concrete";
  const hint = isRunnable
    ? "호버 → 스펙 · 클릭 → P1 실행"
    : "호버 → 설명";

  return (
    <g
      className={isRunnable ? "cursor-pointer" : "cursor-help"}
      role="button"
      tabIndex={0}
      aria-label={`${node.label} — ${hint}`}
      onPointerEnter={(e) => onPointerEnter(node, e)}
      onPointerLeave={() => onPointerLeave(node)}
      onFocus={(e) => onPointerEnter(node, e)}
      onBlur={() => onPointerLeave(node)}
      onPointerUp={(e) => {
        if (e.button !== 0) return;
        onPointerUp(node, e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPointerUp(node, e as unknown as NodePointerEvent);
        }
      }}
      style={isRunnable ? undefined : { opacity: 0.92 }}
    >
      {showPulse && (
        <rect
          className="oop-concrete-pulse-ring"
          x={node.x - 5}
          y={node.y - 5}
          width={node.width + 10}
          height={node.height + 10}
          rx={10}
        />
      )}
      {selected && (
        <rect
          x={node.x - 4}
          y={node.y - 4}
          width={node.width + 8}
          height={node.height + 8}
          rx={12}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2}
          opacity={0.6}
        />
      )}
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={8}
        fill={nodeFill(node.kind, selected)}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {node.kind === "interface" && (
        <text
          x={node.x + node.width / 2}
          y={node.y + 16}
          textAnchor="middle"
          fill="var(--oop-node-sub-fill)"
          fontSize={10}
        >
          &lt;&lt;interface&gt;&gt;
        </text>
      )}
      <text
        x={node.x + node.width / 2}
        y={node.y + (node.kind === "interface" ? 32 : 26)}
        textAnchor="middle"
        fill="var(--oop-node-label-fill)"
        fontSize={13}
        fontWeight={600}
      >
        {node.label}
      </text>
      {node.deviceId && (
        <text
          x={node.x + node.width / 2}
          y={node.y + (node.kind === "interface" ? 48 : 42)}
          textAnchor="middle"
          fill="var(--oop-node-sub-fill)"
          fontSize={11}
        >
          {node.deviceId}
        </text>
      )}
      {showMethods && node.inheritedMethods.length > 0 && (
        <text
          x={node.x + node.width / 2}
          y={node.y + node.height - 22}
          textAnchor="middle"
          fill="var(--oop-node-method-fill)"
          fontSize={9}
        >
          {node.inheritedMethods
            .slice(0, 5)
            .map((m) => `${m.name}()`)
            .join(" · ")}
        </text>
      )}
      {node.kind === "concrete" &&
        !isWorking &&
        node.overriddenMethods.some((m) => m.overridden) && (
          <text
            x={node.x + node.width / 2}
            y={node.y + node.height - 22}
            textAnchor="middle"
            fill="var(--oop-node-override-fill)"
            fontSize={9}
            fontWeight={600}
          >
            ★ process() 오버라이드
          </text>
        )}
      {isWorking && node.kind === "concrete" && (
        <g className="oop-node-working" pointerEvents="none">
          <rect
            x={node.x + 4}
            y={node.y + node.height - 28}
            width={node.width - 8}
            height={18}
            rx={4}
            fill="#16a34a"
            opacity={0.9}
          />
          <text
            x={node.x + node.width / 2}
            y={node.y + node.height - 15}
            textAnchor="middle"
            fill="white"
            fontSize={10}
            fontWeight={700}
          >
            ▶ P1 처리 중…
          </text>
        </g>
      )}
      <text
        x={node.x + node.width / 2}
        y={node.y + node.height - 10}
        textAnchor="middle"
        fill="var(--oop-node-sub-fill)"
        fontSize={10}
        fontWeight={500}
        pointerEvents="none"
      >
        {isWorking
          ? "작업 중"
          : node.kind === "concrete"
            ? "호버 스펙 · 클릭 P1"
            : "호버 → 설명"}
      </text>
    </g>
  );
}

export default memo(ClassNode);
