import type { ProcessResult, UnitStatus } from "./types";

/** ProductionUnitADT — 추상 데이터 타입 인터페이스 */
export interface IProductionUnit {
  readonly deviceId: string;
  readonly status: UnitStatus;
  readonly unitCount: number;
  readonly energyPerCycle: number;
  readonly stationType: string;
  readonly processedCount: number;

  start(): void;
  stop(): void;
  process(item: string): ProcessResult;
  efficiency(): number;
  info(): string;
}
