import PredictionHorizonButtons from "./PredictionHorizonButtons";
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
      <div className="gemini-panel-title">Gemini AI 予測</div>

      <PredictionHorizonButtons
        predicting={predicting}
        predictingHorizon={predictingHorizon}
        onPredict={onPredict}
      />

      {predError && <div className="gemini-error">⚠ {predError}</div>}

      {predData.length > 0 && !predicting && (
        <div className="pred-badge gemini-success">
          ✓ {predData.length}件の予測を表示中（点線部）
        </div>
      )}
    </div>
  );
}
