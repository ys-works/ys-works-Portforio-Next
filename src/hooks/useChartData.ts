import { useMemo } from "react";
import { CITY_NAMES } from "../constants/pollenConstants";
import type { PollenRecord, ChartRow } from "../types/pollen";

interface UseChartDataProps {
  rawData: PollenRecord[];
  selectedCities: number[];
  showAvg: boolean;
  dateGranularity: "daily" | "monthly";
  selectedYear: string;
  selectedMonth: string;
}

export function useChartData({
  rawData,
  selectedCities,
  showAvg,
  dateGranularity,
  selectedYear,
  selectedMonth,
}: UseChartDataProps): ChartRow[] {
  return useMemo(() => {
    if (!rawData.length || !selectedCities.length) return [];

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

    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [rawData, selectedCities, showAvg, dateGranularity, selectedYear, selectedMonth]);
}
