import { useState } from "react";
import "./css/TokyoPollenDashboard.css";
import pollenData from "./json/tokyo_pollen_all.json";

import type { PollenRecord } from "./types/pollen";

import DashboardHeader from "./components/DashboardHeader";
import CitySelector from "./components/CitySelector";
import GeminiPanel from "./components/GeminiPanel";
import DateFilterPanel from "./components/DateFilterPanel";
import PollenChart from "./components/PollenChart";
import PollenLevelLegend from "./components/PollenLevelLegend";
import PredictionTable from "./components/PredictionTable";
import usePollenPrediction from "./hooks/usePollenPrediction";
import { useChartData } from "./hooks/useChartData";
import { useCityColors } from "./hooks/useCityColors";
import { useDateFilters } from "./hooks/useDateFilters";
import { useMergedData } from "./hooks/useMergedData";

export default function App() {
  const rawData = pollenData as PollenRecord[];

  const availableCities = [...new Set(rawData.map((r) => r.citycode))].sort(
    (a, b) => a - b,
  );

  const [selectedCities, setSelectedCities] = useState<number[]>(
    availableCities.slice(0, 3),
  );
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [dateGranularity, setDateGranularity] = useState<"daily" | "monthly">("daily");
  const [showAvg, setShowAvg] = useState<boolean>(true);

  const dateRange = {
    start: rawData[0]?.date.slice(0, 10) ?? "",
    end: rawData[rawData.length - 1]?.date.slice(0, 10) ?? "",
  };

  const dateFilters = useDateFilters({ rawData });

  const chartData = useChartData({
    rawData,
    selectedCities,
    showAvg,
    dateGranularity,
    selectedYear: dateFilters.selectedYear,
    selectedMonth: dateFilters.selectedMonth,
  });

  const toggleCity = (code: number) => {
    setSelectedCities((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const resetCities = () => {
    setSelectedCities([]);
    setShowAvg(false);
  };

  const { cityColorIndexByCode, cityLines } = useCityColors({
    availableCities,
    selectedCities,
  });

  const {
    predData,
    predicting,
    predictingHorizon,
    predError,
    predict,
  } = usePollenPrediction({ rawData, selectedCities, chartData });

  const mergedData = useMergedData({
    chartData,
    predData,
    dateGranularity,
    selectedYear: dateFilters.selectedYear,
    selectedMonth: dateFilters.selectedMonth,
  });

  const lastHistoricalDate =
    chartData.length > 0 ? chartData[chartData.length - 1].date : "";

  return (
    <div className="app-container">
      <DashboardHeader hasData={rawData.length > 0} dateRange={dateRange} />
      <div className="main-container">
        {rawData.length > 0 && (
          <>
            <div className="control-panel-grid">
              <CitySelector
                availableCities={availableCities}
                selectedCities={selectedCities}
                onToggle={toggleCity}
                showAvg={showAvg}
                onShowAvgChange={setShowAvg}
                cityColorIndexByCode={cityColorIndexByCode}
                onReset={resetCities}
              />
              <GeminiPanel
                predicting={predicting}
                predictingHorizon={predictingHorizon}
                predError={predError}
                predData={predData}
                onPredict={predict}
              />
            </div>
            <DateFilterPanel
              chartType={chartType}
              onChartTypeChange={setChartType}
              dateGranularity={dateGranularity}
              onDateGranularityChange={setDateGranularity}
              selectedYear={dateFilters.selectedYear}
              onYearChange={dateFilters.handleYearChange}
              yearOptions={dateFilters.yearOptions}
              selectedMonth={dateFilters.selectedMonth}
              onMonthChange={dateFilters.setSelectedMonth}
              monthOptions={dateFilters.monthOptions}
            />
            <PollenChart
              mergedData={mergedData}
              cityLines={cityLines}
              chartType={chartType}
              showAvg={showAvg}
              predData={predData}
              lastHistoricalDate={lastHistoricalDate}
              dateGranularity={dateGranularity}
            />
            <PollenLevelLegend />
            <PredictionTable predData={predData} />
          </>
        )}
      </div>
    </div>
  );
}
