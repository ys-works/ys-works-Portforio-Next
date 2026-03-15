import { useMemo } from "react";
import type { ChartRow, PredRow } from "../types/pollen";

interface UseMergedDataProps {
  chartData: ChartRow[];
  predData: PredRow[];
  dateGranularity: "daily" | "monthly";
  selectedYear: string;
  selectedMonth: string;
}

export function useMergedData({
  chartData,
  predData,
  dateGranularity,
  selectedYear,
  selectedMonth,
}: UseMergedDataProps): ChartRow[] {
  return useMemo(() => {
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

    return mergedData;
  }, [chartData, predData, dateGranularity, selectedYear, selectedMonth]);
}
