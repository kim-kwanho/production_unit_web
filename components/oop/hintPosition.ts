/** 노드 getBoundingClientRect() — 직렬화 가능한 형태 */
export interface HintAnchorRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export type HintPlacement = "right" | "left" | "below";

export interface HintScreenPosition {
  left: number;
  top: number;
  placement: HintPlacement;
}

export const HINT_TOOLTIP_WIDTH = 248;
export const HINT_TOOLTIP_HEIGHT = 168;

const PAD = 16;
const GAP = 14;

export function rectFromElement(el: Element): HintAnchorRect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
  };
}

/**
 * 노드 옆(또는 아래)에 말풍선을 두어 다이어그램·커서와 겹치지 않게 배치.
 * 화면 오른쪽 노드는 왼쪽으로, 왼쪽·중앙은 오른쪽으로 펼침.
 */
export function computeHintScreenPosition(
  anchorRect: HintAnchorRect | undefined,
  clientX: number,
  clientY: number,
  tooltipW = HINT_TOOLTIP_WIDTH,
  tooltipH = HINT_TOOLTIP_HEIGHT,
): HintScreenPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (anchorRect && anchorRect.width > 2 && anchorRect.height > 2) {
    const r = anchorRect;
    const nodeCx = r.left + r.width / 2;
    const nodeCy = r.top + r.height / 2;
    const preferLeft = nodeCx > vw * 0.5;

    let left: number;
    let top = nodeCy - tooltipH / 2;
    let placement: HintPlacement;

    if (preferLeft) {
      left = r.left - tooltipW - GAP;
      placement = "left";
      if (left < PAD) {
        left = r.right + GAP;
        placement = "right";
      }
    } else {
      left = r.right + GAP;
      placement = "right";
      if (left + tooltipW > vw - PAD) {
        left = r.left - tooltipW - GAP;
        placement = "left";
      }
    }

    if (left < PAD || left + tooltipW > vw - PAD) {
      left = Math.min(
        Math.max(PAD, nodeCx - tooltipW / 2),
        vw - tooltipW - PAD,
      );
      top = r.bottom + GAP;
      placement = "below";
    }

    top = Math.max(PAD, Math.min(top, vh - tooltipH - PAD));

    if (top + tooltipH > vh - PAD && r.top - tooltipH - GAP >= PAD) {
      top = r.top - tooltipH - GAP;
    }

    return { left, top, placement };
  }

  return {
    left: Math.min(Math.max(PAD, clientX + 24), vw - tooltipW - PAD),
    top: Math.min(Math.max(PAD, clientY - tooltipH / 2), vh - tooltipH - PAD),
    placement: "right",
  };
}
