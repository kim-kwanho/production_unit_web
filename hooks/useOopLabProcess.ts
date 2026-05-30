import { useCallback, useRef } from "react";
import {
  NODE_DEMO_ITEMS,
  NODE_TO_UNIT,
  pickAlternatingDemoItem,
} from "@/components/oop/oopLabModel";
import { createLogEntry, logFromProcess } from "@/domain/log";
import type { OopLabFactory } from "@/domain/oopLabFactory";
import type { IProductionUnit } from "@/domain/ProductionUnitADT";
import { RUNNING, type ConcreteUnitKind, type LogEntry } from "@/domain/types";

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
  options?: { alternateDemoItems?: boolean },
) {
  const demoClickRef = useRef(0);

  const getUnitForNode = useCallback(
    (nodeId: string) => getUnitForNodeFromFactory(factory, nodeId),
    [factory],
  );

  const getDemoItemForKind = useCallback(
    (kind: ConcreteUnitKind) => {
      if (!options?.alternateDemoItems) {
        return NODE_DEMO_ITEMS[kind];
      }
      const item = pickAlternatingDemoItem(kind, demoClickRef.current);
      demoClickRef.current += 1;
      return item;
    },
    [options?.alternateDemoItems],
  );

  const runProcess = useCallback(
    (nodeId: string, item: string) => {
      const unit = getUnitForNode(nodeId);
      if (!unit) return;

      const autoStartLogs: LogEntry[] = [];
      if (unit.status !== RUNNING) {
        unit.start();
        autoStartLogs.push(
          createLogEntry(
            `[${unit.deviceId}] 정지 상태 — 데모 실행을 위해 가동을 시작했습니다.`,
            "info",
          ),
        );
      }

      const plantBefore = factory.plantEnergy.total;
      const before = snapshotUnit(unit);
      const result = unit.process(item);
      const plantAfter = factory.plantEnergy.total;
      const after = snapshotUnit(unit);

      const processedDelta = after.processedCount - before.processedCount;
      const energyDelta = plantAfter - plantBefore;

      appendLogs([
        ...autoStartLogs,
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
    },
    [appendLogs, factory.plantEnergy, getUnitForNode, onAfterProcess],
  );

  return { getUnitForNode, runProcess, getDemoItemForKind, snapshotUnit };
}
