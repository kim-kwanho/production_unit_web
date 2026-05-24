import { processMsg } from "./message";
import { ProductionUnit } from "./ProductionUnit";
import { PlantEnergyContext } from "./PlantEnergyContext";
import { RUNNING, STOPPED, type ProcessResult, type UnitStatus } from "./types";

/** 이송 공정 */
export class ConveyorBeltUnit extends ProductionUnit {
  constructor(
    deviceId: string,
    unitCount = 2,
    energyPerCycle = 3.0,
    status: UnitStatus = STOPPED,
    plantEnergy: PlantEnergyContext,
  ) {
    super(deviceId, status, unitCount, energyPerCycle, "conveyor", plantEnergy);
  }

  process(item: string): ProcessResult {
    if (this.status !== RUNNING) {
      return super.process(item);
    }
    if (typeof item === "string" && item.includes("JAM")) {
      return {
        ok: false,
        messages: [
          processMsg(
            `  [${this.deviceId}] 컨베이어 정체 감지! '${item}' 이송 중단.`,
            "error",
          ),
        ],
      };
    }
    const messages = [
      processMsg(`  [${this.deviceId}] 컨베이어: '${item}' 이송 중...`, "info"),
    ];
    const result = super.process(item);
    return { ok: result.ok, messages: [...messages, ...result.messages] };
  }
}
