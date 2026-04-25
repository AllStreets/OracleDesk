from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter()

PLAN_LIMITS = {
    "free": {"on_demand": 0, "thesis_access": 3, "watchlist": 3},
    "pro": {"on_demand": 10, "thesis_access": None, "watchlist": 20},
    "premium": {"on_demand": 50, "thesis_access": None, "watchlist": None},
}

@router.get("/usage")
async def get_usage(current_user: User = Depends(get_current_user)):
    limits = PLAN_LIMITS.get(current_user.plan, PLAN_LIMITS["free"])
    return {
        "plan": current_user.plan,
        "limits": limits,
    }
