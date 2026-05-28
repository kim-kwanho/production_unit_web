"use client";

import OnboardingPanel from "@/components/ui/onboarding-panel";

export default function OopOnboarding() {
  return (
    <div className="mb-3">
      <OnboardingPanel
        storageKey="sf-oop-onboarding-done"
        title="OOP Lab — 1분 사용법"
        subtitle="상속/다형성(오버라이딩)을 클릭 한 번으로 시연합니다."
        steps={[
          "다이어그램에서 구현 클래스(Conveyor/Robot/Inspection)를 선택합니다.",
          "우측에서 입력(item)을 고른 뒤 process(item) 실행을 누릅니다.",
          "Activity Log에서 같은 호출이 클래스마다 다른 결과를 내는지 확인합니다.",
        ]}
        details={[
          "다이어그램에서 ★ 표시는 오버라이딩된 메서드(핵심 포인트)입니다.",
          "아래 로그(Activity Log)는 실행 순서대로 위→아래 누적되며, 각 실행의 메시지는 process() 내부 발생 순서대로 출력됩니다.",
          "공장 요소(가동/정지/에너지)는 확장 모드에서만 보입니다.",
        ]}
      />
    </div>
  );
}
