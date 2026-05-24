import { PLANT_ENERGY_LIMIT } from "./types";

/** OOP Lab / Dashboard 각각 독립적인 공장 에너지 컨텍스트 */
export class PlantEnergyContext {
  private _total = 0;

  get total(): number {
    return this._total;
  }

  get limit(): number {
    return PLANT_ENERGY_LIMIT;
  }

  get remaining(): number {
    return Math.max(0, PLANT_ENERGY_LIMIT - this._total);
  }

  canAfford(step: number): boolean {
    return this._total + step <= PLANT_ENERGY_LIMIT;
  }

  get isAtLimit(): boolean {
    return this._total >= PLANT_ENERGY_LIMIT;
  }

  add(step: number): void {
    this._total += step;
  }

  reset(): void {
    this._total = 0;
  }
}
