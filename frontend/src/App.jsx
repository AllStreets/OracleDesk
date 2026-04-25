import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ContractDetail from "./pages/ContractDetail";
import Watchlist from "./pages/Watchlist";
import Settings from "./pages/Settings";
import History from "./pages/History";
import Navbar from "./components/Navbar";
import Disclaimer from "./components/Disclaimer";

function AuthLayout({ children }) {
  const token = localStorage.getItem("oracle_token");
  if (!token) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen bg-surface text-white font-mono">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <Disclaimer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<AuthLayout><Dashboard /></AuthLayout>} />
        <Route path="/contract/:id" element={<AuthLayout><ContractDetail /></AuthLayout>} />
        <Route path="/watchlist" element={<AuthLayout><Watchlist /></AuthLayout>} />
        <Route path="/settings" element={<AuthLayout><Settings /></AuthLayout>} />
        <Route path="/history" element={<AuthLayout><History /></AuthLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
