import { useState, useEffect, useCallback } from "react";
import "./css/TokyoPollenDashboard.css";
import pollenData from "./json/tokyo_pollen_all.json";

import { CITY_NAMES, COLORS } from "./constants/pollenConstants";
import type { PollenRecord, ChartRow, PredRow, CityLine } from "./types/pollen";

import CitySelector from "./components/CitySelector";
import GeminiPanel from "./components/GeminiPanel";
import ChartTypeToggle from "./components/ChartTypeToggle";
import PollenChart from "./components/PollenChart";
import PollenLevelLegend from "./components/PollenLevelLegend";
import PredictionTable from "./components/PredictionTable";

export default function App() {
  const [rawData, setRawData] = useState<PollenRecord[]>([]);
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [predData, setPredData] = useState<PredRow[]>([]);
  const [selectedCities, setSelectedCities] = useState<number[]>([]);
  const [availableCities, setAvailableCities] = useState<number[]>([]);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [dateGranularity, setDateGranularity] = useState<"daily" | "monthly">("daily");
  const [showAvg, setShowAvg] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [predicting, setPredicting] = useState<boolean>(false);
  const [predictingHorizon, setPredictingHorizon] = useState<1 | 3 | 7 | null>(null);
  const [predError, setPredError] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  // 初期データ読み込み
  useEffect(() => {
    setRawData(pollenData as PollenRecord[]);
  }, []);

  // データ初期化
  useEffect(() => {
    if (!rawData.length) return;
    const cities = [...new Set(rawData.map((r) => r.citycode))].sort(
      (a, b) => a - b,
    );
    setAvailableCities(cities);
    setSelectedCities(cities.slice(0, 3));

    const dates = rawData.map((r) => r.date.slice(0, 10));
    setDateRange({ start: dates[0], end: dates[dates.length - 1] });

    setSelectedYear("all");
    setSelectedMonth("all");
  }, [rawData]);

  // チャートデータ生成
  useEffect(() => {
    if (!rawData.length || !selectedCities.length) return;

    let filtered = rawData.filter((r) => selectedCities.includes(r.citycode));
    if (selectedYear !== "all") {
      filtered = filtered.filter((r) => r.date.slice(0, 4) === selectedYear);
    }
    if (selectedMonth !== "all") {
      filtered = filtered.filter((r) => r.date.slice(5, 7) === selectedMonth);
    }

    const byDate: Record<string, ChartRow> = {};
    const dateKey = (rawDate: string) =>
      dateGranularity === "monthly" ? rawDate.slice(0, 7) : rawDate.slice(0, 10);

    for (const row of filtered) {
      const date = dateKey(row.date);
      if (!byDate[date]) byDate[date] = { date };
      const name = CITY_NAMES[row.citycode] ?? `${row.citycode}`;
      byDate[date][name] = row.pollen < 0 ? null : row.pollen;
    }

    if (showAvg) {
      const avgSource = rawData.filter((r) => {
        if (r.pollen < 0) return false;
        if (selectedYear !== "all" && r.date.slice(0, 4) !== selectedYear) return false;
        if (selectedMonth !== "all" && r.date.slice(5, 7) !== selectedMonth) return false;
        return true;
      });
      const allByDate: Record<string, number[]> = {};
      for (const row of avgSource) {
        const date = dateKey(row.date);
        if (!allByDate[date]) allByDate[date] = [];
        allByDate[date].push(row.pollen);
      }
      for (const [date, vals] of Object.entries(allByDate)) {
        if (!byDate[date]) byDate[date] = { date };
        byDate[date]["東京都平均"] = Math.round(
          vals.reduce((a, b) => a + b, 0) / vals.length,
        );
      }
    }

    const sorted = Object.values(byDate).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    setChartData(sorted);
    setPredData([]);
  }, [rawData, selectedCities, showAvg, dateGranularity, selectedYear, selectedMonth]);

  const toggleCity = (code: number) => {
    setSelectedCities((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  // Gemini予測（選択中の市区町村ごと）
  const predict = useCallback(async (horizon: 1 | 3 | 7) => {
    if (!chartData.length) {
      setPredError("データを先に読み込んでください");
      return;
    }
    if (!selectedCities.length) {
      setPredError("市区町村を選択してください");
      return;
    }

    const dayCount = horizon;

    setPredicting(true);
    setPredictingHorizon(horizon);
    setPredError("");
    setPredData([]);

    try {
      const predictions: PredRow[] = [];

      for (const citycode of selectedCities) {
        const cityName = CITY_NAMES[citycode] ?? `${citycode}`;
        const cityData = rawData
          .filter((r) => r.citycode === citycode && r.pollen >= 0)
          .slice(-30)
          .map((r) => ({ date: r.date.slice(0, 10), pollen: r.pollen }));

        if (cityData.length === 0) continue;

        const prompt = horizon === 1 ? `\nあなたは花粉データを分析する専門家です。以下は${cityName}の花粉飛散数（個/cm²）の時系列データです。\nこのデータに基づき、翌日の花粉飛散数を予測してください。\n\n過去データ（日付, 花粉数）:\n${cityData.slice(-7).map((d) => `${d.date}: ${d.pollen}`).join("\n")}\n\n最終日: ${cityData[cityData.length - 1].date}\n予測値のみを整数で返してください。\n` : `\nあなたは花粉データを分析する専門家です。以下は${cityName}の花粉飛散数（個/cm²）の時系列データです。\nこのデータに基づき、次の${dayCount}日間の花粉飛散数を日別に予測してください。\n\n過去データ（日付, 花粉数）:\n${cityData.slice(-7).map((d) => `${d.date}: ${d.pollen}`).join("\n")}\n\n最終日: ${cityData[cityData.length - 1].date}\n出力は「1日目: 数値、2日目: 数値, ...」のように各日付の整数のみを返してください。\n`;

        const apiBase = import.meta.env.DEV ? "http://localhost:3001" : "";

        const res = await fetch(`${apiBase}/api/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMsg = errorData?.error || `HTTP ${res.status}`;
          if (res.status === 429) {
            throw new Error(
              `APIレート制限超過: 数分待ってから再度お試しください`,
            );
          }
          throw new Error(`API Error: ${errorMsg}`);
        }

        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const numbers = [...text.matchAll(/\d+/g)].map((m) => parseInt(m[0] ?? "0", 10));

        const lastDate = new Date(cityData[cityData.length - 1].date);
        for (let i = 1; i <= dayCount; i += 1) {
          const value = numbers[i - 1] ?? 0;
          const date = new Date(lastDate);
          date.setDate(date.getDate() + i);
          predictions.push({
            date: date.toISOString().slice(0, 10),
            citycode,
            cityName,
            pollen: value,
          });
        }
      }

      setPredData(predictions);
    } catch (e) {
      setPredError(e instanceof Error ? e.message : "予測エラーが発生しました");
    } finally {
      setPredicting(false);
      setPredictingHorizon(null);
    }
  }, [chartData, selectedCities, rawData]);

  // 予測データをチャートにマージ
  const mergedData: ChartRow[] = [...chartData];
  if (predData.length) {
    const predByDate: Record<string, ChartRow> = {};
    const dateKey = (rawDate: string) =>
      dateGranularity === "monthly" ? rawDate.slice(0, 7) : rawDate.slice(0, 10);
    for (const p of predData) {
      if (selectedYear !== "all" && p.date.slice(0, 4) !== selectedYear) continue;
      if (selectedMonth !== "all" && p.date.slice(5, 7) !== selectedMonth) continue;
      const displayDate = dateKey(p.date);
      if (!predByDate[displayDate])
        predByDate[displayDate] = { date: displayDate, _predicted: true };
      predByDate[displayDate][p.cityName || `予測${p.citycode}`] = p.pollen;
    }
    mergedData.push(...Object.values(predByDate));
  }

  const cityLines: CityLine[] = selectedCities.map((code, i) => ({
    key: CITY_NAMES[code] ?? `${code}`,
    color: COLORS[i % COLORS.length],
  }));

  const yearOptions = [...new Set(rawData.map((r) => r.date.slice(0, 4)))].sort();
  const monthOptions = [...new Set(rawData.map((r) => r.date.slice(5, 7)))].sort();

  const lastHistoricalDate =
    chartData.length > 0 ? chartData[chartData.length - 1].date : "";

  return (
    <div className="app-container">
      {/* ヘッダー */}
      <div className="header">
        <div className="header-icon">🌿</div>
        <div>
          <div className="header-title">東京都 花粉情報</div>
          <div className="header-subtitle">
            TOKYO POLLEN ANALYTICS × GEMINI AI FORECAST
          </div>
        </div>
        {rawData.length > 0 && (
          <div className="header-status">
            <div className="header-date">
              {dateRange.start} → {dateRange.end}
            </div>
            <div className="status-indicator" />
          </div>
        )}
      </div>

      <div className="main-container">
        {rawData.length > 0 && (
          <>
            {/* コントロールパネル */}
            <div className="control-panel-grid">
              <CitySelector
                availableCities={availableCities}
                selectedCities={selectedCities}
                onToggle={toggleCity}
                showAvg={showAvg}
                onShowAvgChange={setShowAvg}
              />
              <GeminiPanel
                predicting={predicting}
                predictingHorizon={predictingHorizon}
                predError={predError}
                predData={predData}
                onPredict={predict}
              />
            </div>

            <div className="chart-controls-row">
              <ChartTypeToggle chartType={chartType} onChange={setChartType} />
              <div className="date-granularity-toggle">
                <button
                  className={`btn ${dateGranularity === "daily" ? "active" : ""}`}
                  onClick={() => setDateGranularity("daily")}
                >
                  日次
                </button>
                <button
                  className={`btn ${dateGranularity === "monthly" ? "active" : ""}`}
                  onClick={() => setDateGranularity("monthly")}
                >
                  月次
                </button>
              </div>
            </div>

            <div className="period-selector-row">
              <div className="period-selector-item">
                <label>年</label>
                <select
                  title="表示する年を選択"
                  aria-label="表示する年"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="all">全期間</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="period-selector-item">
                <label>月</label>
                <select
                  title="表示する月を選択"
                  aria-label="表示する月"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="all">全期間</option>
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
