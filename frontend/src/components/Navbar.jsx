import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem("oracle_token"); navigate("/"); };
  return (
    <nav className="border-b border-border bg-panel px-4 py-3 flex items-center justify-between">
      <Link to="/dashboard" className="text-white font-bold tracking-widest text-sm">ORACLE DESK</Link>
      <div className="flex gap-6 text-sm text-muted">
        <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
        <Link to="/watchlist" className="hover:text-white">Watchlist</Link>
        <Link to="/history" className="hover:text-white">History</Link>
        <Link to="/settings" className="hover:text-white">Settings</Link>
        <button onClick={logout} className="hover:text-white">Sign out</button>
      </div>
    </nav>
  );
}
