import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getDashboard } from "../api/contracts";
import ContractCard from "../components/ContractCard";

function StatPill({ label, value, color = "text-white" }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg">
      <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-mono font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="flex gap-2">
        <div className="w-12 h-4 bg-panel rounded shimmer-bg" />
        <div className="w-16 h-4 bg-panel rounded shimmer-bg" />
        <div className="w-10 h-4 bg-panel rounded ml-auto shimmer-bg" />
      </div>
      <div className="w-3/4 h-4 bg-panel rounded shimmer-bg" />
      <div className="w-full h-5 bg-panel rounded shimmer-bg" />
      <div className="flex gap-3">
        <div className="w-14 h-3 bg-panel rounded shimmer-bg" />
        <div className="w-12 h-3 bg-panel rounded shimmer-bg" />
        <div className="w-16 h-5 bg-panel rounded ml-auto shimmer-bg" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getDashboard()
      .then(setContracts)
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(contracts.map(c => c.category).filter(Boolean))];
  const filtered = filter === "all" ? contracts : contracts.filter(c => c.category === filter);

  const positiveEV = contracts.filter(c => (c.expected_value_yes ?? 0) > 0);
  const avgEV = contracts.length
    ? contracts.reduce((s, c) => s + (c.expected_value_yes ?? 0), 0) / contracts.length
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Stats bar */}
      {!loading && contracts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          <StatPill label="Contracts analyzed" value={contracts.length} />
          <StatPill
            label="Positive EV"
            value={`${positiveEV.length} / ${contracts.length}`}
            color="text-positive"
          />
          {avgEV != null && (
            <StatPill
              label="Avg EV"
              value={`${avgEV > 0 ? "+" : ""}${(avgEV * 100).toFixed(1)}c`}
              color={avgEV > 0 ? "text-positive" : "text-negative"}
            />
          )}
          <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-muted px-3">
            <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
            Syncs every 15 min
          </div>
        </motion.div>
      )}

      {/* Header + filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-white">Top Mispricings</h2>
          <p className="text-xs text-muted mt-0.5 font-mono">Ranked by absolute expected value</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                filter === cat
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "border-border text-muted hover:text-white hover:border-border-2 bg-transparent"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="text-4xl mb-4 opacity-20">◈</div>
          <p className="text-secondary text-sm font-medium">No analyzed contracts yet.</p>
          <p className="text-muted text-xs mt-1.5 max-w-xs">
            Contract sync runs every 15 minutes. Analysis triggers automatically once contracts are ingested.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((c, i) => (
            <ContractCard
              key={c.id || c.contract_id}
              contract={{ ...c, id: c.id || c.contract_id }}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
