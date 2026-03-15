import { pollenLevel } from "../utils/pollenUtils";
import type { PredRow } from "../types/pollen";

interface Props {
  predData: PredRow[];
}

export default function PredictionTable({ predData }: Props) {
  if (!predData.length) return null;

  const sorted = [...predData].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.cityName ?? "").localeCompare(b.cityName ?? "");
  });

  return (
    <div className="prediction-table">
      <div className="prediction-table-title">
        ✦ Gemini AI 予測結果
      </div>
      <div className="prediction-table-table-wrap">
        <table className="prediction-table-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>市区町村</th>
              <th>予測値</th>
              <th>レベル</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => {
              const lv = pollenLevel(p.pollen);
              const label = p.pollen < 0 ? "欠測" : lv.label;
              const displayValue = p.pollen < 0 ? "欠測" : `${p.pollen}`;
              return (
                <tr key={`${p.date}-${p.citycode || i}`}>
                  <td>{p.date}</td>
                  <td>{p.cityName ?? p.citycode ?? "-"}</td>
                  <td>{displayValue}</td>
                  <td>{label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
