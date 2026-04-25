import { useState, useEffect } from "react";
import { getWatchlist, removeFromWatchlist } from "../api/watchlist";
import ContractCard from "../components/ContractCard";

export default function Watchlist() {
  const [items, setItems] = useState([]);
  useEffect(() => { getWatchlist().then(setItems); }, []);

  const remove = async (watchlistId) => {
    await removeFromWatchlist(watchlistId);
    setItems(items.filter(i => i.watchlist_id !== watchlistId));
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-6">Watchlist</h2>
      {items.length === 0 ? (
        <p className="text-muted text-sm">No contracts on watchlist. Add them from the Dashboard or contract pages.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.watchlist_id} className="flex items-center gap-3">
              <div className="flex-1">
                <ContractCard contract={{ id: item.contract_id, title: item.title, platform: item.platform, current_yes_price: item.current_yes_price }} />
              </div>
              <button onClick={() => remove(item.watchlist_id)} className="text-xs text-muted hover:text-negative px-2">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
