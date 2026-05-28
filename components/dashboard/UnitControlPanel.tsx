"use client";

import type { ProductionUnit } from "@/domain/ProductionUnit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  LINE_MAX,
  PRODUCT_PRESETS,
  RUNNING,
  UNIT_COUNT_MAX,
  UNIT_COUNT_MIN,
  type AddUnitKind,
} from "@/domain/types";

interface UnitControlPanelProps {
  line: ProductionUnit[];
  productInput: string;
  addUnitKind: AddUnitKind;
  onAddUnitKindChange: (kind: AddUnitKind) => void;
  canAddUnit: boolean;
  onProductInputChange: (value: string) => void;
  onPresetSelect: (preset: string) => void;
  onStartAll: () => void;
  onStopAll: () => void;
  onRunPipeline: () => void;
  onAddUnit: () => void;
  onUnitCountChange: (deviceId: string, delta: number) => void;
  energyAtLimit: boolean;
  plantEnergyLabel: string;
  studioMinimal?: boolean;
}

export default function UnitControlPanel({
  line,
  productInput,
  addUnitKind,
  onAddUnitKindChange,
  canAddUnit,
  onProductInputChange,
  onPresetSelect,
  onStartAll,
  onStopAll,
  onRunPipeline,
  onAddUnit,
  onUnitCountChange,
  energyAtLimit,
  plantEnergyLabel,
  studioMinimal = false,
}: UnitControlPanelProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            유닛 제어
          </h2>
          <div className="text-right">
            <span
              className={`font-mono text-xs ${
                energyAtLimit
                  ? "font-semibold text-red-600 dark:text-red-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {plantEnergyLabel}
            </span>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              현재 부하(점유)는 작업 종료 시 내려가며, 효율은 최근 60초 기준입니다.
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            onClick={onStartAll}
            disabled={energyAtLimit}
            title={
              energyAtLimit
                ? "공장 에너지 한도에 도달했습니다"
                : "전체 유닛 가동"
            }
            variant="primary"
            size="sm"
          >
          전체 가동
          </Button>
          <Button onClick={onStopAll} variant="secondary" size="sm">
          전체 정지
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {!studioMinimal && (
            <>
              <Select
                value={addUnitKind}
                onChange={(e) =>
                  onAddUnitKindChange(e.target.value as AddUnitKind)
                }
                disabled={!canAddUnit}
                aria-label="추가할 유닛 종류 선택"
                className="min-w-[10rem]"
              >
                <option value="conveyor">컨베이어</option>
                <option value="robot_arm">로봇암</option>
                <option value="inspection">검사기</option>
              </Select>
              <Button
                onClick={onAddUnit}
                disabled={!canAddUnit}
                variant="secondary"
                size="md"
              >
                + 유닛 추가
              </Button>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {line.length}/{LINE_MAX}칸
              </span>
            </>
          )}
        </div>

        {!studioMinimal && !canAddUnit && (
          <p className="mb-3 text-xs text-amber-700 dark:text-amber-400">
            라인이 가득 찼습니다 (최대 {LINE_MAX}유닛).
          </p>
        )}

        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Select
            value={
              (PRODUCT_PRESETS as readonly string[]).includes(productInput)
                ? productInput
                : ""
            }
            onChange={(e) => {
              if (e.target.value) onPresetSelect(e.target.value);
            }}
            aria-label="제품 프리셋 선택"
            className="sm:w-44"
          >
            <option value="">프리셋 선택…</option>
            {PRODUCT_PRESETS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Input
            value={productInput}
            onChange={(e) => onProductInputChange(e.target.value)}
            placeholder="제품 ID 직접 입력 (예: P1)"
            aria-label="제품 ID 입력"
            className="min-w-0 flex-1"
          />
          <Button
            onClick={onRunPipeline}
            disabled={energyAtLimit}
            title={
              energyAtLimit
                ? "공장 에너지 한도에 도달했습니다"
                : "라인 파이프라인 실행"
            }
            variant="primary"
            size="md"
          >
          파이프라인 실행
          </Button>
        </div>

        {energyAtLimit && (
          <p className="mb-3 text-xs font-medium text-red-600 dark:text-red-400">
          공장 에너지 한도(100)에 도달했습니다. 파이프라인 실행을 사용할 수 없습니다.
          </p>
        )}

        {!studioMinimal && (
          <ul className="space-y-3">
            {line.map((unit) => (
              <li
                key={unit.deviceId}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 dark:text-white">
                    {unit.deviceId}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {unit.stationType} ·{" "}
                    {unit.status === RUNNING ? "가동" : "정지"} · 처리{" "}
                    {unit.processedCount}건
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    unit_count
                  </span>
                  <Button
                    onClick={() => onUnitCountChange(unit.deviceId, -1)}
                    disabled={unit.unitCount <= UNIT_COUNT_MIN}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0"
                    aria-label={`${unit.deviceId} unit_count 감소`}
                    title="unit_count 감소"
                  >
                    −
                  </Button>
                  <span className="w-7 text-center font-mono text-sm">
                    {unit.unitCount}
                  </span>
                  <Button
                    onClick={() => onUnitCountChange(unit.deviceId, 1)}
                    disabled={unit.unitCount >= UNIT_COUNT_MAX}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0"
                    aria-label={`${unit.deviceId} unit_count 증가`}
                    title="unit_count 증가"
                  >
                    +
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
