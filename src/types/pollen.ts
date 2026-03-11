export interface PollenRecord {
  citycode: number;
  date: string;
  pollen: number;
}

export interface ChartRow {
  date: string;
  [key: string]: number | null | string | boolean;
}

export interface PredRow {
  date: string;
  citycode?: number;
  cityName?: string;
  pollen: number;
}

export interface PollenLevel {
  label: string;
  color: string;
}

export interface CityLine {
  key: string;
  color: string;
}
