import { pollenLevel } from "../utils/pollenUtils";
import type { PredRow } from "../types/pollen";

interface Props {
  predData: PredRow[];
}

export default function PredictionTable({ predData }: Props) {
  if (!predData.length) return null;

  return (
    <div className="prediction-table">
      <div className="prediction-table-title">
        ✦ Gemini AI 予測結果
      </div>
      <div className="prediction-table-grid">
        {predData.map((p, i) => {
          const lv = pollenLevel(p.pollen);
          return (
            <div
              key={`${p.date}-${p.citycode || i}`}
              className="prediction-table-card"
              style={{ border: `1px solid ${lv.color}44` }}
            >
              {p.cityName && (
                <div className="prediction-table-city">
                  {p.cityName}
                </div>
              )}
              <div className="prediction-table-date">
                {p.date.slice(5)}
              </div>
              <div
                className="prediction-table-value"
                style={{ color: lv.color }}
              >
                {p.pollen}
              </div>
              <div className="prediction-table-label" style={{ color: lv.color }}>
                {lv.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
