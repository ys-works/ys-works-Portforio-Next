interface Props {
  selectedYear: string;
  onYearChange: (year: string) => void;
  yearOptions: string[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthOptions: string[];
}

export default function PeriodSelector({
  selectedYear,
  onYearChange,
  yearOptions,
  selectedMonth,
  onMonthChange,
  monthOptions,
}: Props) {
  return (
    <div className="period-selector-row">
      <div className="period-selector-item">
        <label>年</label>
        <select
          title="表示する年を選択"
          aria-label="表示する年"
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
        >
          <option value="all">全期間</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="period-selector-item">
        <label>月</label>
        <select
          title="表示する月を選択"
          aria-label="表示する月"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
        >
          <option value="all">全期間</option>
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
