import type { FocusEvent, MouseEvent, PointerEvent } from "react";
import type { ProcessRunOutcome } from "@/hooks/useOopLabProcess";
import { CONCRETE_SPEC_BY_NODE, type ConcreteClassSpec } from "./classNodeSpecs";
import type { HintAnchorRect } from "./hintPosition";
import { NODE_INFO, NODE_WHY } from "./oopLabModel";

export type { HintAnchorRect };

export type NodePointerEvent = MouseEvent | PointerEvent;

export type NodeHoverEvent = NodePointerEvent | FocusEvent<Element>;

export function clientPointForHover(
  event: NodeHoverEvent,
  element: Element,
): { clientX: number; clientY: number } {
  if ("clientX" in event && typeof event.clientX === "number") {
    return { clientX: event.clientX, clientY: event.clientY };
  }
  const r = element.getBoundingClientRect();
  return { clientX: r.right + 14, clientY: r.top + r.height / 2 };
}

export type ClickHintVariant = "override" | "override-fail" | "info";

export interface ClickHintSpecRow {
  label: string;
  value: string;
  /** 강조 (에너지·효율 등 비교 포인트) */
  highlight?: boolean;
}

export interface ClickHintContent {
  title: string;
  subtitle?: string;
  /** 클래스 고유 파라미터 (표 형태) */
  specRows?: ClickHintSpecRow[];
  lines: string[];
  variant: ClickHintVariant;
  /** 호버용 간단 레이아웃 (푸터·섹션 제목 생략) */
  compact?: boolean;
}

export interface ClickHintAnchor {
  clientX: number;
  clientY: number;
  /** 호버한 SVG 노드 영역 — 말풍선을 노드 옆에 고정 */
  anchorRect?: HintAnchorRect;
  content: ClickHintContent;
}

/** 호버 말풍선 — 다형성 비교에 필요한 최소 스펙만 */
function concreteHoverSpecRows(spec: ConcreteClassSpec): ClickHintSpecRow[] {
  return [
    {
      label: "1회 에너지",
      value: `${spec.energyPerProcess.toFixed(1)} (${spec.unitCount}×${spec.energyPerCycle})`,
      highlight: true,
    },
    {
      label: "exp_eff",
      value: spec.expEff.toFixed(4),
      highlight: true,
    },
    { label: "실패 데모", value: spec.demoItem },
  ];
}

function runOutcomeContent(
  nodeId: string,
  outcome: ProcessRunOutcome,
): Pick<ClickHintContent, "title" | "lines" | "variant"> | null {
  const spec = CONCRETE_SPEC_BY_NODE[nodeId];
  if (!spec) return null;

  if (outcome.ok) {
    return {
      title: spec.label,
      variant: "override",
      lines: [
        `P1 성공 · +${outcome.energyDelta.toFixed(1)} 에너지 · exp_eff ${outcome.expEff?.toFixed(4) ?? "—"}`,
      ],
    };
  }

  return {
    title: spec.label,
    variant: "override-fail",
    lines: [`${outcome.item} 실패 · 실패 데모는 「추가 실험」`],
  };
}

function hoverAnchorPoint(event: NodeHoverEvent): { clientX: number; clientY: number } {
  const el = event.currentTarget instanceof Element ? event.currentTarget : null;
  if (el) return clientPointForHover(event, el);
  return { clientX: 0, clientY: 0 };
}

/** 호버 시 유닛 고유 스펙·설명 */
export function buildHoverUnitHint(
  nodeId: string,
  event: NodeHoverEvent,
  anchorRect?: HintAnchorRect,
): ClickHintAnchor | null {
  const { clientX, clientY } = hoverAnchorPoint(event);
  const spec = CONCRETE_SPEC_BY_NODE[nodeId];
  if (spec) {
    return {
      clientX,
      clientY,
      anchorRect,
      content: {
        title: spec.label,
        subtitle: `${spec.role} · ${spec.deviceId}`,
        specRows: concreteHoverSpecRows(spec),
        lines: ["클릭 → P1 실행"],
        variant: "override",
        compact: true,
      },
    };
  }

  const staticHint = buildStaticClickHint(nodeId, event);
  if (staticHint && anchorRect) {
    return { ...staticHint, anchorRect };
  }
  return staticHint;
}

/** 호버 중 클릭 실행 후 말풍선에 실행 결과 반영 */
export function applyRunToHoverHint(
  anchor: ClickHintAnchor,
  nodeId: string,
  outcome: ProcessRunOutcome,
): ClickHintAnchor {
  const run = runOutcomeContent(nodeId, outcome);
  if (!run) return anchor;
  const spec = CONCRETE_SPEC_BY_NODE[nodeId];
  return {
    ...anchor,
    content: {
      ...anchor.content,
      title: run.title,
      subtitle: anchor.content.subtitle,
      specRows: undefined,
      lines: run.lines,
      variant: run.variant,
      compact: true,
    },
  };
}

export function buildStaticClickHint(
  nodeId: string,
  event: NodeHoverEvent,
): ClickHintAnchor | null {
  if (!NODE_INFO[nodeId] && !NODE_WHY[nodeId]) return null;
  const { clientX, clientY } = hoverAnchorPoint(event);
  const short =
    nodeId === "adt"
      ? "인터페이스 — process() 등 메서드 계약"
      : "추상 클래스 — super.process()로 공통 처리";
  return {
    clientX,
    clientY,
    content: {
      title: nodeId === "adt" ? "ProductionUnitADT" : "ProductionUnit",
      lines: [short],
      variant: "info",
      compact: true,
    },
  };
}
