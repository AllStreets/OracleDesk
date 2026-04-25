import logging
from pathlib import Path
from decimal import Decimal
import anthropic
from app.config import settings
from app.services.cost_tracker import compute_cost

logger = logging.getLogger(__name__)
_client = None

def get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client

def load_prompt(name: str) -> str:
    path = Path(__file__).parent / "prompts" / f"{name}.txt"
    return path.read_text()

async def run_agent(
    agent_name: str,
    model: str,
    user_message: str,
    max_tokens: int = 4096,
) -> tuple:
    """Run a single agent call. Returns (response_text, cost_usd).
    Uses prompt caching on the system prompt (cache_control: ephemeral)."""
    client = get_client()
    system_prompt = load_prompt(agent_name)

    response = await client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=[
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user_message}],
    )

    input_tokens = response.usage.input_tokens
    output_tokens = response.usage.output_tokens
    cost = compute_cost(model, input_tokens, output_tokens)

    logger.info(
        "agent=%s model=%s in=%d out=%d cost=$%s",
        agent_name, model, input_tokens, output_tokens, cost,
    )

    return response.content[0].text, cost
