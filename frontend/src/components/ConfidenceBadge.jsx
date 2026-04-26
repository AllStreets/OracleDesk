export default function ConfidenceBadge({ confidence }) {
  if (!confidence) return null;
  const level = confidence.toLowerCase();
  const config = {
    high: { dots: 3, color: "text-positive", bg: "bg-positive/10 border-positive/20", label: "HIGH" },
    medium: { dots: 2, color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "MED" },
    low: { dots: 1, color: "text-muted", bg: "bg-border border-border-2", label: "LOW" },
  }[level] || { dots: 1, color: "text-muted", bg: "bg-border border-border-2", label: "LOW" };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${config.bg} ${config.color}`}>
      <span>{config.label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full ${i <= config.dots ? config.color.replace("text-", "bg-") : "bg-border-2"}`}
          />
        ))}
      </div>
    </div>
  );
}
