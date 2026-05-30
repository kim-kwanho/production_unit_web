import { useCallback } from "react";
import { NODE_TO_UNIT } from "@/components/oop/oopLabModel";
import { createLogEntry, logFromProcess } from "@/domain/log";
import type { OopLabFactory } from "@/domain/oopLabFactory";
import type { IProductionUnit } from "@/domain/ProductionUnitADT";
import type { LogEntry } from "@/domain/types";

export interface ProcessRunOutcome {
  ok: boolean;
  item: string;
  deviceId: string;
  stationType: string;
  energyDelta: number;
  energyPerProcess: number;
  expEff: number | null;
  processedDelta: number;
}

export function snapshotUnit(u: IProductionUnit) {
  const info = u.info();
  const kv = Object.fromEntries(
    info
      .split(",")
      .map((s) => s.trim())
      .map((pair) => {
        const i = pair.indexOf("=");
        if (i < 0) return [pair, ""];
        return [pair.slice(0, i), pair.slice(i + 1)];
      }),
  );
  const toNum = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  return {
    deviceId: u.deviceId,
    stationType: u.stationType,
    processedCount: u.processedCount,
    expEff: toNum(kv.exp_eff),
    unitCount: toNum(kv.unit_count),
    energyPerCycle: toNum(kv.energy_per_cycle),
  };
}

export function getUnitForNodeFromFactory(
  factory: OopLabFactory,
  nodeId: string,
): IProductionUnit | null {
  const kind = NODE_TO_UNIT[nodeId];
  if (!kind) return null;
  if (kind === "conveyor") return factory.units.conveyor;
  if (kind === "robot_arm") return factory.units.robot;
  return factory.units.inspection;
}

export function useOopLabProcess(
  factory: OopLabFactory,
  appendLogs: (entries: LogEntry[]) => void,
  onAfterProcess?: () => void,
) {
  const getUnitForNode = useCallback(
    (nodeId: string) => getUnitForNodeFromFactory(factory, nodeId),
    [factory],
  );

  const runProcess = useCallback(
    (nodeId: string, item: string): ProcessRunOutcome | null => {
      const unit = getUnitForNode(nodeId);
      if (!unit) return null;

      const plantBefore = factory.plantEnergy.total;
      const before = snapshotUnit(unit);
      const result = unit.process(item);
      const plantAfter = factory.plantEnergy.total;
      const after = snapshotUnit(unit);

      const processedDelta = after.processedCount - before.processedCount;
      const energyDelta = plantAfter - plantBefore;
      const energyPerProcess =
        before.energyPerCycle != null && before.unitCount != null
          ? before.energyPerCycle * before.unitCount
          : energyDelta;

      appendLogs([
        createLogEntry(
          `━━ 변화(diff): ${before.deviceId} (${before.stationType}) ━━`,
          "info",
        ),
        createLogEntry(
          `processed: ${before.processedCount} → ${after.processedCount} (${processedDelta >= 0 ? "+" : ""}${processedDelta})`,
          processedDelta > 0 ? "success" : "info",
        ),
        createLogEntry(
          `plant_energy: ${plantBefore.toFixed(1)} → ${plantAfter.toFixed(1)} (${energyDelta >= 0 ? "+" : ""}${energyDelta.toFixed(1)})`,
          energyDelta > 0 ? "warning" : "info",
        ),
        createLogEntry(
          `▶ ${unit.deviceId}.process("${item}") → ${result.ok ? "성공" : "실패"}`,
          result.ok ? "success" : "error",
        ),
        ...logFromProcess(result.messages),
      ]);
      onAfterProcess?.();

      return {
        ok: result.ok,
        item,
        deviceId: unit.deviceId,
        stationType: unit.stationType,
        energyDelta,
        energyPerProcess,
        expEff: after.expEff,
        processedDelta,
      };
    },
    [appendLogs, factory.plantEnergy, getUnitForNode, onAfterProcess],
  );

  return { getUnitForNode, runProcess, snapshotUnit };
}
