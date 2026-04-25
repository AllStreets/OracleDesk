import client from "./client";

export const getWatchlist = () => client.get("/api/watchlist").then(r => r.data);
export const addToWatchlist = (contract_id, alert_threshold) =>
  client.post("/api/watchlist", { contract_id, alert_threshold }).then(r => r.data);
export const removeFromWatchlist = (id) => client.delete(`/api/watchlist/${id}`).then(r => r.data);
