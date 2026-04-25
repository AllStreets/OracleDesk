import logging
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from app.database import AsyncSessionLocal
from app.models.contract import Contract
from app.models.price_history import PriceHistory
from app.services.kalshi import KalshiClient
from app.services.polymarket import PolymarketClient

logger = logging.getLogger(__name__)

async def sync_contracts():
    """Pull active contracts from Kalshi and Polymarket; upsert into DB."""
    kalshi = KalshiClient()
    poly = PolymarketClient()
    records = []

    try:
        kalshi_markets = await kalshi.get_active_markets()
        for m in kalshi_markets:
            yes_bid = m.get("yes_bid")
            records.append({
                "platform": "kalshi",
                "platform_contract_id": m.get("ticker", ""),
                "title": m.get("title", ""),
                "category": m.get("category", "other"),
                "current_yes_price": yes_bid,
                "current_no_price": round(1 - float(yes_bid), 4) if yes_bid is not None else None,
                "volume": m.get("volume"),
                "expiry_date": m.get("close_time"),
                "last_fetched_at": datetime.now(timezone.utc),
            })
    except Exception as e:
        logger.error(f"Kalshi sync failed: {e}")
    finally:
        await kalshi.close()

    try:
        poly_markets = await poly.get_active_markets()
        for m in poly_markets:
            normalized = poly.normalize(m)
            normalized["last_fetched_at"] = datetime.now(timezone.utc)
            records.append(normalized)
    except Exception as e:
        logger.error(f"Polymarket sync failed: {e}")
    finally:
        await poly.close()

    if not records:
        logger.warning("sync_contracts: no records to upsert")
        return

    async with AsyncSessionLocal() as session:
        stmt = insert(Contract).values(records)
        stmt = stmt.on_conflict_do_update(
            index_elements=["platform", "platform_contract_id"],
            set_={
                "current_yes_price": stmt.excluded.current_yes_price,
                "current_no_price": stmt.excluded.current_no_price,
                "volume": stmt.excluded.volume,
                "last_fetched_at": stmt.excluded.last_fetched_at,
            },
        )
        await session.execute(stmt)
        await session.commit()

    logger.info(f"sync_contracts: upserted {len(records)} contracts")


async def record_prices():
    """Snapshot current prices for all active contracts into price_history."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Contract))
        contracts = result.scalars().all()
        if not contracts:
            return
        snapshots = [
            {
                "contract_id": c.id,
                "yes_price": c.current_yes_price,
                "no_price": c.current_no_price,
                "volume": c.volume,
                "recorded_at": datetime.now(timezone.utc),
            }
            for c in contracts
        ]
        await session.execute(insert(PriceHistory).values(snapshots))
        await session.commit()
    logger.info(f"record_prices: recorded {len(snapshots)} snapshots")
