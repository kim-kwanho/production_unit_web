import { PLANT_ENERGY_LIMIT } from "./types";

/** OOP Lab / Dashboard 각각 독립적인 공장 에너지 컨텍스트 */
export class PlantEnergyContext {
  private _total = 0;

  constructor(private readonly _limit: number = PLANT_ENERGY_LIMIT) {}

  get total(): number {
    return this._total;
  }

  get limit(): number {
    return this._limit;
  }

  get remaining(): number {
    return Math.max(0, this._limit - this._total);
  }

  canAfford(step: number): boolean {
    return this._total + step <= this._limit;
  }

  get isAtLimit(): boolean {
    return this._total >= this._limit;
  }

  add(step: number): void {
    this._total += step;
  }

  remove(step: number): void {
    this._total = Math.max(0, this._total - step);
  }

  reset(): void {
    this._total = 0;
  }
}
