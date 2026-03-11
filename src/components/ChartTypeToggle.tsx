interface Props {
  chartType: "line" | "bar";
  onChange: (type: "line" | "bar") => void;
}

const TYPES = [
  { id: "line" as const, label: "折れ線" },
  { id: "bar"  as const, label: "棒グラフ" },
];

export default function ChartTypeToggle({ chartType, onChange }: Props) {
  return (
    <div className="chart-type-toggle">
      {TYPES.map((t) => (
        <button
          key={t.id}
          className={`btn chart-type-btn ${chartType === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
