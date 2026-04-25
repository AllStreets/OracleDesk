import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.polymarket import PolymarketClient

@pytest.mark.asyncio
async def test_get_markets_returns_list():
    client = PolymarketClient()
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "data": [
            {
                "id": "abc123",
                "question": "Will Fed cut rates in June?",
                "outcomePrices": "[0.52, 0.48]",
                "volume": "50000",
                "endDate": "2025-06-30T00:00:00Z",
                "category": "economics",
            }
        ]
    }
    mock_response.raise_for_status = MagicMock()

    try:
        with patch.object(client._http, "get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_response
            markets = await client.get_active_markets()
        assert len(markets) == 1
        assert markets[0]["id"] == "abc123"
    finally:
        await client.close()

@pytest.mark.asyncio
async def test_normalize_market():
    client = PolymarketClient()
    raw = {
        "id": "abc123",
        "question": "Will Fed cut rates in June?",
        "outcomePrices": "[0.52, 0.48]",
        "volume": "50000",
        "endDate": "2025-06-30T00:00:00Z",
        "category": "economics",
    }
    try:
        normalized = client.normalize(raw)
        assert normalized["platform_contract_id"] == "abc123"
        assert normalized["current_yes_price"] == 0.52
        assert normalized["platform"] == "polymarket"
    finally:
        await client.close()
