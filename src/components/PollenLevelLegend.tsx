const LEVELS = [
  { label: "飛散なし",   color: "#10b981", range: "0" },
  { label: "少ない",     color: "#34d399", range: "1〜29" },
  { label: "やや多い",   color: "#fbbf24", range: "30〜59" },
  { label: "多い",       color: "#fb923c", range: "60〜99" },
  { label: "非常に多い", color: "#f87171", range: "100〜" },
];

export default function PollenLevelLegend() {
  return (
    <div className="pollen-legend">
      {LEVELS.map((lv, index) => (
        <div key={lv.label} className="pollen-legend-item">
          <span
            className="pollen-legend-dot"
            data-level-index={index}
          />
          <span>{lv.label}</span>
          <span className="pollen-legend-range">
            ({lv.range} 個/cm²)
          </span>
        </div>
      ))}
    </div>
  );
}
