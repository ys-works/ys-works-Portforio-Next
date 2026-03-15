import type { PredRow } from "../types/pollen";

interface Props {
  predicting: boolean;
  predictingHorizon: 1 | 3 | 7 | null;
  predError: string;
  predData: PredRow[];
  onPredict: (horizon: 1 | 3 | 7) => void;
}

export default function GeminiPanel({
  predicting,
  predictingHorizon,
  predError,
  predData,
  onPredict,
}: Props) {
  return (
    <div className="gemini-panel">
      <div className="gemini-panel-title">
        Gemini AI 予測
      </div>

      <div className="gemini-panel-controls">
        <button
          className={`btn gemini-predict-btn ${predictingHorizon === 1 ? "active" : ""}`}
          onClick={() => onPredict(1)}
          disabled={predicting && predictingHorizon !== 1}
        >
          {predicting && predictingHorizon === 1 ? "予測中…" : "✦ 翌日の予測"}
        </button>
        <button
          className={`btn gemini-predict-btn ${predictingHorizon === 3 ? "active" : ""}`}
          onClick={() => onPredict(3)}
          disabled={predicting && predictingHorizon !== 3}
        >
          {predicting && predictingHorizon === 3 ? "予測中…" : "✦ 3日間の予測"}
        </button>
        <button
          className={`btn gemini-predict-btn ${predictingHorizon === 7 ? "active" : ""}`}
          onClick={() => onPredict(7)}
          disabled={predicting && predictingHorizon !== 7}
        >
          {predicting && predictingHorizon === 7 ? "予測中…" : "✦ 1週間の予測"}
        </button>
      </div>

      {predError && (
        <div className="gemini-error">
          ⚠ {predError}
        </div>
      )}

      {predData.length > 0 && !predicting && (
        <div className="pred-badge gemini-success">
          ✓ {predData.length}件の予測を表示中（点線部）
        </div>
      )}
    </div>
  );
}
