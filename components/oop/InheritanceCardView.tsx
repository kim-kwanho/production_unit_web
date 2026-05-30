"use client";

import { memo, useCallback, useMemo } from "react";
import UnitTileIcon from "@/components/dashboard/UnitTileIcon";
import type { ClassNodeData } from "./ClassNode";
import { CONCRETE_SPEC_BY_NODE } from "./classNodeSpecs";
import { OOP_CLASS_NODES } from "./oopLabModel";

interface InheritanceCardViewProps {
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  compact?: boolean;
}

const KIND_LABEL: Record<ClassNodeData["kind"], string> = {
  interface: "인터페이스",
  abstract: "추상",
  concrete: "구현",
};

function kindStyles(kind: ClassNodeData["kind"], selected: boolean) {
  if (kind === "interface") {
    return {
      border: "border-dashed border-slate-400 dark:border-slate-500",
      bg: "bg-slate-50 dark:bg-slate-800/60",
      badge: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    };
  }
  if (kind === "abstract") {
    return {
      border: "border-slate-400 dark:border-slate-500",
      bg: "bg-slate-100 dark:bg-slate-800/80",
      badge: "bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100",
    };
  }
  return {
    border: selected
      ? "border-emerald-500 ring-2 ring-emerald-400/50"
      : "border-emerald-400 dark:border-emerald-600",
    bg: selected
      ? "bg-emerald-100 dark:bg-emerald-950/50"
      : "bg-emerald-50 dark:bg-emerald-950/30",
    badge: "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100",
  };
}

function Connector({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`flex justify-center ${compact ? "py-0.5" : "py-1"}`}
      aria-hidden
    >
      <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400">
        <div className={`w-px bg-emerald-400 dark:bg-emerald-600 ${compact ? "h-2" : "h-3"}`} />
        <svg viewBox="0 0 12 8" className="h-1.5 w-2.5 fill-none stroke-current stroke-[1.5]">
          <path d="M1 1 L6 6 L11 1" />
        </svg>
      </div>
    </div>
  );
}

function HierarchyCard({
  node,
  selected,
  onClick,
  compact,
}: {
  node: ClassNodeData;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const spec = CONCRETE_SPEC_BY_NODE[node.id];
  const styles = kindStyles(node.kind, selected);
  const hasOverride = node.overriddenMethods.some((m) => m.overridden);
  const isRunnable = node.kind === "concrete";
  const isInfoOnly = node.kind === "interface" || node.kind === "abstract";

  const methodPreview =
    node.kind !== "concrete"
      ? node.inheritedMethods
          .slice(0, 5)
          .map((m) => m.name)
          .join(" · ")
      : null;

  const demoHint = spec ? `데모 item ${spec.demoItem}` : null;

  const sharedClass = `group relative w-full rounded-lg border text-left transition-all ${styles.border} ${styles.bg} ${
    compact ? "p-2" : "p-2.5"
  }`;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
            >
              {KIND_LABEL[node.kind]}
            </span>
            {isRunnable && (
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                클릭하여 실행
              </span>
            )}
            {isInfoOnly && (
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                정보 전용
              </span>
            )}
          </div>
          <p
            className={`mt-1 font-semibold text-slate-900 dark:text-white ${
              compact ? "text-xs" : "text-xs"
            }`}
          >
            {node.label}
          </p>
          {node.deviceId && (
            <p className="mt-0.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
              {node.deviceId}
            </p>
          )}
          {spec && (
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
              공정: <span className="font-medium text-slate-800 dark:text-slate-200">{spec.role}</span>
            </p>
          )}
          {methodPreview && (
            <p className="mt-1.5 truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">
              {methodPreview}()
            </p>
          )}
        </div>
        {node.stationType && (
          <div className="shrink-0 text-emerald-700 dark:text-emerald-300">
            <UnitTileIcon stationType={node.stationType} className={compact ? "h-7 w-7" : "h-9 w-9"} />
          </div>
        )}
      </div>

      {hasOverride && (
        <div className="mt-1.5 rounded border border-emerald-400/60 bg-emerald-100/80 px-1.5 py-0.5 dark:border-emerald-600/60 dark:bg-emerald-900/40">
          <p className="text-[9px] font-semibold text-emerald-800 dark:text-emerald-200">
            ★ <span className="font-mono">process()</span> 오버라이드
          </p>
        </div>
      )}

      {node.kind === "abstract" && (
        <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
          <span className="font-mono">process()</span> 기본 구현 — 실행 불가
        </p>
      )}

      {isRunnable && demoHint && (
        <p className="mt-1.5 text-[9px] font-medium text-emerald-700/80 dark:text-emerald-300/80">
          → <span className="font-mono">process(&quot;{spec!.demoItem}&quot;)</span> 즉시 실행
        </p>
      )}
    </>
  );

  if (isRunnable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${sharedClass} cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-emerald-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900`}
        aria-pressed={selected}
        aria-label={`${node.label} — 클릭하여 process(${spec?.demoItem ?? "데모"}) 실행`}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`${sharedClass} cursor-help opacity-95 hover:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 focus-visible:ring-offset-2 dark:hover:bg-slate-800/80 dark:focus-visible:ring-offset-slate-900`}
      aria-pressed={selected}
      aria-label={`${node.label} (${KIND_LABEL[node.kind]}) — 정보 보기`}
    >
      {inner}
    </div>
  );
}

function InheritanceCardView({
  selectedNodeId,
  onSelectNode,
  compact = false,
}: InheritanceCardViewProps) {
  const nodeMap = useMemo(
    () => Object.fromEntries(OOP_CLASS_NODES.map((n) => [n.id, n])),
    [],
  );

  const adt = nodeMap.adt;
  const base = nodeMap.base;
  const concretes = OOP_CLASS_NODES.filter((n) => n.kind === "concrete");

  const handleClick = useCallback(
    (node: ClassNodeData) => {
      onSelectNode(node.id);
    },
    [onSelectNode],
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className={`mx-auto flex w-full max-w-2xl flex-col ${compact ? "gap-0" : "gap-0"}`}
      >
        <HierarchyCard
          node={adt}
          selected={selectedNodeId === adt.id}
          onClick={() => handleClick(adt)}
          compact={compact}
        />

        <Connector compact={compact} />

        <HierarchyCard
          node={base}
          selected={selectedNodeId === base.id}
          onClick={() => handleClick(base)}
          compact={compact}
        />

        <Connector compact={compact} />

        <div
          className={`grid grid-cols-1 gap-2 sm:grid-cols-3 ${compact ? "gap-1.5" : "gap-3"}`}
        >
          {concretes.map((node) => (
            <HierarchyCard
              key={node.id}
              node={node}
              selected={selectedNodeId === node.id}
              onClick={() => handleClick(node)}
              compact={compact}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(InheritanceCardView);
