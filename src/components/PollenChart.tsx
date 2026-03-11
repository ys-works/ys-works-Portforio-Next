import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import CustomTooltip from "./CustomTooltip";
import type { ChartRow, CityLine, PredRow } from "../types/pollen";

interface Props {
  mergedData: ChartRow[];
  cityLines: CityLine[];
  chartType: "line" | "bar";
  showAvg: boolean;
  predData: PredRow[];
  lastHistoricalDate: string;
}

export default function PollenChart({
  mergedData,
  cityLines,
  chartType,
  showAvg,
  predData,
  lastHistoricalDate,
}: Props) {
  return (
    <div className="glow chart-container">
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart
          data={mergedData}
          margin={{ top: 5, right: 20, bottom: 20, left: 10 }}
        >
          <CartesianGrid
            stroke="rgba(255,255,255,0.04)"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#334155", fontSize: 10, fontFamily: "DM Mono" }}
            tickFormatter={(v) => v.slice(5)}
            interval="preserveStartEnd"
            axisLine={{ stroke: "#1e3a5f" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#334155", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "個/cm²",
              angle: -90,
              position: "insideLeft",
              fill: "#334155",
              fontSize: 10,
              dy: 40,
            }}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 12 }}
          />

          {predData.length > 0 && lastHistoricalDate && (
            <ReferenceLine
              x={lastHistoricalDate}
              stroke="#818cf8"
              strokeDasharray="6 3"
              label={{ value: "予測開始", fontSize: 12, fill: "#cfd3fd" }}
            />
          )}

          {cityLines.map(({ key, color }) =>
            chartType === "line" ? (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                connectNulls={false}
                activeDot={{ r: 4 }}
              />
            ) : (
              <Bar
                key={key}
                dataKey={key}
                fill={color}
                opacity={0.8}
                radius={[2, 2, 0, 0]}
              />
            )
          )}

          {showAvg && chartType === "line" && (
            <Line
              type="monotone"
              dataKey="東京都平均"
              stroke="#faf62a"
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
          )}

          {showAvg && chartType === "bar" && (
            <Bar
              dataKey="東京都平均"
              fill="#faf62a"
              opacity={0.8}
              radius={[2, 2, 0, 0]}
            />
          )}

          {predData.length > 0 && chartType === "line" && (
            <Line
              type="monotone"
              dataKey="予測（東京平均）"
              stroke="#818cf8"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={{ fill: "#818cf8", r: 3 }}
              connectNulls
            />
          )}

          {predData.length > 0 && chartType === "bar" && (
            <Bar
              dataKey="予測（東京平均）"
              fill="#818cf8"
              opacity={0.8}
              radius={[2, 2, 0, 0]}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
