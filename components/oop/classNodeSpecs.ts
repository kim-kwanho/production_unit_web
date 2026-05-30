import type { ConcreteUnitKind } from "@/domain/types";

/** 사이드 패널 상세 — 구현 클래스별 차이 (OOP Lab 초기값 기준) */
export interface ConcreteClassSpec {
  nodeId: string;
  deviceId: string;
  label: string;
  role: string;
  unitCount: number;
  energyPerCycle: number;
  energyPerProcess: number;
  expEff: number;
  demoItem: string;
  failWhen: string;
  processNote: string;
}

function spec(
  nodeId: string,
  deviceId: string,
  label: string,
  role: string,
  unitCount: number,
  energyPerCycle: number,
  demoItem: string,
  failWhen: string,
  processNote: string,
): ConcreteClassSpec {
  const energyPerProcess = energyPerCycle * unitCount;
  return {
    nodeId,
    deviceId,
    label,
    role,
    unitCount,
    energyPerCycle,
    energyPerProcess,
    expEff: energyPerProcess > 0 ? 1 / energyPerProcess : 0,
    demoItem,
    failWhen,
    processNote,
  };
}

export const CONCRETE_CLASS_SPECS: ConcreteClassSpec[] = [
  spec(
    "conveyor",
    "CV-01",
    "ConveyorBeltUnit",
    "이송",
    2,
    3.0,
    "P-JAM",
    "'JAM' 포함",
    "컨베이어 이송 메시지",
  ),
  spec(
    "robot",
    "RA-01",
    "RobotArmUnit",
    "조립",
    1,
    12.0,
    "P-HEAVY",
    "'HEAVY' 포함",
    "로봇암 조립 메시지",
  ),
  spec(
    "inspection",
    "INSP-01",
    "InspectionUnit",
    "검사",
    1,
    6.0,
    "P-DEFECT",
    "'DEFECT' 포함",
    "검사·불량 판정 메시지",
  ),
];

export const CONCRETE_SPEC_BY_NODE: Record<string, ConcreteClassSpec> =
  Object.fromEntries(CONCRETE_CLASS_SPECS.map((s) => [s.nodeId, s]));

export const BASE_CLASS_SPEC = {
  unitCount: "(가변)",
  energyPerCycle: "(가변)",
  processNote: "가동 중이 아니면 base process() — 경고 후 종료",
} as const;

export function specForUnitKind(kind: ConcreteUnitKind): ConcreteClassSpec | undefined {
  const map: Record<ConcreteUnitKind, string> = {
    conveyor: "conveyor",
    robot_arm: "robot",
    inspection: "inspection",
  };
  return CONCRETE_SPEC_BY_NODE[map[kind]];
}
