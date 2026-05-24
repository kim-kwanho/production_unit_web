import { processMsg } from "./message";
import type { IProductionUnit } from "./ProductionUnitADT";
import type { ProcessResult } from "./types";

function printBlocked(unit: IProductionUnit, item: string): ProcessResult {
  return {
    ok: false,
    messages: [
      processMsg(
        `  [${unit.deviceId}] 이전 공정이 가동 중이 아니어서 '${item}' 처리하지 않음.`,
        "warning",
      ),
    ],
  };
}

/** 컨베이어→로봇→검사기 순서로 1개 item을 라인 처리 (main.py process_pipeline 포팅) */
export function processPipeline(
  line: IProductionUnit[],
  item: string,
): { results: ProcessResult[]; failedUnitId: string | null } {
  const results: ProcessResult[] = [];
  let upstreamOk = true;
  let failedUnitId: string | null = null;

  for (const unit of line) {
    if (!upstreamOk) {
      results.push(printBlocked(unit, item));
      continue;
    }

    const result = unit.process(item);
    results.push(result);

    if (!result.ok) {
      upstreamOk = false;
      failedUnitId = unit.deviceId;
    }
  }

  return { results, failedUnitId };
}
