export default function EVBadge({ ev }) {
  if (ev == null) return <span className="text-muted text-xs">No EV</span>;
  const positive = ev > 0;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded ${positive ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"}`}>
      {positive ? "+" : ""}{(ev * 100).toFixed(1)}c EV
    </span>
  );
}
