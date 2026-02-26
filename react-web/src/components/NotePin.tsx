import { useState } from "react";

export type PinType = "mine" | "friend" | "group" | "public" | "legacy";

const COLORS: Record<PinType, { fill: string; stroke: string; dot: string; ring?: string }> = {
  mine:   { fill: "#00feb5", stroke: "#028a5e", dot: "#11111b" },
  friend: { fill: "#b4befe", stroke: "#6c5fcf", dot: "#11111b" },
  group:  { fill: "#fab387", stroke: "#c4622d", dot: "#11111b", ring: "#c4622d" },
  public: { fill: "#f38ba8", stroke: "#b31f40", dot: "#11111b" },
  legacy: { fill: "#6c7086", stroke: "#45475a", dot: "#cdd6f4" },
};

interface Props {
  type: PinType;
  selected?: boolean;
  /** Note title shown in hover tooltip */
  label?: string;
  /** Owner @username or group name shown below label */
  subtitle?: string;
}

export function NotePin({ type, selected = false, label, subtitle }: Props) {
  const c = COLORS[type];
  const scale = selected ? 1.25 : 1;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        transform: `scale(${scale})`,
        transformOrigin: "bottom center",
        transition: "transform 150ms ease, filter 150ms ease",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* hover tooltip */}
      {hovered && label && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 999,
          }}
          className="bg-surface border border-border/30 rounded-xl px-3 py-1.5 shadow-lg"
        >
          <p className="text-text text-xs font-medium">{label}</p>
          {subtitle && (
            <p className="text-muted text-[10px] mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      <svg width="28" height="38" viewBox="0 0 28 38" fill="none">
        {/* group outline ring — slightly larger teardrop behind */}
        {type === "group" && (
          <path
            d="M14 1C6.82 1 1 6.82 1 14c0 9.778 13 23 13 23s13-13.222 13-23C27 6.82 21.18 1 14 1z"
            fill="none"
            stroke={c.ring}
            strokeWidth="4"
            opacity="0.45"
          />
        )}
        {/* teardrop body */}
        <path
          d="M14 1C6.82 1 1 6.82 1 14c0 9.778 13 23 13 23s13-13.222 13-23C27 6.82 21.18 1 14 1z"
          fill={c.fill}
          stroke={c.stroke}
          strokeWidth="1.8"
        />
        {/* inner dot */}
        <circle cx="14" cy="13.5" r="4.5" fill={c.dot} opacity="0.65" />
      </svg>
    </div>
  );
}
