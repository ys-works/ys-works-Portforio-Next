import { CITY_NAMES, COLORS } from "../constants/pollenConstants";

interface Props {
  availableCities: number[];
  selectedCities: number[];
  onToggle: (code: number) => void;
  showAvg: boolean;
  onShowAvgChange: (val: boolean) => void;
}

export default function CitySelector({
  availableCities,
  selectedCities,
  onToggle,
  showAvg,
  onShowAvgChange,
}: Props) {
  return (
    <div className="city-selector-panel">
      <div className="city-selector-title">
        市区町村を選択
      </div>
      <div className="city-selector-list">
        {availableCities.map((code) => {
          const selected = selectedCities.includes(code);
          const colorIndex = selectedCities.indexOf(code) % COLORS.length;
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
