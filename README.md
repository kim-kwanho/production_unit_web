# Smart Factory OOP

과제 1 Python OOP 도메인을 TypeScript로 포팅한 Next.js 웹 앱입니다.  
**OOP Lab**에서 상속·오버라이딩·`process()` 다형성을 확인하고, **Factory Dashboard**에서 생산 라인(파이프라인)을 운영합니다.

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
| `/oop-lab` | UML 상속 다이어그램, `process()` 다형성, Activity Log |
| `/dashboard` | 생산 라인 상태, 파이프라인 로그, 효율 도넛 |

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
  hooks/            # OOP Lab process 훅 등
  lib/              # 포맷 유틸
```

## OOP Lab vs Dashboard

| | OOP Lab | Factory Dashboard |
|---|---------|-------------------|
| 목적 | 상속·다형성·`process()` 오버라이드 비교 | 라인 가동·파이프라인·병목 확인 |
| 공장 에너지 한도 | **10,000** (별도 컨텍스트) | **100** |
| 유닛 조작 | 고정 3클래스 (CV / RA / INSP) | 라인에 유닛 추가·순서 변경 (최대 8) |
| 실행 순서 | **클릭 순서 자유** (비교 실험용) | **라인 순서**대로 파이프라인 |

에너지 컨텍스트는 `createOopLabFactory()`와 `createDashboardFactory()`가 각각 독립된 `PlantEnergyContext`를 사용합니다.

## OOP Lab 사용법

다이어그램 중심 흐름: **① 노드 호버 → ② 구현 클래스 클릭 → ③ 실행 결과(Activity Log)**

1. **구현 클래스 노드(초록)에 마우스를 올리면** 말풍선에 핵심 스펙이 표시됩니다.  
   - 1회 에너지, `exp_eff`, 실패 데모 item (P-JAM / P-HEAVY / P-DEFECT)  
   - 참고: Conveyor **6.0** · Robot **12.0** · Inspection **6.0** (`unit_count × energy/cycle`)
2. **같은 노드를 클릭**하면 `process("P1")`이 실행됩니다.  
   - 노드에「▶ P1 처리 중…」표시  
   - 호버를 유지한 채 클릭하면 말풍선에 이번 실행 결과(에너지·exp_eff)가 한 줄로 갱신  
   - **클릭 순서는 강제하지 않습니다.** 클래스마다 결과만 비교하면 됩니다.
3. 오른쪽 **실행 결과(Activity Log)** 에 다형성 증명 로그가 쌓입니다.
4. **추가 실험**(사이드 패널 접기 영역)  
   - P-JAM / P-HEAVY / P-DEFECT → 오버라이드 **실패** 데모  
   - 프리셋 + process 실행, 가동/정지 → base `process()` 경고와 비교  
   - 선택 클래스 상세는 **ClassNodeDetailPanel** 참고
5. **ADT / ProductionUnit** 노드는 호버 시 설명만 표시됩니다 (`process` 실행 없음).
6. **세션 리셋** → 에너지·로그·선택 초기화.

## Dashboard 보조 화면

1. **전체 가동**으로 라인 가동 (에너지 한도 **100** 도달 시 파이프라인 비활성).
2. 프리셋 또는 직접 입력 후 **파이프라인 실행** — 라인에 배치된 순서대로 처리.
3. **+ 유닛 추가** — 타입 선택, 최대 8칸.
4. **세션 리셋** — 에너지·통계 초기화 + 라인을 CV-01·RA-01·INSP-01으로 복원.
5. 픽셀 맵: 가동/정지 상태 표시, 마지막 실패 유닛 강조.

### 에너지/효율 정책 (Dashboard)

- 에너지 표시는 **현재 부하(점유)** 개념입니다. 완제품 완료 시 해당 제품에 쓴 에너지를 환급해 생산 전 수준으로 돌아갑니다.
- 효율(도넛)은 **최근 60초 사용 에너지(누적)** 와 **완제품 수(누적)** 로 계산합니다.

## 도메인 상수 (참고)

| 상수 | 값 | 용도 |
|------|-----|------|
| `PLANT_ENERGY_LIMIT` | 100 | Dashboard |
| `OOP_LAB_PLANT_ENERGY_LIMIT` | 10,000 | OOP Lab |

## 제출 문서 체크리스트

1. 학번, 이름, 소속 분반.
2. GitHub public repository URL.
3. Vercel 배포 URL.
4. 구현 설명: `ProductionUnitADT → ProductionUnit → ConveyorBeltUnit / RobotArmUnit / InspectionUnit`, `process()` 오버라이드·다형성.
5. `/oop-lab` 초기 화면 스크린샷 (UML 다이어그램).
6. 구현 클래스 **호버**(스펙 말풍선) + **P1 클릭** 후 Activity Log 스크린샷 (에너지 차이 확인).
7. **추가 실험**에서 P-JAM / P-HEAVY / P-DEFECT 중 **1개 이상** 실패 로그 스크린샷.
8. 수행 소감 2~3줄.

## Vercel 배포 (과제 제출)

1. GitHub에 **public** repo `production_unit_web` 생성 후 push
2. [Vercel](https://vercel.com) → Import Git Repository
3. Framework: Next.js (기본값)
4. 배포 URL을 과제 PDF에 기재

## 관련 문서

- UML: `docs/uml/ProductionUnit_UML_ClassDiagram.pdf` (또는 동일 경로 `.puml` 소스)
- 과제 1 README: `../production_unit_project/README.md`
