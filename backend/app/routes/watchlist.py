import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.models.watchlist import Watchlist
from app.models.contract import Contract
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter()

class WatchlistAdd(BaseModel):
    contract_id: uuid.UUID
    alert_threshold: Optional[float] = None

@router.get("")
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Watchlist, Contract)
        .join(Contract, Contract.id == Watchlist.contract_id)
        .where(Watchlist.user_id == current_user.id)
    )
    return [
        {
            "watchlist_id": str(w.id),
            "contract_id": str(c.id),
            "title": c.title,
            "platform": c.platform,
            "current_yes_price": float(c.current_yes_price) if c.current_yes_price else None,
            "alert_threshold": float(w.alert_threshold) if w.alert_threshold else None,
        }
        for w, c in result.all()
    ]

@router.post("")
async def add_to_watchlist(
    body: WatchlistAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    contract = await db.get(Contract, body.contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    entry = Watchlist(
        user_id=current_user.id,
        contract_id=body.contract_id,
        alert_threshold=body.alert_threshold,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return {"watchlist_id": str(entry.id)}

@router.delete("/{watchlist_id}")
async def remove_from_watchlist(
    watchlist_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        delete(Watchlist).where(
            Watchlist.id == watchlist_id,
            Watchlist.user_id == current_user.id,
        )
    )
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    return {"status": "removed"}
