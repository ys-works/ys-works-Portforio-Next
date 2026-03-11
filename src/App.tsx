import { useState, useEffect, useCallback } from "react";
import "./css/TokyoPollenDashboard.css";
import pollenData from "./json/tokyo_pollen_all.json";

import { CITY_NAMES, COLORS } from "./constants/pollenConstants";
import type { PollenRecord, ChartRow, PredRow, CityLine } from "./types/pollen";

import CitySelector      from "./components/CitySelector";
import GeminiPanel       from "./components/GeminiPanel";
import ChartTypeToggle   from "./components/ChartTypeToggle";
import PollenChart       from "./components/PollenChart";
import PollenLevelLegend from "./components/PollenLevelLegend";
import PredictionTable   from "./components/PredictionTable";

export default function App() {
  const [rawData, setRawData]               = useState<PollenRecord[]>([]);
  const [chartData, setChartData]           = useState<ChartRow[]>([]);
  const [predData, setPredData]             = useState<PredRow[]>([]);
  const [selectedCities, setSelectedCities] = useState<number[]>([]);
  const [availableCities, setAvailableCities] = useState<number[]>([]);
  const [chartType, setChartType]           = useState<"line" | "bar">("line");
  const [showAvg, setShowAvg]               = useState<boolean>(true);
  const [predicting, setPredicting]         = useState<boolean>(false);
  const [predError, setPredError]           = useState<string>("");
  const [dateRange, setDateRange]           = useState<{ start: string; end: string }>({
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
    const cities = [...new Set(rawData.map((r) => r.citycode))].sort((a, b) => a - b);
    setAvailableCities(cities);
    setSelectedCities(cities.slice(0, 3));
    const dates = rawData.map((r) => r.date.slice(0, 10));
    setDateRange({ start: dates[0], end: dates[dates.length - 1] });
  }, [rawData]);

  // チャートデータ生成
  useEffect(() => {
    if (!rawData.length || !selectedCities.length) return;

    const filtered = rawData.filter((r) => selectedCities.includes(r.citycode));
    const byDate: Record<string, ChartRow> = {};

    for (const row of filtered) {
      const date = row.date.slice(0, 10);
      if (!byDate[date]) byDate[date] = { date };
      const name = CITY_NAMES[row.citycode] ?? `${row.citycode}`;
      byDate[date][name] = row.pollen < 0 ? null : row.pollen;
    }

    if (showAvg) {
      const allByDate: Record<string, number[]> = {};
      for (const row of rawData) {
        if (row.pollen < 0) continue;
        const date = row.date.slice(0, 10);
        if (!allByDate[date]) allByDate[date] = [];
        allByDate[date].push(row.pollen);
      }
      for (const [date, vals] of Object.entries(allByDate)) {
        if (!byDate[date]) byDate[date] = { date };
        byDate[date]["東京都平均"] = Math.round(
          vals.reduce((a, b) => a + b, 0) / vals.length
        );
      }
    }

    const sorted = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    setChartData(sorted);
    setPredData([]);
  }, [rawData, selectedCities, showAvg]);

  const toggleCity = (code: number) => {
    setSelectedCities((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Gemini予測（選択中の市区町村ごと）
  const predict = useCallback(async () => {
    if (!chartData.length) { setPredError("データを先に読み込んでください"); return; }
    if (!selectedCities.length) { setPredError("市区町村を選択してください"); return; }

    setPredicting(true);
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

        const prompt = `
あなたは花粉データを分析する専門家です。以下は${cityName}の花粉飛散数（個/cm²）の時系列データです。
このデータに基づき、翌日の花粉飛散数を予測してください。

過去データ（日付, 花粉数）:
${cityData.slice(-7).map((d) => `${d.date}: ${d.pollen}`).join("\n")}

最終日: ${cityData[cityData.length - 1].date}
翌日の予測値のみを整数で返してください。数値のみ。
`;

        const res = await fetch("http://localhost:3001/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMsg = errorData?.error || `HTTP ${res.status}`;
          if (res.status === 429) {
            throw new Error(`APIレート制限超過: 数分待ってから再度お試しください`);
          }
          throw new Error(`API Error: ${errorMsg}`);
        }
        
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const pollenValue = parseInt(text.match(/\d+/)?.[0] ?? "0");
        
        const lastDate = new Date(cityData[cityData.length - 1].date);
        lastDate.setDate(lastDate.getDate() + 1);
        const nextDate = lastDate.toISOString().slice(0, 10);
        
        predictions.push({
          date: nextDate,
          citycode,
          cityName,
          pollen: pollenValue,
        });
      }
      
      setPredData(predictions);
    } catch (e) {
      setPredError(e instanceof Error ? e.message : "予測エラーが発生しました");
    } finally {
      setPredicting(false);
    }
  }, [chartData, selectedCities, rawData]);

  // 予測データをチャートにマージ
  const mergedData: ChartRow[] = [...chartData];
  if (predData.length) {
    const predByDate: Record<string, ChartRow> = {};
    for (const p of predData) {
      if (!predByDate[p.date]) predByDate[p.date] = { date: p.date, _predicted: true };
      predByDate[p.date][p.cityName || `予測${p.citycode}`] = p.pollen;
    }
    mergedData.push(...Object.values(predByDate));
  }

  const cityLines: CityLine[] = selectedCities.map((code, i) => ({
    key: CITY_NAMES[code] ?? `${code}`,
    color: COLORS[i % COLORS.length],
  }));

  const lastHistoricalDate = chartData.length > 0 ? chartData[chartData.length - 1].date : "";

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
                predError={predError}
                predData={predData}
                onPredict={predict}
              />
            </div>

            <ChartTypeToggle chartType={chartType} onChange={setChartType} />

            <PollenChart
              mergedData={mergedData}
              cityLines={cityLines}
              chartType={chartType}
              showAvg={showAvg}
              predData={predData}
              lastHistoricalDate={lastHistoricalDate}
            />

            <PollenLevelLegend />

            <PredictionTable predData={predData} />
          </>
        )}
      </div>
    </div>
  );
}
