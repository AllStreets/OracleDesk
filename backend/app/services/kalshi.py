import httpx
from typing import Any, Optional
from app.config import settings

class KalshiClient:
    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key or settings.kalshi_api_key
        self._base = settings.kalshi_base_url
        self._http = httpx.AsyncClient(
            headers={"Authorization": f"Token {self._api_key}"},
            timeout=30.0,
        )

    async def get_active_markets(self, category: Optional[str] = None, limit: int = 100) -> list:
        params: dict[str, Any] = {"limit": limit, "status": "open"}
        if category:
            params["category"] = category
        resp = await self._http.get(f"{self._base}/markets", params=params)
        resp.raise_for_status()
        return resp.json().get("markets", [])

    async def get_market(self, ticker: str) -> dict:
        resp = await self._http.get(f"{self._base}/markets/{ticker}")
        resp.raise_for_status()
        return resp.json().get("market", {})

    async def get_market_history(self, ticker: str, days: int = 30) -> list:
        resp = await self._http.get(
            f"{self._base}/markets/{ticker}/history",
            params={"limit": days * 24},
        )
        resp.raise_for_status()
        return resp.json().get("history", [])

    async def close(self):
        await self._http.aclose()
