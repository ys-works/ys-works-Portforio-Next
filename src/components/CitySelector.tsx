import { CITY_NAMES } from "../constants/pollenConstants";

interface Props {
  availableCities: number[];
  selectedCities: number[];
  onToggle: (code: number) => void;
  showAvg: boolean;
  onShowAvgChange: (val: boolean) => void;
  cityColorIndexByCode: Record<number, number>;
  onReset: () => void;
}

export default function CitySelector({
  availableCities,
  selectedCities,
  onToggle,
  showAvg,
  onShowAvgChange,
  cityColorIndexByCode,
  onReset,
}: Props) {
  return (
    <div className="city-selector-panel">
      <div className="city-selector-title">
        <span>市区町村を選択</span>
        <button
          className="reset-button"
          onClick={onReset}
          type="button"
          title="すべての選択をリセット"
        >
          リセット
        </button>
      </div>
      <div className="city-selector-list">
        {availableCities.map((code) => {
          const selected = selectedCities.includes(code);
          const colorIndex = cityColorIndexByCode[code] ?? 0;
          return (
            <div
              key={code}
              className={`city-chip ${selected ? 'selected' : ''}`}
              onClick={() => onToggle(code)}
              data-color-index={selected ? colorIndex : undefined}
            >
              {CITY_NAMES[code] ?? code}
            </div>
          );
        })}
      </div>
      <div className="city-selector-checkbox">
        <label className="city-selector-label">
          <input
            type="checkbox"
            checked={showAvg}
            onChange={(e) => onShowAvgChange(e.target.checked)}
          />
          <span>東京都平均を表示</span>
        </label>
      </div>
    </div>
  );
}
