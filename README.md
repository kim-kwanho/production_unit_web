# Smart Factory OOP

과제 1 Python OOP 도메인을 TypeScript로 포팅한 Next.js 웹 앱입니다.  
**OOP Lab**(상속·다형성)과 **Factory Dashboard**(라인 시뮬레이션) 두 화면을 제공합니다.

과제 1 Python 프로젝트: [`../production_unit_project`](../production_unit_project)

## 요구 사항

- Node.js 18+
- npm

## 빠른 시작

```bash
cd production_unit_web
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 — OOP Lab / Dashboard 선택 |
| `/oop-lab` | 상속 다이어그램, `process()` 다형성, Activity Log |
| `/dashboard` | 픽셀 라인맵, 파이프라인, 효율 도넛 |

## 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```text
production_unit_web/
  app/              # Next.js App Router 페이지
  components/       # UI (oop, dashboard, layout, theme)
  domain/           # TypeScript OOP 도메인 (Python 포팅)
  docs/uml/         # UML PDF 복사본
  lib/              # 포맷 유틸
```

## OOP Lab 사용법

1. **구현 클래스** 노드를 클릭 → `process()` 실행 (정지 상태면 경고 로그, Python과 동일).
2. **가동** 버튼으로 선택 유닛을 켠 뒤 다시 클릭/프리셋으로 성공 시나리오를 볼 수 있습니다.
3. **ADT / ProductionUnit** 클릭 → 설명 로그만 (process 없음).
4. **프리셋 칩**(P1, P-JAM, …) → 구현 클래스 선택 후 다른 item 테스트.
5. **세션 리셋** → 에너지·로그 초기화.

## Factory Dashboard 사용법

1. **Start All**으로 라인 가동 (에너지 한도 도달 시 비활성).
2. 프리셋 또는 직접 입력 후 **Run Pipeline**.
3. **+ 유닛 추가** — 타입 선택, 최대 8칸.
4. **세션 리셋** — 에너지·통계 초기화 + 라인을 CV-01·RA-01·INSP-01으로 복원.
5. 픽셀 맵: 초록=가동, 노랑=정지, 빨강=마지막 실패 유닛.

## 제출 PDF 캡처 체크리스트 (OOP Lab)

1. `/oop-lab` — ConveyorBeltUnit 클릭 후 Activity Log (JAM 등).
2. 같은 화면 — **가동** 후 P1 또는 성공 로그 1장.
3. Vercel URL + GitHub repo URL.

## Vercel 배포 (과제 제출)

1. GitHub에 **public** repo `production_unit_web` 생성 후 push
2. [Vercel](https://vercel.com) → Import Git Repository
3. Framework: Next.js (기본값)
4. 배포 URL을 과제 PDF에 기재

## 관련 문서

- UML: `docs/uml/ProductionUnit_UML_ClassDiagram.pdf`
- 과제 1 README: `../production_unit_project/README.md`
