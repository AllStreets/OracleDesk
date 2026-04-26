import { Link, useNavigate, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = () => { localStorage.removeItem("oracle_token"); navigate("/"); };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white text-[10px] font-bold font-mono">O</div>
          <span className="text-white font-semibold text-sm tracking-widest font-mono">ORACLE DESK</span>
        </Link>

        <div className="flex items-center gap-1 flex-1">
          {LINKS.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
            <div className="relative w-1.5 h-1.5">
              <div className="absolute inset-0 rounded-full bg-positive" />
              <div className="absolute inset-0 rounded-full bg-positive animate-ping-slow" />
            </div>
            LIVE
          </div>
          <button
            onClick={logout}
            className="text-xs text-muted hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
