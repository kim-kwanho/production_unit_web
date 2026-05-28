"use client";

import Image from "next/image";
import type { ProductionUnit } from "@/domain/ProductionUnit";
import { RUNNING } from "@/domain/types";
import UnitTileIcon from "./UnitTileIcon";

export type PixelTileColor = "green" | "yellow" | "red";

interface PixelLineMapProps {
  line: ProductionUnit[];
  lastFailedUnitId: string | null;
  activeUnitId?: string | null;
  activeItemLabel?: string | null;
  activeProgress?: number;
  highlightUnitId?: string | null;
}

function tileColor(
  unit: ProductionUnit,
  lastFailedUnitId: string | null,
): PixelTileColor {
  if (lastFailedUnitId === unit.deviceId) {
    return "red";
  }
  if (unit.status === RUNNING) {
    return "green";
  }
  return "yellow";
}

const BORDER_CLASS: Record<PixelTileColor, string> = {
  green: "border-factory-green ring-1 ring-factory-green/40",
  yellow: "border-factory-yellow ring-1 ring-factory-yellow/40",
  red: "border-factory-red ring-1 ring-factory-red/50",
};

const BAR_CLASS: Record<PixelTileColor, string> = {
  green: "bg-factory-green",
  yellow: "bg-factory-yellow",
  red: "bg-factory-red",
};

export default function PixelLineMap({
  line,
  lastFailedUnitId,
  activeUnitId,
  activeItemLabel,
  activeProgress = 0,
  highlightUnitId,
}: PixelLineMapProps) {
  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <Image
        src="/images/factory-bg.svg"
        alt=""
        fill
        className="object-cover opacity-30 blur-[2px] dark:opacity-40"
      />
      <div className="absolute inset-0 bg-white/75 dark:bg-slate-950/80" />

      <div className="relative p-4">
        <h2 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
          픽셀 라인 맵
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          {line.map((unit, index) => {
            const color = tileColor(unit, lastFailedUnitId);
            const isActive = activeUnitId === unit.deviceId;
            const isHighlighted = highlightUnitId === unit.deviceId && !isActive;
            const statusLabel =
              isActive ? "작업 중" : unit.status === RUNNING ? "가동" : "정지";
            return (
              <div key={`${unit.deviceId}-${index}`} className="flex items-center">
                <div
                  className={`relative flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 bg-white/90 shadow-sm transition-shadow dark:bg-slate-900/90 ${BORDER_CLASS[color]} ${
                    lastFailedUnitId === unit.deviceId ? "animate-pulse" : ""
                  } ${isHighlighted ? "ring-2 ring-emerald-500/70 shadow-md" : ""}`}
                  title={`${unit.deviceId} — ${statusLabel}`}
                >
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-md ${BAR_CLASS[color]}`}
                  />
                  {isActive && activeItemLabel && (
                    <div className="absolute left-1 top-1 rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {activeItemLabel}
                    </div>
                  )}
                  <UnitTileIcon
                    stationType={unit.stationType}
                    className="relative z-10 h-9 w-9 text-slate-700 dark:text-slate-200"
                  />
                  {isActive && (
                    <div className="absolute right-1 top-1 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-950/70 dark:text-slate-200">
                      {Math.round(activeProgress * 100)}%
                    </div>
                  )}
                </div>
                <div className="ml-2 flex min-w-[5.25rem] flex-col">
                  <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {unit.deviceId}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {statusLabel}
                  </span>
                </div>
                {index < line.length - 1 && (
                  <span className="mx-3 select-none text-slate-400 dark:text-slate-500">
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border-2 border-factory-green bg-factory-green/30" />
            가동 중
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border-2 border-factory-yellow bg-factory-yellow/30" />
            정지
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border-2 border-factory-red bg-factory-red/30" />
            마지막 실패 유닛
          </span>
        </div>
      </div>
    </div>
  );
}
