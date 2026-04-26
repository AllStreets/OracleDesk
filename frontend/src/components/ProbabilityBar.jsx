import { motion } from "framer-motion";

export default function ProbabilityBar({ market, fair }) {
  if (market == null) return null;
  const marketPct = Math.round(market * 100);
  const fairPct = fair != null ? Math.round(fair * 100) : null;
  const edge = fair != null ? market - fair : null;
  const isOverpriced = edge > 0;

  return (
    <div className="space-y-1.5">
      <div className="relative h-5 bg-surface rounded-sm overflow-hidden border border-border">
        <motion.div
          className={`absolute inset-y-0 left-0 ${isOverpriced ? "bg-negative/20" : "bg-positive/20"}`}
          initial={{ width: 0 }}
          animate={{ width: `${marketPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        />
        {fairPct != null && (
          <motion.div
            className="absolute inset-y-0 w-0.5 bg-accent z-10"
            style={{ left: `${fairPct}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="absolute -top-0.5 -left-1 w-2 h-2 bg-accent rounded-full" />
          </motion.div>
        )}
        <div className="absolute inset-0 flex items-center px-2">
          <span className="text-[10px] font-mono font-semibold text-white/70 z-10">
            YES {marketPct}%
          </span>
          <span className="ml-auto text-[10px] font-mono text-muted z-10">
            NO {100 - marketPct}%
          </span>
        </div>
      </div>
      {fairPct != null && (
        <div className="flex items-center gap-1 text-[10px] font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-muted">Fair value {fairPct}%</span>
          {edge != null && (
            <span className={`ml-auto font-semibold ${isOverpriced ? "text-negative" : "text-positive"}`}>
              {isOverpriced ? "▲" : "▼"} {Math.abs(edge * 100).toFixed(1)}pt mispricing
            </span>
          )}
        </div>
      )}
    </div>
  );
}
