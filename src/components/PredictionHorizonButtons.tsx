interface Props {
  predicting: boolean;
  predictingHorizon: 1 | 3 | 7 | null;
  onPredict: (horizon: 1 | 3 | 7) => void;
}

export default function PredictionHorizonButtons({
  predicting,
  predictingHorizon,
  onPredict,
}: Props) {
  return (
    <div className="gemini-panel-controls">
      <button
        className={`btn gemini-predict-btn ${predictingHorizon === 1 ? "active" : ""}`}
        onClick={() => onPredict(1)}
        disabled={predicting}
      >
        {predicting && predictingHorizon === 1 ? "予測中…" : "✦ 翌日の予測"}
      </button>
      <button
        className={`btn gemini-predict-btn ${predictingHorizon === 3 ? "active" : ""}`}
        onClick={() => onPredict(3)}
        disabled={predicting}
      >
        {predicting && predictingHorizon === 3 ? "予測中…" : "✦ 3日間の予測"}
      </button>
      <button
        className={`btn gemini-predict-btn ${predictingHorizon === 7 ? "active" : ""}`}
        onClick={() => onPredict(7)}
        disabled={predicting}
      >
        {predicting && predictingHorizon === 7 ? "予測中…" : "✦ 1週間の予測"}
      </button>
    </div>
  );
}
