import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getWatchlist, removeFromWatchlist } from "../api/watchlist";
import ContractCard from "../components/ContractCard";

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getWatchlist().then(setItems).finally(() => setLoading(false)); }, []);

  const remove = async (watchlistId) => {
    await removeFromWatchlist(watchlistId);
    setItems(items.filter(i => i.watchlist_id !== watchlistId));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Watchlist</h2>
        <p className="text-xs text-muted mt-0.5 font-mono">Contracts you're tracking</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl h-24 shimmer-bg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4 opacity-20">◎</div>
          <p className="text-secondary text-sm font-medium">No contracts on your watchlist.</p>
          <p className="text-muted text-xs mt-1.5 max-w-xs">
            Visit any contract page and add it to your watchlist to track it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.watchlist_id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="flex items-start gap-2"
              >
                <div className="flex-1 min-w-0">
                  <ContractCard
                    contract={{ id: item.contract_id, title: item.title, platform: item.platform, current_yes_price: item.current_yes_price }}
                    index={i}
                  />
                </div>
                <button
                  onClick={() => remove(item.watchlist_id)}
                  className="mt-2 shrink-0 text-[11px] font-medium text-muted hover:text-negative border border-border hover:border-negative/30 px-2.5 py-1.5 rounded-lg transition-all"
                >
                  Remove
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
