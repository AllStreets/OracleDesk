from decimal import Decimal
from app.services.cost_tracker import compute_cost

def test_haiku_cost_input_only():
    cost = compute_cost("claude-haiku-4-5-20251001", 1_000_000, 0)
    assert cost == Decimal("0.800000")

def test_sonnet_cost_mixed():
    cost = compute_cost("claude-sonnet-4-6", 1000, 500)
    assert cost == Decimal("0.010500")

def test_opus_cost_output_only():
    cost = compute_cost("claude-opus-4-7", 0, 1000)
    assert cost == Decimal("0.075000")

def test_unknown_model_falls_back_to_sonnet():
    cost = compute_cost("unknown-model", 1000, 0)
    assert cost == Decimal("0.003000")

def test_zero_tokens_returns_zero():
    cost = compute_cost("claude-sonnet-4-6", 0, 0)
    assert cost == Decimal("0.000000")
