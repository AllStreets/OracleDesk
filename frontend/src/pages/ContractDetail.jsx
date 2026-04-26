import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getContract, triggerAnalysis, getHistory } from "../api/contracts";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "../api/watchlist";
import ThesisRenderer from "../components/ThesisRenderer";
import EVBadge from "../components/EVBadge";
import ProbabilityBar from "../components/ProbabilityBar";
import ConfidenceBadge from "../components/ConfidenceBadge";
import AgentPipeline from "../components/AgentPipeline";
import SparklineChart from "../components/SparklineChart";

const PLATFORM_STYLE = {
  kalshi: { label: "KALSHI", color: "text-kalshi bg-kalshi/10 border-kalshi/20" },
  polymarket: { label: "POLYMARKET", color: "text-polymarket bg-polymarket/10 border-polymarket/20" },
};

function MetricBox({ label, value, color = "text-white", sub }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1">
      <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{label}</span>
      <span className={`text-xl font-mono font-bold ${color}`}>{value}</span>
      {sub && <span className="text-[10px] text-muted">{sub}</span>}
    </div>
  );
}

export default function ContractDetail() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineVisible, setPipelineVisible] = useState(false);
  const [pipelinePhase, setPipelinePhase] = useState(0);
  const [watchlistId, setWatchlistId] = useState(null);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const pipelineRef = useRef(null);

  const load = () => getContract(id).then(setContract).finally(() => setLoading(false));

  useEffect(() => {
    load();
    getHistory(id).then(setHistory).catch(() => {});
    getWatchlist().then(items => {
      const match = items.find(w => w.contract_id === id);
      if (match) setWatchlistId(match.watchlist_id);
    }).catch(() => {});
  }, [id]);

  const toggleWatchlist = async () => {
    setWatchlistLoading(true);
    try {
      if (watchlistId) {
        await removeFromWatchlist(watchlistId);
        setWatchlistId(null);
      } else {
        const res = await addToWatchlist(id, null);
        setWatchlistId(res.watchlist_id);
      }
    } finally {
      setWatchlistLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setPipelinePhase(0);
    setPipelineVisible(true);
    await triggerAnalysis(id);
  };

  const handlePipelineComplete = () => {
    setTimeout(() => {
      load();
      setAnalyzing(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl h-24 shimmer-bg" />
        ))}
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-negative text-sm">Contract not found.</p>
        <Link to="/dashboard" className="text-xs text-accent mt-2 hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  const { title, platform, category, current_yes_price, expiry_date, analysis, volume } = contract;
  const platformStyle = PLATFORM_STYLE[platform?.toLowerCase()] || { label: platform?.toUpperCase(), color: "text-muted bg-border border-border-2" };
  const ev = analysis?.expected_value_yes;
  const isPositiveEV = ev != null && ev > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
        <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-secondary truncate max-w-xs">{title}</span>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border rounded-2xl p-6"
        style={{ boxShadow: isPositiveEV ? "0 0 40px rgba(16,185,129,0.05)" : "0 0 40px rgba(239,68,68,0.03)" }}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${platformStyle.color}`}>
                {platformStyle.label}
              </span>
              <span className="text-[11px] text-muted">{category}</span>
              {expiry_date && (
                <span className="text-[10px] font-mono text-muted border border-border rounded px-1.5 py-0.5">
                  Expires {new Date(expiry_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
            <h1 className="text-xl font-semibold text-white leading-snug">{title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleWatchlist}
              disabled={watchlistLoading}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border font-medium transition-all
                ${watchlistId
                  ? "border-warning/40 text-warning bg-warning/10 hover:bg-warning/5"
                  : "border-border text-muted hover:text-white hover:border-border-2 bg-transparent"}`}
            >
              {watchlistId ? "★ Watching" : "☆ Watch"}
            </button>
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg border font-medium transition-all
                ${analyzing
                  ? "border-accent/30 text-accent/60 bg-accent/5 cursor-not-allowed"
                  : "border-accent text-accent hover:bg-accent hover:text-white bg-accent/5"}`}
            >
              {analyzing && <span className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />}
              {analyzing ? "Running..." : "Refresh analysis"}
            </button>
          </div>
        </div>

        {/* Probability bar */}
        <ProbabilityBar market={current_yes_price} fair={analysis?.fair_value_yes} />
      </motion.div>

      {/* Metrics grid */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <MetricBox
            label="Market price"
            value={current_yes_price != null ? `${Math.round(current_yes_price * 100)}c` : "N/A"}
          />
          {analysis.fair_value_yes != null && (
            <MetricBox
              label="Fair value"
              value={`${Math.round(analysis.fair_value_yes * 100)}c`}
              color="text-accent"
              sub="model estimate"
            />
          )}
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Expected value</span>
            <EVBadge ev={ev} size="lg" />
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Confidence</span>
            <div className="mt-1">
              <ConfidenceBadge confidence={analysis.confidence} />
            </div>
            {volume && <span className="text-[10px] text-muted mt-1">
              ${(volume / 1_000_000).toFixed(1)}M volume
            </span>}
          </div>
        </motion.div>
      )}

      {/* Price history sparkline */}
      {history.length > 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-surface border border-border rounded-xl p-4"
        >
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-3">
            Price history (48h)
          </p>
          <SparklineChart data={history} positive={isPositiveEV} />
          <div className="flex justify-between text-[9px] font-mono text-muted mt-1">
            <span>48h ago</span>
            <span>Now</span>
          </div>
        </motion.div>
      )}

      {/* Agent pipeline — drawer while running, inline when done */}
      {pipelineVisible && analyzing && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="pointer-events-auto max-w-4xl mx-auto px-4 pb-4"
          >
            <AgentPipeline
              running={analyzing}
              onComplete={handlePipelineComplete}
              onPhaseChange={setPipelinePhase}
            />
          </motion.div>
        </div>
      )}

      {pipelineVisible && !analyzing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AgentPipeline
            running={false}
            onComplete={null}
            onPhaseChange={null}
          />
        </motion.div>
      )}

      {/* Thesis */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface border border-border rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-accent text-lg">✦</span>
            <h3 className="text-sm font-semibold text-white">Research Thesis</h3>
            <span className="text-[10px] font-mono text-muted">claude-opus-4-7</span>
          </div>
          {analysis?.created_at && (
            <span className="text-[10px] font-mono text-muted">
              {new Date(analysis.created_at).toLocaleString("en-US", {
                month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {analysis ? (
          <ThesisRenderer markdown={analysis.thesis_markdown} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-3xl mb-3 opacity-20">✦</div>
            <p className="text-secondary text-sm mb-4">No analysis for this contract yet.</p>
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="text-sm px-6 py-2.5 bg-accent hover:bg-blue-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
            >
              {analyzing ? "Running pipeline..." : "Run analysis"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
