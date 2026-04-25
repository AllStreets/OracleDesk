from decimal import Decimal

# Prices per 1M tokens (update when Anthropic changes pricing)
MODEL_PRICES = {
    "claude-haiku-4-5-20251001": {"input": Decimal("0.80"), "output": Decimal("4.00")},
    "claude-sonnet-4-6": {"input": Decimal("3.00"), "output": Decimal("15.00")},
    "claude-opus-4-7": {"input": Decimal("15.00"), "output": Decimal("75.00")},
}

_FALLBACK = MODEL_PRICES["claude-sonnet-4-6"]

def compute_cost(model: str, input_tokens: int, output_tokens: int) -> Decimal:
    prices = MODEL_PRICES.get(model, _FALLBACK)
    input_cost = prices["input"] * Decimal(input_tokens) / Decimal(1_000_000)
    output_cost = prices["output"] * Decimal(output_tokens) / Decimal(1_000_000)
    return (input_cost + output_cost).quantize(Decimal("0.000001"))
