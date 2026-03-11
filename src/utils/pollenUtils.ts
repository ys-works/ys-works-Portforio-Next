import type { PollenLevel } from "../types/pollen";

export function pollenLevel(val: number): PollenLevel {
  if (val < 0)   return { label: "欠測",       color: "#4b5563" };
  if (val === 0) return { label: "飛散なし",   color: "#10b981" };
  if (val < 30)  return { label: "少ない",     color: "#34d399" };
  if (val < 60)  return { label: "やや多い",   color: "#fbbf24" };
  if (val < 100) return { label: "多い",       color: "#fb923c" };
  return               { label: "非常に多い",  color: "#f87171" };
}
