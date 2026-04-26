import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const COMING_SOON = [
  { icon: "◈", label: "Outcome tracking", sub: "See which theses were correct after contracts resolve" },
  { icon: "∿", label: "Accuracy metrics", sub: "Fair value calibration and EV prediction performance over time" },
  { icon: "✦", label: "P&L simulation", sub: "Hypothetical returns if you had traded each recommendation" },
];

export default function History() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white">Analysis History</h2>
        <p className="text-xs text-muted mt-0.5 font-mono">Resolved contract outcomes and accuracy tracking</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border rounded-2xl p-8 text-center mb-6"
      >
        <div className="text-4xl mb-4 opacity-20">◈</div>
        <p className="text-white font-medium text-sm mb-1">No resolved contracts yet</p>
        <p className="text-muted text-xs max-w-sm mx-auto">
          Outcome tracking activates when analyzed contracts expire. Check back after your first contracts resolve.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 mt-5 text-xs text-accent border border-accent/30 bg-accent/5 hover:bg-accent/10 px-4 py-2 rounded-lg transition-all"
        >
          View live contracts
        </Link>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-3">
        {COMING_SOON.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <div className="text-accent text-lg mb-2">{item.icon}</div>
            <p className="text-sm font-medium text-white mb-1">{item.label}</p>
            <p className="text-xs text-muted leading-relaxed">{item.sub}</p>
            <div className="mt-3 text-[9px] font-mono text-muted/50 uppercase tracking-wider border border-border rounded px-1.5 py-0.5 inline-block">
              Coming soon
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
