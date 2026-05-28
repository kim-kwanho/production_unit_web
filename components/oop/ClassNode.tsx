"use client";

export interface ClassNodeData {
  id: string;
  label: string;
  kind: "interface" | "abstract" | "concrete";
  stationType?: string;
  deviceId?: string;
  methods: { name: string; overridden?: boolean }[];
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ClassNodeProps {
  node: ClassNodeData;
  selected: boolean;
  onHover: (node: ClassNodeData | null) => void;
  onClick: (node: ClassNodeData) => void;
}

function nodeFill(kind: ClassNodeData["kind"], selected: boolean): string {
  if (kind === "interface") return "var(--oop-node-interface-fill)";
  if (kind === "abstract") return "var(--oop-node-abstract-fill)";
  return selected
    ? "var(--oop-node-concrete-selected-fill)"
    : "var(--oop-node-concrete-fill)";
}

export default function ClassNode({
  node,
  selected,
  onHover,
  onClick,
}: ClassNodeProps) {
  const fill = nodeFill(node.kind, selected);

  const stroke = selected
    ? "#22c55e"
    : node.kind === "interface"
        ? "#94a3b8"
        : node.kind === "abstract"
          ? "#64748b"
          : "#10b981";

  const dash = node.kind === "interface" ? "6 4" : undefined;
  const strokeWidth = selected ? 3.5 : 2;

  return (
    <g
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`${node.label} 클래스`}
      onMouseEnter={() => onHover(node)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(node)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(node);
        }
      }}
    >
      {selected && (
        <rect
          x={node.x - 4}
          y={node.y - 4}
          width={node.width + 8}
          height={node.height + 8}
          rx={12}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2}
          opacity={0.6}
        />
      )}
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {node.kind === "interface" && (
        <text
          x={node.x + node.width / 2}
          y={node.y + 16}
          textAnchor="middle"
          fill="var(--oop-node-sub-fill)"
          fontSize={10}
        >
          &lt;&lt;interface&gt;&gt;
        </text>
      )}
      <text
        x={node.x + node.width / 2}
        y={node.y + (node.kind === "interface" ? 32 : 26)}
        textAnchor="middle"
        fill="var(--oop-node-label-fill)"
        fontSize={13}
        fontWeight={600}
      >
        {node.label}
      </text>
      {node.deviceId && (
        <text
          x={node.x + node.width / 2}
          y={node.y + (node.kind === "interface" ? 48 : 42)}
          textAnchor="middle"
          fill="var(--oop-node-sub-fill)"
          fontSize={11}
        >
          {node.deviceId}
        </text>
      )}
      <text
        x={node.x + node.width / 2}
        y={node.y + node.height - 10}
        textAnchor="middle"
        fill="var(--oop-node-sub-fill)"
        fontSize={10}
        fontWeight={500}
      >
        process() ★
      </text>
    </g>
  );
}
