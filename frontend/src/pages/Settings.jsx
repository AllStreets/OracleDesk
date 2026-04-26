import { motion } from "framer-motion";

const PLAN_TIERS = [
  {
    name: "Free",
    price: "$0",
    current: true,
    features: ["10 contract analyses / mo", "Dashboard access", "Watchlist (5 contracts)", "48h price history"],
  },
  {
    name: "Pro",
    price: "$49",
    current: false,
    features: ["Unlimited analyses", "Priority pipeline", "Watchlist (unlimited)", "Full price history", "Email alerts", "API access"],
    highlight: true,
  },
  {
    name: "Premium",
    price: "$149",
    current: false,
    features: ["Everything in Pro", "Batch analysis", "Custom agent prompts", "Dedicated support", "White-label export"],
  },
];

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <p className="text-xs text-muted mt-0.5 font-mono">Account and billing</p>
      </div>

      {/* Current plan */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-white">Current plan</h3>
          <span className="text-[10px] font-mono text-positive bg-positive/10 border border-positive/20 px-2 py-0.5 rounded">FREE</span>
        </div>
        <p className="text-xs text-muted">Upgrade to Pro for unlimited analyses and email alerts.</p>
      </motion.div>

      {/* Plan comparison */}
      <div className="grid gap-3 sm:grid-cols-3">
        {PLAN_TIERS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.07 }}
            className={`relative bg-surface rounded-2xl p-5 border ${
              plan.highlight ? "border-accent shadow-glow" : "border-border"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-white bg-accent px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Popular
              </div>
            )}
            <div className="mb-4">
              <p className="text-xs font-mono text-muted uppercase tracking-wider mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white font-mono">{plan.price}</span>
                {plan.price !== "$0" && <span className="text-xs text-muted">/mo</span>}
              </div>
            </div>
            <ul className="space-y-1.5 mb-5">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-xs text-secondary">
                  <span className="text-positive mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {plan.current ? (
              <div className="text-center text-[11px] font-mono text-muted border border-border rounded-lg py-2">
                Current plan
              </div>
            ) : (
              <button
                disabled
                className={`w-full py-2 rounded-lg text-xs font-semibold transition-all
                  ${plan.highlight
                    ? "bg-accent text-white opacity-60 cursor-not-allowed"
                    : "border border-border text-muted cursor-not-allowed"}`}
              >
                {plan.highlight ? "Upgrade to Pro" : "Contact us"}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-[10px] font-mono text-muted/50"
      >
        Billing integration coming soon. Plans shown for preview only.
      </motion.div>
    </div>
  );
}
