interface Props {
  dateGranularity: "daily" | "monthly";
  onDateGranularityChange: (value: "daily" | "monthly") => void;
}

export default function DateGranularityToggle({
  dateGranularity,
  onDateGranularityChange,
}: Props) {
  return (
    <div className="date-granularity-toggle">
      <button
        className={`btn ${dateGranularity === "daily" ? "active" : ""}`}
        onClick={() => onDateGranularityChange("daily")}
      >
        日次
      </button>
      <button
        className={`btn ${dateGranularity === "monthly" ? "active" : ""}`}
        onClick={() => onDateGranularityChange("monthly")}
      >
        月次
      </button>
    </div>
  );
}
