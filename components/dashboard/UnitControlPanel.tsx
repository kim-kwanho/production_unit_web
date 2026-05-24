"use client";

import type { ProductionUnit } from "@/domain/ProductionUnit";
import {
  LINE_MAX,
  PRODUCT_PRESETS,
  RUNNING,
  UNIT_COUNT_MAX,
  UNIT_COUNT_MIN,
  type AddUnitKind,
} from "@/domain/types";

interface UnitControlPanelProps {
  line: ProductionUnit[];
  productInput: string;
  addUnitKind: AddUnitKind;
  onAddUnitKindChange: (kind: AddUnitKind) => void;
  canAddUnit: boolean;
  onProductInputChange: (value: string) => void;
  onPresetSelect: (preset: string) => void;
  onStartAll: () => void;
  onStopAll: () => void;
  onRunPipeline: () => void;
  onAddUnit: () => void;
  onUnitCountChange: (deviceId: string, delta: number) => void;
  energyAtLimit: boolean;
  plantEnergyLabel: string;
}

export default function UnitControlPanel({
  line,
  productInput,
  addUnitKind,
  onAddUnitKindChange,
  canAddUnit,
  onProductInputChange,
  onPresetSelect,
  onStartAll,
  onStopAll,
  onRunPipeline,
  onAddUnit,
  onUnitCountChange,
  energyAtLimit,
  plantEnergyLabel,
}: UnitControlPanelProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          유닛 제어
        </h2>
        <span
          className={`font-mono text-xs ${
            energyAtLimit
              ? "font-semibold text-red-600 dark:text-red-400"
              : "text-slate-500"
          }`}
        >
          에너지 {plantEnergyLabel}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onStartAll}
          disabled={energyAtLimit}
          title={
            energyAtLimit
              ? "공장 에너지 한도에 도달했습니다"
              : "전체 유닛 가동"
          }
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start All
        </button>
        <button
          type="button"
          onClick={onStopAll}
          className="rounded-lg bg-amber-700 px-3 py-1.5 text-sm text-white hover:bg-amber-600"
        >
          Stop All
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={addUnitKind}
          onChange={(e) => onAddUnitKindChange(e.target.value as AddUnitKind)}
          disabled={!canAddUnit}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="conveyor">컨베이어</option>
          <option value="robot_arm">로봇암</option>
          <option value="inspection">검사기</option>
        </select>
        <button
          type="button"
          onClick={onAddUnit}
          disabled={!canAddUnit}
          className="rounded-lg bg-slate-600 px-3 py-2 text-sm text-white hover:bg-slate-500 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          + 유닛 추가
        </button>
        <span className="text-xs text-slate-500">
          {line.length}/{LINE_MAX}칸
        </span>
      </div>

      {!canAddUnit && (
        <p className="mb-3 text-xs text-amber-700 dark:text-amber-400">
          라인이 가득 찼습니다 (최대 {LINE_MAX}유닛).
        </p>
      )}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <select
          value={
            (PRODUCT_PRESETS as readonly string[]).includes(productInput)
              ? productInput
              : ""
          }
          onChange={(e) => {
            if (e.target.value) onPresetSelect(e.target.value);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">프리셋 선택…</option>
          {PRODUCT_PRESETS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={productInput}
          onChange={(e) => onProductInputChange(e.target.value)}
          placeholder="제품 ID 직접 입력 (예: P1)"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={onRunPipeline}
          disabled={energyAtLimit}
          title={
            energyAtLimit
              ? "공장 에너지 한도에 도달했습니다"
              : "라인 파이프라인 실행"
          }
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Run Pipeline
        </button>
      </div>

      {energyAtLimit && (
        <p className="mb-3 text-xs font-medium text-red-600 dark:text-red-400">
          공장 에너지 한도(100)에 도달했습니다. Run Pipeline을 사용할 수 없습니다.
        </p>
      )}

      <ul className="space-y-3">
        {line.map((unit) => (
          <li
            key={unit.deviceId}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/60"
          >
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {unit.deviceId}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unit.stationType} ·{" "}
                {unit.status === RUNNING ? "가동" : "정지"} · 처리{" "}
                {unit.processedCount}건
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">unit_count</span>
              <button
                type="button"
                onClick={() => onUnitCountChange(unit.deviceId, -1)}
                disabled={unit.unitCount <= UNIT_COUNT_MIN}
                className="rounded bg-slate-200 px-2 py-1 text-sm disabled:opacity-40 dark:bg-slate-800"
              >
                −
              </button>
              <span className="w-6 text-center font-mono text-sm">
                {unit.unitCount}
              </span>
              <button
                type="button"
                onClick={() => onUnitCountChange(unit.deviceId, 1)}
                disabled={unit.unitCount >= UNIT_COUNT_MAX}
                className="rounded bg-slate-200 px-2 py-1 text-sm disabled:opacity-40 dark:bg-slate-800"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
