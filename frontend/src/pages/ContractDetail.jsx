import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getContract, triggerAnalysis } from "../api/contracts";
import ThesisRenderer from "../components/ThesisRenderer";
import EVBadge from "../components/EVBadge";

export default function ContractDetail() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const load = () => getContract(id).then(setContract).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    await triggerAnalysis(id);
    setTimeout(() => { load(); setAnalyzing(false); }, 30000);
  };

  if (loading) return <p className="text-muted text-sm">Loading...</p>;
  if (!contract) return <p className="text-negative text-sm">Contract not found.</p>;

  const { title, platform, category, current_yes_price, expiry_date, analysis } = contract;

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-1">{platform} / {category}</p>
          <h2 className="text-xl font-bold leading-snug">{title}</h2>
          {expiry_date && <p className="text-xs text-muted mt-1">Expires {new Date(expiry_date).toLocaleDateString()}</p>}
        </div>
        <button onClick={runAnalysis} disabled={analyzing}
          className="shrink-0 text-xs px-4 py-2 border border-accent text-accent rounded hover:bg-accent hover:text-white transition-colors disabled:opacity-50">
          {analyzing ? "Analyzing..." : "Refresh analysis"}
        </button>
      </div>

      {analysis && (
        <div className="flex gap-6 mb-6 text-sm">
          <div><p className="text-muted text-xs">Market price</p><p className="text-white font-bold">{current_yes_price != null ? `${(current_yes_price * 100).toFixed(0)}c` : "N/A"}</p></div>
          {analysis.fair_value_yes != null && <div><p className="text-muted text-xs">Fair value</p><p className="text-accent font-bold">{(analysis.fair_value_yes * 100).toFixed(0)}c</p></div>}
          <div><p className="text-muted text-xs">Expected value</p><EVBadge ev={analysis.expected_value_yes} /></div>
          {analysis.confidence && <div><p className="text-muted text-xs">Confidence</p><p className="text-white">{analysis.confidence}</p></div>}
        </div>
      )}

      <div className="bg-panel border border-border rounded p-6">
        {analysis ? (
          <>
            <ThesisRenderer markdown={analysis.thesis_markdown} />
            <p className="text-xs text-muted mt-4">Analysis generated {new Date(analysis.created_at).toLocaleString()}</p>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted text-sm mb-4">No analysis available for this contract.</p>
            <button onClick={runAnalysis} disabled={analyzing}
              className="text-sm px-6 py-2 bg-accent text-white rounded hover:bg-blue-500 disabled:opacity-50">
              {analyzing ? "Running analysis..." : "Run analysis"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
