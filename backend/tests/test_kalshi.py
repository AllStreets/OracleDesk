import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.kalshi import KalshiClient

@pytest.mark.asyncio
async def test_get_markets_returns_list():
    client = KalshiClient(api_key="test")
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "markets": [
            {
                "ticker": "FED-25JUN-T5.25",
                "title": "Fed rate above 5.25% in June?",
                "yes_bid": 0.48,
                "yes_ask": 0.50,
                "volume": 10000,
                "category": "economics",
                "close_time": "2025-06-30T00:00:00Z",
            }
        ],
        "cursor": None,
    }
    mock_response.raise_for_status = MagicMock()

    try:
        with patch.object(client._http, "get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_response
            markets = await client.get_active_markets(category="economics")
        assert len(markets) == 1
        assert markets[0]["ticker"] == "FED-25JUN-T5.25"
    finally:
        await client.close()

@pytest.mark.asyncio
async def test_get_market_history_returns_list():
    client = KalshiClient(api_key="test")
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "history": [
            {"yes_price": 0.48, "volume": 100, "ts": 1700000000}
        ]
    }
    mock_response.raise_for_status = MagicMock()

    try:
        with patch.object(client._http, "get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_response
            history = await client.get_market_history("FED-25JUN-T5.25", days=30)
        assert len(history) == 1
        assert history[0]["yes_price"] == 0.48
    finally:
        await client.close()
