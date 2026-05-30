"use client";

import Image from "next/image";
import { memo } from "react";
import type { ProductionUnit } from "@/domain/ProductionUnit";
import { RUNNING } from "@/domain/types";
import UnitTileIcon from "./UnitTileIcon";

export type PixelTileColor = "green" | "yellow" | "red";

interface PixelLineMapProps {
  line: ProductionUnit[];
  /** factory in-place 변경 후 UI 동기화용 */
  lineSyncVersion?: number;
  lastFailedUnitId: string | null;
  activeUnitId?: string | null;
  activeItemLabel?: string | null;
  activeProgress?: number;
  highlightUnitId?: string | null;
  compact?: boolean;
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

function PixelLineMap({
  line,
  lineSyncVersion: _lineSyncVersion,
  lastFailedUnitId,
  activeUnitId,
  activeItemLabel,
  activeProgress = 0,
  highlightUnitId,
  compact = false,
}: PixelLineMapProps) {
  void _lineSyncVersion;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 ${
        compact ? "min-h-[140px]" : "min-h-[148px]"
      }`}
    >
      <Image
        src="/images/factory-bg.svg"
        alt=""
        fill
        sizes={compact ? "(max-width: 640px) 100vw, 50vw" : "100vw"}
        className="object-cover opacity-30 blur-[2px] dark:opacity-40"
        priority={compact}
      />
      <div className="absolute inset-0 bg-white/75 dark:bg-slate-950/80" />

      <div className={`relative ${compact ? "p-2.5" : "p-3"}`}>
        <h2
          className={`font-medium text-slate-700 dark:text-slate-300 ${
            compact ? "mb-1.5 text-xs" : "mb-2 text-xs"
          }`}
        >
          픽셀 라인 맵
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          {line.map((unit, index) => {
            const color = tileColor(unit, lastFailedUnitId);
            const isActive = activeUnitId === unit.deviceId;
            const isHighlighted = highlightUnitId === unit.deviceId && !isActive;
            const statusLabel =
              isActive ? "작업 중" : unit.status === RUNNING ? "가동" : "정지";
            const tileSize = compact ? "h-12 w-12" : "h-14 w-14";
            return (
              <div key={`${unit.deviceId}-${index}`} className="flex items-center">
                <div
                  className={`relative flex ${tileSize} flex-col items-center justify-center rounded-lg border-2 bg-white/90 shadow-sm transition-shadow dark:bg-slate-900/90 ${BORDER_CLASS[color]} ${
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
                    className={`relative z-10 text-slate-700 dark:text-slate-200 ${
                      compact ? "h-8 w-8" : "h-9 w-9"
                    }`}
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
        {!compact && (
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-slate-600 dark:text-slate-400">
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
        )}
      </div>
    </div>
  );
}

export default memo(PixelLineMap);
