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

export const PLANT_ENERGY_LIMIT = 100;

export const UNIT_COUNT_MIN = 1;
export const UNIT_COUNT_MAX = 10;

export const LINE_MAX = 8;

export type AddUnitKind = "conveyor" | "robot_arm" | "inspection";

export type ConcreteUnitKind = "conveyor" | "robot_arm" | "inspection";

export const DEMO_ITEMS: Record<ConcreteUnitKind, string> = {
  conveyor: "P-JAM",
  robot_arm: "P-HEAVY",
  inspection: "P-DEFECT",
};

export const PRODUCT_PRESETS = ["P1", "P-JAM", "P-HEAVY", "P-DEFECT"] as const;
export type ProductPreset = (typeof PRODUCT_PRESETS)[number];
