import { processMsg } from "./message";
import { ProductionUnit } from "./ProductionUnit";
import { PlantEnergyContext } from "./PlantEnergyContext";
import { RUNNING, STOPPED, type ProcessResult, type UnitStatus } from "./types";

/** 조립 공정 */
export class RobotArmUnit extends ProductionUnit {
  constructor(
    deviceId: string,
    unitCount = 1,
    energyPerCycle = 12.0,
    status: UnitStatus = STOPPED,
    plantEnergy: PlantEnergyContext,
  ) {
    super(deviceId, status, unitCount, energyPerCycle, "robot_arm", plantEnergy);
  }

  process(item: string): ProcessResult {
    if (this.status !== RUNNING) {
      return super.process(item);
    }
    if (typeof item === "string" && item.includes("HEAVY")) {
      return {
        ok: false,
        messages: [
          processMsg(
            `  [${this.deviceId}] 과중량 부품 감지! '${item}' 조립을 거부합니다.`,
            "error",
          ),
        ],
      };
    }
    const messages = [
      processMsg(`  [${this.deviceId}] 로봇암: '${item}' 조립 작업...`, "info"),
    ];
    const result = super.process(item);
    return { ok: result.ok, messages: [...messages, ...result.messages] };
  }
}
