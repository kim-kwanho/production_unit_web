export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function formatEnergy(value: number): string {
  return value.toFixed(1);
}

export function clampUnitCount(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
