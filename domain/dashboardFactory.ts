import { ConveyorBeltUnit } from "./ConveyorBeltUnit";
import { InspectionUnit } from "./InspectionUnit";
import { PlantEnergyContext } from "./PlantEnergyContext";
import { ProductionUnit } from "./ProductionUnit";
import { RobotArmUnit } from "./RobotArmUnit";
import type { IProductionUnit } from "./ProductionUnitADT";
import { LINE_MAX, type AddUnitKind } from "./types";

export type AddUnitResult =
  | { ok: true; unit: ProductionUnit }
  | { ok: false; reason: string };

export interface DashboardFactory {
  plantEnergy: PlantEnergyContext;
  line: ProductionUnit[];
  allUnits: ProductionUnit[];
  reset(): void;
  addUnit(kind: AddUnitKind): AddUnitResult;
  canAddUnit(): boolean;
}

const INITIAL_COUNTS = {
  conveyor: { unitCount: 2, energy: 3.0 },
  robot: { unitCount: 1, energy: 12.0 },
  inspection: { unitCount: 1, energy: 6.0 },
} as const;

/** Factory Dashboard 전용 조절 가능 라인 (OOP Lab과 plant energy 분리) */
export function createDashboardFactory(): DashboardFactory {
  const dashboardPlantEnergy = new PlantEnergyContext();

  const conveyor = new ConveyorBeltUnit(
    "CV-01",
    INITIAL_COUNTS.conveyor.unitCount,
    INITIAL_COUNTS.conveyor.energy,
    "stopped",
    dashboardPlantEnergy,
  );
  const robot = new RobotArmUnit(
    "RA-01",
    INITIAL_COUNTS.robot.unitCount,
    INITIAL_COUNTS.robot.energy,
    "stopped",
    dashboardPlantEnergy,
  );
  const inspection = new InspectionUnit(
    "INSP-01",
    INITIAL_COUNTS.inspection.unitCount,
    INITIAL_COUNTS.inspection.energy,
    "stopped",
    dashboardPlantEnergy,
  );

  const initialUnits: ProductionUnit[] = [conveyor, robot, inspection];
  const line: ProductionUnit[] = [...initialUnits];
  const allUnits: ProductionUnit[] = [...initialUnits];

  const counters = { conveyor: 1, robot_arm: 1, inspection: 1 };

  function nextId(kind: AddUnitKind): string {
    counters[kind] += 1;
    const n = counters[kind];
    if (kind === "conveyor") return `CV-${String(n).padStart(2, "0")}`;
    if (kind === "robot_arm") return `RA-${String(n).padStart(2, "0")}`;
    return `INSP-${String(n).padStart(2, "0")}`;
  }

  function restoreInitialLine(): void {
    line.length = 0;
    allUnits.length = 0;

    conveyor.unitCount = INITIAL_COUNTS.conveyor.unitCount;
    conveyor.energyPerCycle = INITIAL_COUNTS.conveyor.energy;
    robot.unitCount = INITIAL_COUNTS.robot.unitCount;
    robot.energyPerCycle = INITIAL_COUNTS.robot.energy;
    inspection.unitCount = INITIAL_COUNTS.inspection.unitCount;
    inspection.energyPerCycle = INITIAL_COUNTS.inspection.energy;

    line.push(conveyor, robot, inspection);
    allUnits.push(conveyor, robot, inspection);

    counters.conveyor = 1;
    counters.robot_arm = 1;
    counters.inspection = 1;
  }

  return {
    plantEnergy: dashboardPlantEnergy,
    line,
    allUnits,

    canAddUnit(): boolean {
      return line.length < LINE_MAX;
    },

    reset() {
      restoreInitialLine();
      ProductionUnit.resetFactorySession(dashboardPlantEnergy, allUnits);
      allUnits.forEach((u) => u.stop());
    },

    addUnit(kind: AddUnitKind): AddUnitResult {
      if (line.length >= LINE_MAX) {
        return {
          ok: false,
          reason: `라인은 최대 ${LINE_MAX}개 유닛까지 추가할 수 있습니다.`,
        };
      }

      const id = nextId(kind);
      let unit: ProductionUnit;

      if (kind === "conveyor") {
        unit = new ConveyorBeltUnit(
          id,
          INITIAL_COUNTS.conveyor.unitCount,
          INITIAL_COUNTS.conveyor.energy,
          "stopped",
          dashboardPlantEnergy,
        );
        allUnits.push(unit);
        line.unshift(unit);
      } else if (kind === "robot_arm") {
        unit = new RobotArmUnit(
          id,
          INITIAL_COUNTS.robot.unitCount,
          INITIAL_COUNTS.robot.energy,
          "stopped",
          dashboardPlantEnergy,
        );
        allUnits.push(unit);
        const inspIndex = line.findIndex((u) => u.stationType === "inspection");
        if (inspIndex >= 0) {
          line.splice(inspIndex, 0, unit);
        } else {
          line.push(unit);
        }
      } else {
        unit = new InspectionUnit(
          id,
          INITIAL_COUNTS.inspection.unitCount,
          INITIAL_COUNTS.inspection.energy,
          "stopped",
          dashboardPlantEnergy,
        );
        allUnits.push(unit);
        line.push(unit);
      }

      return { ok: true, unit };
    },
  };
}

export function getFinishedCount(units: IProductionUnit[]): number {
  return units
    .filter((u) => u.stationType === "inspection")
    .reduce((sum, u) => sum + u.processedCount, 0);
}

/** 라인에 있는 검사기만 합산 (도넛 표시용) */
export function getFinishedCountOnLine(line: IProductionUnit[]): number {
  return line
    .filter((u) => u.stationType === "inspection")
    .reduce((sum, u) => sum + u.processedCount, 0);
}

export function computeEfficiencyScore(
  plantEnergy: PlantEnergyContext,
  line: IProductionUnit[],
): { score: number; finished: number; plant: number; percent: number } {
  const plant = ProductionUnit.plantTotalEnergy(plantEnergy);
  const finished = getFinishedCountOnLine(line);
  const rawScore = plant <= 0 ? 0 : (finished / plant) * 1000;
  const percent = Math.min(100, rawScore);
  return { score: rawScore, finished, plant, percent };
}
