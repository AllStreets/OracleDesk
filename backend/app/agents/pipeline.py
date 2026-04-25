import asyncio
import json
import logging
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Optional
from app.agents.runners import run_agent

logger = logging.getLogger(__name__)

HAIKU = "claude-haiku-4-5-20251001"
SONNET = "claude-sonnet-4-6"
OPUS = "claude-opus-4-7"

@dataclass
class PipelineResult:
    thesis_markdown: str
    fair_value_yes: Optional[float]
    fair_value_no: Optional[float]
    expected_value_yes: Optional[float]
    confidence: Optional[str]
    key_assumptions: list
    risk_factors: list
    data_sources: list
    total_cost_usd: Decimal


def _ingestion_prompt(c: dict) -> str:
    return (
        f"Analyze this prediction market contract and gather all relevant data.\n\n"
        f"Title: {c['title']}\n"
        f"Platform: {c['platform']}\n"
        f"Current YES price: {c.get('current_yes_price', 'unknown')}\n"
        f"Current NO price: {c.get('current_no_price', 'unknown')}\n"
        f"Volume: {c.get('volume', 'unknown')}\n"
        f"Category: {c['category']}\n"
        f"Expiry: {c.get('expiry_date', 'unknown')}\n"
    )


def _quant_prompt(c: dict, ingestion: str) -> str:
    return (
        f"Contract: {c['title']}\n"
        f"Current YES price: {c.get('current_yes_price', 'unknown')}\n\n"
        f"Data from ingestion agent:\n{ingestion}\n\n"
        f"Compute fair value probability and expected value."
    )


def _research_prompt(c: dict, ingestion: str) -> str:
    return (
        f"Contract: {c['title']}\n\n"
        f"Data from ingestion agent:\n{ingestion}\n\n"
        f"Conduct qualitative research on this contract."
    )


def _sentiment_prompt(c: dict) -> str:
    return (
        f"Contract: {c['title']}\n"
        f"Platform: {c['platform']}\n"
        f"Current YES price: {c.get('current_yes_price', 'unknown')}\n\n"
        f"Assess public sentiment and crowd positioning for this contract."
    )


def _synthesis_prompt(c: dict, ingestion: str, quant: str, research: str, sentiment: str) -> str:
    return (
        f"Synthesize the following research into a final thesis.\n\n"
        f"Contract: {c['title']}\n"
        f"Platform: {c['platform']}\n"
        f"Current YES price: {c.get('current_yes_price')}\n\n"
        f"=== DATA INGESTION OUTPUT ===\n{ingestion}\n\n"
        f"=== QUANTITATIVE MODELING OUTPUT ===\n{quant}\n\n"
        f"=== QUALITATIVE RESEARCH OUTPUT ===\n{research}\n\n"
        f"=== SENTIMENT ANALYSIS OUTPUT ===\n{sentiment}\n"
    )


def _parse_quant(text: str) -> dict:
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(text[start:end])
    except Exception:
        pass
    return {}


async def analyze_contract(contract: dict) -> PipelineResult:
    """Full 5-agent pipeline. Agents 1-4 run in parallel; Agent 5 (Opus) runs after."""
    ingestion_prompt = _ingestion_prompt(contract)

    (ingestion_text, ingestion_cost), (quant_text, quant_cost), (research_text, research_cost), (sentiment_text, sentiment_cost) = await asyncio.gather(
        run_agent("data_ingestion", HAIKU, ingestion_prompt),
        run_agent("quant_modeling", SONNET, _quant_prompt(contract, ingestion_prompt)),
        run_agent("qualitative_research", SONNET, _research_prompt(contract, ingestion_prompt)),
        run_agent("sentiment", SONNET, _sentiment_prompt(contract)),
    )

    synthesis_prompt = _synthesis_prompt(
        contract, ingestion_text, quant_text, research_text, sentiment_text
    )
    thesis_markdown, synthesis_cost = await run_agent(
        "synthesis", OPUS, synthesis_prompt, max_tokens=4096
    )

    total_cost = ingestion_cost + quant_cost + research_cost + sentiment_cost + synthesis_cost
    quant_data = _parse_quant(quant_text)

    fv_yes = quant_data.get("fair_value_yes")
    fv_no = round(1 - float(fv_yes), 4) if fv_yes is not None else None

    return PipelineResult(
        thesis_markdown=thesis_markdown,
        fair_value_yes=float(fv_yes) if fv_yes is not None else None,
        fair_value_no=fv_no,
        expected_value_yes=quant_data.get("expected_value_yes"),
        confidence=None,
        key_assumptions=[],
        risk_factors=[],
        data_sources=[],
        total_cost_usd=total_cost,
    )
