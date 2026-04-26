export default function EVBadge({ ev, size = "sm" }) {
  if (ev == null) return (
    <span className="inline-flex items-center text-[10px] font-mono text-muted">— EV</span>
  );

  const positive = ev > 0;
  const cents = (ev * 100).toFixed(1);

  if (size === "lg") {
    return (
      <div className={`inline-flex flex-col items-center px-4 py-2.5 rounded-lg border
        ${positive ? "bg-positive/10 border-positive/25 text-positive" : "bg-negative/10 border-negative/25 text-negative"}`}>
        <span className="text-2xl font-mono font-bold">
          {positive ? "+" : ""}{cents}c
        </span>
        <span className="text-[9px] font-mono opacity-60 uppercase tracking-wider mt-0.5">expected value</span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border
      ${positive
        ? "bg-positive/10 border-positive/20 text-positive"
        : "bg-negative/10 border-negative/20 text-negative"}`}>
      <span className="text-[8px]">{positive ? "▲" : "▼"}</span>
      {positive ? "+" : ""}{cents}c
    </span>
  );
}
