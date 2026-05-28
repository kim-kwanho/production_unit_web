"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "sf-oop-onboarding-done";

const STEPS = [
  "① 구현 클래스를 클릭하면 오버라이딩된 process()가 바로 실행됩니다.",
  "② 정지/가동 버튼으로 상태에 따른 base process() 처리도 비교할 수 있습니다.",
  "③ 프리셋 칩(P-JAM 등)으로 다른 제품을 실험해 보세요.",
];

export default function OopOnboarding() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "1") {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-50 p-3 dark:bg-emerald-950/40">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          시작 가이드
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          닫기
        </button>
      </div>
      <ol className="list-inside list-decimal space-y-1 text-xs text-slate-700 dark:text-slate-300">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
