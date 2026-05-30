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
    // 1. 가동 상태 검사 — 정지 중이면 base 경고 반환
    if (this.status !== RUNNING) {
      return super.process(item);
    }
    // 2. 도메인 예외 — 불량 감지
    if (item.includes("DEFECT")) {
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
    // 3. 정상 처리 — 검사 메시지 + 에너지 소비(super)
    const messages = [
      processMsg(`  [${this.deviceId}] 검사기: '${item}' 품질 검사...`, "info"),
    ];
    const result = super.process(item);
    return { ok: result.ok, messages: [...messages, ...result.messages] };
  }
}
