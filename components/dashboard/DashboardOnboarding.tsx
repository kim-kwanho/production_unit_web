"use client";

import OnboardingPanel from "@/components/ui/onboarding-panel";

export default function DashboardOnboarding() {
  return (
    <div className="mb-4">
      <OnboardingPanel
        storageKey="sf-dashboard-onboarding-done"
        title="Dashboard — 1분 사용법"
        subtitle="생산 라인 시뮬레이션을 ‘가동 → 실행 → 해석’ 순서로 체험합니다."
        steps={[
          "Start All로 전체 유닛을 가동합니다. (정지는 Stop All)",
          "제품 ID를 입력하거나 프리셋을 고른 뒤 Run Pipeline을 눌러 처리 결과를 만듭니다.",
          "픽셀 라인 맵에서 상태를 확인하고(색상), Message Log에서 처리 과정을 읽습니다.",
          "+ 유닛 추가 / unit_count 증감으로 라인을 바꿔가며 효율 변화도 비교합니다.",
        ]}
        details={[
          "픽셀 라인 맵: 초록=가동, 노랑=정지, 빨강=마지막 실패 유닛",
          "처리 순서: 라인은 왼쪽→오른쪽(= line 배열 순서)으로 유닛이 순차 처리합니다.",
          "공장 효율: (완제품/에너지) 기반의 점수이며, 에너지 한도 도달 시 빨간색으로 경고됩니다.",
          "세션 리셋은 현재 세션만 초기화합니다(초기 라인 구성으로 복귀).",
        ]}
      />
    </div>
  );
}

