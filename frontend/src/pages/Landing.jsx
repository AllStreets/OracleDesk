import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login, signup } from "../api/auth";

const FEATURES = [
  { icon: "⬡", label: "Kalshi", sub: "prediction markets" },
  { icon: "◎", label: "Polymarket", sub: "prediction markets" },
  { icon: "∿", label: "5-Agent Pipeline", sub: "parallel AI research" },
  { icon: "✦", label: "Opus Synthesis", sub: "structured theses" },
  { icon: "◈", label: "EV Ranking", sub: "ranked mispricings" },
];

const SAMPLE_CONTRACTS = [
  { title: "Will the Fed cut rates at May FOMC?", market: 31, fair: 19, ev: -11.8, platform: "KALSHI", category: "Economics", confidence: "HIGH" },
  { title: "Will US pass federal AI regulation in 2026?", market: 14, fair: 9, ev: -4.7, platform: "POLY", category: "Technology", confidence: "HIGH" },
  { title: "Will US economy enter recession in H1 2026?", market: 22, fair: 27, ev: +5.1, platform: "KALSHI", category: "Economics", confidence: "MED" },
];

function SampleCard({ contract, delay }) {
  const pos = contract.ev > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="bg-surface/60 border border-border rounded-xl p-3.5 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border
          ${contract.platform === "KALSHI" ? "text-kalshi bg-kalshi/10 border-kalshi/20" : "text-polymarket bg-polymarket/10 border-polymarket/20"}`}>
          {contract.platform}
        </span>
        <span className="text-[9px] text-muted">{contract.category}</span>
        <span className={`ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border
          ${contract.confidence === "HIGH" ? "text-positive bg-positive/10 border-positive/20" : "text-warning bg-warning/10 border-warning/20"}`}>
          {contract.confidence}
        </span>
      </div>
      <p className="text-xs text-white leading-snug mb-2.5">{contract.title}</p>
      <div className="relative h-4 bg-bg rounded-sm overflow-hidden border border-border mb-1.5">
        <div className="absolute inset-y-0 left-0 bg-white/10" style={{ width: `${contract.market}%` }} />
        <div className="absolute inset-y-0 w-px bg-accent" style={{ left: `${contract.fair}%` }} />
        <div className="absolute inset-0 flex items-center px-1.5">
          <span className="text-[8px] font-mono text-white/60">YES {contract.market}%</span>
          <span className="ml-auto text-[8px] font-mono text-muted">NO {100 - contract.market}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[9px] font-mono">
        <span className="text-muted">Market {contract.market}c</span>
        <span className="text-accent">Fair {contract.fair}c</span>
        <span className={`ml-auto font-bold px-1.5 py-0.5 rounded border
          ${pos ? "text-positive bg-positive/10 border-positive/20" : "text-negative bg-negative/10 border-negative/20"}`}>
          {pos ? "+" : ""}{contract.ev.toFixed(1)}c EV
        </span>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      mode === "login" ? await login(email, password) : await signup(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg bg-grid text-white overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-kalshi/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-xs font-mono text-accent">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Phase 1: Prediction Market Research
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-center mb-14"
        >
          <h1 className="font-mono font-bold tracking-[0.2em] text-5xl md:text-6xl mb-4 text-gradient">
            ORACLE DESK
          </h1>
          <p className="text-secondary text-base max-w-xl mx-auto leading-relaxed">
            Multi-agent AI research on Kalshi and Polymarket contracts. Five specialized Claude agents run in parallel, synthesize structured theses, and surface ranked mispricings.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-16"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface/60 backdrop-blur-sm text-xs"
            >
              <span className="text-accent">{f.icon}</span>
              <span className="text-white font-medium">{f.label}</span>
              <span className="text-muted hidden sm:inline">{f.sub}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Main split: sample cards + auth form */}
        <div className="grid lg:grid-cols-2 gap-10 items-start max-w-5xl mx-auto">
          {/* Left: sample dashboard preview */}
          <div className="space-y-3">
            <p className="text-xs font-mono text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-positive animate-pulse" />
              Live contract feed
            </p>
            {SAMPLE_CONTRACTS.map((c, i) => (
              <SampleCard key={c.title} contract={c} delay={0.5 + i * 0.1} />
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center pt-2"
            >
              <p className="text-[10px] font-mono text-muted/60">
                Sign in to see live analysis + full theses
              </p>
            </motion.div>
          </div>

          {/* Right: auth form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:sticky lg:top-20"
          >
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
              <div className="flex gap-1 p-1 bg-bg rounded-lg mb-6 border border-border">
                {["login", "signup"].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                      mode === m ? "bg-accent text-white shadow-sm" : "text-muted hover:text-white"
                    }`}
                  >
                    {m === "login" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-muted/50 outline-none focus:border-accent transition-colors font-sans"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-muted/50 outline-none focus:border-accent transition-colors font-sans"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-negative text-xs font-mono bg-negative/5 border border-negative/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-semibold transition-all mt-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {mode === "login" ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : (
                    mode === "login" ? "Sign in" : "Create account"
                  )}
                </button>
              </form>

              <p className="text-[10px] text-muted/60 text-center mt-5 leading-relaxed">
                Research platform for informational purposes. Trading involves risk of loss.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
