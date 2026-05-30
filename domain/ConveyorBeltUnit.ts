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
    // 1. 가동 상태 검사 — 정지 중이면 base 경고 반환
    if (this.status !== RUNNING) {
      return super.process(item);
    }
    // 2. 도메인 예외 — JAM 감지
    if (item.includes("JAM")) {
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
    // 3. 정상 처리 — 이송 메시지 + 에너지 소비(super)
    const messages = [
      processMsg(`  [${this.deviceId}] 컨베이어: '${item}' 이송 중...`, "info"),
    ];
    const result = super.process(item);
    return { ok: result.ok, messages: [...messages, ...result.messages] };
  }
}
