import { useState, useCallback, useEffect } from "react";
import { CITY_NAMES } from "../constants/pollenConstants";
import type { PollenRecord, ChartRow, PredRow } from "../types/pollen";

interface UsePollenPredictionProps {
  rawData: PollenRecord[];
  selectedCities: number[];
  chartData: ChartRow[];
}

export default function usePollenPrediction({
  rawData,
  selectedCities,
  chartData,
}: UsePollenPredictionProps) {
  const [predData, setPredData] = useState<PredRow[]>([]);
  const [predicting, setPredicting] = useState<boolean>(false);
  const [predictingHorizon, setPredictingHorizon] = useState<1 | 3 | 7 | null>(null);
  const [predError, setPredError] = useState<string>("");

  useEffect(() => {
    setPredData([]);
  }, [rawData, selectedCities, chartData]);

  const predict = useCallback(async (horizon: 1 | 3 | 7) => {
    if (!chartData.length) {
      setPredError("データを先に読み込んでください");
      return;
    }
    if (!selectedCities.length) {
      setPredError("市区町村を選択してください");
      return;
    }

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

        if (!cityData.length) continue;

        const prompt =
          horizon === 1
            ? `\nあなたは花粉データを分析する専門家です。以下は${cityName}の花粉飛散数（個/cm²）の時系列データです。\nこのデータに基づき、翌日の花粉飛散数を予測してください。\n\n過去データ（日付, 花粉数）:\n${cityData.slice(-7).map((d) => `${d.date}: ${d.pollen}`).join("\n")}\n\n最終日: ${cityData[cityData.length - 1].date}\n予測値のみを整数で返してください。\n`
            : `\nあなたは花粉データを分析する専門家です。以下は${cityName}の花粉飛散数（個/cm²）の時系列データです。\nこのデータに基づき、次の${horizon}日間の花粉飛散数を日別に予測してください。\n\n過去データ（日付, 花粉数）:\n${cityData.slice(-7).map((d) => `${d.date}: ${d.pollen}`).join("\n")}\n\n最終日: ${cityData[cityData.length - 1].date}\n出力は「1日目: 数値、2日目: 数値, ...」のように各日付の整数のみを返してください。\n`;

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
            throw new Error("APIレート制限超過: 数分待ってから再度お試しください");
          }
          throw new Error(`API Error: ${errorMsg}`);
        }

        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const numbers = [...text.matchAll(/\d+/g)].map((m) => parseInt(m[0] ?? "0", 10));

        const lastDate = new Date(cityData[cityData.length - 1].date);
        for (let i = 1; i <= horizon; i += 1) {
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
  }, [rawData, selectedCities, chartData]);

  return {
    predData,
    predicting,
    predictingHorizon,
    predError,
    predict,
  };
}
