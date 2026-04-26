import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AGENTS = [
  {
    id: "ingestion", label: "Data Ingestion", model: "claude-haiku-4-5", icon: "⬡",
    color: "text-kalshi", activeBorder: "border-kalshi/40", activeBg: "bg-kalshi/5",
    duration: 2400,
    lines: [
      "Connecting to Kalshi REST API...",
      "GET /trade-api/v2/markets?status=open",
      "Response: 200 OK — 847 contracts",
      "Connecting to Polymarket CLOB API...",
      "GET /markets?active=true",
      "Response: 200 OK — 1,203 contracts",
      "Normalizing price schema across platforms...",
      "Filtering: expiry > 7d, volume > $50K",
      "Contracts matched: 6",
      "Computing price deltas vs. 24h prior...",
      "Data quality check: PASS ✓",
      "Passing normalized payload to research agents →",
    ],
  },
  {
    id: "quant", label: "Quant Model", model: "claude-sonnet-4-6", icon: "∿",
    color: "text-accent", activeBorder: "border-accent/40", activeBg: "bg-accent/5",
    duration: 5200,
    lines: [
      "Loading quantitative probability model...",
      "Input: market_price=0.31, category=Economics",
      "Running base rate calibration...",
      "  Fed cuts at consecutive meetings: 23.1%",
      "  CME FedWatch 30d implied: 17.2%",
      "  Taylor Rule deviation: -0.82σ from neutral",
      "Computing macro factor loadings...",
      "  Core PCE 3mo avg: 2.84% (above 2.0% target)",
      "  NFP 3mo avg: +182K (above 150K threshold)",
      "  Yield curve (2s10s): -18bps (inverted)",
      "Bayesian update: posterior = 0.189",
      "Fair value YES: 19c | Fair value NO: 81c",
      "Expected value (YES): -11.8c ← FADE",
      "Expected value (NO): +11.8c ← LONG",
      "Confidence interval: ±4.1pts at 95%",
    ],
  },
  {
    id: "qualitative", label: "Qualitative", model: "claude-sonnet-4-6", icon: "◈",
    color: "text-accent", activeBorder: "border-accent/40", activeBg: "bg-accent/5",
    duration: 5600,
    lines: [
      "Analyzing FOMC communication signals...",
      "Parsing March 2026 meeting minutes...",
      "  Keyword 'patient': 7 occurrences",
      "  Keyword 'data-dependent': 4 occurrences",
      "  Hawkish lean score: 3.8 / 5.0",
      "Powell press conference tone: HAWKISH",
      "Fed speaker index (30d): 2.1 / 5.0 (dovish scale)",
      "Scanning earnings calls for macro signals...",
      "  Financials sector: 68% flagging 'higher for longer'",
      "Market narrative diagnosis:",
      "  → Anchored to 2024 soft-landing prior",
      "  → Not updating on Q1 2026 data releases",
      "  → Structural information lag detected",
      "Qualitative thesis: FADE YES ← confirmed",
    ],
  },
  {
    id: "sentiment", label: "Sentiment", model: "claude-sonnet-4-6", icon: "◎",
    color: "text-accent", activeBorder: "border-accent/40", activeBg: "bg-accent/5",
    duration: 4600,
    lines: [
      "Loading sentiment and contrarian signals...",
      "Social sentiment scan (24h):",
      "  Bullish on rate cut: 61.3%",
      "  Bearish on rate cut: 38.7%",
      "Options market positioning:",
      "  Net gamma: short vol (complacency signal)",
      "  Skew: 0.3σ toward YES (crowded)",
      "Polymarket cross-check: 28c (Kalshi: 31c)",
      "  3pt Kalshi premium → arb signal",
      "Smart money divergence: YES side crowded",
      "Contrarian signal strength: MODERATE-HIGH",
      "Crowding risk on YES: ELEVATED",
      "Contrarian lean: SHORT YES / LONG NO",
      "Signal weight: 0.72 (high confidence)",
    ],
  },
  {
    id: "synthesis", label: "Synthesis", model: "claude-opus-4-7", icon: "✦",
    color: "text-warning", activeBorder: "border-warning/40", activeBg: "bg-warning/5",
    duration: 9000,
    lines: [
      "Receiving outputs from 4 research agents...",
      "  ✓ Data Ingestion (haiku) — 847 tokens",
      "  ✓ Quant Model (sonnet) — 1,204 tokens",
      "  ✓ Qualitative (sonnet) — 1,089 tokens",
      "  ✓ Sentiment (sonnet) — 976 tokens",
      "Synthesizing cross-agent consensus...",
      "  Quant: FADE YES (fair value 19c vs 31c)",
      "  Qualitative: FADE YES (hawkish signals)",
      "  Sentiment: FADE YES (crowded + arb gap)",
      "  Consensus: 3/3 agents — HIGH conviction",
      "Generating structured research thesis...",
      "  ## Fed May Cut — NO at 31c is a strong fade",
      "  Writing thesis sections: Why / Evidence / Risk...",
      "  Calibrating confidence: HIGH",
      "  Computing final EV: YES -11.8c | NO +11.8c",
      "Thesis complete. Writing to database...",
      "Pipeline total cost: $0.29 ✓",
    ],
  },
];

const TIMING = {
  ingestionStart: 0,
  ingestionEnd: AGENTS[0].duration,
  parallelStart: AGENTS[0].duration,
  parallelEnd: AGENTS[0].duration + Math.max(AGENTS[1].duration, AGENTS[2].duration, AGENTS[3].duration),
  synthStart: AGENTS[0].duration + Math.max(AGENTS[1].duration, AGENTS[2].duration, AGENTS[3].duration),
  synthEnd: AGENTS[0].duration + Math.max(AGENTS[1].duration, AGENTS[2].duration, AGENTS[3].duration) + AGENTS[4].duration,
};

function useTypewriter(lines, active, msPerChar = 18, msPerLine = 120) {
  const [displayed, setDisplayed] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (!active || lines.length === 0) return;
    setDisplayed([]);
    setCurrentLine(0);
    setCurrentChar(0);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    if (currentLine >= lines.length) return;

    const line = lines[currentLine];

    if (currentChar < line.length) {
      const t = setTimeout(() => setCurrentChar(c => c + 1), msPerChar);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setDisplayed(d => [...d, line]);
        setCurrentLine(l => l + 1);
        setCurrentChar(0);
      }, msPerLine);
      return () => clearTimeout(t);
    }
  }, [active, currentLine, currentChar, lines]);

  const partial = active && currentLine < lines.length ? lines[currentLine].slice(0, currentChar) : "";
  return { displayed, partial };
}

function AgentNode({ agent, status }) {
  const isRunning = status === "running";
  const isDone = status === "done";

  return (
    <motion.div
      className={`relative flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg border transition-all duration-500
        ${isRunning ? `${agent.activeBg} ${agent.activeBorder}` : isDone ? "bg-positive/5 border-positive/25" : "bg-transparent border-border"}`}
      animate={isRunning ? {
        boxShadow: [
          "0 0 0px rgba(59,130,246,0)",
          "0 0 16px rgba(59,130,246,0.2)",
          "0 0 0px rgba(59,130,246,0)",
        ],
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <span className={`text-base transition-colors duration-300 ${isRunning ? agent.color : isDone ? "text-positive" : "text-muted/40"}`}>
        {isDone ? "✓" : agent.icon}
      </span>
      <div className="text-center">
        <div className={`text-[9px] font-mono font-semibold leading-tight transition-colors duration-300
          ${isRunning ? agent.color : isDone ? "text-positive" : "text-muted/50"}`}>
          {agent.label}
        </div>
        <div className={`text-[8px] mt-0.5 transition-colors duration-300 ${isRunning || isDone ? "text-muted" : "text-muted/30"}`}>
          {agent.model.split("-").slice(-2).join("-")}
        </div>
      </div>
      {isRunning && (
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-accent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function TerminalOutput({ agent, active }) {
  const { displayed, partial } = useTypewriter(agent?.lines || [], active);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayed, partial]);

  if (!agent) return null;

  return (
    <div className="font-mono text-[11px] leading-relaxed space-y-0.5 h-36 overflow-y-auto pr-1">
      {displayed.map((line, i) => (
        <div key={i} className={`${line.startsWith("  ") ? "text-secondary pl-2" : "text-secondary/70"} transition-opacity duration-200`}>
          <span className="text-muted/40 select-none mr-2">{String(i + 1).padStart(2, "0")}</span>
          {line}
        </div>
      ))}
      {active && partial !== undefined && displayed.length < agent.lines.length && (
        <div className="text-secondary/70">
          <span className="text-muted/40 select-none mr-2">{String(displayed.length + 1).padStart(2, "0")}</span>
          {partial}
          <motion.span
            className="inline-block w-1.5 h-3 bg-accent ml-0.5 align-middle"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
          />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

const ALL_DONE_STATUSES = { ingestion: "done", quant: "done", qualitative: "done", sentiment: "done", synthesis: "done" };
const ALL_PENDING_STATUSES = { ingestion: "pending", quant: "pending", qualitative: "pending", sentiment: "pending", synthesis: "pending" };

export default function AgentPipeline({ running, onComplete, onPhaseChange }) {
  const [statuses, setStatuses] = useState(running ? ALL_PENDING_STATUSES : ALL_DONE_STATUSES);
  const [activeAgent, setActiveAgent] = useState(null);
  const [phase, setPhase] = useState(running ? 0 : 3);
  const [tokens, setTokens] = useState(running ? 0 : 4316);
  const [cost, setCost] = useState(running ? 0 : 0.29);
  const [elapsed, setElapsed] = useState(running ? 0 : 26.8);
  const startRef = useRef(null);

  const allDone = Object.values(statuses).every(s => s === "done");

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();

    const tick = setInterval(() => {
      const t = (Date.now() - startRef.current) / 1000;
      setElapsed(t);
      setTokens(prev => prev + Math.floor(Math.random() * 18 + 6));
      setCost(prev => prev + 0.00031);
    }, 120);

    return () => clearInterval(tick);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const timers = [];

    setStatuses(s => ({ ...s, ingestion: "running" }));
    setActiveAgent("ingestion");
    setPhase(1); onPhaseChange?.(1);

    timers.push(setTimeout(() => {
      setStatuses(s => ({ ...s, ingestion: "done", quant: "running", qualitative: "running", sentiment: "running" }));
      setActiveAgent("quant");
      setPhase(2); onPhaseChange?.(2);
    }, TIMING.ingestionEnd));

    timers.push(setTimeout(() => {
      setStatuses(s => ({ ...s, quant: "done" }));
    }, TIMING.parallelStart + AGENTS[1].duration));

    timers.push(setTimeout(() => {
      setStatuses(s => ({ ...s, qualitative: "done" }));
    }, TIMING.parallelStart + AGENTS[2].duration));

    timers.push(setTimeout(() => {
      setStatuses(s => ({ ...s, sentiment: "done" }));
    }, TIMING.parallelStart + AGENTS[3].duration));

    timers.push(setTimeout(() => {
      setStatuses(s => ({ ...s, synthesis: "running" }));
      setActiveAgent("synthesis");
      setPhase(3); onPhaseChange?.(3);
    }, TIMING.synthStart));

    timers.push(setTimeout(() => {
      setStatuses(s => ({ ...s, synthesis: "done" }));
      setActiveAgent(null);
      onComplete?.();
    }, TIMING.synthEnd));

    return () => timers.forEach(clearTimeout);
  }, [running]);

  const currentAgentData = AGENTS.find(a => a.id === activeAgent);

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-panel/60">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(p => {
              const isGreen = p === 3 ? allDone : phase >= p + 1;
              const isPulsing = running && phase === p && !isGreen;
              return (
                <motion.div
                  key={p}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${
                    isGreen ? "bg-positive" : isPulsing ? "bg-accent animate-pulse" : "bg-muted/30"
                  }`}
                  animate={isPulsing ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                />
              );
            })}
          </div>
          <span className="text-[11px] font-mono text-muted">
            oracle-desk / agent-pipeline
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted">
          {running && (
            <>
              <span>{elapsed.toFixed(1)}s</span>
              <span className="text-secondary">{tokens.toLocaleString()} tokens</span>
              <span className="text-warning">${cost.toFixed(3)}</span>
            </>
          )}
          {allDone && <span className="text-positive font-semibold">✓ complete</span>}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Pipeline nodes */}
        <div className="grid grid-cols-5 gap-1.5 relative">
          {/* Connector lines */}
          <div className="absolute top-1/2 left-[20%] right-[20%] h-px bg-border -translate-y-1/2 z-0" />

          {AGENTS.map((agent) => (
            <div key={agent.id} className="relative z-10">
              <AgentNode agent={agent} status={statuses[agent.id]} />
            </div>
          ))}
        </div>

        {/* Phase label */}
        <div className="flex items-center gap-2 text-[9px] font-mono text-muted/50">
          <span className={statuses.ingestion === "done" ? "text-positive" : activeAgent === "ingestion" ? "text-accent" : ""}>
            01 ingest
          </span>
          <span className="flex-1 border-t border-dashed border-border/50" />
          <span className={["quant","qualitative","sentiment"].every(s => statuses[s] === "done") ? "text-positive" : activeAgent === "quant" ? "text-accent" : ""}>
            02 parallel research
          </span>
          <span className="flex-1 border-t border-dashed border-border/50" />
          <span className={statuses.synthesis === "done" ? "text-positive" : activeAgent === "synthesis" ? "text-warning" : ""}>
            03 synthesize
          </span>
        </div>

        {/* Terminal */}
        <AnimatePresence mode="wait">
          {(running || allDone) && (
            <motion.div
              key={activeAgent || "done"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-bg rounded-xl border border-border p-3"
            >
              {/* Terminal header */}
              <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-border/50">
                {currentAgentData ? (
                  <>
                    <span className={`text-[10px] font-mono font-semibold ${currentAgentData.color}`}>
                      {currentAgentData.icon} {currentAgentData.label}
                    </span>
                    <span className="text-[9px] text-muted">{currentAgentData.model}</span>
                    <motion.span
                      className="ml-auto text-[9px] font-mono text-accent"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      ● generating
                    </motion.span>
                  </>
                ) : allDone ? (
                  <span className="text-[10px] font-mono text-positive">✓ All agents complete — thesis written to database</span>
                ) : null}
              </div>

              {allDone ? (
                <div className="font-mono text-[11px] text-secondary/70 space-y-0.5">
                  {AGENTS[4].lines.map((line, i) => (
                    <div key={i} className={line.startsWith("  ") ? "text-secondary pl-2" : ""}>
                      <span className="text-muted/40 select-none mr-2">{String(i + 1).padStart(2, "0")}</span>
                      {line}
                    </div>
                  ))}
                </div>
              ) : (
                <TerminalOutput agent={currentAgentData} active={!!activeAgent} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
