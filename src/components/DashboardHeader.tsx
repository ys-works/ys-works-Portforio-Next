interface DashboardHeaderProps {
  hasData: boolean;
  dateRange: { start: string; end: string };
}

export default function DashboardHeader({ hasData, dateRange }: DashboardHeaderProps) {
  return (
    <div className="header">
      <div className="header-icon">🌿</div>
      <div>
        <div className="header-title">東京都 花粉情報</div>
        <div className="header-subtitle">
          TOKYO POLLEN ANALYTICS × GEMINI AI FORECAST
        </div>
      </div>
      {hasData && (
        <div className="header-status">
          <div className="header-date">
            {dateRange.start} → {dateRange.end}
          </div>
          <div className="status-indicator" />
        </div>
      )}
    </div>
  );
}
