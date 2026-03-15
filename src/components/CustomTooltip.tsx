import { useEffect, useRef } from "react";
import { pollenLevel } from "../utils/pollenUtils";

interface Props {
  active?: boolean;
  payload?: Array<{ value: number; color?: string; name?: string }>;
  label?: string;
  coordinate?: { x?: number; y?: number };
}

export default function CustomTooltip({ active, payload, label, coordinate }: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tooltipRef.current || coordinate == null) return;
    const container = tooltipRef.current;
    container.style.position = "absolute";
    container.style.left = `${coordinate.x ?? 0}px`;
    container.style.top = `${coordinate.y ?? 0}px`;
    container.style.transform = "translate(-50%, -120%)";
    container.style.pointerEvents = "none";

    const dots = container.querySelectorAll<HTMLSpanElement>(".tooltip-dot");
    dots.forEach((dot) => {
      const color = dot.getAttribute("data-color");
      dot.style.background = color ?? "#fff";
    });
  }, [coordinate, payload]);

  if (!active || !payload?.length || coordinate == null) return null;

  return (
    <div ref={tooltipRef} className="tooltip-container">
      <div className="tooltip-label">{label}</div>
      {payload.map((p, idx) => {
        const value = p.value;
        const isMissing = value == null || (typeof value === "number" && value < 0);
        const displayValue = isMissing ? "欠測" : `${value} 個/cm²`;
        const lv = typeof value === "number" && value >= 0 ? pollenLevel(value) : null;
        return (
          <div key={idx} className="tooltip-item">
            <span className="tooltip-dot" data-color={p.color ?? "#fff"} />
            <span className="tooltip-name">{p.name}:</span>
            <span className="tooltip-value">{displayValue}</span>
            {lv && <span className="tooltip-level">({lv.label})</span>}
          </div>
        );
      })}
    </div>
  );
}
