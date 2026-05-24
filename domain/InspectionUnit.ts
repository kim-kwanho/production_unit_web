import { processMsg } from "./message";
import { ProductionUnit } from "./ProductionUnit";
import { PlantEnergyContext } from "./PlantEnergyContext";
import { RUNNING, STOPPED, type ProcessResult, type UnitStatus } from "./types";

/** 검사 공정 */
export class InspectionUnit extends ProductionUnit {
  constructor(
    deviceId: string,
    unitCount = 1,
    energyPerCycle = 6.0,
    status: UnitStatus = STOPPED,
    plantEnergy: PlantEnergyContext,
  ) {
    super(
      deviceId,
      status,
      unitCount,
      energyPerCycle,
      "inspection",
      plantEnergy,
    );
  }

  process(item: string): ProcessResult {
    if (this.status !== RUNNING) {
      return super.process(item);
    }
    if (typeof item === "string" && item.includes("DEFECT")) {
      return {
        ok: false,
        messages: [
          processMsg(
            `  [${this.deviceId}] 불량 판정! '${item}' 검사를 종료합니다.`,
            "error",
          ),
        ],
      };
    }
    const messages = [
      processMsg(`  [${this.deviceId}] 검사기: '${item}' 품질 검사...`, "info"),
    ];
    const result = super.process(item);
    return { ok: result.ok, messages: [...messages, ...result.messages] };
  }
}
