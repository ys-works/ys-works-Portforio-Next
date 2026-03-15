import ChartTypeToggle from "./ChartTypeToggle";
import DateGranularityToggle from "./DateGranularityToggle";
import PeriodSelector from "./PeriodSelector";

interface DateFilterPanelProps {
  chartType: "line" | "bar";
  onChartTypeChange: (type: "line" | "bar") => void;
  dateGranularity: "daily" | "monthly";
  onDateGranularityChange: (value: "daily" | "monthly") => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  yearOptions: string[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthOptions: string[];
}

export default function DateFilterPanel({
  chartType,
  onChartTypeChange,
  dateGranularity,
  onDateGranularityChange,
  selectedYear,
  onYearChange,
  yearOptions,
  selectedMonth,
  onMonthChange,
  monthOptions,
}: DateFilterPanelProps) {
  return (
    <>
      <div className="chart-controls-row">
        <ChartTypeToggle chartType={chartType} onChange={onChartTypeChange} />
        <DateGranularityToggle
          dateGranularity={dateGranularity}
          onDateGranularityChange={onDateGranularityChange}
        />
      </div>

      <PeriodSelector
        selectedYear={selectedYear}
        onYearChange={onYearChange}
        yearOptions={yearOptions}
        selectedMonth={selectedMonth}
        onMonthChange={onMonthChange}
        monthOptions={monthOptions}
      />
    </>
  );
}
