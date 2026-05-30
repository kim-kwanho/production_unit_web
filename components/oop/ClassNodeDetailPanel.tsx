"use client";

import type { ClassNodeData } from "./ClassNode";
import {
  CONCRETE_CLASS_SPECS,
  CONCRETE_SPEC_BY_NODE,
  type ConcreteClassSpec,
} from "./classNodeSpecs";

const KIND_LABEL: Record<ClassNodeData["kind"], string> = {
  interface: "인터페이스",
  abstract: "추상",
  concrete: "구현",
};

const KIND_BADGE: Record<ClassNodeData["kind"], string> = {
  interface: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  abstract: "bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100",
  concrete: "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100",
};

function ProcessUnitCard({ spec, active }: { spec: ConcreteClassSpec; active: boolean }) {
  return (
    <div
      className={`rounded border p-1.5 text-[10px] transition-colors ${
        active
          ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-400/40 dark:border-emerald-500 dark:bg-emerald-950/50"
          : "border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/50"
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-mono font-semibold text-emerald-800 dark:text-emerald-200">
          {spec.deviceId}
        </span>
        {active && (
          <span className="rounded bg-emerald-600 px-1 py-0.5 text-[8px] font-medium text-white">
            선택
          </span>
        )}
      </div>
      <p className="truncate text-[9px] font-medium text-slate-700 dark:text-slate-300">
        {spec.label} · {spec.role}
      </p>
    </div>
  );
}

function ProcessCompareCards({ activeNodeId }: { activeNodeId: string | null }) {
  return (
    <div className="mt-1.5 grid grid-cols-3 gap-1">
      {CONCRETE_CLASS_SPECS.map((spec) => (
        <ProcessUnitCard key={spec.nodeId} spec={spec} active={activeNodeId === spec.nodeId} />
      ))}
    </div>
  );
}

export default function ClassNodeDetailPanel({
  node,
  canControlUnit,
  onClear,
  compact,
  minimal = false,
}: {
  node: ClassNodeData | null;
  canControlUnit: boolean;
  onClear?: () => void;
  compact?: boolean;
  /** 참고용 축소 표시 — 데모 시 로그가 주 시선 */
  minimal?: boolean;
}) {
  if (!node) {
    return null;
  }

  const concrete = CONCRETE_SPEC_BY_NODE[node.id];
  const showProcessCompare =
    node.kind === "concrete" || node.kind === "abstract" || node.kind === "interface";

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50/40 dark:border-slate-700/60 dark:bg-slate-950/20 ${
        minimal ? "text-[10px]" : ""
      }`}
    >
      <div
        className={`flex items-start justify-between gap-2 ${minimal ? "px-2 py-1.5" : "px-2.5 py-2"}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <span
              className={`rounded px-1 py-0.5 text-[9px] font-semibold ${KIND_BADGE[node.kind]}`}
            >
              {KIND_LABEL[node.kind]}
            </span>
            <p
              className={`font-semibold text-slate-900 dark:text-white ${
                compact || minimal ? "text-[11px]" : "text-xs"
              }`}
            >
              {node.label}
            </p>
            {node.deviceId && (
              <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">
                {node.deviceId}
              </span>
            )}
          </div>
          {!minimal && concrete && node.kind === "concrete" && (
            <p className="mt-0.5 text-[10px] text-slate-600 dark:text-slate-400">
              공정: {concrete.role}
            </p>
          )}
          {!minimal && !canControlUnit && node.kind !== "concrete" && (
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              정보 전용 — process() 실행 불가
            </p>
          )}
          {!minimal && canControlUnit && concrete && (
            <p className="mt-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
              클릭 시 <span className="font-mono">process(&quot;{concrete.demoItem}&quot;)</span>{" "}
              즉시 실행됨
            </p>
          )}
          {minimal && canControlUnit && concrete && (
            <p className="mt-0.5 truncate text-[9px] text-slate-500 dark:text-slate-400">
              데모 item: <span className="font-mono">{concrete.demoItem}</span>
            </p>
          )}
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[9px] text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            해제
          </button>
        )}
      </div>

      {showProcessCompare && !minimal && (
        <details className="border-t border-slate-200/60 px-2.5 py-1.5 dark:border-slate-700/40">
          <summary className="cursor-pointer select-none text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            process() 다형성 비교 (3개 구현 클래스)
          </summary>
          <ProcessCompareCards activeNodeId={node.kind === "concrete" ? node.id : null} />
        </details>
      )}
    </div>
  );
}
