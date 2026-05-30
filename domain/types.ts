export type UnitStatus = "running" | "stopped";

export type LogLevel = "info" | "success" | "warning" | "error";

export interface ProcessMessage {
  text: string;
  level: LogLevel;
}

export interface ProcessResult {
  ok: boolean;
  messages: ProcessMessage[];
}

export interface LogEntry {
  time: string;
  level: LogLevel;
  text: string;
}

export const RUNNING: UnitStatus = "running";
export const STOPPED: UnitStatus = "stopped";

/** Factory Dashboard — 라인 전체 공유 한도 */
export const PLANT_ENERGY_LIMIT = 100;

/** OOP Lab — 다형성·오버라이드 반복 실험용 (대시보드와 별도 컨텍스트) */
export const OOP_LAB_PLANT_ENERGY_LIMIT = 10_000;

export const UNIT_COUNT_MIN = 1;
export const UNIT_COUNT_MAX = 10;

export const LINE_MAX = 8;

export type AddUnitKind = "conveyor" | "robot_arm" | "inspection";

export type ConcreteUnitKind = "conveyor" | "robot_arm" | "inspection";

export const PRODUCT_PRESETS = ["P1", "P-JAM", "P-HEAVY", "P-DEFECT"] as const;
export type ProductPreset = (typeof PRODUCT_PRESETS)[number];
