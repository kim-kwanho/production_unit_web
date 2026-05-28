import type { ConcreteUnitKind } from "@/domain/types";
import type { ClassNodeData } from "./ClassNode";

const COMMON_METHODS: ClassNodeData["methods"] = [
  { name: "start" },
  { name: "stop" },
  { name: "process", overridden: true },
  { name: "efficiency" },
  { name: "info" },
];

export const OOP_CLASS_NODES: ClassNodeData[] = [
  {
    id: "adt",
    label: "ProductionUnitADT",
    kind: "interface",
    methods: COMMON_METHODS,
    x: 200,
    y: 20,
    width: 220,
    height: 72,
  },
  {
    id: "base",
    label: "ProductionUnit",
    kind: "abstract",
    methods: COMMON_METHODS,
    x: 200,
    y: 130,
    width: 220,
    height: 72,
  },
  {
    id: "conveyor",
    label: "ConveyorBeltUnit",
    kind: "concrete",
    stationType: "conveyor",
    deviceId: "CV-01",
    methods: COMMON_METHODS,
    x: 20,
    y: 260,
    width: 200,
    height: 82,
  },
  {
    id: "robot",
    label: "RobotArmUnit",
    kind: "concrete",
    stationType: "robot_arm",
    deviceId: "RA-01",
    methods: COMMON_METHODS,
    x: 240,
    y: 260,
    width: 200,
    height: 82,
  },
  {
    id: "inspection",
    label: "InspectionUnit",
    kind: "concrete",
    stationType: "inspection",
    deviceId: "INSP-01",
    methods: COMMON_METHODS,
    x: 460,
    y: 260,
    width: 200,
    height: 82,
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

export const NODE_INFO: Record<string, string> = {
  adt: "ProductionUnitADT — 인터페이스 역할. start/stop/process/efficiency/info 계약을 정의합니다.",
  base: "ProductionUnit — 공통 구현. 가동 상태, 에너지 한도, 기본 process() 흐름을 제공합니다.",
};
