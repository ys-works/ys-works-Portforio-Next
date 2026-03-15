import { useState, useMemo, useCallback } from "react";
import type { PollenRecord } from "../types/pollen";

interface UseDateFiltersProps {
  rawData: PollenRecord[];
}

export function useDateFilters({ rawData }: UseDateFiltersProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const yearOptions = useMemo(
    () => [...new Set(rawData.map((r) => r.date.slice(0, 4)))].sort(),
    [rawData],
  );

  const monthByYear = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const r of rawData) {
      const year = r.date.slice(0, 4);
      const month = r.date.slice(5, 7);
      if (!map[year]) map[year] = [];
      if (!map[year].includes(month)) map[year].push(month);
    }
    for (const year of Object.keys(map)) {
      map[year].sort();
    }
    return map;
  }, [rawData]);

  const monthOptions = useMemo(() => {
    if (selectedYear === "all") {
      const allMonths = [...new Set(rawData.map((r) => r.date.slice(5, 7)))].sort();
      return allMonths;
    }
    const yearMonths = monthByYear[selectedYear] ?? [];
    const currentYear = String(new Date().getFullYear());
    if (selectedYear === currentYear) {
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
      return yearMonths.filter((m) => m <= currentMonth);
    }
    return yearMonths;
  }, [rawData, monthByYear, selectedYear]);

  const handleYearChange = useCallback(
    (year: string) => {
      setSelectedYear(year);
      if (selectedMonth === "all") return;
      if (year === "all") return;

      const yearMonths = monthByYear[year] ?? [];
      const currentYear = String(new Date().getFullYear());
      const clippedMonths =
        year === currentYear
          ? yearMonths.filter((m) => m <= String(new Date().getMonth() + 1).padStart(2, "0"))
          : yearMonths;

      if (!clippedMonths.includes(selectedMonth)) {
        setSelectedMonth("all");
      }
    },
    [monthByYear, selectedMonth],
  );

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    yearOptions,
    monthOptions,
    handleYearChange,
  };
}
