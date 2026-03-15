import { useMemo } from "react";
import { CITY_NAMES, COLORS } from "../constants/pollenConstants";
import type { CityLine } from "../types/pollen";

interface UseCityColorsProps {
  availableCities: number[];
  selectedCities: number[];
}

export function useCityColors({ availableCities, selectedCities }: UseCityColorsProps) {
  const cityColorIndexByCode = useMemo(() => {
    const map: Record<number, number> = {};
    availableCities.forEach((code, idx) => {
      map[code] = idx % COLORS.length;
    });
    return map;
  }, [availableCities]);

  const cityLines: CityLine[] = useMemo(() => {
    return selectedCities.map((code) => {
      const colorIdx = cityColorIndexByCode[code] ?? 0;
      return {
        key: CITY_NAMES[code] ?? `${code}`,
        color: COLORS[colorIdx],
      };
    });
  }, [selectedCities, cityColorIndexByCode]);

  return { cityColorIndexByCode, cityLines };
}
