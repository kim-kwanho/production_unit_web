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
    // 1. 가동 상태 검사 — 정지 중이면 base 경고 반환
    if (this.status !== RUNNING) {
      return super.process(item);
    }
    // 2. 도메인 예외 — 과중량 감지
    if (item.includes("HEAVY")) {
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
    // 3. 정상 처리 — 조립 메시지 + 에너지 소비(super)
    const messages = [
      processMsg(`  [${this.deviceId}] 로봇암: '${item}' 조립 작업...`, "info"),
    ];
    const result = super.process(item);
    return { ok: result.ok, messages: [...messages, ...result.messages] };
  }
}
