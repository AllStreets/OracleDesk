import { useState, useEffect } from "react";
import { getDashboard } from "../api/contracts";
import ContractCard from "../components/ContractCard";

export default function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getDashboard()
      .then(setContracts)
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(contracts.map(c => c.category))];
  const filtered = filter === "all" ? contracts : contracts.filter(c => c.category === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Top Mispricings</h2>
        <div className="flex gap-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`text-xs px-3 py-1 rounded border ${filter === cat ? "border-accent text-accent" : "border-border text-muted hover:border-white"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <p className="text-muted text-sm">Loading contracts...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-sm">No analyzed contracts yet. Nightly analysis runs at midnight.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(c => <ContractCard key={c.contract_id} contract={{...c, id: c.contract_id}} />)}
        </div>
      )}
    </div>
  );
}
