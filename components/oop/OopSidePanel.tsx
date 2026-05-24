"use client";

import ActivityLog from "./ActivityLog";
import OopOnboarding from "./OopOnboarding";
import type { LogEntry, ProductPreset } from "@/domain/types";
import { PRODUCT_PRESETS } from "@/domain/types";

interface OopSidePanelProps {
  logs: LogEntry[];
  selectedPreset: ProductPreset;
  selectedNodeLabel: string | null;
  canControlUnit: boolean;
  onPresetClick: (preset: ProductPreset) => void;
  onStartSelected: () => void;
  onStopSelected: () => void;
  onReset: () => void;
  plantEnergy: string;
}

export default function OopSidePanel({
  logs,
  selectedPreset,
  selectedNodeLabel,
  canControlUnit,
  onPresetClick,
  onStartSelected,
  onStopSelected,
  onReset,
  plantEnergy,
}: OopSidePanelProps) {
  return (
    <aside className="flex h-full min-h-[calc(100vh-8rem)] flex-col rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/80">
      <OopOnboarding />

      {canControlUnit && (
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onStartSelected}
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs text-white hover:bg-emerald-600"
          >
            가동 {selectedNodeLabel ? `(${selectedNodeLabel})` : ""}
          </button>
          <button
            type="button"
            onClick={onStopSelected}
            className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs text-white hover:bg-amber-600"
          >
            정지
          </button>
        </div>
      )}

      <div className="mb-3">
        <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          제품 프리셋
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          클래스 선택 후 칩을 눌러 다른 item을 테스트하세요
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRODUCT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onPresetClick(preset)}
              className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                selectedPreset === preset
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <ActivityLog entries={logs} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        <p className="text-[10px] text-slate-500">에너지 {plantEnergy}</p>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          세션 리셋
        </button>
      </div>
    </aside>
  );
}
