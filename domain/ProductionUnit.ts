import { processMsg } from "./message";
import { PlantEnergyContext } from "./PlantEnergyContext";
import type { IProductionUnit } from "./ProductionUnitADT";
import {
  PLANT_ENERGY_LIMIT,
  RUNNING,
  STOPPED,
  type ProcessResult,
  type UnitStatus,
} from "./types";

/** ADT를 구현하는 생산 유닛 공통 클래스 (추상 클래스 — 직접 인스턴스화 불가) */
export abstract class ProductionUnit implements IProductionUnit {
  private _deviceId: string;
  private _status: UnitStatus;
  private _unitCount: number;
  private _energyPerCycle: number;
  private _stationType: string;
  private _processedCount = 0;
  protected readonly plantEnergy: PlantEnergyContext;

  constructor(
    deviceId: string,
    status: UnitStatus,
    unitCount: number,
    energyPerCycle: number,
    stationType = "base",
    plantEnergy: PlantEnergyContext,
  ) {
    this._deviceId = deviceId;
    this._status = status;
    this._unitCount = unitCount;
    this._energyPerCycle = energyPerCycle;
    this._stationType = stationType;
    this.plantEnergy = plantEnergy;
  }

  get deviceId(): string {
    return this._deviceId;
  }

  get status(): UnitStatus {
    return this._status;
  }

  set status(value: UnitStatus) {
    if (value !== RUNNING && value !== STOPPED) {
      return;
    }
    this._status = value;
  }

  get unitCount(): number {
    return this._unitCount;
  }

  set unitCount(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      return;
    }
    this._unitCount = value;
  }

  get energyPerCycle(): number {
    return this._energyPerCycle;
  }

  set energyPerCycle(value: number) {
    const v = Number(value);
    if (Number.isNaN(v) || v < 0) {
      return;
    }
    this._energyPerCycle = v;
  }

  get stationType(): string {
    return this._stationType;
  }

  get processedCount(): number {
    return this._processedCount;
  }

  start(): void {
    this._status = RUNNING;
  }

  stop(): void {
    this._status = STOPPED;
  }

  process(item: string): ProcessResult {
    if (this._status !== RUNNING) {
      return this.blockedResult(
        `가동 중이 아니어서 '${item}' 처리하지 않음.`,
        "warning",
      );
    }

    const step = this.energyForOneProcess();

    if (!this.plantEnergy.canAfford(step)) {
      return this.blockedResult(
        `공장 에너지 한도(${PLANT_ENERGY_LIMIT}) 초과로 '${item}' 처리를 취소합니다. ` +
          `(현재 ${this.plantEnergy.total.toFixed(1)}/${PLANT_ENERGY_LIMIT.toFixed(1)}, 필요 ${step.toFixed(1)})`,
        "error",
      );
    }

    this._processedCount += 1;
    this.plantEnergy.add(step);
    return this.completedResult(item);
  }

  private blockedResult(
    reason: string,
    level: "warning" | "error",
  ): ProcessResult {
    return {
      ok: false,
      messages: [
        processMsg(`  [${this._deviceId}] ${reason}`, level),
      ],
    };
  }

  private completedResult(item: string): ProcessResult {
    return {
      ok: true,
      messages: [
        processMsg(
          `  [${this._deviceId}] '${item}' 완료 (공장 ${this.plantEnergy.total.toFixed(1)}/${PLANT_ENERGY_LIMIT.toFixed(0)}, 남음 ${this.plantEnergy.remaining.toFixed(1)})`,
          "success",
        ),
      ],
    };
  }

  /**
   * 이 유닛의 처리 건수를 공장 전체 누적 에너지로 나눈 값.
   * ⚠️ plantEnergy는 라인 전체가 공유하므로 유닛 단독 효율이 아닌
   *    "공장 전체 에너지 대비 이 유닛의 기여도" 를 나타냅니다.
   */
  efficiency(): number {
    const pt = this.plantEnergy.total;
    if (pt <= 0) {
      return 0;
    }
    return this._processedCount / pt;
  }

  info(): string {
    const step = this.energyForOneProcess();
    const expEff = step <= 0 ? 0 : 1 / step;
    return (
      `device_id=${this._deviceId}, station_type=${this._stationType}, status=${this._status}, ` +
      `unit_count=${this._unitCount}, energy_per_cycle=${this._energyPerCycle}, ` +
      `processed=${this._processedCount}, exp_eff=${expEff.toFixed(4)}`
    );
  }

  resetStats(): void {
    this._processedCount = 0;
  }

  protected energyForOneProcess(): number {
    return this._energyPerCycle * this._unitCount;
  }

  static resetFactorySession(
    plantEnergy: PlantEnergyContext,
    units?: ProductionUnit[],
  ): void {
    plantEnergy.reset();
    units?.forEach((u) => u.resetStats());
  }

  static plantTotalEnergy(plantEnergy: PlantEnergyContext): number {
    return plantEnergy.total;
  }
}
