import { pollenLevel } from "../utils/pollenUtils";

interface Props {
  active?: boolean;
  payload?: Array<{ value: number; color?: string; name?: string }>;
  label?: string;
}

export default function CustomTooltip({ active, payload, label }: Props) {
  if (!active || !payload?.length) return null;

  return (
    <div className="tooltip-container">
      <div className="tooltip-label">{label}</div>
      {payload.map((p, idx) => {
        const value = typeof p.value === "number" ? p.value : 0;
        const lv = pollenLevel(value);
        return (
          <div key={idx} className="tooltip-item">
            <span className="tooltip-dot" style={{ background: p.color }} />
            <span className="tooltip-name">{p.name}:</span>
            <span className="tooltip-value" style={{ color: lv.color }}>
              {value < 0 ? "欠測" : `${value} 個/cm\xb2`}
            </span>
            {value >= 0 && (
              <span className="tooltip-level" style={{ color: lv.color }}>
                ({lv.label})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
