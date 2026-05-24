"use client";

import Image from "next/image";
import type { ProductionUnit } from "@/domain/ProductionUnit";
import { RUNNING } from "@/domain/types";
import UnitTileIcon from "./UnitTileIcon";

export type PixelTileColor = "green" | "yellow" | "red";

interface PixelLineMapProps {
  line: ProductionUnit[];
  lastFailedUnitId: string | null;
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
        <div className="flex flex-wrap items-end gap-4">
          {line.map((unit, index) => {
            const color = tileColor(unit, lastFailedUnitId);
            return (
              <div
                key={`${unit.deviceId}-${index}`}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`relative flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 bg-white/90 shadow-sm dark:bg-slate-900/90 ${BORDER_CLASS[color]}`}
                  title={`${unit.deviceId} — ${unit.status}`}
                >
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-md ${BAR_CLASS[color]}`}
                  />
                  <UnitTileIcon
                    stationType={unit.stationType}
                    className="relative z-10 h-9 w-9 text-slate-700 dark:text-slate-200"
                  />
                </div>
                <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                  {unit.deviceId}
                </span>
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
