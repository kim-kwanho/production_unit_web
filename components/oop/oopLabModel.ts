import type { ConcreteUnitKind } from "@/domain/types";
import type { ClassNodeData } from "./ClassNode";

const INHERITED_FROM_BASE: ClassNodeData["inheritedMethods"] = [
  { name: "start" },
  { name: "stop" },
  { name: "efficiency" },
  { name: "info" },
];

/** ProductionUnit — ADT process() 계약의 기본 구현 (하위 클래스는 super.process() 호출) */
const BASE_PROCESS_METHOD: ClassNodeData["inheritedMethods"] = [
  ...INHERITED_FROM_BASE,
  { name: "process" }, // abstract 아님 — base에서 구현됨
];

const ADT_CONTRACT_METHODS: ClassNodeData["inheritedMethods"] = [
  { name: "start" },
  { name: "stop" },
  { name: "process" },
  { name: "efficiency" },
  { name: "info" },
];

export const OOP_CLASS_NODES: ClassNodeData[] = [
  {
    id: "adt",
    label: "ProductionUnitADT",
    kind: "interface",
    inheritedMethods: ADT_CONTRACT_METHODS,
    overriddenMethods: [],
    x: 230,
    y: 20,
    width: 220,
    height: 88,
  },
  {
    id: "base",
    label: "ProductionUnit",
    kind: "abstract",
    inheritedMethods: BASE_PROCESS_METHOD,
    overriddenMethods: [],
    x: 230,
    y: 130,
    width: 220,
    height: 88,
  },
  {
    id: "conveyor",
    label: "ConveyorBeltUnit",
    kind: "concrete",
    stationType: "conveyor",
    deviceId: "CV-01",
    inheritedMethods: INHERITED_FROM_BASE,
    overriddenMethods: [{ name: "process", overridden: true }],
    x: 20,
    y: 260,
    width: 200,
    height: 90,
  },
  {
    id: "robot",
    label: "RobotArmUnit",
    kind: "concrete",
    stationType: "robot_arm",
    deviceId: "RA-01",
    inheritedMethods: INHERITED_FROM_BASE,
    overriddenMethods: [{ name: "process", overridden: true }],
    x: 240,
    y: 260,
    width: 200,
    height: 90,
  },
  {
    id: "inspection",
    label: "InspectionUnit",
    kind: "concrete",
    stationType: "inspection",
    deviceId: "INSP-01",
    inheritedMethods: INHERITED_FROM_BASE,
    overriddenMethods: [{ name: "process", overridden: true }],
    x: 460,
    y: 260,
    width: 200,
    height: 90,
  },
];

export const GENERALIZATION_EDGES = [
  { subclass: "base", superclass: "adt" },
  { subclass: "conveyor", superclass: "base" },
  { subclass: "robot", superclass: "base" },
  { subclass: "inspection", superclass: "base" },
] as const;

export const NODE_TO_UNIT: Record<string, ConcreteUnitKind> = {
  conveyor: "conveyor",
  robot: "robot_arm",
  inspection: "inspection",
};

export const NODE_DEMO_ITEMS: Record<ConcreteUnitKind, string> = {
  conveyor: "P-JAM",
  robot_arm: "P-HEAVY",
  inspection: "P-DEFECT",
};

/** 다이어그램 클릭 시 기본 item — 정상 가동·에너지/효율 차이 비교용 */
export const NODE_CLICK_ITEM = "P1";

export const NODE_INFO: Record<string, string> = {
  adt: "ProductionUnitADT — 인터페이스 역할. start/stop/process/efficiency/info 계약을 정의합니다.",
  base: "ProductionUnit — 공통 구현. 가동·에너지 검사 후 process() 기본 흐름을 제공하며, 하위 클래스는 super.process()로 이를 재사용합니다.",
};

export const NODE_WHY: Record<string, string> = {
  adt: "인터페이스(ADT)는 구현이 아니라 ‘약속(계약)’을 제공합니다.",
  base: "추상 클래스는 process() 기본 구현을 제공하고, 하위 클래스는 공정별 로직 뒤 super.process()로 에너지·완료 처리를 위임합니다.",
  conveyor:
    "ConveyorBeltUnit은 운반 단계에 맞게 process()를 오버라이딩해 ‘이동/적재’ 중심의 메시지를 냅니다.",
  robot: "RobotArmUnit은 조립/작업 단계에 맞게 process()를 오버라이딩해 ‘작업/가공’ 중심의 메시지를 냅니다.",
  inspection:
    "InspectionUnit은 검사 단계에 맞게 process()를 오버라이딩해 ‘검사/불량’ 중심의 메시지를 냅니다.",
};
