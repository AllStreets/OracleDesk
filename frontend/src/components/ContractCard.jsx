import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import EVBadge from "./EVBadge";
import ProbabilityBar from "./ProbabilityBar";
import ConfidenceBadge from "./ConfidenceBadge";

const PLATFORM_STYLE = {
  kalshi: { label: "KALSHI", color: "text-kalshi bg-kalshi/10 border-kalshi/20" },
  polymarket: { label: "POLY", color: "text-polymarket bg-polymarket/10 border-polymarket/20" },
};

function formatVolume(v) {
  if (!v) return null;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M vol`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K vol`;
  return `$${v} vol`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  if (days <= 7) return `${days}d left`;
  if (days <= 30) return `${Math.ceil(days / 7)}w left`;
  return `${Math.ceil(days / 30)}mo left`;
}

export default function ContractCard({ contract, index = 0 }) {
  const { id, title, platform, category, current_yes_price, analysis, expiry_date, volume } = contract;
  const platformStyle = PLATFORM_STYLE[platform?.toLowerCase()] || { label: platform?.toUpperCase(), color: "text-muted bg-border border-border-2" };
  const ev = analysis?.expected_value_yes;
  const isPositiveEV = ev != null && ev > 0;
  const expiry = daysUntil(expiry_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link
        to={`/contract/${id}`}
        className="block bg-surface border border-border rounded-xl p-4 card-hover group"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)" }}
      >
        {/* Header row */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${platformStyle.color}`}>
            {platformStyle.label}
          </span>
          <span className="text-[10px] text-muted font-medium">{category}</span>
          <div className="ml-auto flex items-center gap-2">
            <ConfidenceBadge confidence={analysis?.confidence} />
          </div>
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-white leading-snug mb-3 group-hover:text-blue-100 transition-colors line-clamp-2">
          {title}
        </p>

        {/* Probability bar */}
        <div className="mb-3">
          <ProbabilityBar market={current_yes_price} fair={analysis?.fair_value_yes} />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div>
            <span className="text-muted">Market </span>
            <span className="text-white font-semibold">
              {current_yes_price != null ? `${Math.round(current_yes_price * 100)}c` : "N/A"}
            </span>
          </div>
          {analysis?.fair_value_yes != null && (
            <div>
              <span className="text-muted">Fair </span>
              <span className="text-accent font-semibold">{Math.round(analysis.fair_value_yes * 100)}c</span>
            </div>
          )}
          {volume && <span className="text-muted">{formatVolume(volume)}</span>}
          {expiry && (
            <span className={`ml-auto ${parseInt(expiry) <= 7 ? "text-warning" : "text-muted"}`}>
              {expiry}
            </span>
          )}
          <EVBadge ev={ev} />
        </div>
      </Link>
    </motion.div>
  );
}
