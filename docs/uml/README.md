# UML 클래스 다이어그램

과제 제출용 UML PDF는 이 폴더에 `production-unit-class-diagram.pdf` 이름으로 두면 됩니다.

## PlantUML 소스

`class-diagram.puml`을 PlantUML 또는 VS Code PlantUML 확장으로 렌더링해 PDF로 내보낼 수 있습니다.

## 계층 구조

```text
ProductionUnitADT (interface)
        ▲
        │ implements / extends
ProductionUnit (abstract, process() 기본 구현)
        ▲
        ├── ConveyorBeltUnit  (process() override)
        ├── RobotArmUnit      (process() override)
        └── InspectionUnit    (process() override)
```

웹 앱 `/oop-lab`의 **UML 다이어그램**이 상속 계층(ADT → Base → 3 구현)을 표시합니다.
