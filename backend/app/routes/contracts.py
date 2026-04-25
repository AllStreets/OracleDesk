import uuid
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db, AsyncSessionLocal
from app.models.contract import Contract
from app.models.analysis import Analysis
from app.models.price_history import PriceHistory
from app.middleware.auth import get_current_user
from app.models.user import User
from app.agents.pipeline import analyze_contract

router = APIRouter()

@router.get("")
async def list_contracts(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func
    subq = (
        select(Analysis.contract_id, func.max(Analysis.created_at).label("latest"))
        .group_by(Analysis.contract_id)
        .subquery()
    )
    result = await db.execute(
        select(Contract, Analysis)
        .outerjoin(subq, subq.c.contract_id == Contract.id)
        .outerjoin(
            Analysis,
            (Analysis.contract_id == subq.c.contract_id) & (Analysis.created_at == subq.c.latest),
        )
        .order_by(desc(Analysis.created_at))
        .limit(100)
    )
    rows = result.all()
    return [
        {
            "id": str(c.id),
            "platform": c.platform,
            "title": c.title,
            "category": c.category,
            "current_yes_price": float(c.current_yes_price) if c.current_yes_price else None,
            "expiry_date": c.expiry_date.isoformat() if c.expiry_date else None,
            "analysis": {
                "fair_value_yes": float(a.fair_value_yes) if a and a.fair_value_yes else None,
                "expected_value_yes": float(a.expected_value_yes) if a and a.expected_value_yes else None,
                "confidence": a.confidence if a else None,
            } if a else None,
        }
        for c, a in rows
    ]

@router.get("/{contract_id}")
async def get_contract(contract_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalar_one_or_none()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    analysis_result = await db.execute(
        select(Analysis)
        .where(Analysis.contract_id == contract_id)
        .order_by(desc(Analysis.created_at))
        .limit(1)
    )
    analysis = analysis_result.scalar_one_or_none()
    return {
        "id": str(contract.id),
        "platform": contract.platform,
        "title": contract.title,
        "category": contract.category,
        "current_yes_price": float(contract.current_yes_price) if contract.current_yes_price else None,
        "expiry_date": contract.expiry_date.isoformat() if contract.expiry_date else None,
        "analysis": {
            "thesis_markdown": analysis.thesis_markdown,
            "fair_value_yes": float(analysis.fair_value_yes) if analysis.fair_value_yes else None,
            "expected_value_yes": float(analysis.expected_value_yes) if analysis.expected_value_yes else None,
            "confidence": analysis.confidence,
            "created_at": analysis.created_at.isoformat(),
        } if analysis else None,
    }

async def _run_analysis_and_save(contract_id: uuid.UUID):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Contract).where(Contract.id == contract_id))
        contract = result.scalar_one_or_none()
        if not contract:
            return
        contract_dict = {
            "title": contract.title,
            "platform": contract.platform,
            "current_yes_price": float(contract.current_yes_price) if contract.current_yes_price else None,
            "current_no_price": float(contract.current_no_price) if contract.current_no_price else None,
            "volume": contract.volume,
            "category": contract.category,
            "expiry_date": contract.expiry_date.isoformat() if contract.expiry_date else None,
        }
        pipeline_result = await analyze_contract(contract_dict)
        analysis = Analysis(
            contract_id=contract_id,
            fair_value_yes=pipeline_result.fair_value_yes,
            fair_value_no=pipeline_result.fair_value_no,
            expected_value_yes=pipeline_result.expected_value_yes,
            thesis_markdown=pipeline_result.thesis_markdown,
            agent_costs_usd=pipeline_result.total_cost_usd,
        )
        db.add(analysis)
        await db.commit()

@router.post("/{contract_id}/analyze")
async def trigger_analysis(
    contract_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Contract not found")
    background_tasks.add_task(_run_analysis_and_save, contract_id)
    return {"status": "analysis_queued", "contract_id": str(contract_id)}

@router.get("/{contract_id}/history")
async def get_price_history(contract_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PriceHistory)
        .where(PriceHistory.contract_id == contract_id)
        .order_by(PriceHistory.recorded_at)
        .limit(720)
    )
    history = result.scalars().all()
    return [
        {
            "yes_price": float(h.yes_price) if h.yes_price else None,
            "no_price": float(h.no_price) if h.no_price else None,
            "recorded_at": h.recorded_at.isoformat(),
        }
        for h in history
    ]
