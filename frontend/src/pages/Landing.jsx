import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup } from "../api/auth";

export default function Landing() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      mode === "login" ? await login(email, password) : await signup(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-surface text-white font-mono flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold tracking-widest mb-2">ORACLE DESK</h1>
      <p className="text-muted text-sm mb-10 text-center max-w-md">
        Multi-agent prediction market research. Structured theses on Kalshi and Polymarket contracts, ranked by expected value.
      </p>
      <form onSubmit={submit} className="w-full max-w-sm bg-panel border border-border rounded p-6 flex flex-col gap-4">
        <div className="flex border border-border rounded overflow-hidden text-sm">
          <button type="button" onClick={() => setMode("login")}
            className={`flex-1 py-2 ${mode === "login" ? "bg-accent text-white" : "text-muted"}`}>Sign in</button>
          <button type="button" onClick={() => setMode("signup")}
            className={`flex-1 py-2 ${mode === "signup" ? "bg-accent text-white" : "text-muted"}`}>Sign up</button>
        </div>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="bg-surface border border-border rounded px-3 py-2 text-sm text-white placeholder-muted outline-none focus:border-accent" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
          className="bg-surface border border-border rounded px-3 py-2 text-sm text-white placeholder-muted outline-none focus:border-accent" />
        {error && <p className="text-negative text-xs">{error}</p>}
        <button type="submit" className="bg-accent text-white rounded py-2 text-sm font-semibold hover:bg-blue-500 transition-colors">
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
      <p className="text-xs text-muted mt-8 text-center max-w-md">
        Oracle Desk provides research and analysis for informational and entertainment purposes. Trading involves risk of loss.
      </p>
    </div>
  );
}
