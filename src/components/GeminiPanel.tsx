import type { PredRow } from "../types/pollen";

interface Props {
  predicting: boolean;
  predError: string;
  predData: PredRow[];
  onPredict: () => void;
}

export default function GeminiPanel({
  predicting,
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
          className="btn gemini-predict-btn"
          onClick={onPredict}
          disabled={predicting}
        >
          {predicting ? "予測中…" : "✦ 翌日の予測"}
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
