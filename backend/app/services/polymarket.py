import json
import httpx
from typing import Optional
from app.config import settings

class PolymarketClient:
    def __init__(self):
        self._base = settings.polymarket_base_url
        self._http = httpx.AsyncClient(timeout=30.0)

    async def get_active_markets(self, limit: int = 100) -> list:
        resp = await self._http.get(
            f"{self._base}/markets",
            params={"active": "true", "closed": "false", "limit": limit},
        )
        resp.raise_for_status()
        return resp.json().get("data", [])

    async def get_market(self, condition_id: str) -> dict:
        resp = await self._http.get(f"{self._base}/markets/{condition_id}")
        resp.raise_for_status()
        return resp.json()

    async def get_market_history(self, condition_id: str) -> list:
        resp = await self._http.get(
            f"{self._base}/prices-history",
            params={"market": condition_id, "interval": "1h", "fidelity": 60},
        )
        resp.raise_for_status()
        return resp.json().get("history", [])

    def normalize(self, raw: dict) -> dict:
        prices_raw = raw.get("outcomePrices", "[0,0]")
        try:
            prices = json.loads(prices_raw)
        except (json.JSONDecodeError, TypeError):
            prices = [0, 0]
        if not isinstance(prices, list) or len(prices) < 2:
            prices = [0, 0]
        return {
            "platform": "polymarket",
            "platform_contract_id": raw["id"],
            "title": raw.get("question", ""),
            "category": raw.get("category", "other"),
            "current_yes_price": float(prices[0]),
            "current_no_price": float(prices[1]),
            "volume": int(float(raw.get("volume", 0))),
            "expiry_date": raw.get("endDate"),
        }

    async def close(self):
        await self._http.aclose()
