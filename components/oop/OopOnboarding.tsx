"use client";

export default function OopOnboarding() {
  return (
    <details className="mb-2 shrink-0 rounded-lg border border-slate-200/80 bg-slate-50/50 dark:border-slate-700/60 dark:bg-slate-950/30">
      <summary className="cursor-pointer select-none px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
        OOP Lab 사용법
      </summary>
      <ol className="list-inside list-decimal space-y-0.5 px-2.5 pb-2 text-[10px] leading-snug text-slate-700 dark:text-slate-300">
        <li>
          초록색 구현 클래스(Conveyor / Robot / Inspection) 클릭 — 클릭 즉시 데모 item으로{" "}
          <code className="font-mono">process()</code> 실행
        </li>
        <li>
          데모 item: Conveyor → P-JAM, Robot → P-HEAVY, Inspection → P-DEFECT
        </li>
        <li>실행 결과(다형성 증명) 패널에서 클래스마다 다른 결과 확인</li>
        <li>item 변경 후 재실행 버튼으로 같은 클래스를 다른 item으로 다시 실행</li>
      </ol>
    </details>
  );
}
