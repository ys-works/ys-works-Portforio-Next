import CitySelector from "./CitySelector";
import GeminiPanel from "./GeminiPanel";
import type { PredRow } from "../types/pollen";

interface DashboardControlsProps {
  availableCities: number[];
  selectedCities: number[];
  onToggleCity: (code: number) => void;
  onResetCities: () => void;
  showAvg: boolean;
  onShowAvgChange: (val: boolean) => void;
  cityColorIndexByCode: Record<number, number>;
  predicting: boolean;
  predictingHorizon: 1 | 3 | 7 | null;
  predError: string;
  predData: PredRow[];
  onPredict: (horizon: 1 | 3 | 7) => void;
}

export default function DashboardControls({
  availableCities,
  selectedCities,
  onToggleCity,
  onResetCities,
  showAvg,
  onShowAvgChange,
  cityColorIndexByCode,
  predicting,
  predictingHorizon,
  predError,
  predData,
  onPredict,
}: DashboardControlsProps) {
  return (
    <div className="control-panel-grid">
      <CitySelector
        availableCities={availableCities}
        selectedCities={selectedCities}
        onToggle={onToggleCity}
        showAvg={showAvg}
        onShowAvgChange={onShowAvgChange}
        cityColorIndexByCode={cityColorIndexByCode}
        onReset={onResetCities}
      />
      <GeminiPanel
        predicting={predicting}
        predictingHorizon={predictingHorizon}
        predError={predError}
        predData={predData}
        onPredict={onPredict}
      />
    </div>
  );
}
