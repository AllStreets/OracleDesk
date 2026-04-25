import { Link } from "react-router-dom";
import EVBadge from "./EVBadge";

export default function ContractCard({ contract }) {
  const { id, title, platform, category, current_yes_price, analysis, expiry_date } = contract;
  const yesPrice = current_yes_price != null ? `${(current_yes_price * 100).toFixed(0)}c` : "N/A";
  const fairValue = analysis?.fair_value_yes != null ? `${(analysis.fair_value_yes * 100).toFixed(0)}c` : null;

  return (
    <Link to={`/contract/${id}`} className="block bg-panel border border-border rounded p-4 hover:border-accent transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">{platform} / {category}</p>
          <p className="text-sm text-white leading-snug">{title}</p>
          {expiry_date && (
            <p className="text-xs text-muted mt-1">Expires {new Date(expiry_date).toLocaleDateString()}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="text-right">
            <span className="text-xs text-muted">Market </span>
            <span className="text-sm font-bold text-white">{yesPrice}</span>
          </div>
          {fairValue && (
            <div className="text-right">
              <span className="text-xs text-muted">Fair value </span>
              <span className="text-sm font-bold text-accent">{fairValue}</span>
            </div>
          )}
          <EVBadge ev={analysis?.expected_value_yes} />
        </div>
      </div>
    </Link>
  );
}
