"use client";

import { memo, useEffect, useState } from "react";
import InheritanceCardView from "./InheritanceCardView";
import InheritanceDiagram from "./InheritanceDiagram";

export type InheritanceViewMode = "card" | "diagram";

interface InheritanceViewProps {
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  compact?: boolean;
  defaultMode?: InheritanceViewMode;
}

const VIEW_TABS: { id: InheritanceViewMode; label: string }[] = [
  { id: "card", label: "카드" },
  { id: "diagram", label: "다이어그램" },
];

function InheritanceView({
  selectedNodeId,
  onSelectNode,
  compact = false,
  defaultMode = "card",
}: InheritanceViewProps) {
  const [mode, setMode] = useState<InheritanceViewMode>(defaultMode);

  useEffect(() => {
    const saved = localStorage.getItem("sf-inheritance-view-mode");
    if (saved === "card" || saved === "diagram") {
      setMode(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sf-inheritance-view-mode", mode);
  }, [mode]);

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 ${
        compact ? "p-2" : "p-3"
      }`}
    >
      <div className="mb-2 flex shrink-0 flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {!compact && (
            <h2 className="min-w-0 flex-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
              상속 계층
            </h2>
          )}
          {compact && (
            <p className="min-w-0 flex-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              초록 구현 카드 클릭
            </p>
          )}
        <div className="flex shrink-0 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800/80">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 ${
                mode === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        </div>
        <p
          className={`shrink-0 rounded-md border border-emerald-200/70 bg-emerald-50/60 px-2 py-1 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-200 ${
            compact ? "text-[10px]" : "text-[11px]"
          }`}
        >
          <span className="font-medium">시작:</span> 초록색 구현 카드(Conveyor / Robot / Inspection)를
          클릭하면 데모 item으로 <code className="font-mono">process()</code>가 즉시 실행됩니다.
          ADT·Base는 정보 전용입니다.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {mode === "card" ? (
          <InheritanceCardView
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            compact={compact}
          />
        ) : (
          <InheritanceDiagram
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            compact={compact}
            embedded
          />
        )}
      </div>
    </div>
  );
}

export default memo(InheritanceView);
