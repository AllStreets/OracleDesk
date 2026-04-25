import pytest
from unittest.mock import AsyncMock, patch
from decimal import Decimal
from app.agents.pipeline import analyze_contract, PipelineResult

@pytest.mark.asyncio
async def test_analyze_contract_calls_all_five_agents():
    contract = {
        "title": "Will the Fed cut rates in June 2025?",
        "platform": "kalshi",
        "current_yes_price": 0.48,
        "current_no_price": 0.52,
        "volume": 100000,
        "category": "economics",
        "expiry_date": "2025-06-30T00:00:00Z",
    }

    call_log = []

    async def mock_run_agent(agent_name, model, prompt, max_tokens=4096):
        call_log.append(agent_name)
        if agent_name == "quant_modeling":
            return ('{"fair_value_yes": 0.62, "expected_value_yes": 0.14}', Decimal("0.01"))
        return (f"Mock output from {agent_name}", Decimal("0.01"))

    with patch("app.agents.pipeline.run_agent", side_effect=mock_run_agent):
        result = await analyze_contract(contract)

    assert set(call_log) == {"data_ingestion", "quant_modeling", "qualitative_research", "sentiment", "synthesis"}
    assert result.total_cost_usd == Decimal("0.05")
    assert result.fair_value_yes == 0.62
    assert "Mock output from synthesis" in result.thesis_markdown

@pytest.mark.asyncio
async def test_analyze_contract_handles_bad_quant_output():
    contract = {
        "title": "Test contract",
        "platform": "polymarket",
        "current_yes_price": 0.5,
        "current_no_price": 0.5,
        "volume": 1000,
        "category": "politics",
        "expiry_date": "2025-12-31T00:00:00Z",
    }

    async def mock_run_agent(agent_name, model, prompt, max_tokens=4096):
        return ("not valid json at all", Decimal("0.01"))

    with patch("app.agents.pipeline.run_agent", side_effect=mock_run_agent):
        result = await analyze_contract(contract)

    # Should not raise; quant parsing failure is handled gracefully
    assert result.fair_value_yes is None
    assert result.total_cost_usd == Decimal("0.05")
