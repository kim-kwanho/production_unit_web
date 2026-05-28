import { ConveyorBeltUnit } from "./ConveyorBeltUnit";
import { InspectionUnit } from "./InspectionUnit";
import { PlantEnergyContext } from "./PlantEnergyContext";
import { ProductionUnit } from "./ProductionUnit";
import { RobotArmUnit } from "./RobotArmUnit";
import { RUNNING } from "./types";
import type { IProductionUnit } from "./ProductionUnitADT";

export interface OopLabFactory {
  plantEnergy: PlantEnergyContext;
  units: {
    conveyor: ConveyorBeltUnit;
    robot: RobotArmUnit;
    inspection: InspectionUnit;
  };
  allUnits: IProductionUnit[];
  reset(): void;
}

/** OOP Lab 전용 고정 3유닛 데모 팩토리 (Dashboard와 plant energy 분리) */
export function createOopLabFactory(): OopLabFactory {
  const oopPlantEnergy = new PlantEnergyContext();
  const conveyor = new ConveyorBeltUnit(
    "CV-01",
    2,
    3.0,
    RUNNING,
    oopPlantEnergy,
  );
  const robot = new RobotArmUnit("RA-01", 1, 12.0, RUNNING, oopPlantEnergy);
  const inspection = new InspectionUnit(
    "INSP-01",
    1,
    6.0,
    RUNNING,
    oopPlantEnergy,
  );

  const allUnits: IProductionUnit[] = [conveyor, robot, inspection];

  return {
    plantEnergy: oopPlantEnergy,
    units: { conveyor, robot, inspection },
    allUnits,
    reset() {
      ProductionUnit.resetFactorySession(oopPlantEnergy, [
        conveyor,
        robot,
        inspection,
      ]);
      conveyor.start();
      robot.start();
      inspection.start();
    },
  };
}
