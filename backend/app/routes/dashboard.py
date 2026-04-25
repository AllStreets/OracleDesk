from fastapi import APIRouter, Depends
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.contract import Contract
from app.models.analysis import Analysis

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    subq = (
        select(Analysis.contract_id, func.max(Analysis.created_at).label("latest"))
        .group_by(Analysis.contract_id)
        .subquery()
    )
    result = await db.execute(
        select(Contract, Analysis)
        .join(subq, subq.c.contract_id == Contract.id)
        .join(
            Analysis,
            (Analysis.contract_id == subq.c.contract_id) & (Analysis.created_at == subq.c.latest),
        )
        .where(Analysis.expected_value_yes.isnot(None))
        .order_by(desc(func.abs(Analysis.expected_value_yes)))
        .limit(50)
    )
    rows = result.all()
    return [
        {
            "contract_id": str(c.id),
            "title": c.title,
            "platform": c.platform,
            "category": c.category,
            "current_yes_price": float(c.current_yes_price) if c.current_yes_price else None,
            "fair_value_yes": float(a.fair_value_yes) if a.fair_value_yes else None,
            "expected_value_yes": float(a.expected_value_yes) if a.expected_value_yes else None,
            "confidence": a.confidence,
            "expiry_date": c.expiry_date.isoformat() if c.expiry_date else None,
        }
        for c, a in rows
    ]
